function getSupabaseSessionId(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    const sessionId = claims.session_id;

    return typeof sessionId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)
      ? sessionId
      : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(
  request,
  pool,
  { allowSessionBootstrap = false } = {}
) {
  const startedAt = Date.now();
  const requestIdHeader = request.headers.get('x-request-id') || '';
  const flowIdHeader = request.headers.get('x-admin-flow-id') || '';
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const requestId = uuidPattern.test(requestIdHeader)
    ? requestIdHeader
    : globalThis.crypto.randomUUID();
  const flowId = uuidPattern.test(flowIdHeader) ? flowIdHeader : null;
  const stages = {};
  let outcome = 'denied';

  const recordStage = (name, stageStartedAt, details = {}) => {
    const durationMs = Date.now() - stageStartedAt;
    stages[name] = durationMs;
    console.info('[admin-auth-timing]', JSON.stringify({
      requestId,
      flowId,
      stage: name,
      durationMs,
      ...details,
    }));
  };

  try {
    const authorization = request.headers.get('authorization') || '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : '';

    if (!token) {
      outcome = 'missing_token';
      return null;
    }

    const supabaseUrl = (
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
    ).replace(/\/+$/, '');

    const supabaseKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      outcome = 'configuration_error';
      throw new Error('Supabase authentication configuration is missing.');
    }

    // Keep remote token validation until the project's signing configuration is verified.
    const authStartedAt = Date.now();
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      recordStage('supabase_user_validation', authStartedAt, {
        httpStatus: response.status,
      });
      outcome = 'invalid_token';
      return null;
    }

    const user = await response.json();
    recordStage('supabase_user_validation', authStartedAt, {
      httpStatus: response.status,
      outcome: user?.id ? 'valid_user' : 'missing_user',
    });
    if (!user?.id) {
      outcome = 'invalid_user';
      return null;
    }

    const supabaseSessionId = getSupabaseSessionId(token);
    if (!supabaseSessionId) {
      outcome = 'missing_session_claim';
      return null;
    }

    const adminLookupStartedAt = Date.now();
    const result = await pool.query(
      `SELECT
         a.id,
         a.email,
         a.role,
         a.store_id,
         a.is_active,
         s.slug AS store_slug,
         s.is_active AS store_is_active
       FROM public.admins a
       LEFT JOIN public.stores s ON s.id = a.store_id
       WHERE a.id = $1
         AND a.is_active IS TRUE
       LIMIT 1`,
      [user.id]
    );
    recordStage('admin_database_lookup', adminLookupStartedAt, {
      rowCount: result.rowCount,
    });

    if (!result.rowCount) {
      outcome = 'admin_not_found_or_inactive';
      return null;
    }

    const admin = result.rows[0];

    if (admin.role === 'super_admin') {
      if (admin.store_id !== null) {
        outcome = 'invalid_super_admin_store';
        return null;
      }
    } else if (admin.role === 'store_admin') {
      if (
        !admin.store_id ||
        !admin.store_slug ||
        admin.store_is_active !== true
      ) {
        outcome = 'invalid_store_admin_scope';
        return null;
      }
    } else {
      outcome = 'invalid_admin_role';
      return null;
    }

    const sessionLookupStartedAt = Date.now();
    const sessionResult = await pool.query(
      `SELECT id, ended_at, revoked_at
       FROM public.admin_sessions
       WHERE supabase_session_id = $1
         AND admin_id = $2
       LIMIT 1`,
      [supabaseSessionId, admin.id]
    );
    recordStage('admin_session_lookup', sessionLookupStartedAt, {
      rowCount: sessionResult.rowCount,
    });

    if (!sessionResult.rowCount) {
      if (!allowSessionBootstrap) {
        outcome = 'application_session_missing';
        return null;
      }

      outcome = 'session_bootstrap_required';
      return {
        ...admin,
        supabase_session_id: supabaseSessionId,
        needs_session_bootstrap: true,
      };
    }

    const appSession = sessionResult.rows[0];

    if (appSession.ended_at || appSession.revoked_at) {
      outcome = appSession.revoked_at ? 'session_revoked' : 'session_ended';
      return null;
    }

    const heartbeatStartedAt = Date.now();
    const heartbeat = await pool.query(
      `UPDATE public.admin_sessions
       SET last_seen_at = now()
       WHERE id = $1
         AND admin_id = $2
         AND ended_at IS NULL
         AND revoked_at IS NULL`,
      [appSession.id, admin.id]
    );
    recordStage('admin_session_heartbeat', heartbeatStartedAt, {
      rowCount: heartbeat.rowCount,
    });

    if (!heartbeat.rowCount) {
      outcome = 'session_not_active';
      return null;
    }

    outcome = 'authorized';
    return {
      ...admin,
      supabase_session_id: supabaseSessionId,
      app_session_id: appSession.id,
    };
  } catch (error) {
    if (outcome !== 'configuration_error') outcome = 'error';
    throw error;
  } finally {
    console.info('[admin-auth-timing]', JSON.stringify({
      requestId,
      flowId,
      stage: 'require_admin_total',
      totalDurationMs: Date.now() - startedAt,
      outcome,
      stages,
      allowSessionBootstrap,
    }));
  }
}
export function canAccessStore(admin, storefront) {
  if (!admin || !storefront) return false;

  if (admin.role === 'super_admin') return true;

  return (
    admin.role === 'store_admin' &&
    admin.store_slug === storefront
  );
}
