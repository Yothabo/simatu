import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import {
  AdminButton,
  AdminSectionHeader,
} from '../../../../design-system/components';
import OverviewStoreSelector from '../overview/header/OverviewStoreSelector';
import { SECTIONS } from './constants';
import { useInventoryData, useStockAction } from './hooks';
import {
  InventoryOverviewSection,
  InventoryReceiptsSection,
  InventorySalesSection,
  InventoryStockSection,
} from './sections';
import InventoryPageHeader from './InventoryPageHeader';
import InventorySectionNavigation from './InventorySectionNavigation';
import StockActionModal from './shared/StockActionModal';
import type { InventoryProps, InventorySection } from './types';

export default function AdminInventory({
  storefrontFilter,
  onStorefrontChange,
  accessToken,
  userId,
}: InventoryProps) {
  const [section, setSection] = useState<InventorySection>('overview');

  const {
    inventory,
    movements,
    isLoading,
    loadError,
    stockSummary,
    refreshInventory,
    applyInventoryResponse,
    setLoadError,
  } = useInventoryData({
    storefrontFilter,
    accessToken,
    userId,
  });

  const stock = useStockAction({
    inventory,
    storefrontFilter,
    accessToken,
    applyInventoryResponse,
    setLoadError,
  });
  const activeSection = SECTIONS.find((item) => item.id === section)!;

  return (
    <section
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-xl)' }}
    >
      <InventoryPageHeader
        inventory={inventory}
        storefrontFilter={storefrontFilter}
        isLoading={isLoading}
        loadError={loadError}
        onRefresh={refreshInventory}
      />

      <div className="overview-store-row">
        <OverviewStoreSelector
          value={storefrontFilter}
          onChange={onStorefrontChange}
        />
      </div>

      <InventorySectionNavigation
        section={section}
        onSectionChange={setSection}
      />

      <AdminSectionHeader
        title={activeSection.label}
        description={activeSection.description}
        action={
          section === 'sales' ? (
            <AdminButton
              variant="neutral"
              shape="pill"
              ariaLabel="New direct sale"
              onClick={() => {
                // Not wired yet.
              }}
            >
              <FiPlus size={16} aria-hidden="true" />
              <span>New direct sale</span>
            </AdminButton>
          ) : section === 'receipts' ? (
            <AdminButton
              variant="neutral"
              shape="pill"
              ariaLabel="New receipt"
              onClick={() => {
                // Not wired yet.
              }}
            >
              <FiPlus size={16} aria-hidden="true" />
              <span>New receipt</span>
            </AdminButton>
          ) : undefined
        }
      />

      {loadError && (
        <p
          role="alert"
          className="rounded-lg border p-3 text-sm"
          style={{
            background: 'var(--admin-page)',
            borderColor: 'var(--admin-border-subtle)',
            color: 'var(--admin-text-primary)',
          }}
        >
          {loadError}
        </p>
      )}

      {section === 'overview' && (
        <InventoryOverviewSection
          inventory={inventory}
          movements={movements}
          stockSummary={stockSummary}
          isLoading={isLoading}
          loadError={loadError}
        />
      )}

      {section === 'stock' && (
        <InventoryStockSection
          inventory={inventory}
          stockSummary={stockSummary}
          isLoading={isLoading}
          loadError={loadError}
          onReceive={stock.openReceive}
          onAdjust={stock.openAdjust}
        />
      )}

      {section === 'sales' && <InventorySalesSection />}
      {section === 'receipts' && <InventoryReceiptsSection />}

      <StockActionModal
        stockAction={stock.stockAction}
        inventory={inventory}
        selectedProductId={stock.selectedProductId}
        setSelectedProductId={stock.setSelectedProductId}
        quantity={stock.quantity}
        setQuantity={stock.setQuantity}
        reason={stock.reason}
        setReason={stock.setReason}
        adjustmentDirection={stock.adjustmentDirection}
        setAdjustmentDirection={stock.setAdjustmentDirection}
        isSubmitting={stock.isSubmitting}
        submitError={stock.submitError}
        selectedProduct={stock.selectedProduct}
        onClose={stock.close}
        onSubmit={stock.handleSubmit}
      />
    </section>
  );
}
