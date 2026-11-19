import { FiDownload, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { AdminButton } from '../../../../../design-system/components';
import { useSearchPopover } from '../../../../admin/hooks/useSearchPopover';
import type { Order, Storefront } from '../../../types/admin.types';
import { exportOrdersCsv } from '../utils';

type Props = {
  orderSearch: string;
  filteredOrders: Order[];
  storefrontFilter: 'all' | Storefront;
  isLoadingOrders: boolean;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
};

export default function OrdersToolbar({
  orderSearch,
  filteredOrders,
  storefrontFilter,
  isLoadingOrders,
  onSearchChange,
  onRefresh,
}: Props) {
  const { isSearchOpen, setIsSearchOpen, searchRef } = useSearchPopover();

  return (
    <div
      className="flex items-center flex-wrap"
      style={{ gap: 'var(--admin-space-xs)' }}
    >
      <AdminButton
        variant="neutral"
        shape="circle"
        ariaLabel="Export orders report"
        onClick={() => {
          if (isLoadingOrders || filteredOrders.length === 0) return;
          exportOrdersCsv(filteredOrders, storefrontFilter);
        }}
        disabled={isLoadingOrders || filteredOrders.length === 0}
      >
        <FiDownload size={18} aria-hidden="true" />
      </AdminButton>

      <AdminButton
        variant="neutral"
        shape="circle"
        ariaLabel={isLoadingOrders ? 'Refreshing orders' : 'Refresh orders'}
        onClick={() => {
          if (isLoadingOrders) return;
          onRefresh();
        }}
      >
        <FiRefreshCw
          size={18}
          aria-hidden="true"
          className={isLoadingOrders ? 'animate-spin' : ''}
        />
      </AdminButton>

      <div className="relative" ref={searchRef}>
        <AdminButton
          variant="neutral"
          shape="circle"
          ariaLabel="Search orders"
          ariaCurrent={isSearchOpen ? 'true' : undefined}
          onClick={() => setIsSearchOpen((v) => !v)}
        >
          <FiSearch size={18} aria-hidden="true" />
        </AdminButton>

        {isSearchOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '320px',
              maxWidth: 'calc(100vw - 32px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              height: '44px',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: 'var(--ds-radius-xl)',
              backgroundColor: 'var(--admin-surface)',
              boxShadow: 'var(--admin-shadow)',
              paddingInline: 'var(--admin-space-sm)',
              gap: 'var(--admin-space-xs)',
            }}
          >
            <input
              type="search"
              value={orderSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search orders by number, name, or phone"
              aria-label="Search orders"
              autoFocus
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--admin-text-primary)',
                fontSize: 'var(--admin-size-supporting)',
                padding: 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
