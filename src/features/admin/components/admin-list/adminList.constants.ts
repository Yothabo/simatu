import type { AdminStatus } from './types';

export const STATUS_LABELS: Record<AdminStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  expired: 'Expired',
  revoked: 'Revoked',
  accepted: 'Accepted',
  inactive: 'Inactive',
};

export const STATUS_COLORS: Record<
  AdminStatus,
  { bg: string; color: string }
> = {
  active: {
    bg: 'color-mix(in srgb, var(--admin-status-green) 15%, transparent)',
    color: 'var(--admin-status-green)',
  },
  pending: {
    bg: 'color-mix(in srgb, var(--admin-status-amber) 15%, transparent)',
    color: 'var(--admin-status-amber)',
  },
  expired: {
    bg: 'color-mix(in srgb, var(--admin-status-red) 15%, transparent)',
    color: 'var(--admin-status-red)',
  },
  revoked: {
    bg: 'color-mix(in srgb, var(--admin-status-red) 15%, transparent)',
    color: 'var(--admin-status-red)',
  },
  accepted: {
    bg: 'color-mix(in srgb, var(--admin-status-green) 15%, transparent)',
    color: 'var(--admin-status-green)',
  },
  inactive: {
    bg: 'var(--admin-surface-subtle)',
    color: 'var(--admin-text-secondary)',
  },
};
