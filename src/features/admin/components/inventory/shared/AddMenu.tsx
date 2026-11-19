import { useEffect, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { AdminButton } from '../../../../../design-system/components';
import { ADD_ACTIONS } from '../constants';

export default function AddMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <AdminButton
        variant="neutral"
        shape="circle"
        ariaLabel="Add"
        ariaCurrent={isOpen ? 'true' : undefined}
        onClick={() => setIsOpen((v) => !v)}
      >
        <FiPlus size={18} aria-hidden="true" />
      </AdminButton>

      {isOpen && (
        <div
          role="menu"
          aria-label="Add action menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            width: '220px',
            zIndex: 100,
            backgroundColor: 'var(--admin-surface)',
            boxShadow: 'var(--admin-shadow)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--admin-border-subtle)',
            borderRadius: 'var(--ds-radius-lg)',
            overflow: 'hidden',
          }}
        >
          {ADD_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  // Actions not wired yet.
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--admin-space-sm)',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--admin-text-primary)',
                  fontSize: 'var(--admin-size-body)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--admin-surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
