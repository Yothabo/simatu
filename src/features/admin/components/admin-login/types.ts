import type { FormEvent } from 'react';

export type AdminLoginScreenProps = {
  email: string;
  password: string;
  loginError: string | null;
  isLoggingIn: boolean;
  isResolving: boolean;
  showAuthIndicator: boolean;
  isTransitioning: boolean;
  onTransitionComplete: () => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onClearLoginError: () => void;
};

export type AdminLoginFormProps = {
  email: string;
  password: string;
  isLoggingIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
};

export type AdminLoginWordmarkProps = {
  isFullscreen: boolean;
  isResolving: boolean;
  isTransitioning: boolean;
  showAuthIndicator: boolean;
  onTransitionComplete: () => void;
};
