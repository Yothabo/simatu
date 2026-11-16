import {
  FiDownload,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import { AdminButton } from '../../../../../design-system/components';
import type { AdminRow, Storefront } from '../../../types/admin.types';
import { exportProductsCsv } from '../utils';
import { useSearchPopover } from '../../../hooks/useSearchPopover';

type Props = {
  searchQuery: string;
  filteredProducts: AdminRow[];
  storefrontFilter: 'all' | Storefront;
  isLoadingProducts: boolean;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  onRefresh: () => void;
};

export default function ProductsToolbar({
  searchQuery,
  filteredProducts,
  storefrontFilter,
  isLoadingProducts,
  onSearchChange,
  onAddProduct,
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
        ariaLabel="Export products report"
        onClick={() => {
          if (isLoadingProducts || filteredProducts.length === 0) return;
          exportProductsCsv(filteredProducts, storefrontFilter);
        }}
        disabled={isLoadingProducts || filteredProducts.length === 0}
      >
        <FiDownload size={18} aria-hidden="true" />
      </AdminButton>

      <AdminButton
        variant="neutral"
        shape="circle"
        ariaLabel={isLoadingProducts ? 'Refreshing products' : 'Refresh products'}
        onClick={() => {
          if (isLoadingProducts) return;
          onRefresh();
        }}
      >
        <FiRefreshCw
          size={18}
          aria-hidden="true"
          className={isLoadingProducts ? 'animate-spin' : ''}
        />
      </AdminButton>

      <div className="relative" ref={searchRef}>
        <AdminButton
          variant="neutral"
          shape="circle"
          ariaLabel="Search products"
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
            }}
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
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

      <AdminButton
        variant="neutral"
        shape="circle"
        ariaLabel="Add product"
        onClick={onAddProduct}
      >
        <FiPlus size={18} aria-hidden="true" />
      </AdminButton>
    </div>
  );
}
