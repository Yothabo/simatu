type HeaderIconButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  tone?: 'neutral' | 'danger';
  children: React.ReactNode;
};

export default function HeaderIconButton({
  onClick,
  ariaLabel,
  tone = 'neutral',
  children,
}: HeaderIconButtonProps) {
  const isDanger = tone === 'danger';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-border-strong)',
        backgroundColor: 'var(--admin-surface)',
        color: isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-text-secondary)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background-color 150ms ease, color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-surface-subtle)';
        e.currentTarget.style.color = isDanger
          ? 'var(--admin-on-accent)'
          : 'var(--admin-text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--admin-surface)';
        e.currentTarget.style.color = isDanger
          ? 'var(--admin-status-red)'
          : 'var(--admin-text-secondary)';
      }}
    >
      {children}
    </button>
  );
}
