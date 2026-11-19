import type { FormEvent, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import AdminLoginScreen from '../../../features/admin/components/AdminLoginScreen';
import AdminLoadingScreen from '../AdminLoadingScreen';
import {
  AdminAccessDeniedScreen,
  AdminVerificationErrorScreen,
} from '../AdminDeniedScreens';

type AdminPageAuthScreenProps = {
  session: Session | null;
  isAdmin: boolean | null;
  isChecking: boolean;
  authError: string | null;
  email: string;
  password: string;
  loginError: string | null;
  isLoggingIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onClearLoginError: () => void;
  onRetryAuthorization: () => void;
  onLogout: () => void;
};

export function getAdminPageAuthScreen({
  session,
  isAdmin,
  isChecking,
  authError,
  email,
  password,
  loginError,
  isLoggingIn,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onClearLoginError,
  onRetryAuthorization,
  onLogout,
}: AdminPageAuthScreenProps): ReactNode | null {
  if (isChecking && (!session || isAdmin !== true) && !authError) {
    return <AdminLoadingScreen />;
  }

  if (!session) {
    return (
      <AdminLoginScreen
        email={email}
        password={password}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
        isResolving={false}
        showAuthIndicator={false}
        isTransitioning={false}
        onTransitionComplete={() => {}}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onLogin={onLogin}
        onClearLoginError={onClearLoginError}
      />
    );
  }

  if (session && authError && isAdmin !== true) {
    return (
      <AdminVerificationErrorScreen
        authError={authError}
        onRetry={onRetryAuthorization}
        onLogout={onLogout}
      />
    );
  }

  if (!isChecking && isAdmin === false) {
    return <AdminAccessDeniedScreen onLogout={onLogout} />;
  }

  return null;
}
