import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});
const storageBase = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\\/+$/, '');
const mediaUrl = (path) => path && storageBase
  ? `${storageBase}/storage/v1/object/public/marketplace-media/${path.split('/').map(encodeURIComponent).join('/')}`
  : null;

export default async (request) => {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed.' }, {
      status: 405,
      headers: { Allow: 'GET', 'Cache-Control': 'no-store' },
    });
  }

  try {
    const result = await pool.query(`
      SELECT t.id,t.title,t.image_url,t.alt_text,t.subtitle,t.destination_path,t.sort_order,
             c.name AS category_name,c.slug AS category_slug,
             media.jpeg_path,media.jxl_path,media.alt_text AS media_alt_text
      FROM public.marketplace_discovery_tiles t
      JOIN public.marketplace_categories c ON c.id=t.marketplace_category_id
      LEFT JOIN public.marketplace_content_media media
        ON media.id=c.image_media_id AND media.retired_at IS NULL
      WHERE t.is_active IS TRUE
        AND c.is_active IS TRUE
        AND c.publication_status='published'
        AND c.audience_policy='general'
      ORDER BY t.sort_order,t.title
    `);
    const tiles = result.rows.map(({ jpeg_path, jxl_path, media_alt_text, ...tile }) => ({
      ...tile,
      image_url: mediaUrl(jpeg_path) || tile.image_url,
      image_jxl_url: mediaUrl(jxl_path),
      alt_text: media_alt_text || tile.alt_text,
    }));
    return Response.json({ tiles }, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('[marketplace-discovery-tiles] read failed', error?.code || error?.message);
    return Response.json({ error: 'Discovery tiles unavailable.' }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
};
