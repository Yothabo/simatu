import type { ReactNode } from 'react';

type CheckoutItemCardProps = {
  name: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'admin';
};

export default function CheckoutItemCard({
  name,
  leftContent,
  rightContent,
  onClick,
  variant = 'default',
}: CheckoutItemCardProps) {
  const isAdmin = variant === 'admin';

  const content = (
    <>
      <p
        className={`m-0 p-0 leading-normal ${
          isAdmin
            ? 'admin-type-body admin-color-primary'
            : 'font-heading text-base text-[var(--sf-text)]'
        }`}
      >
        {name}
      </p>

      <div className="m-0 flex items-center justify-between gap-4 p-0 leading-normal">
        <p
          className={`m-0 p-0 leading-normal ${
            isAdmin
              ? 'admin-type-body admin-color-primary'
              : 'text-base text-[var(--sf-text-muted)]'
          }`}
        >
          {leftContent}
        </p>

        <p
          className={`m-0 shrink-0 whitespace-nowrap p-0 text-right leading-normal ${
            isAdmin
              ? 'admin-type-body admin-color-primary'
              : 'font-heading text-base tabular-nums text-[var(--sf-text-muted)]'
          }`}
        >
          {rightContent}
        </p>
      </div>
    </>
  );

  const className =
    `m-0 flex w-full flex-col gap-1 border-b border-[var(--sf-border)] px-4 py-3 text-left leading-normal transition-colors ${
      isAdmin
        ? 'bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-subtle)]'
        : 'bg-[var(--sf-surface-soft)] hover:bg-[var(--sf-hover-surface)]'
    }`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`View ${name} details`}
        className={className}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
