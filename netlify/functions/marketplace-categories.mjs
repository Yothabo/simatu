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
      `SELECT id, name, slug, description, sort_order
       FROM public.marketplace_categories
       WHERE is_active IS TRUE
         AND audience_policy = 'general'
       ORDER BY sort_order ASC, name ASC`
    );

    return json(
      { categories: result.rows },
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
