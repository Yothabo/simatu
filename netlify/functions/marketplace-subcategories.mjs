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

export default async (request) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET', 'Cache-Control': 'no-store' });
  try {
    const result = await pool.query(
      `SELECT mc.id AS category_id, mc.slug AS category_slug, mc.name AS category_name,
              msc.id, msc.slug, msc.name, msc.description, msc.sort_order,
              media.jpeg_path, media.jxl_path, media.alt_text AS image_alt_text
       FROM public.marketplace_categories mc
       JOIN public.marketplace_subcategories msc ON msc.marketplace_category_id = mc.id
       LEFT JOIN public.marketplace_content_media media
         ON media.id = msc.image_media_id AND media.retired_at IS NULL
       WHERE mc.is_active IS TRUE
         AND mc.publication_status = 'published'
         AND mc.audience_policy = 'general'
         AND msc.is_active IS TRUE
         AND msc.publication_status = 'published'
       ORDER BY mc.sort_order, msc.sort_order, msc.name`
    );
    const storageBase = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\\/+$/, '');
    const subcategories = result.rows.map(({ jpeg_path, jxl_path, ...subcategory }) => ({
      ...subcategory,
      image_url: jpeg_path && storageBase ? `${storageBase}/storage/v1/object/public/marketplace-media/${jpeg_path.split('/').map(encodeURIComponent).join('/')}` : null,
      image_jxl_url: jxl_path && storageBase ? `${storageBase}/storage/v1/object/public/marketplace-media/${jxl_path.split('/').map(encodeURIComponent).join('/')}` : null,
    }));
    return json({ subcategories }, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });
  } catch (error) {
    console.error('[marketplace-subcategories] query failed', { errorCode: error?.code || null, errorMessage: error?.message || 'Unknown database error' });
    return json({ error: 'Marketplace subcategories are temporarily unavailable.' }, 500, { 'Cache-Control': 'no-store' });
  }
};
