import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

function requestContext(request) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const suppliedRequestId = request.headers.get('x-request-id') || '';
  const suppliedFlowId = request.headers.get('x-admin-flow-id') || '';
  return {
    requestId: uuidPattern.test(suppliedRequestId)
      ? suppliedRequestId
      : globalThis.crypto.randomUUID(),
    flowId: uuidPattern.test(suppliedFlowId) ? suppliedFlowId : null,
  };
}

function json(data, status = 200, requestId) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      ...(requestId ? { 'X-Request-ID': requestId } : {}),
    },
  });
}

export default async (request) => {
  const { requestId, flowId } = requestContext(request);
  const requestStartedAt = Date.now();
  let client;
  let databaseCommitted = false;
  let outcome = 'error';

  try {
    if (request.method !== 'GET') {
      outcome = 'method_not_allowed';
      return json({ error: 'Method not allowed.' }, 405, requestId);
    }

    const authStartedAt = Date.now();
    const admin = await requireAdmin(request, pool, {
      allowSessionBootstrap: true,
    });
    console.info('[admin-context-timing]', JSON.stringify({
      requestId,
      flowId,
      stage: 'require_admin',
      durationMs: Date.now() - authStartedAt,
      outcome: admin ? 'authorized' : 'denied',
    }));

    if (!admin) {
      outcome = 'unauthorized';
      return json({ error: 'Not authorised.' }, 401, requestId);
    }

    let appSessionId = admin.app_session_id ?? null;

    if (!appSessionId) {
      const bootstrapStartedAt = Date.now();
      client = await pool.connect();
      await client.query('BEGIN');

      const inserted = await client.query(
        `INSERT INTO public.admin_sessions (
           admin_id,
           supabase_session_id,
           user_agent
         )
         VALUES ($1, $2, $3)
         ON CONFLICT (supabase_session_id) DO NOTHING
         RETURNING id`,
        [
          admin.id,
          admin.supabase_session_id,
          request.headers.get('user-agent')?.slice(0, 1000) || null,
        ]
      );

      if (inserted.rowCount) {
        appSessionId = inserted.rows[0].id;
        await client.query(
          `INSERT INTO public.admin_activity_log (
             event_type,
             entity_type,
             entity_id,
             description,
             actor_email,
             metadata
           )
           VALUES (
             'admin.login',
             'admin',
             $1,
             'Administrator signed in.',
             $2,
             '{}'::jsonb
           )`,
          [admin.id, admin.email]
        );
      } else {
        const existing = await client.query(
          `SELECT id, admin_id, ended_at, revoked_at
           FROM public.admin_sessions
           WHERE supabase_session_id = $1
           LIMIT 1
           FOR UPDATE`,
          [admin.supabase_session_id]
        );

        if (
          !existing.rowCount ||
          existing.rows[0].admin_id !== admin.id ||
          existing.rows[0].ended_at ||
          existing.rows[0].revoked_at
        ) {
          await client.query('ROLLBACK');
          outcome = 'inactive_session_conflict';
          return json({ error: 'This session is no longer active.' }, 401, requestId);
        }

        appSessionId = existing.rows[0].id;
        await client.query(
          `UPDATE public.admin_sessions
           SET last_seen_at = now(),
               user_agent = COALESCE(user_agent, $2)
           WHERE id = $1`,
          [
            appSessionId,
            request.headers.get('user-agent')?.slice(0, 1000) || null,
          ]
        );
      }

      console.info('[admin-context-timing]', JSON.stringify({
        requestId,
        flowId,
        stage: 'session_bootstrap_transaction',
        durationMs: Date.now() - bootstrapStartedAt,
        insertedNewSession: Boolean(inserted.rowCount),
      }));
    }

    const storeQueryStartedAt = Date.now();
    const storeResult = client
      ? await client.query(
          `SELECT slug, created_at
           FROM public.stores
           WHERE ($1::text IS NULL OR slug = $1)
           ORDER BY created_at ASC`,
          [admin.role === 'store_admin' ? admin.store_slug : null]
        )
      : await pool.query(
          `SELECT slug, created_at
           FROM public.stores
           WHERE ($1::text IS NULL OR slug = $1)
           ORDER BY created_at ASC`,
          [admin.role === 'store_admin' ? admin.store_slug : null]
        );
    console.info('[admin-context-timing]', JSON.stringify({
      requestId,
      flowId,
      stage: 'store_metadata_query',
      durationMs: Date.now() - storeQueryStartedAt,
      rowCount: storeResult.rowCount,
    }));

    const storeCreatedAt = Object.fromEntries(
      storeResult.rows.map((store) => [
        store.slug,
        new Date(store.created_at).toISOString(),
      ])
    );

    if (client) {
      await client.query('COMMIT');
      databaseCommitted = true;
    }

    outcome = 'success';
    return json({
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        storeId: admin.store_id,
        storeSlug: admin.store_slug,
      },
      sessionId: appSessionId,
      storeCreatedAt,
    }, 200, requestId);
  } catch (error) {
    if (client && !databaseCommitted) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('[admin-context] request failed', JSON.stringify({
      requestId,
      flowId,
      errorName: error?.name || 'UnknownError',
    }));
    return json({ error: 'Unable to verify admin access.' }, 500, requestId);
  } finally {
    client?.release();
    console.info('[admin-context-timing]', JSON.stringify({
      requestId,
      flowId,
      stage: 'request_total',
      durationMs: Date.now() - requestStartedAt,
      outcome,
    }));
  }
};
