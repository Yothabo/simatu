import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: true },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_VARIANT_BYTES = 5 * 1024 * 1024;

export function getJpegDimensions(bytes) {
  if (!isJpeg(bytes) || bytes.length < 4 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    return null;
  }

  let offset = 2;
  while (offset < bytes.length - 2) {
    if (bytes[offset] !== 0xff) return null;
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) return null;

    const marker = bytes[offset++];
    // Standalone markers have no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd9) break;
    if (offset + 2 > bytes.length) return null;

    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;

    // SOF markers carrying frame dimensions (excluding DHT/JPG/DAC markers).
    const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
    if (isStartOfFrame) {
      if (segmentLength < 8 || offset + 8 > bytes.length) return null;
      const precision = bytes[offset + 2];
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      const componentCount = bytes[offset + 7];
      // The SOF segment must contain all component descriptors (3 bytes each).
      if (!width || !height || !componentCount || componentCount > 4 ||
          segmentLength < 8 + (componentCount * 3) ||
          (precision !== 8 && precision !== 12)) return null;
      return { width, height };
    }

    // SOS starts compressed scan data; no frame header after this point.
    if (marker === 0xda) return null;
    offset += segmentLength;
  }
  return null;
}

function isJpeg(bytes) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export function validateDimensions(width, height, jpegDimensions) {
  return Number.isInteger(width) && Number.isInteger(height) &&
    width >= 1 && height >= 1 && width <= 6000 && height <= 6000 &&
    jpegDimensions?.width === width && jpegDimensions?.height === height;
}

export function isJxl(bytes) {
  const codestream = bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0x0a;
  const container = bytes.length >= 12 &&
    bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x0c &&
    bytes.toString('ascii', 4, 8) === 'JXL ';
  return codestream || container;
}

function encodeStoragePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function uploadObject(baseUrl, secret, path, bytes, contentType) {
  const response = await fetch(
    `${baseUrl}/storage/v1/object/marketplace-media/${encodeStoragePath(path)}`,
    {
      method: 'POST',
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'x-upsert': 'false',
      },
      body: bytes,
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Storage upload failed (${response.status}): ${detail.slice(0, 300)}`);
  }
}

async function removeObjects(baseUrl, secret, paths) {
  await fetch(`${baseUrl}/storage/v1/object/marketplace-media`, {
    method: 'DELETE',
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: paths }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => {});
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let admin;
  try {
    admin = await requireAdmin(request, pool);
  } catch (error) {
    console.error('[admin-marketplace-media] auth failed', error?.message || 'unknown');
    return json({ error: 'Unable to verify administrator access.' }, 503);
  }
  if (!admin) return json({ error: 'Authentication required.' }, 401);
  if (admin.role !== 'super_admin') return json({ error: 'Only platform administrators may manage marketplace images.' }, 403);

  const baseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const storageSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!baseUrl || !storageSecret) {
    return json({ error: 'Marketplace media storage is not configured on the server.' }, 503);
  }

  // Reject oversized uploads before multipart parsing to limit memory pressure.
  const contentLength = Number(request.headers.get('content-length') || 0);
  const MAX_REQUEST_BYTES = (MAX_VARIANT_BYTES * 2) + (256 * 1024);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: 'Marketplace media upload exceeds the 10 MB request limit.' }, 413);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'A valid multipart image upload is required.' }, 400);
  }

  const categoryId = String(form.get('category_id') || '');
  const subcategoryId = String(form.get('subcategory_id') || '');
  const altText = String(form.get('alt_text') || '').trim();
  const jpegFile = form.get('jpeg');
  const jxlFile = form.get('jxl');

  if ((Boolean(categoryId) === Boolean(subcategoryId)) ||
      (categoryId && !uuid.test(categoryId)) ||
      (subcategoryId && !uuid.test(subcategoryId))) {
    return json({ error: 'Specify exactly one valid category or subcategory ID.' }, 400);
  }
  if (!altText || altText.length > 250) return json({ error: 'Image alt text is required and must not exceed 250 characters.' }, 400);
  if (!(jpegFile instanceof File) || !(jxlFile instanceof File)) {
    return json({ error: 'Both optimized JPEG and JPEG XL variants are required.' }, 400);
  }
  if (jpegFile.size < 1 || jpegFile.size > MAX_VARIANT_BYTES || jxlFile.size < 1 || jxlFile.size > MAX_VARIANT_BYTES) {
    return json({ error: 'Each optimized image variant must be between 1 byte and 5 MB.' }, 413);
  }

  const [jpegBuffer, jxlBuffer] = await Promise.all([
    jpegFile.arrayBuffer().then((value) => Buffer.from(value)),
    jxlFile.arrayBuffer().then((value) => Buffer.from(value)),
  ]);
  const jpegDimensions = getJpegDimensions(jpegBuffer);
  if (!jpegDimensions) return json({ error: 'The JPEG variant is malformed or missing valid frame dimensions.' }, 415);
  if (!isJxl(jxlBuffer)) return json({ error: 'The JPEG XL variant failed file-signature validation.' }, 415);

  const width = Number(form.get('width'));
  const height = Number(form.get('height'));
  if (!validateDimensions(width, height, jpegDimensions)) {
    return json({ error: 'Valid optimized image dimensions are required.' }, 400);
  }

  const resourceType = categoryId ? 'categories' : 'subcategories';
  const resourceId = categoryId || subcategoryId;
  const assetId = crypto.randomUUID();
  const jpegPath = `${resourceType}/${resourceId}/${assetId}.jpg`;
  const jxlPath = `${resourceType}/${resourceId}/${assetId}.jxl`;
  const uploadedPaths = [];
  let client = null;
  let transactionStarted = false;
  try {
    // Upload to unique immutable paths before acquiring the database row lock.
    // This keeps storage latency outside the critical transaction.
    await uploadObject(baseUrl, storageSecret, jpegPath, jpegBuffer, 'image/jpeg');
    uploadedPaths.push(jpegPath);
    await uploadObject(baseUrl, storageSecret, jxlPath, jxlBuffer, 'image/jxl');
    uploadedPaths.push(jxlPath);

    // Acquire a database connection only after storage uploads complete.
    // Avoid holding scarce pool connections during network I/O.
    client = await pool.connect();
    await client.query('BEGIN');
    transactionStarted = true;
    const target = categoryId
      ? await client.query('SELECT id, image_media_id FROM public.marketplace_categories WHERE id=$1 FOR UPDATE', [categoryId])
      : await client.query('SELECT id, image_media_id FROM public.marketplace_subcategories WHERE id=$1 FOR UPDATE', [subcategoryId]);

    if (!target.rowCount) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      await removeObjects(baseUrl, storageSecret, uploadedPaths);
      return json({ error: 'Marketplace content item not found.' }, 404);
    }

    const previousMediaId = target.rows[0].image_media_id;
    if (previousMediaId) {
      await client.query(
        'UPDATE public.marketplace_content_media SET retired_at=NOW() WHERE id=$1 AND retired_at IS NULL',
        [previousMediaId]
      );
    }

    const media = await client.query(
      `INSERT INTO public.marketplace_content_media
        (marketplace_category_id, marketplace_subcategory_id, jpeg_path, jxl_path,
         jpeg_size_bytes, jxl_size_bytes, width, height, alt_text, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [categoryId || null, subcategoryId || null, jpegPath, jxlPath,
       jpegBuffer.length, jxlBuffer.length, width, height, altText, admin.id]
    );

    if (categoryId) {
      await client.query(
        'UPDATE public.marketplace_categories SET image_media_id=$2,updated_at=NOW() WHERE id=$1',
        [categoryId, media.rows[0].id]
      );
    } else {
      await client.query(
        'UPDATE public.marketplace_subcategories SET image_media_id=$2,updated_at=NOW() WHERE id=$1',
        [subcategoryId, media.rows[0].id]
      );
    }
    await client.query('COMMIT');
    transactionStarted = false;

    const publicBase = `${baseUrl}/storage/v1/object/public/marketplace-media/`;
    return json({
      media: {
        id: media.rows[0].id,
        image_url: publicBase + encodeStoragePath(jpegPath),
        image_jxl_url: publicBase + encodeStoragePath(jxlPath),
        width,
        height,
        jpeg_size_bytes: jpegBuffer.length,
        jxl_size_bytes: jxlBuffer.length,
        alt_text: altText,
      },
    }, 201);
  } catch (error) {
    if (transactionStarted && client) await client.query('ROLLBACK').catch(() => {});
    await removeObjects(baseUrl, storageSecret, uploadedPaths);
    console.error('[admin-marketplace-media] upload failed', {
      errorCode: error?.code || null,
      errorMessage: error?.message || 'Unknown error',
    });
    return json({ error: 'Marketplace image could not be stored.' }, 500);
  } finally {
    if (client) client.release();
  }
};
