import { useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { updateAppSession } from '../auth/adminSession.api';
import type { UseAdminAuthResult } from '../auth/adminAuth.types';
import { useAdminAuthorization } from './useAdminAuthorization';
import {
  beginAdminFlow,
  clearAdminFlow,
  logAdminTiming,
  startAdminTimer,
} from '../auth/adminRequestTelemetry';
import { useAdminSessionHeartbeat } from './useAdminSessionHeartbeat';

export function useAdminAuth(): UseAdminAuthResult {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const authorization = useAdminAuthorization();

  useAdminSessionHeartbeat(
    authorization.session,
    authorization.admin,
    authorization.isAdmin,
  );

  async function login(email: string, password: string) {
    setLoginError(null);
    authorization.clearAuthError();
    setIsLoggingIn(true);
    const flowId = beginAdminFlow();
    const loginStartedAt = startAdminTimer();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logAdminTiming('supabase.sign_in', flowId, loginStartedAt, {
          outcome: 'rejected',
          errorCode: error.code ?? null,
          httpStatus: error.status ?? null,
        });
        setLoginError(
          error.message.toLowerCase().includes('invalid login')
            ? 'The email or password you entered is incorrect.'
            : error.message,
        );
        return false;
      }

      const success = Boolean(data.session);
      logAdminTiming('supabase.sign_in', flowId, loginStartedAt, {
        outcome: success ? 'success' : 'no_session',
      });
      return success;
    } catch (error) {
      logAdminTiming('supabase.sign_in', flowId, loginStartedAt, {
        outcome: 'error',
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
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
    const currentSession = authorization.session;

    // Application-session logging is best effort. It must never prevent
    // the user's Supabase session from being cleared.
    if (currentSession) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2_500);

      try {
        await updateAppSession(
          currentSession,
          'logout',
          controller.signal,
        );
      } catch (error) {
        console.warn(
          'Application session logout could not be recorded:',
          error,
        );
      } finally {
        window.clearTimeout(timeout);
      }
    }

    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) throw error;

    authorization.resetAfterLogout();
    clearAdminFlow();
  }

  return {
    session: authorization.session,
    admin: authorization.admin,
    isAdmin: authorization.isAdmin,
    isChecking: authorization.isChecking,
    isLoggingIn,
    loginError,
    authError: authorization.authError,
    clearLoginError: () => setLoginError(null),
    retryAuthorization: authorization.retryAuthorization,
    login,
    logout,
  };
}
