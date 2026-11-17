import type { Session } from '@supabase/supabase-js';
import type { AdminContext } from './adminAuth.types';

type AdminContextResponse = {
  status: number;
  admin: AdminContext | null;
};

export async function verifyAdminContext(
  session: Session,
  signal: AbortSignal,
): Promise<AdminContextResponse> {
  const response = await fetch('/api/admin-context', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: 'no-store',
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    return {
      status: response.status,
      admin: null,
    };
  }

  if (!response.ok) {
    throw new Error(
      `Admin verification failed with HTTP ${response.status}.`,
    );
  }

  const payload = await response.json();
  const verifiedAdmin = payload?.admin;

  const validAdmin =
    Boolean(verifiedAdmin?.id) &&
    ['super_admin', 'store_admin'].includes(verifiedAdmin.role) &&
    (
      verifiedAdmin.role !== 'store_admin' ||
      Boolean(verifiedAdmin.storeId && verifiedAdmin.storeSlug)
    ) &&
    (
      verifiedAdmin.role !== 'super_admin' ||
      verifiedAdmin.storeId === null
    );

  if (!validAdmin) {
    return {
      status: response.status,
      admin: null,
    };
  }

  return {
    status: response.status,
    admin: {
      ...verifiedAdmin,
      storeCreatedAt:
        payload?.storeCreatedAt &&
        typeof payload.storeCreatedAt === 'object'
          ? payload.storeCreatedAt
          : {},
    },
  };
}
