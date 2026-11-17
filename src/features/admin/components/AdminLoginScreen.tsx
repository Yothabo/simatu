import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLoginWordmark from './admin-login/AdminLoginWordmark';
import AdminLoginForm from './admin-login/AdminLoginForm';
import AdminLoginOverlays from './admin-login/AdminLoginOverlays';
import type { AdminLoginScreenProps } from './admin-login/types';

export default function AdminLoginScreen({
  email,
  password,
  loginError,
  isLoggingIn,
  isResolving,
  showAuthIndicator,
  isTransitioning,
  onTransitionComplete,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onClearLoginError,
}: AdminLoginScreenProps) {
  const isFullscreen = isResolving || isTransitioning;
  const [isForgotMode, setIsForgotMode] = useState(false);

  return (
    <main
      className={
        isFullscreen
          ? 'fixed inset-0 m-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-[#181715] p-0'
          : 'relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#181715] px-6 py-16 text-[#EDE8E0]'
      }
    >
      <AdminLoginWordmark
        isFullscreen={isFullscreen}
        isResolving={isResolving}
        isTransitioning={isTransitioning}
        showAuthIndicator={showAuthIndicator}
        onTransitionComplete={onTransitionComplete}
      />

      {!isFullscreen && (
        <>
          <div className="relative z-10 mt-12 w-full max-w-[400px] border border-[#A39E96]/20 bg-[#181715]/80 p-6 shadow-2xl backdrop-blur-md sm:mt-16 sm:p-8">
            <AdminLoginForm
              email={email}
              password={password}
              isLoggingIn={isLoggingIn}
              onEmailChange={onEmailChange}
              onPasswordChange={onPasswordChange}
              onLogin={onLogin}
              onForgotPassword={() => setIsForgotMode(true)}
            />

            <p className="mt-8 text-center text-xs text-[#A39E96]/60">
              <Link to="/" className="hover:text-[#EDE8E0]">
                ← Back to site
              </Link>
            </p>
          </div>

          <AdminLoginOverlays
            isForgotMode={isForgotMode}
            loginError={loginError}
            email={email}
            onCloseForgotPassword={() => setIsForgotMode(false)}
            onClearLoginError={onClearLoginError}
          />
        </>
      )}

      {isTransitioning && (
        <span className="sr-only">Opening Yotaabo admin</span>
      )}
    </main>
  );
}
