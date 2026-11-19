import type { ReactNode } from 'react';

type AdminFieldProps = {
  label: string;
  children: ReactNode;
  /** Optional hint shown under the label. */
  hint?: string;
  /** Optional required marker. */
  required?: boolean;
  /** Optional error message shown under the field in red. */
  error?: string;
  /** Optional HTML id to associate the label with an input. */
  htmlFor?: string;
};

export default function AdminField({
  label,
  children,
  hint,
  required = false,
  error,
  htmlFor,
}: AdminFieldProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--admin-space-xxs)',
      }}
    >
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: 'var(--admin-size-micro)',
          fontWeight: 'var(--admin-weight-medium)',
          color: 'var(--admin-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          display: 'block',
        }}
      >
        {label}
        {required && (
          <span
            aria-hidden="true"
            style={{
              color: 'var(--admin-status-red)',
              marginLeft: 'var(--admin-space-xxs)',
            }}
          >
            *
          </span>
        )}
      </label>

      {hint && (
        <span
          style={{
            fontSize: 'var(--admin-size-micro)',
            color: 'var(--admin-text-tertiary)',
            lineHeight: 1.4,
          }}
        >
          {hint}
        </span>
      )}

      {children}

      {error && (
        <span
          role="alert"
          style={{
            fontSize: 'var(--admin-size-micro)',
            fontWeight: 'var(--admin-weight-medium)',
            color: 'var(--admin-status-red)',
            lineHeight: 1.4,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
