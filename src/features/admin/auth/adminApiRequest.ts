import { supabase } from '../../../utils/supabase';
import {
  createAdminRequestId,
  getAdminFlowId,
  logAdminTiming,
  startAdminTimer,
} from './adminRequestTelemetry';

export type AdminApiMethod = 'GET' | 'PATCH' | 'DELETE';

type AdminApiRequestOptions = {
  userId: string | null;
  url: string;
  method: AdminApiMethod;
  body?: Record<string, unknown>;
  resource: 'products' | 'orders';
  responseCollection: 'products' | 'orders';
  fallbackError: string;
};

type AdminApiResponse = Record<string, unknown>;

function getCollectionLength(
  payload: unknown,
  collection: AdminApiRequestOptions['responseCollection'],
): number | null {
  if (!payload || typeof payload !== 'object') return null;

  const value = (payload as Record<string, unknown>)[collection];
  return Array.isArray(value) ? value.length : null;
}

function getResponseError(
  payload: unknown,
  fallbackError: string,
): string {
  if (!payload || typeof payload !== 'object') return fallbackError;

  const message = (payload as Record<string, unknown>).error;
  return typeof message === 'string' && message.trim()
    ? message
    : fallbackError;
}

/**
 * Shared authenticated request pipeline for admin data endpoints.
 * Keeps session validation, correlation headers, response parsing and timing
 * consistent while leaving endpoint-specific validation to each feature.
 */
export async function requestAdminApi<T extends AdminApiResponse = AdminApiResponse>({
  userId,
  url,
  method,
  body,
  resource,
  responseCollection,
  fallbackError,
}: AdminApiRequestOptions): Promise<T> {
  const requestId = createAdminRequestId();
  const flowId = getAdminFlowId();
  const totalStartedAt = startAdminTimer();
  let totalTimingLogged = false;

  const logTotal = (details: Record<string, string | number | boolean | null>) => {
    logAdminTiming(`admin.${resource}.total`, requestId, totalStartedAt, {
      method,
      ...details,
    });
    totalTimingLogged = true;
  };

  try {
    const sessionStartedAt = startAdminTimer();
    const {
      data: { session: currentSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    logAdminTiming(
      `admin.${resource}.session_lookup`,
      requestId,
      sessionStartedAt,
      {
        outcome: sessionError
          ? 'error'
          : currentSession
            ? 'session_found'
            : 'missing_session',
      },
    );

    if (
      sessionError ||
      !currentSession?.access_token ||
      currentSession.user.id !== userId
    ) {
      logTotal({ outcome: 'invalid_session' });
      throw new Error('Your admin session has expired. Please sign in again.');
    }

    const fetchStartedAt = startAdminTimer();
    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
          Accept: 'application/json',
          'X-Request-ID': requestId,
          'X-Admin-Flow-ID': flowId,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      logTotal({
        outcome: 'network_error',
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    }

    logAdminTiming(`admin.${resource}.fetch`, requestId, fetchStartedAt, {
      method,
      httpStatus: response.status,
    });

    const parseStartedAt = startAdminTimer();
    const payload: unknown = await response.json();
    logAdminTiming(`admin.${resource}.parse`, requestId, parseStartedAt, {
      method,
      rowCount: getCollectionLength(payload, responseCollection),
    });

    if (!response.ok) {
      logTotal({
        httpStatus: response.status,
        outcome: 'http_error',
      });
      throw new Error(getResponseError(payload, fallbackError));
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('The server returned an invalid response.');
    }

    logTotal({
      httpStatus: response.status,
      outcome: 'success',
    });

    return payload as T;
  } catch (error) {
    if (!totalTimingLogged) {
      logTotal({
        outcome: 'error',
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }
    throw error;
  }
}
