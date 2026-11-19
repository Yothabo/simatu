import type { Session } from '@supabase/supabase-js';
import { ADMIN_STORAGE_KEYS } from '../constants/admin.constants';

export function clearAdminStorage() {
  try {
    const storageKeys = Object.values(ADMIN_STORAGE_KEYS);

    for (let index = sessionStorage.length - 1; index >= 0; index--) {
      const storedKey = sessionStorage.key(index);

      if (
        storedKey &&
        storageKeys.some(
          (key) => storedKey === key || storedKey.startsWith(`${key}:`),
        )
      ) {
        sessionStorage.removeItem(storedKey);
      }
    }
  } catch {
    // Storage may be unavailable.
  }
}

// The session_id is used only to deduplicate client-side checks.
// It is never used as proof of authentication or authorization.
export function getSessionIdentity(session: Session): string {
  try {
    const payload = session.access_token.split('.')[1];

    if (payload) {
      const claims = JSON.parse(
        window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      );

      if (typeof claims.session_id === 'string') {
        return `${session.user.id}:${claims.session_id}`;
      }
    }
  } catch {
    // Fall back to the authenticated user identity.
  }

  return session.user.id;
}
