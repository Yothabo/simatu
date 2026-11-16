import AdminInviteForm from './AdminInviteForm';
import AdminList from './AdminList';
import { useAdminManagement } from '../settings/management/useAdminManagement';

type AdminManagementProps = {
  accessToken: string;
};

export default function AdminManagement({ accessToken }: AdminManagementProps) {
  const m = useAdminManagement({ accessToken });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--admin-space-2xl)',
      }}
    >
      <AdminInviteForm
        email={m.email}
        setEmail={m.setEmail}
        storeSlug={m.storeSlug}
        setStoreSlug={m.setStoreSlug}
        isInviting={m.isInviting}
        onSubmit={m.handleInvite}
      />

      <AdminList
        admins={m.admins}
        isLoading={m.isLoading}
        loadError={m.loadError}
        onRefresh={m.loadAdmins}
        onResend={m.handleResend}
        onRevoke={m.handleRevoke}
        onDelete={m.handleDeleteAdmin}
        actionLoadingId={m.actionLoadingId}
      />
    </div>
  );
}
