import { FiX } from 'react-icons/fi';
import type { CategoryFormHeaderProps } from './types';

export default function CategoryFormHeader({
  title,
  onCancel,
}: CategoryFormHeaderProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: 'var(--admin-space-md)' }}
    >
      <h3
        style={{
          fontSize: 'var(--admin-size-heading-3)',
          fontWeight: 'var(--admin-weight-semibold)',
          color: 'var(--admin-text-primary)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      <button
        type="button"
        onClick={onCancel}
        aria-label="Close"
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--admin-text-tertiary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FiX size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
