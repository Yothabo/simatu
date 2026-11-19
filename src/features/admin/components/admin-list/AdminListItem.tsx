import { FiMail, FiTrash2, FiXCircle } from 'react-icons/fi';
import AdminListStatus from './AdminListStatus';
import {
  DangerActionButton,
  NeutralActionButton,
} from './AdminListActions';
import { getStatus } from './adminList.utils';
import type { AdminRecord } from './types';

type AdminListItemProps = {
  item: AdminRecord;
  actionLoadingId: string | null;
  onResend: (admin: AdminRecord) => void;
  onRevoke: (admin: AdminRecord) => void;
  onDelete: (admin: AdminRecord) => void;
};

export default function AdminListItem({
  item,
  actionLoadingId,
  onResend,
  onRevoke,
  onDelete,
}: AdminListItemProps) {
  const status = getStatus(item);
  const isActionLoading = actionLoadingId === item.id;
  const canResend =
    !item.is_active && ['pending', 'expired'].includes(status);
  const canRevoke = status === 'pending';

  return (
    <article
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

          <AdminListStatus status={status} />
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
          borderTop:
            '1px solid color-mix(in srgb, var(--admin-status-red) 20%, transparent)',
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
}
