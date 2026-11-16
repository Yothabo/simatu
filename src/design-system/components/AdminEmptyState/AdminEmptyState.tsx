import type { ReactNode } from 'react';
import AdminText from '../AdminText/AdminText';

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  inline?: boolean;
};

export default function AdminEmptyState({
  title,
  description,
  icon,
  action,
  inline = false,
}: AdminEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        paddingBlock: inline
          ? 'var(--admin-space-lg)'
          : 'var(--admin-space-2xl)',
        paddingInline: 'var(--admin-space-md)',
        gap: 'var(--admin-space-xs)',
        textAlign: 'center',
        borderRadius: inline ? undefined : 'var(--ds-radius-lg)',
        borderWidth: inline ? undefined : '1px',
        borderStyle: inline ? undefined : 'dashed',
        borderColor: inline ? undefined : 'var(--admin-border-subtle)',
      }}
    >
      {icon && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--admin-text-tertiary)',
            marginBottom: 'var(--admin-space-xxs)',
          }}
        >
          {icon}
        </span>
      )}

      <AdminText variant="body" as="p">
        {title}
      </AdminText>

      {description && (
        <AdminText
          variant="supporting"
          as="p"
          style={{ maxWidth: '36ch' }}
        >
          {description}
        </AdminText>
      )}

      {action && (
        <div
          style={{
            marginTop: 'var(--admin-space-sm)',
            display: 'inline-flex',
            gap: 'var(--admin-space-xs)',
          }}
        >
          {action}
        </div>
      )}
    </div>
  );
}
