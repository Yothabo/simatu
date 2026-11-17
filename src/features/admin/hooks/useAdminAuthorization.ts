import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../utils/supabase';
import type { AdminContext } from '../auth/adminAuth.types';
import { verifyAdminContext } from '../auth/adminAuthorization.api';
import { logAdminMilestone } from '../auth/adminRequestTelemetry';
import {
  clearAdminStorage,
  getSessionIdentity,
} from '../auth/adminAuth.utils';

type UseAdminAuthorizationResult = {
  session: Session | null;
  admin: AdminContext | null;
  isAdmin: boolean | null;
  isChecking: boolean;
  authError: string | null;
  clearAuthError: () => void;
  retryAuthorization: () => void;
  resetAfterLogout: () => void;
};

export function useAdminAuthorization(): UseAdminAuthorizationResult {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminContext | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const lastUserIdRef = useRef<string | null>(null);
  const authorizedUserIdRef = useRef<string | null>(null);
  const verifiedIdentityRef = useRef<string | null>(null);
  const inFlightIdentityRef = useRef<string | null>(null);
  const requestVersionRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);
  const retryAuthorizationRef = useRef<() => void>(() => {});
  const sessionRef = useRef<Session | null>(null);

  sessionRef.current = session;

  useEffect(() => {
    let active = true;

    async function checkAdmin(currentSession: Session) {
      if (!active) return;

      const identity = getSessionIdentity(currentSession);
      const userId = currentSession.user.id;

      // A previously verified session does not need another round trip.
      if (
        verifiedIdentityRef.current === identity &&
        authorizedUserIdRef.current === userId
      ) {
        setIsChecking(false);
        setAuthError(null);
        return;
      }

      // Prevent duplicate checks for the same session.
      if (inFlightIdentityRef.current === identity) return;

      // Invalidate and cancel any older request.
      requestVersionRef.current += 1;
      const requestVersion = requestVersionRef.current;

      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      inFlightIdentityRef.current = identity;

      // A different user must not inherit the previous user's admin context.
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
        // Two bounded attempts. A hung request cannot hold the UI indefinitely.
        for (let attempt = 0; attempt < 2; attempt++) {
          const controller = new AbortController();
          requestControllerRef.current = controller;

          const timeout = window.setTimeout(
            () => controller.abort(),
            10_000,
          );

          try {
            const result = await verifyAdminContext(
              currentSession,
              controller.signal,
              attempt + 1,
            );

            if (!active || requestVersion !== requestVersionRef.current) {
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
            logAdminMilestone('admin.authorization.ready', { outcome: 'authorized' });
            setAuthError(null);
            setIsChecking(false);
            return;
          } catch (error) {
            if (!active || requestVersion !== requestVersionRef.current) {
              return;
            }

            lastError = error;

            if (attempt === 0) {
              await new Promise((resolve) =>
                window.setTimeout(resolve, 400),
              );
            }
          } finally {
            window.clearTimeout(timeout);

            if (requestControllerRef.current === controller) {
              requestControllerRef.current = null;
            }
          }
        }

        if (!active || requestVersion !== requestVersionRef.current) {
          return;
        }

        // A temporary service failure is not proof that access was revoked.
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

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!active) return;

        const nextUserId = nextSession?.user.id ?? null;
        const previousUserId = lastUserIdRef.current;

        lastUserIdRef.current = nextUserId;
        setSession(nextSession);

        if (!nextSession || event === 'SIGNED_OUT') {
          requestVersionRef.current += 1;
          requestControllerRef.current?.abort();
          requestControllerRef.current = null;
          inFlightIdentityRef.current = null;
          authorizedUserIdRef.current = null;
          verifiedIdentityRef.current = null;

          clearAdminStorage();
          setAdmin(null);
          setIsAdmin(false);
          setIsChecking(false);
          setAuthError(null);
          return;
        }

        if (event === 'PASSWORD_RECOVERY') {
          requestVersionRef.current += 1;
          requestControllerRef.current?.abort();
          requestControllerRef.current = null;
          inFlightIdentityRef.current = null;
          authorizedUserIdRef.current = null;
          verifiedIdentityRef.current = null;

          clearAdminStorage();
          setAdmin(null);
          setIsAdmin(false);
          setIsChecking(false);
          setAuthError(null);
          return;
        }

        // Refreshing an access token does not change the user's admin role.
        // Keep the new token in state without repeating authorization.
        if (event === 'TOKEN_REFRESHED') {
          return;
        }

        const relevantEvent = [
          'INITIAL_SESSION',
          'SIGNED_IN',
          'USER_UPDATED',
        ].includes(event);

        if (!relevantEvent) return;

        const identity = getSessionIdentity(nextSession);

        // Supabase can emit SIGNED_IN again for an existing session.
        if (
          verifiedIdentityRef.current === identity &&
          authorizedUserIdRef.current === nextUserId
        ) {
          setIsChecking(false);
          setAuthError(null);
          return;
        }

        if (inFlightIdentityRef.current === identity) return;

        if (previousUserId !== null && previousUserId !== nextUserId) {
          clearAdminStorage();
          authorizedUserIdRef.current = null;
          verifiedIdentityRef.current = null;
          setAdmin(null);
          setIsAdmin(null);
        }

        void checkAdmin(nextSession);
      },
    );

    retryAuthorizationRef.current = () => {
      const currentSession = lastUserIdRef.current
        ? sessionRef.current
        : null;

      if (currentSession) {
        void checkAdmin(currentSession);
      }
    };

    return () => {
      active = false;
      requestVersionRef.current += 1;
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      retryAuthorizationRef.current = () => {};
      subscription.subscription.unsubscribe();
    };
  }, []);

  function resetAfterLogout() {
    requestVersionRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    inFlightIdentityRef.current = null;
    authorizedUserIdRef.current = null;
    verifiedIdentityRef.current = null;
    lastUserIdRef.current = null;

    clearAdminStorage();
    setSession(null);
    setAdmin(null);
    setIsAdmin(false);
    setIsChecking(false);
    setAuthError(null);
  }

  return {
    session,
    admin,
    isAdmin,
    isChecking,
    authError,
    clearAuthError: () => setAuthError(null),
    retryAuthorization: () => retryAuthorizationRef.current(),
    resetAfterLogout,
  };
}
