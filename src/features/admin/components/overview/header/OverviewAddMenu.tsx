import { useEffect, useRef, useState } from 'react';
import {
  FiFileText,
  FiPlus,
  FiShoppingCart,
} from 'react-icons/fi';
import AccentButton from '../../AccentButton';

type AddAction = 'direct-sale' | 'new-product' | 'receipt';

const ADD_ACTIONS: {
  key: AddAction;
  label: string;
  icon: typeof FiPlus;
}[] = [
  { key: 'direct-sale', label: 'Register a direct sale', icon: FiShoppingCart },
  { key: 'new-product', label: 'Add new product', icon: FiPlus },
  { key: 'receipt', label: 'Create a receipt', icon: FiFileText },
];

type Props = {
  onAddProduct: () => void;
};

export default function OverviewAddMenu({ onAddProduct }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAddOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(event.target as Node)) {
        setIsAddOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAddOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddOpen]);

  const handleAction = (action: AddAction) => {
    setIsAddOpen(false);
    if (action === 'new-product') onAddProduct();
  };

  return (
    <div className="relative" ref={addRef}>
      <AccentButton
        variant="neutral"
        shape="circle"
        ariaLabel="Add"
        ariaCurrent={isAddOpen ? 'true' : undefined}
        onClick={() => setIsAddOpen((current) => !current)}
      >
        <FiPlus size={18} aria-hidden="true" />
      </AccentButton>

      {isAddOpen && (
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
            const isImplemented = action.key === 'new-product';
            return (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                onClick={() => handleAction(action.key)}
                disabled={!isImplemented}
                title={!isImplemented ? 'This action is not available yet.' : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--admin-space-sm)',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: isImplemented ? 'var(--admin-text-primary)' : 'var(--admin-text-tertiary)',
                  fontSize: 'var(--admin-size-body)',
                  textAlign: 'left',
                  cursor: isImplemented ? 'pointer' : 'not-allowed',
                  opacity: isImplemented ? 1 : 0.55,
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(event) => {
                  if (isImplemented) event.currentTarget.style.backgroundColor = 'var(--admin-surface-subtle)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
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
