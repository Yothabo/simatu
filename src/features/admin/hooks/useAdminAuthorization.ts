import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../utils/supabase';
import type { AdminContext } from '../auth/adminAuth.types';
import { checkAdminAuthorization } from '../auth/adminAuthorizationCheck';
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

    function checkAdmin(currentSession: Session) {
      return checkAdminAuthorization({
        currentSession,
        isActive: () => active,
        authorizedUserIdRef,
        verifiedIdentityRef,
        inFlightIdentityRef,
        requestVersionRef,
        requestControllerRef,
        setAdmin,
        setIsAdmin,
        setIsChecking,
        setAuthError,
      });
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
