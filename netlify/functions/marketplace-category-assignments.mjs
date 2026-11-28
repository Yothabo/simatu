import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

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

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Platform-only marketplace category assignment management.
 * POST body: { action: 'assign'|'unassign', storeId, categoryId }
 */
export default async (request) => {
  if (!['GET', 'POST'].includes(request.method)) {
    return json({ error: 'Method not allowed.' }, 405, {
      Allow: 'GET, POST',
      'Cache-Control': 'no-store',
    });
  }

  const admin = await requireAdmin(request, pool);
  if (!admin) {
    return json({ error: 'Authentication required.' }, 401, {
      'Cache-Control': 'no-store',
    });
  }
  if (admin.role !== 'super_admin') {
    return json({ error: 'Only platform administrators may manage marketplace category assignments.' }, 403, {
      'Cache-Control': 'no-store',
    });
  }

  if (request.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT
           s.id AS store_id,
           s.name AS store_name,
           s.slug AS store_slug,
           s.is_active,
           COALESCE(
             json_agg(json_build_object(
               'id', mc.id,
               'name', mc.name,
               'slug', mc.slug,
               'is_primary', smc.is_primary
             ) ORDER BY mc.sort_order, mc.name)
             FILTER (WHERE mc.id IS NOT NULL),
             '[]'::json
           ) AS categories
         FROM public.stores s
         LEFT JOIN public.store_marketplace_categories smc
           ON smc.store_id = s.id
         LEFT JOIN public.marketplace_categories mc
           ON mc.id = smc.marketplace_category_id
          AND mc.is_active IS TRUE
          AND mc.audience_policy = 'general'
         GROUP BY s.id, s.name, s.slug, s.is_active
         ORDER BY s.name ASC`
      );
      return json({ stores: result.rows }, 200, { 'Cache-Control': 'no-store' });
    } catch (error) {
      console.error('[marketplace-category-assignments] listing failed', {
        errorCode: error?.code || null,
        errorMessage: error?.message || 'Unknown database error',
      });
      return json({ error: 'Unable to load marketplace assignments.' }, 500, { 'Cache-Control': 'no-store' });
    }
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400, { 'Cache-Control': 'no-store' });
  }

  const action = body?.action;
  const storeId = String(body?.storeId || '');
  const categoryId = String(body?.categoryId || '');

  if (!['assign', 'unassign', 'set-primary'].includes(action)) {
    return json({ error: 'Action must be assign, unassign or set-primary.' }, 400, { 'Cache-Control': 'no-store' });
  }
  if (!uuidPattern.test(storeId) || !uuidPattern.test(categoryId)) {
    return json({ error: 'Valid storeId and categoryId UUIDs are required.' }, 400, { 'Cache-Control': 'no-store' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.actor_email', $1, true)", [admin.email || '']);

    const category = await client.query(
      `SELECT id, slug, audience_policy, is_active
       FROM public.marketplace_categories
       WHERE id = $1
       FOR UPDATE`,
      [categoryId]
    );
    if (!category.rowCount || category.rows[0].is_active !== true || category.rows[0].audience_policy !== 'general') {
      await client.query('ROLLBACK');
      return json({ error: 'Category not found or not eligible for general marketplace assignment.' }, 404, { 'Cache-Control': 'no-store' });
    }

    const store = await client.query(
      `SELECT id, slug, name
       FROM public.stores
       WHERE id = $1
       FOR UPDATE`,
      [storeId]
    );
    if (!store.rowCount) {
      await client.query('ROLLBACK');
      return json({ error: 'Store not found.' }, 404, { 'Cache-Control': 'no-store' });
    }

    if (action === 'assign') {
      await client.query(
        `INSERT INTO public.store_marketplace_categories (store_id, marketplace_category_id, is_primary)
         VALUES ($1, $2, NOT EXISTS (
           SELECT 1 FROM public.store_marketplace_categories
           WHERE store_id = $1 AND is_primary IS TRUE
         ))
         ON CONFLICT (store_id, marketplace_category_id) DO NOTHING`,
        [storeId, categoryId]
      );
    } else if (action === 'set-primary') {
      const assignment = await client.query(
        'SELECT 1 FROM public.store_marketplace_categories WHERE store_id=$1 AND marketplace_category_id=$2',
        [storeId, categoryId]
      );
      if (!assignment.rowCount) {
        await client.query('ROLLBACK');
        return json({ error: 'Assign the category to the store before making it primary.' }, 409, { 'Cache-Control': 'no-store' });
      }
      await client.query(
        'UPDATE public.store_marketplace_categories SET is_primary=FALSE WHERE store_id=$1 AND is_primary IS TRUE',
        [storeId]
      );
      await client.query(
        'UPDATE public.store_marketplace_categories SET is_primary=TRUE WHERE store_id=$1 AND marketplace_category_id=$2',
        [storeId, categoryId]
      );
    } else {
      const assignmentCount = await client.query(
        'SELECT COUNT(*)::integer AS count FROM public.store_marketplace_categories WHERE store_id=$1',
        [storeId]
      );
      if (Number(assignmentCount.rows[0]?.count || 0) <= 1) {
        await client.query('ROLLBACK');
        return json({ error: 'Every classified store must retain at least one marketplace category.' }, 409, { 'Cache-Control': 'no-store' });
      }
      const removed = await client.query(
        `DELETE FROM public.store_marketplace_categories
         WHERE store_id = $1 AND marketplace_category_id = $2
         RETURNING is_primary`,
        [storeId, categoryId]
      );
      if (removed.rows[0]?.is_primary) {
        const next = await client.query(
          `SELECT marketplace_category_id FROM public.store_marketplace_categories
           WHERE store_id=$1 ORDER BY created_at, marketplace_category_id LIMIT 1`,
          [storeId]
        );
        if (next.rowCount) {
          await client.query(
            'UPDATE public.store_marketplace_categories SET is_primary=TRUE WHERE store_id=$1 AND marketplace_category_id=$2',
            [storeId, next.rows[0].marketplace_category_id]
          );
        }
      }
    }

    await client.query('COMMIT');
    return json({ action, store: store.rows[0], category: category.rows[0] }, 200, {
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[marketplace-category-assignments] mutation failed', {
      action,
      errorCode: error?.code || null,
      errorMessage: error?.message || 'Unknown database error',
    });
    return json({ error: 'Unable to update marketplace category assignment.' }, 500, {
      'Cache-Control': 'no-store',
    });
  } finally {
    client.release();
  }
};
