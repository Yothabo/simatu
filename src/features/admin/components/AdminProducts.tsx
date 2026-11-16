import { AdminSectionHeader } from '../../../design-system/components';
import OverviewStoreSelector from './overview/header/OverviewStoreSelector';
import type {
  AdminRow,
  CategoryFilter,
  Storefront,
} from '../types/admin.types';
import {
  ProductListMobile,
  ProductListTable,
  ProductsCategoryFilter,
  ProductsPagination,
  ProductsToolbar,
} from './products/components';

type AdminProductsProps = {
  searchQuery: string;
  categoryFilter: CategoryFilter;
  filteredProducts: AdminRow[];
  paginatedProducts: AdminRow[];
  currentPage: number;
  totalPages: number;
  storefrontFilter: 'all' | Storefront;
  isLoadingProducts: boolean;
  onStorefrontChange: (value: 'all' | Storefront) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onPageChange: (page: number) => void;
  onAddProduct: () => void;
  onSelectProduct: (product: AdminRow) => void;
  onRefresh: () => void;
};

export default function AdminProducts({
  searchQuery,
  categoryFilter,
  filteredProducts,
  paginatedProducts,
  currentPage,
  totalPages,
  storefrontFilter,
  isLoadingProducts,
  onStorefrontChange,
  onSearchChange,
  onCategoryChange,
  onPageChange,
  onAddProduct,
  onSelectProduct,
  onRefresh,
}: AdminProductsProps) {
  return (
    <div
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <AdminSectionHeader
        title="Products"
        as="h1"
        action={
          <ProductsToolbar
            searchQuery={searchQuery}
            filteredProducts={filteredProducts}
            storefrontFilter={storefrontFilter}
            isLoadingProducts={isLoadingProducts}
            onSearchChange={onSearchChange}
            onAddProduct={onAddProduct}
            onRefresh={onRefresh}
          />
        }
      />

      <div className="overview-store-row">
        <OverviewStoreSelector
          value={storefrontFilter}
          onChange={onStorefrontChange}
        />
      </div>

      <ProductsCategoryFilter
        storefrontFilter={storefrontFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
      />

      <div className="admin-product-list-region">
        {filteredProducts.length === 0 ? (
          <p
            style={{
              padding: 'var(--admin-space-2xl) 0',
              textAlign: 'center',
              fontSize: 'var(--admin-size-supporting)',
              color: 'var(--admin-text-tertiary)',
              margin: 0,
            }}
          >
            No products match your filters.
          </p>
        ) : (
          <>
            <ProductListMobile
              paginatedProducts={paginatedProducts}
              onSelectProduct={onSelectProduct}
            />
            <ProductListTable
              paginatedProducts={paginatedProducts}
              onSelectProduct={onSelectProduct}
            />
          </>
        )}
      </div>

      <ProductsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        filteredProducts={filteredProducts}
        onPageChange={onPageChange}
      />
    </div>
  );
}
