import type { ReactNode } from 'react';

export type AdminRecord = {
  id: string;
  email: string;
  role: 'super_admin' | 'store_admin';
  store_id: string | null;
  store_name: string | null;
  store_slug: string | null;
  is_active: boolean;
  created_at: string;
  invitation_id: string | null;
  invitation_status: 'pending' | 'accepted' | 'expired' | 'revoked' | null;
  invitation_created_at: string | null;
  invitation_expires_at: string | null;
};

export type AdminListProps = {
  admins: AdminRecord[];
  isLoading: boolean;
  loadError: string;
  onRefresh: () => void;
  onResend: (admin: AdminRecord) => void;
  onRevoke: (admin: AdminRecord) => void;
  onDelete: (admin: AdminRecord) => void;
  actionLoadingId: string | null;
};

export type AdminStatus =
  | 'active'
  | 'pending'
  | 'expired'
  | 'revoked'
  | 'accepted'
  | 'inactive';

export type AdminActionButtonProps = {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  icon: ReactNode;
  children: ReactNode;
};
