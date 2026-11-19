import { AdminButton, AdminText } from '../../../../design-system/components';
import AdminListItem from './AdminListItem';
import type { AdminListProps } from './types';

export default function AdminListContent({
  admins,
  isLoading,
  loadError,
  onRefresh,
  onResend,
  onRevoke,
  onDelete,
  actionLoadingId,
}: AdminListProps) {
  if (isLoading) {
    return (
      <AdminText
        variant="supporting"
        as="p"
        style={{
          textAlign: 'center',
          paddingBlock: 'var(--admin-space-lg)',
        }}
      >
        Loading administrators...
      </AdminText>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--admin-space-sm)',
          alignItems: 'flex-start',
        }}
      >
        <AdminText
          variant="supporting"
          as="p"
          style={{ color: 'var(--admin-status-red)', margin: 0 }}
        >
          {loadError}
        </AdminText>

        <AdminButton
          variant="neutral"
          shape="pill"
          ariaLabel="Retry loading administrators"
          onClick={onRefresh}
        >
          Try again
        </AdminButton>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <AdminText
        variant="supporting"
        as="p"
        style={{
          textAlign: 'center',
          paddingBlock: 'var(--admin-space-lg)',
        }}
      >
        No administrator accounts found.
      </AdminText>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--admin-space-md)',
      }}
    >
      {admins.map((item) => (
        <AdminListItem
          key={item.id}
          item={item}
          actionLoadingId={actionLoadingId}
          onResend={onResend}
          onRevoke={onRevoke}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
