import type { AdminRecord, AdminStatus } from './types';

export function getStatus(item: AdminRecord): AdminStatus {
  if (item.is_active) return 'active';

  if (
    item.invitation_status === 'pending' &&
    item.invitation_expires_at &&
    new Date(item.invitation_expires_at).getTime() <= Date.now()
  ) {
    return 'expired';
  }

  return (item.invitation_status as AdminStatus) || 'inactive';
}
