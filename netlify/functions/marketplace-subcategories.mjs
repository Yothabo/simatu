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
      `SELECT mc.slug AS category_slug, mc.name AS category_name,
              msc.id, msc.slug, msc.name, msc.description, msc.sort_order
       FROM public.marketplace_categories mc
       JOIN public.marketplace_subcategories msc ON msc.marketplace_category_id = mc.id
       WHERE mc.is_active IS TRUE
         AND mc.audience_policy = 'general'
         AND msc.is_active IS TRUE
       ORDER BY mc.sort_order, msc.sort_order, msc.name`
    );
    return json({ subcategories: result.rows }, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });
  } catch (error) {
    console.error('[marketplace-subcategories] query failed', { errorCode: error?.code || null, errorMessage: error?.message || 'Unknown database error' });
    return json({ error: 'Marketplace subcategories are temporarily unavailable.' }, 500, { 'Cache-Control': 'no-store' });
  }
};
