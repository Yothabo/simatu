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
 * Public marketplace business discovery.
 * Businesses must be explicitly assigned to a platform category and have at
 * least one active, marketplace-visible, non-restricted listing.
 */
export default async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405, {
      Allow: 'GET',
      'Cache-Control': 'no-store',
    });
  }

  const url = new URL(request.url);
  const categorySlug = (url.searchParams.get('category') || '').trim().toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categorySlug)) {
    return json({ error: 'A valid marketplace category is required.' }, 400, {
      'Cache-Control': 'no-store',
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         s.id AS store_id,
         s.slug AS store_slug,
         mc.id AS category_id,
         mc.slug AS category_slug,
         COUNT(DISTINCT p.id)::integer AS eligible_listing_count
       FROM public.marketplace_categories mc
       JOIN public.store_marketplace_categories smc
         ON smc.marketplace_category_id = mc.id
       JOIN public.stores s
         ON s.id = smc.store_id
       JOIN public.products p
         ON p.store_id = s.id
        AND p.storefront = s.slug
        AND p.is_active IS TRUE
        AND p.marketplace_visible IS TRUE
        AND COALESCE(p.is_age_restricted, FALSE) IS FALSE
       WHERE mc.slug = $1
         AND s.is_active IS TRUE
         AND mc.is_active IS TRUE
         AND mc.audience_policy = 'general'
       GROUP BY s.id, s.slug, mc.id, mc.slug
       ORDER BY s.slug ASC`,
      [categorySlug]
    );

    return json(
      { businesses: result.rows },
      200,
      {
        'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
      }
    );
  } catch (error) {
    console.error('[marketplace-businesses] query failed', {
      categorySlug,
      errorCode: error?.code || null,
      errorMessage: error?.message || 'Unknown database error',
    });

    return json(
      { error: 'Marketplace businesses are temporarily unavailable.' },
      500,
      { 'Cache-Control': 'no-store' }
    );
  }
};
