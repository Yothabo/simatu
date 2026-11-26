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
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, {
      Allow: 'POST',
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

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400, { 'Cache-Control': 'no-store' });
  }

  const action = body?.action;
  const storeId = String(body?.storeId || '');
  const categoryId = String(body?.categoryId || '');

  if (!['assign', 'unassign'].includes(action)) {
    return json({ error: 'Action must be assign or unassign.' }, 400, { 'Cache-Control': 'no-store' });
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
        `INSERT INTO public.store_marketplace_categories (store_id, marketplace_category_id)
         VALUES ($1, $2)
         ON CONFLICT (store_id, marketplace_category_id) DO NOTHING`,
        [storeId, categoryId]
      );
    } else {
      await client.query(
        `DELETE FROM public.store_marketplace_categories
         WHERE store_id = $1 AND marketplace_category_id = $2`,
        [storeId, categoryId]
      );
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
