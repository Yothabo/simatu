import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

function json(data, status = 200, requestId) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      ...(requestId ? { 'X-Request-ID': requestId } : {}),
    },
  });}

export default async (request) => {
  const requestId = request.headers.get('x-request-id') || globalThis.crypto.randomUUID();
  const flowId = request.headers.get('x-admin-flow-id') || null;
  const requestStartedAt = Date.now();

  try {
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed.' }, 405, requestId);
    }

    const authStartedAt = Date.now();
    const admin = await requireAdmin(request, pool);
    console.info('[admin-data-timing]', JSON.stringify({
      requestId,
      flowId,
      endpoint: 'activity',
      stage: 'admin_authorization',
      durationMs: Date.now() - authStartedAt,
      outcome: admin ? 'authorized' : 'denied',
    }));

    if (!admin) {
      return json({ error: 'Not authorised.' }, 401, requestId);
    }

    const storeSlug =
      admin.role === 'store_admin' ? admin.store_slug : null;

    const queryStartedAt = Date.now();
    const result = await pool.query(
      `SELECT
         a.id,
         a.event_type,
         a.entity_type,
         a.entity_id,
         a.description,
         a.actor_email,
         a.metadata,
         a.created_at
       FROM public.admin_activity_log a
       WHERE
         $1::text IS NULL
         OR a.metadata->>'storefront' = $1
         OR a.metadata->'current'->>'storefront' = $1
         OR a.metadata->'previous'->>'storefront' = $1
         OR (
           a.entity_type = 'product'
           AND EXISTS (
             SELECT 1
             FROM public.products p
             WHERE p.id = a.entity_id
               AND p.storefront = $1
           )
         )
         OR (
           a.entity_type = 'order'
           AND EXISTS (
             SELECT 1
             FROM public.orders o
             WHERE o.id = a.entity_id
               AND o.storefront = $1
           )
         )
       ORDER BY a.created_at DESC`,
      [storeSlug]
    );
    console.info('[admin-data-timing]', JSON.stringify({
      requestId,
      flowId,
      endpoint: 'activity',
      stage: 'activity_select',
      durationMs: Date.now() - queryStartedAt,
      rowCount: result.rowCount,
    }));
    console.info('[activity] request completed', JSON.stringify({
      requestId,
      flowId,
      status: 200,
      totalDurationMs: Date.now() - requestStartedAt,
    }));
    return json({ activities: result.rows }, 200, requestId);
  } catch (error) {
    console.error('[activity] request failed', JSON.stringify({
      requestId,
      flowId,
      errorName: error?.name || 'UnknownError',
      totalDurationMs: Date.now() - requestStartedAt,
    }));
    return json({ error: 'Unable to retrieve activities.' }, 500, requestId);
  }
};
