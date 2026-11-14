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
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';

  if (!token) return null;

  const supabaseUrl = (
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  ).replace(/\/+$/, '');

  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase authentication configuration is missing.');
  }

  // Validate the bearer token with Supabase before reading its claims.
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${token}`,
    },
    // A stalled Supabase Auth request must not hold a Netlify function open.
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) return null;

  const user = await response.json();
  if (!user?.id) return null;

  const supabaseSessionId = getSupabaseSessionId(token);
  if (!supabaseSessionId) return null;

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

  if (!result.rowCount) return null;

  const admin = result.rows[0];

  if (admin.role === 'super_admin') {
    if (admin.store_id !== null) return null;
  } else if (admin.role === 'store_admin') {
    if (
      !admin.store_id ||
      !admin.store_slug ||
      admin.store_is_active !== true
    ) {
      return null;
    }
  } else {
    return null;
  }

  const sessionResult = await pool.query(
    `SELECT id, ended_at, revoked_at
     FROM public.admin_sessions
     WHERE supabase_session_id = $1
       AND admin_id = $2
     LIMIT 1`,
    [supabaseSessionId, admin.id]
  );

  if (!sessionResult.rowCount) {
    if (!allowSessionBootstrap) return null;

    return {
      ...admin,
      supabase_session_id: supabaseSessionId,
      needs_session_bootstrap: true,
    };
  }

  const appSession = sessionResult.rows[0];

  if (appSession.ended_at || appSession.revoked_at) return null;

  const heartbeat = await pool.query(
    `UPDATE public.admin_sessions
     SET last_seen_at = now()
     WHERE id = $1
       AND admin_id = $2
       AND ended_at IS NULL
       AND revoked_at IS NULL`,
    [appSession.id, admin.id]
  );

  if (!heartbeat.rowCount) return null;

  return {
    ...admin,
    supabase_session_id: supabaseSessionId,
    app_session_id: appSession.id,
  };
}

export function canAccessStore(admin, storefront) {
  if (!admin || !storefront) return false;

  if (admin.role === 'super_admin') return true;

  return (
    admin.role === 'store_admin' &&
    admin.store_slug === storefront
  );
}
