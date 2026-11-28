import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

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
             c.name AS category_name,c.slug AS category_slug
      FROM public.marketplace_discovery_tiles t
      JOIN public.marketplace_categories c ON c.id=t.marketplace_category_id
      WHERE t.is_active IS TRUE
        AND c.is_active IS TRUE
        AND c.publication_status='published'
        AND c.audience_policy='general'
      ORDER BY t.sort_order,t.title
    `);
    // Discovery tiles own their imagery and alt text. Category imagery belongs
    // to category cards and must not override tile-specific content.
    const tiles = result.rows;
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
