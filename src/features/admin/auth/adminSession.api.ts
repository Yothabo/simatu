import type { Session } from '@supabase/supabase-js';

export async function updateAppSession(
  currentSession: Session,
  action: 'heartbeat' | 'logout',
  signal?: AbortSignal,
) {
  const response = await fetch('/api/admin-session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentSession.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(
      payload?.error || 'Unable to update administrator session.',
    );
  }
}
