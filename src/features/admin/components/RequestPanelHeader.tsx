import { FiPlus } from 'react-icons/fi';
import AccentButton from './AccentButton';

type RequestPanelHeaderProps = {
  openCount: number;
  storeLabel: string;
  onNewRequest: () => void;
};

export default function RequestPanelHeader({
  openCount,
  storeLabel,
  onNewRequest,
}: RequestPanelHeaderProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: 'var(--admin-space-md)',
        borderBottom: '1px solid var(--admin-border-subtle)',
        gap: 'var(--admin-space-md)',
      }}
    >
      <div className="flex flex-col" style={{ gap: 'var(--admin-space-xxs)' }}>
        <div className="flex items-center" style={{ gap: 'var(--admin-space-xs)' }}>
          <h3
            style={{
              fontSize: 'var(--admin-size-heading-3)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
              margin: 0,
            }}
          >
            Store requests
          </h3>
          {openCount > 0 && (
            <span
              style={{
                fontSize: 'var(--admin-size-micro)',
                fontWeight: 'var(--admin-weight-semibold)',
                color: 'var(--admin-on-accent)',
                backgroundColor: 'var(--admin-accent)',
                paddingInline: 'var(--admin-space-xs)',
                paddingBlock: '1px',
                borderRadius: 'var(--ds-radius-full)',
                fontVariantNumeric: 'tabular-nums',
                minWidth: '18px',
                textAlign: 'center',
              }}
            >
              {openCount}
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 'var(--admin-size-micro)',
            color: 'var(--admin-text-tertiary)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Anything you need from the technical team for {storeLabel}.
        </p>
      </div>

      <AccentButton
        variant="dark"
        shape="pill"
        onClick={onNewRequest}
        ariaLabel="New request"
      >
        <FiPlus size={14} aria-hidden="true" />
        <span style={{ marginLeft: 'var(--admin-space-xs)' }}>New request</span>
      </AccentButton>
    </div>
  );
}
