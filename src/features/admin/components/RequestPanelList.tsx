import { FiCheck } from 'react-icons/fi';
import type { StoreRequest, StoreRequestStatus } from '../settings/categories/types';

type RequestPanelListProps = {
  requests: StoreRequest[];
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'recently';
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_META: Record<
  StoreRequestStatus,
  { label: string; color: string; bg: string }
> = {
  open: {
    label: 'Open',
    color: 'var(--admin-status-amber)',
    bg: 'color-mix(in srgb, var(--admin-status-amber) 15%, transparent)',
  },
  in_progress: {
    label: 'In progress',
    color: 'var(--admin-accent)',
    bg: 'color-mix(in srgb, var(--admin-accent) 15%, transparent)',
  },
  resolved: {
    label: 'Resolved',
    color: 'var(--admin-status-green)',
    bg: 'color-mix(in srgb, var(--admin-status-green) 15%, transparent)',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug report',
  feature: 'Feature request',
  content: 'Content change',
  other: 'Other',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function RequestPanelList({ requests }: RequestPanelListProps) {
  if (requests.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{
          padding: 'var(--admin-space-xl)',
          gap: 'var(--admin-space-xs)',
          textAlign: 'center',
        }}
      >
        <FiCheck
          size={20}
          style={{ color: 'var(--admin-status-green)' }}
          aria-hidden="true"
        />
        <p
          style={{
            fontSize: 'var(--admin-size-supporting)',
            fontWeight: 'var(--admin-weight-medium)',
            color: 'var(--admin-text-primary)',
            margin: 0,
          }}
        >
          No requests yet
        </p>
        <p
          style={{
            fontSize: 'var(--admin-size-micro)',
            color: 'var(--admin-text-tertiary)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Need something built or fixed? Click "New request".
        </p>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {requests.map((request, index) => {
        const statusMeta = STATUS_META[request.status];
        return (
          <li
            key={request.id}
            style={{
              padding: 'var(--admin-space-md)',
              borderTop: index > 0 ? '1px solid var(--admin-border-subtle)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--admin-space-xs)',
            }}
          >
            <div className="flex items-center justify-between" style={{ gap: 'var(--admin-space-sm)' }}>
              <span
                style={{
                  fontSize: 'var(--admin-size-body)',
                  fontWeight: 'var(--admin-weight-medium)',
                  color: 'var(--admin-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {request.title}
              </span>
              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  fontWeight: 'var(--admin-weight-medium)',
                  color: statusMeta.color,
                  backgroundColor: statusMeta.bg,
                  paddingInline: 'var(--admin-space-xs)',
                  paddingBlock: '1px',
                  borderRadius: 'var(--ds-radius-full)',
                  flexShrink: 0,
                }}
              >
                {statusMeta.label}
              </span>
            </div>

            <div className="flex items-center flex-wrap" style={{ gap: 'var(--admin-space-xs)' }}>
              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  fontWeight: 'var(--admin-weight-medium)',
                  color: 'var(--admin-text-secondary)',
                  backgroundColor: 'var(--admin-surface-subtle)',
                  paddingInline: 'var(--admin-space-xs)',
                  paddingBlock: '1px',
                  borderRadius: 'var(--ds-radius-sm)',
                }}
              >
                {CATEGORY_LABELS[request.category] ?? request.category}
              </span>
              <span
                style={{
                  fontSize: 'var(--admin-size-micro)',
                  color: 'var(--admin-text-tertiary)',
                }}
              >
                · Priority: {PRIORITY_LABELS[request.priority] ?? request.priority}
              </span>
            </div>

            <p
              style={{
                fontSize: 'var(--admin-size-caption)',
                color: 'var(--admin-text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {request.description}
            </p>

            <span
              style={{
                fontSize: 'var(--admin-size-micro)',
                color: 'var(--admin-text-tertiary)',
              }}
            >
              Submitted {formatRelativeDate(request.created_at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
