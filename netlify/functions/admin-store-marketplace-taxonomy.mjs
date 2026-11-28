import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'private, no-store' },
});
const storeSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  let admin;
  try {
    admin = await requireAdmin(request, pool);
  } catch (error) {
    console.error('[admin-store-marketplace-taxonomy] auth failed', error?.code || error?.message);
    return json({ error: 'Unable to verify administrator access.' }, 503);
  }
  if (!admin) return json({ error: 'Authentication required.' }, 401);

  const requestedStore = new URL(request.url).searchParams.get('storefront')?.trim().toLowerCase() || '';
  const storeSlug = admin.role === 'store_admin' ? admin.store_slug : requestedStore;

  if (!storeSlug || !storeSlugPattern.test(storeSlug)) {
    return json({ error: 'A valid storefront is required.' }, 400);
  }
  if (admin.role === 'store_admin' && requestedStore && requestedStore !== admin.store_slug) {
    return json({ error: 'You cannot access another storefront taxonomy.' }, 403);
  }

  try {
    const result = await pool.query(
      `SELECT mc.id AS category_id, mc.slug AS category_slug, mc.name AS category_name,
              msc.id AS id, msc.slug AS slug, msc.name AS name,
              msc.description, msc.sort_order
       FROM public.stores s
       JOIN public.store_marketplace_categories smc ON smc.store_id = s.id
       JOIN public.marketplace_categories mc ON mc.id = smc.marketplace_category_id
       JOIN public.marketplace_subcategories msc ON msc.marketplace_category_id = mc.id
       WHERE s.slug = $1
         AND s.is_active IS TRUE
         AND mc.is_active IS TRUE
         AND mc.publication_status = 'published'
         AND mc.audience_policy = 'general'
         AND msc.is_active IS TRUE
         AND msc.publication_status = 'published'
       ORDER BY mc.sort_order, mc.name, msc.sort_order, msc.name`,
      [storeSlug]
    );

    return json({
      storefront: storeSlug,
      categories: Array.from(new Map(result.rows.map((item) => [
        item.category_id,
        { id: item.category_id, slug: item.category_slug, name: item.category_name },
      ])).values()),
      subcategories: result.rows.map(({ category_id, category_slug, category_name, ...subcategory }) => ({
        ...subcategory,
        category_id,
        category_slug,
        category_name,
      })),
    });
  } catch (error) {
    console.error('[admin-store-marketplace-taxonomy] query failed', error?.code || error?.message);
    return json({ error: 'Store marketplace classifications are temporarily unavailable.' }, 500);
  }
};
