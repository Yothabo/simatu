import type { Session } from '@supabase/supabase-js';

export type AdminContext = {
  id: string;
  email: string | null;
  role: 'super_admin' | 'store_admin';
  storeId: string | null;
  storeSlug: string | null;
  storeCreatedAt: Partial<Record<'yotaabo' | 'poshies', string>>;
};

export type UseAdminAuthResult = {
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
