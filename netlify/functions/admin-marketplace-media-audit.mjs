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
const MAX_OBJECTS = 10000;
const MAX_REPORT_ITEMS = 100;

async function listStorageObjects(baseUrl, secret) {
  const pendingPrefixes = [''];
  const objects = new Set();
  let truncated = false;

  while (pendingPrefixes.length) {
    const prefix = pendingPrefixes.shift();
    let offset = 0;

    while (true) {
      const response = await fetch(`${baseUrl}/storage/v1/object/list/marketplace-media`, {
        method: 'POST',
        headers: {
          apikey: secret,
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prefix,
          limit: 1000,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Storage listing failed (${response.status}).`);

      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error('Storage listing response is invalid.');

      for (const entry of entries) {
        if (!entry || typeof entry.name !== 'string' || !entry.name || entry.name.includes('/')) continue;
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.id == null && entry.metadata == null) {
          pendingPrefixes.push(path);
        } else {
          objects.add(path);
          if (objects.size >= MAX_OBJECTS) {
            truncated = true;
            return { objects, truncated };
          }
        }
      }

      if (entries.length < 1000) break;
      offset += entries.length;
    }
  }
  return { objects, truncated };
}

export default async (request) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);

  let admin;
  try {
    admin = await requireAdmin(request, pool);
  } catch (error) {
    console.error('[admin-marketplace-media-audit] auth failed', error?.message || 'unknown');
    return json({ error: 'Unable to verify administrator access.' }, 503);
  }
  if (!admin) return json({ error: 'Authentication required.' }, 401);
  if (admin.role !== 'super_admin') return json({ error: 'Only platform administrators may audit marketplace media.' }, 403);

  const baseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\\/+$/, '');
  const storageSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!baseUrl || !storageSecret) {
    return json({ error: 'Marketplace media storage is not configured on the server.' }, 503);
  }

  let client;
  try {
    client = await pool.connect();
    const dbResult = await client.query(`
      SELECT m.id, m.marketplace_category_id, m.marketplace_subcategory_id,
             m.jpeg_path, m.jxl_path, m.retired_at,
             c.image_media_id AS category_reference_id,
             s.image_media_id AS subcategory_reference_id
      FROM public.marketplace_content_media m
      LEFT JOIN public.marketplace_categories c
        ON c.id = m.marketplace_category_id
      LEFT JOIN public.marketplace_subcategories s
        ON s.id = m.marketplace_subcategory_id
      ORDER BY m.created_at DESC
    `);

    const storage = await listStorageObjects(baseUrl, storageSecret);
    const expectedPaths = new Set();
    const missingStorage = [];
    const retiredStillReferenced = [];
    for (const row of dbResult.rows) {
      expectedPaths.add(row.jpeg_path);
      expectedPaths.add(row.jxl_path);
      if (!storage.objects.has(row.jpeg_path)) missingStorage.push(row.jpeg_path);
      if (!storage.objects.has(row.jxl_path)) missingStorage.push(row.jxl_path);
      const referenced = row.category_reference_id === row.id || row.subcategory_reference_id === row.id;
      if (row.retired_at && referenced) retiredStillReferenced.push(row.id);
    }

    const orphanStorage = [...storage.objects].filter((path) => !expectedPaths.has(path));
    return json({
      audit: {
        database_media_records: dbResult.rows.length,
        expected_storage_objects: expectedPaths.size,
        actual_storage_objects_scanned: storage.objects.size,
        missing_storage_objects: missingStorage.length,
        orphan_storage_objects: orphanStorage.length,
        retired_media_still_referenced: retiredStillReferenced.length,
        scan_truncated: storage.truncated,
      },
      details: {
        missing_storage_objects: missingStorage.slice(0, MAX_REPORT_ITEMS),
        orphan_storage_objects: orphanStorage.slice(0, MAX_REPORT_ITEMS),
        retired_media_still_referenced: retiredStillReferenced.slice(0, MAX_REPORT_ITEMS),
      },
      note: 'Audit only. No storage objects or database records were changed.',
    });
  } catch (error) {
    console.error('[admin-marketplace-media-audit] failed', error?.message || 'unknown');
    return json({ error: 'Marketplace media audit could not be completed.' }, 503);
  } finally {
    if (client) client.release();
  }
};
