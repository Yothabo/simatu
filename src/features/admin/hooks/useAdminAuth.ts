import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../utils/supabase';
import { ADMIN_STORAGE_KEYS } from '../constants/admin.constants';

type AdminContext = {
  id: string;
  email: string | null;
  role: 'super_admin' | 'store_admin';
  storeId: string | null;
  storeSlug: string | null;
  storeCreatedAt: Partial<Record<'yotaabo' | 'poshies', string>>;
};

type UseAdminAuthResult = {
  session: Session | null;
  admin: AdminContext | null;
  isAdmin: boolean | null;
  isChecking: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  authError: string | null;
  clearLoginError: () => void;
  retryAuthorization: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

function clearAdminStorage() {
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
function getSessionIdentity(session: Session): string {
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

async function updateAppSession(
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

export function useAdminAuth(): UseAdminAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminContext | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const lastUserIdRef = useRef<string | null>(null);
  const authorizedUserIdRef = useRef<string | null>(null);
  const verifiedIdentityRef = useRef<string | null>(null);
  const inFlightIdentityRef = useRef<string | null>(null);
  const requestVersionRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);
  const retryAuthorizationRef = useRef<() => void>(() => {});

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
            const response = await fetch('/api/admin-context', {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${currentSession.access_token}`,
              },
              cache: 'no-store',
              signal: controller.signal,
            });

            if (!active || requestVersion !== requestVersionRef.current) {
              return;
            }

            if (response.status === 401 || response.status === 403) {
              clearAdminStorage();
              authorizedUserIdRef.current = null;
              verifiedIdentityRef.current = null;
              setAdmin(null);
              setIsAdmin(false);
              setAuthError(null);
              setIsChecking(false);
              return;
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
              clearAdminStorage();
              authorizedUserIdRef.current = null;
              verifiedIdentityRef.current = null;
              setAdmin(null);
              setIsAdmin(false);
              setAuthError(null);
              setIsChecking(false);
              return;
            }

            if (!active || requestVersion !== requestVersionRef.current) {
              return;
            }

            setAdmin({
              ...verifiedAdmin,
              storeCreatedAt:
                payload?.storeCreatedAt &&
                typeof payload.storeCreatedAt === 'object'
                  ? payload.storeCreatedAt
                  : {},
            });

            authorizedUserIdRef.current = userId;
            verifiedIdentityRef.current = identity;

            setIsAdmin(true);
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

  // Keep the latest session available to the retry callback without
  // recreating the Supabase auth subscription.
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  useEffect(() => {
    if (!session || !admin || !isAdmin) return;

    const heartbeat = window.setInterval(() => {
      void updateAppSession(session, 'heartbeat').catch((error) => {
        console.error('Admin session heartbeat failed:', error);
      });
    }, 60_000);

    return () => window.clearInterval(heartbeat);
  }, [session, admin, isAdmin]);

  async function login(email: string, password: string) {
    setLoginError(null);
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(
          error.message.toLowerCase().includes('invalid login')
            ? 'The email or password you entered is incorrect.'
            : error.message,
        );
        return false;
      }

      return Boolean(data.session);
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.',
      );
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function logout() {
    const currentSession = session;

    // Application-session logging is best effort. It must never prevent
    // the user's Supabase session from being cleared.
    if (currentSession) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2_500);

      try {
        await updateAppSession(currentSession, 'logout', controller.signal);
      } catch (error) {
        console.warn('Application session logout could not be recorded:', error);
      } finally {
        window.clearTimeout(timeout);
      }
    }

    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) throw error;

    requestVersionRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    inFlightIdentityRef.current = null;
    authorizedUserIdRef.current = null;
    verifiedIdentityRef.current = null;

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
    isLoggingIn,
    loginError,
    authError,
    clearLoginError: () => setLoginError(null),
    retryAuthorization: () => retryAuthorizationRef.current(),
    login,
    logout,
  };
}
