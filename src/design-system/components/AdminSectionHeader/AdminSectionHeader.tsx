import type { ReactNode } from 'react';
import AdminText from '../AdminText/AdminText';

type AdminSectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
  as?: 'h1' | 'h2' | 'h3';
  compact?: boolean;
};

export default function AdminSectionHeader({
  title,
  description,
  action,
  eyebrow,
  as: Heading = 'h2',
  compact = false,
}: AdminSectionHeaderProps) {
  return (
    <div
      className="flex w-full flex-col"
      style={{
        gap: compact ? 'var(--admin-space-xxs)' : 'var(--admin-space-xs)',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ gap: 'var(--admin-space-md)' }}
      >
        <div
          className="flex flex-col"
          style={{ gap: 'var(--admin-space-xxs)', minWidth: 0 }}
        >
          {eyebrow && (
            <AdminText variant="micro" as="span" uppercase>
              {eyebrow}
            </AdminText>
          )}
          <AdminText
            variant={compact ? 'card-title' : 'section-title'}
            as={Heading}
            truncate
          >
            {title}
          </AdminText>
        </div>

        {action && (
          <div
            className="flex items-center"
            style={{ gap: 'var(--admin-space-xs)', flexShrink: 0 }}
          >
            {action}
          </div>
        )}
      </div>

      {description && (
        <AdminText variant="supporting" as="p">
          {description}
        </AdminText>
      )}
    </div>
  );
}
