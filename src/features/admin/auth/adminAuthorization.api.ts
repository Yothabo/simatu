import type { Session } from '@supabase/supabase-js';
import type { AdminContext } from './adminAuth.types';
import {
  createAdminRequestId,
  getAdminFlowId,
  logAdminTiming,
  startAdminTimer,
} from './adminRequestTelemetry';

type AdminContextResponse = {
  status: number;
  admin: AdminContext | null;
};

export async function verifyAdminContext(
  session: Session,
  signal: AbortSignal,
  attempt = 1,
): Promise<AdminContextResponse> {
  const requestId = createAdminRequestId();
  const flowId = getAdminFlowId();
  const requestStartedAt = startAdminTimer();
  let statusCode = 0;

  try {
    const fetchStartedAt = startAdminTimer();
    const response = await fetch('/api/admin-context', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'X-Request-ID': requestId,
        'X-Admin-Flow-ID': flowId,
      },
      cache: 'no-store',
      signal,
    });
    statusCode = response.status;
    logAdminTiming('admin.context.fetch', requestId, fetchStartedAt, {
      attempt,
      httpStatus: statusCode,
    });

    if (response.status === 401 || response.status === 403) {
      logAdminTiming('admin.context.total', requestId, requestStartedAt, {
        attempt,
        httpStatus: statusCode,
        outcome: 'denied',
      });
      return { status: response.status, admin: null };
    }

    if (!response.ok) {
      throw new Error(`Admin verification failed with HTTP ${response.status}.`);
    }

    const parseStartedAt = startAdminTimer();
    const payload = await response.json();
    logAdminTiming('admin.context.parse', requestId, parseStartedAt, { attempt });

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
      logAdminTiming('admin.context.total', requestId, requestStartedAt, {
        attempt,
        httpStatus: statusCode,
        outcome: 'invalid_payload',
      });
      return { status: response.status, admin: null };
    }

    logAdminTiming('admin.context.total', requestId, requestStartedAt, {
      attempt,
      httpStatus: statusCode,
      outcome: 'success',
    });

    return {
      status: response.status,
      admin: {
        ...verifiedAdmin,
        storeCreatedAt:
          payload?.storeCreatedAt && typeof payload.storeCreatedAt === 'object'
            ? payload.storeCreatedAt
            : {},
      },
    };
  } catch (error) {
    logAdminTiming('admin.context.total', requestId, requestStartedAt, {
      attempt,
      httpStatus: statusCode || null,
      outcome: 'error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    throw error;
  }
}
