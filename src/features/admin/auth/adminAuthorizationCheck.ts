import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AdminContext } from './adminAuth.types';
import { verifyAdminContext } from './adminAuthorization.api';
import { logAdminMilestone } from './adminRequestTelemetry';
import {
  clearAdminStorage,
  getSessionIdentity,
} from './adminAuth.utils';

type CheckAdminAuthorizationArgs = {
  currentSession: Session;
  isActive: () => boolean;
  authorizedUserIdRef: MutableRefObject<string | null>;
  verifiedIdentityRef: MutableRefObject<string | null>;
  inFlightIdentityRef: MutableRefObject<string | null>;
  requestVersionRef: MutableRefObject<number>;
  requestControllerRef: MutableRefObject<AbortController | null>;
  setAdmin: Dispatch<SetStateAction<AdminContext | null>>;
  setIsAdmin: Dispatch<SetStateAction<boolean | null>>;
  setIsChecking: Dispatch<SetStateAction<boolean>>;
  setAuthError: Dispatch<SetStateAction<string | null>>;
};

export async function checkAdminAuthorization({
  currentSession,
  isActive,
  authorizedUserIdRef,
  verifiedIdentityRef,
  inFlightIdentityRef,
  requestVersionRef,
  requestControllerRef,
  setAdmin,
  setIsAdmin,
  setIsChecking,
  setAuthError,
}: CheckAdminAuthorizationArgs): Promise<void> {
  if (!isActive()) return;

  const identity = getSessionIdentity(currentSession);
  const userId = currentSession.user.id;

  if (
    verifiedIdentityRef.current === identity &&
    authorizedUserIdRef.current === userId
  ) {
    setIsChecking(false);
    setAuthError(null);
    return;
  }

  if (inFlightIdentityRef.current === identity) return;

  requestVersionRef.current += 1;
  const requestVersion = requestVersionRef.current;

  requestControllerRef.current?.abort();
  requestControllerRef.current = null;
  inFlightIdentityRef.current = identity;

  if (
    authorizedUserIdRef.current !== null &&
    authorizedUserIdRef.current !== userId
  ) {
    authorizedUserIdRef.current = null;
    verifiedIdentityRef.current = null;
    setAdmin(null);
    setIsAdmin(null);
    clearAdminStorage();
  }

  setIsChecking(true);
  setAuthError(null);

  let lastError: unknown = null;

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      requestControllerRef.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), 10_000);

      try {
        const result = await verifyAdminContext(
          currentSession,
          controller.signal,
          attempt + 1,
        );

        if (!isActive() || requestVersion !== requestVersionRef.current) {
          return;
        }

        if (
          result.status === 401 ||
          result.status === 403 ||
          !result.admin
        ) {
          clearAdminStorage();
          authorizedUserIdRef.current = null;
          verifiedIdentityRef.current = null;
          setAdmin(null);
          setIsAdmin(false);
          setAuthError(null);
          setIsChecking(false);
          return;
        }

        setAdmin(result.admin);
        authorizedUserIdRef.current = userId;
        verifiedIdentityRef.current = identity;
        setIsAdmin(true);
        logAdminMilestone('admin.authorization.ready', {
          outcome: 'authorized',
        });
        setAuthError(null);
        setIsChecking(false);
        return;
      } catch (error) {
        if (!isActive() || requestVersion !== requestVersionRef.current) {
          return;
        }

        lastError = error;
        if (attempt === 0) {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
        }
      } finally {
        window.clearTimeout(timeout);
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }
      }
    }

    if (!isActive() || requestVersion !== requestVersionRef.current) return;

    setAuthError(
      lastError instanceof Error
        ? lastError.name === 'AbortError'
          ? 'Admin verification timed out. Check your connection and retry.'
          : lastError.message
        : 'Unable to verify admin access. Please try again.',
    );
    setIsChecking(false);
  } finally {
    if (inFlightIdentityRef.current === identity) {
      inFlightIdentityRef.current = null;
    }
  }
}
