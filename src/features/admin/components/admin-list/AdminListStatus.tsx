import { STATUS_COLORS, STATUS_LABELS } from './adminList.constants';
import type { AdminStatus } from './types';

type AdminListStatusProps = {
  status: AdminStatus;
};

export default function AdminListStatus({
  status,
}: AdminListStatusProps) {
  const colors = STATUS_COLORS[status];

  return (
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
  );
}
