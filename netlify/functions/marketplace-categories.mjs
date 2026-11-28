import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

/**
 * Public marketplace taxonomy read endpoint.
 * Restricted categories are intentionally omitted until server-side age
 * verification and authorization are implemented.
 */
export default async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405, {
      Allow: 'GET',
      'Cache-Control': 'no-store',
    });
  }

  try {
    const result = await pool.query(
      `SELECT mc.id, mc.name, mc.slug, mc.description, mc.sort_order,
              media.jpeg_path, media.jxl_path, media.alt_text AS image_alt_text
       FROM public.marketplace_categories mc
       LEFT JOIN public.marketplace_content_media media
         ON media.id = mc.image_media_id AND media.retired_at IS NULL
       WHERE mc.is_active IS TRUE
         AND mc.publication_status = 'published'
         AND mc.audience_policy = 'general'
       ORDER BY mc.sort_order ASC, mc.name ASC`
    );
    const storageBase = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\\/+$/, '');
    const categories = result.rows.map(({ jpeg_path, jxl_path, ...category }) => ({
      ...category,
      image_url: jpeg_path && storageBase ? `${storageBase}/storage/v1/object/public/marketplace-media/${jpeg_path.split('/').map(encodeURIComponent).join('/')}` : null,
      image_jxl_url: jxl_path && storageBase ? `${storageBase}/storage/v1/object/public/marketplace-media/${jxl_path.split('/').map(encodeURIComponent).join('/')}` : null,
    }));

    return json(
      { categories },
      200,
      {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      }
    );
  } catch (error) {
    console.error('[marketplace-categories] query failed', {
      errorCode: error?.code || null,
      errorMessage: error?.message || 'Unknown database error',
    });

    return json(
      { error: 'Marketplace categories are temporarily unavailable.' },
      500,
      { 'Cache-Control': 'no-store' }
    );
  }
};
