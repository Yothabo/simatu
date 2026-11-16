import { FiRefreshCw, FiTrash2, FiMail, FiXCircle } from 'react-icons/fi';
import {
  AdminButton,
  AdminSectionHeader,
  AdminText,
} from '../../../design-system/components';

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

type AdminListProps = {
  admins: AdminRecord[];
  isLoading: boolean;
  loadError: string;
  onRefresh: () => void;
  onResend: (admin: AdminRecord) => void;
  onRevoke: (admin: AdminRecord) => void;
  onDelete: (admin: AdminRecord) => void;
  actionLoadingId: string | null;
};

type AdminStatus =
  | 'active'
  | 'pending'
  | 'expired'
  | 'revoked'
  | 'accepted'
  | 'inactive';

const STATUS_LABELS: Record<AdminStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  expired: 'Expired',
  revoked: 'Revoked',
  accepted: 'Accepted',
  inactive: 'Inactive',
};

const STATUS_COLORS: Record<AdminStatus, { bg: string; color: string }> = {
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

function getStatus(item: AdminRecord): AdminStatus {
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

function DangerActionButton({
  onClick,
  disabled,
  ariaLabel,
  icon,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--admin-space-xxs)',
        paddingBlock: 'var(--admin-space-xxs)',
        paddingInline: 'var(--admin-space-sm)',
        borderRadius: 'var(--ds-radius-lg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--admin-status-red)',
        backgroundColor: 'transparent',
        color: 'var(--admin-status-red)',
        fontSize: 'var(--admin-size-micro)',
        fontWeight: 'var(--admin-weight-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 150ms ease, color 150ms ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.backgroundColor = 'var(--admin-status-red)';
        e.currentTarget.style.color = 'var(--admin-on-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--admin-status-red)';
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function NeutralActionButton({
  onClick,
  disabled,
  ariaLabel,
  icon,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--admin-space-xxs)',
        paddingBlock: 'var(--admin-space-xxs)',
        paddingInline: 'var(--admin-space-sm)',
        borderRadius: 'var(--ds-radius-lg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--admin-border-strong)',
        backgroundColor: 'transparent',
        color: 'var(--admin-text-secondary)',
        fontSize: 'var(--admin-size-micro)',
        fontWeight: 'var(--admin-weight-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 150ms ease, color 150ms ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.backgroundColor = 'var(--admin-surface-subtle)';
        e.currentTarget.style.color = 'var(--admin-text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--admin-text-secondary)';
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export default function AdminList({
  admins,
  isLoading,
  loadError,
  onRefresh,
  onResend,
  onRevoke,
  onDelete,
  actionLoadingId,
}: AdminListProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--admin-space-md)',
      }}
    >
      <AdminSectionHeader
        title="Administrators"
        as="h3"
        compact
        action={
          <AdminButton
            variant="neutral"
            shape="circle"
            ariaLabel={
              isLoading
                ? 'Refreshing administrators'
                : 'Refresh administrators'
            }
            onClick={onRefresh}
            disabled={isLoading}
          >
            <FiRefreshCw
              size={16}
              aria-hidden="true"
              className={isLoading ? 'animate-spin' : ''}
            />
          </AdminButton>
        }
      />

      {isLoading ? (
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
      ) : loadError ? (
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
      ) : admins.length === 0 ? (
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
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--admin-space-md)',
          }}
        >
          {admins.map((item) => {
            const status = getStatus(item);
            const isActionLoading = actionLoadingId === item.id;
            const canResend = !item.is_active && ['pending', 'expired'].includes(status);
            const canRevoke = status === 'pending';
            const colors = STATUS_COLORS[status];

            return (
              <article
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--admin-border-subtle)',
                  borderRadius: 'var(--ds-radius-lg)',
                  backgroundColor: 'var(--admin-surface)',
                  overflow: 'hidden',
                }}
              >
                {/* Main info */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--admin-space-xs)',
                    padding: 'var(--admin-space-md)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--admin-space-xs)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--admin-size-body)',
                        fontWeight: 'var(--admin-weight-semibold)',
                        color: 'var(--admin-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}
                    >
                      {item.email}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        paddingBlock: '2px',
                        paddingInline: 'var(--admin-space-xs)',
                        borderRadius: 'var(--ds-radius-full)',
                        backgroundColor: colors.bg,
                        color: colors.color,
                        fontSize: 'var(--admin-size-micro)',
                        fontWeight: 'var(--admin-weight-semibold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        flexShrink: 0,
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 'var(--admin-size-micro)',
                      color: 'var(--admin-text-tertiary)',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.role === 'super_admin' ? 'Super Admin' : 'Store Admin'}
                    {item.role === 'store_admin' && item.store_name
                      ? ` · ${item.store_name}`
                      : ''}
                    {' · Added '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : 'Unknown'}
                    {item.invitation_expires_at &&
                      !item.is_active &&
                      item.invitation_status === 'pending' && (
                        <>
                          {' · Invitation expires '}
                          {new Date(item.invitation_expires_at).toLocaleString()}
                        </>
                      )}
                  </span>

                  {canResend && (
                    <div style={{ marginTop: 'var(--admin-space-xs)' }}>
                      <NeutralActionButton
                        onClick={() => onResend(item)}
                        disabled={isActionLoading}
                        ariaLabel={`Resend invitation to ${item.email}`}
                        icon={<FiMail size={12} aria-hidden="true" />}
                      >
                        Resend invitation
                      </NeutralActionButton>
                    </div>
                  )}
                </div>

                {/* Danger zone */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--admin-space-md)',
                    flexWrap: 'wrap',
                    paddingBlock: 'var(--admin-space-sm)',
                    paddingInline: 'var(--admin-space-md)',
                    backgroundColor:
                      'color-mix(in srgb, var(--admin-status-red) 5%, var(--admin-surface))',
                    borderTop: '1px solid color-mix(in srgb, var(--admin-status-red) 20%, transparent)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--admin-size-micro)',
                      fontWeight: 'var(--admin-weight-semibold)',
                      color: 'var(--admin-status-red)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Danger zone
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--admin-space-xs)',
                      flexWrap: 'wrap',
                    }}
                  >
                    {canRevoke && (
                      <DangerActionButton
                        onClick={() => onRevoke(item)}
                        disabled={isActionLoading}
                        ariaLabel={`Revoke invitation for ${item.email}`}
                        icon={<FiXCircle size={12} aria-hidden="true" />}
                      >
                        Revoke
                      </DangerActionButton>
                    )}
                    <DangerActionButton
                      onClick={() => onDelete(item)}
                      disabled={isActionLoading}
                      ariaLabel={`Delete administrator ${item.email}`}
                      icon={<FiTrash2 size={12} aria-hidden="true" />}
                    >
                      Delete
                    </DangerActionButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
