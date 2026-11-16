import { useEffect, useRef, useState } from 'react';
import {
  FiDownload,
  FiFileText,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiShoppingCart,
} from 'react-icons/fi';
import type { Storefront } from '../../../types/admin.types';
import AccentButton from '../../AccentButton';
import AdminDropdown from '../../AdminDropdown';
import OverviewToolbar from '../shared/OverviewToolbar';
import OverviewStoreSelector from './OverviewStoreSelector';

type OverviewHeaderProps = {
  greeting: string;
  userName: string;
  canSwitchStore: boolean;
  storefrontFilter: 'all' | Storefront;
  onStorefrontChange: (value: 'all' | Storefront) => void;
  activeQuickAction: string;
  quickActionOptions: { value: string; label: string }[];
  onQuickActionChange: (value: string) => void;
  isLoading: boolean;
  onExport: () => void;
  onRefresh: () => void;
  onAdd: () => void;
};

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

export default function OverviewHeader({
  greeting,
  userName,
  canSwitchStore,
  storefrontFilter,
  onStorefrontChange,
  activeQuickAction,
  quickActionOptions,
  onQuickActionChange,
  isLoading,
  onExport,
  onRefresh,
  onAdd,
}: OverviewHeaderProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAddOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setIsAddOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddOpen]);

  const handleAddAction = (_action: AddAction) => {
    setIsAddOpen(false);
    // Actions not wired yet — just close the menu.
  };

  return (
    <header
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <div
        className="flex w-full flex-col"
        style={{ gap: 'var(--admin-space-xs)' }}
      >
        <h1
          style={{
            fontSize: 'var(--admin-greeting-size)',
            lineHeight: 'var(--admin-greeting-line)',
            fontWeight: 'var(--admin-greeting-weight)',
            color: 'var(--admin-text-primary)',
            margin: 0,
          }}
        >
          {greeting},{' '}
          <span
            style={{
              fontSize: 'var(--admin-text-page-title-size)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
              lineHeight: 1.1,
            }}
          >
            {userName}
          </span>
        </h1>
      </div>

      <OverviewToolbar align="end">
        <AccentButton
          variant="neutral"
          shape="circle"
          ariaLabel="Export overview report"
          onClick={onExport}
        >
          <FiDownload size={18} aria-hidden="true" />
        </AccentButton>

        <AccentButton
          variant="neutral"
          shape="circle"
          ariaLabel={isLoading ? 'Refreshing overview' : 'Refresh overview'}
          onClick={onRefresh}
        >
          <FiRefreshCw
            size={18}
            aria-hidden="true"
            className={isLoading ? 'animate-spin' : ''}
          />
        </AccentButton>

        <AdminDropdown
          value={activeQuickAction}
          onChange={onQuickActionChange}
          options={quickActionOptions}
          placeholder="Filter period"
          menuWidth="220px"
          compact
          iconOnly
          align="right"
          tone="neutral"
          radioColor="var(--admin-text-primary)"
          ariaLabel="Filter overview by date"
          triggerIcon={<FiFilter size={18} aria-hidden="true" />}
        />

        <div className="relative" ref={addRef}>
          <AccentButton
            variant="neutral"
            shape="circle"
            ariaLabel="Add"
            ariaCurrent={isAddOpen ? 'true' : undefined}
            onClick={() => setIsAddOpen((v) => !v)}
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
                return (
                  <button
                    key={action.key}
                    type="button"
                    role="menuitem"
                    onClick={() => handleAddAction(action.key)}
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
      </OverviewToolbar>

      {canSwitchStore && (
        <div className="overview-store-row">
          <OverviewStoreSelector
            value={storefrontFilter}
            onChange={onStorefrontChange}
          />
        </div>
      )}
    </header>
  );
}
