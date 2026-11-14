import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export default async (request) => {
  let client;
  let databaseCommitted = false;

  try {
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed.' }, 405);
    }

    // This endpoint is the only route allowed to bootstrap a new app session.
    const admin = await requireAdmin(request, pool, {
      allowSessionBootstrap: true,
    });

    if (!admin) {
      return json({ error: 'Not authorised.' }, 401);
    }

    // Existing sessions have already been verified and heartbeated
    // by requireAdmin(). Only bootstrap sessions need a transaction here.
    let appSessionId = admin.app_session_id ?? null;

    if (!appSessionId) {
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
          return json({ error: 'This session is no longer active.' }, 401);
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
    }

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
    });
  } catch (error) {
    if (client && !databaseCommitted) {
      await client.query('ROLLBACK').catch(() => {});
    }

    console.error('Admin context error:', error);
    return json({ error: 'Unable to verify admin access.' }, 500);
  } finally {
    client?.release();
  }
};
