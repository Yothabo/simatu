import { getAdminProductPlaceholderColor } from '../features/admin/utils/adminProductCategoryTheme';
import Modal from '../shared/components/Modal';
import type { AdminRow } from '../features/admin/types/admin.types';
import ProductDetailsHeader from './admin-product-details/components/ProductDetailsHeader';
import ProductDetailsImage from './admin-product-details/components/ProductDetailsImage';
import ProductDetailsPricing from './admin-product-details/components/ProductDetailsPricing';
import ProductDetailsMetrics from './admin-product-details/components/ProductDetailsMetrics';
import ProductDetailsAttributes from './admin-product-details/components/ProductDetailsAttributes';
import ProductDetailsDescription from './admin-product-details/components/ProductDetailsDescription';
import ProductDetailsFooter from './admin-product-details/components/ProductDetailsFooter';
import { formatProductAddedDate } from './admin-product-details/utils/formatProductAddedDate';

type AdminProductDetailsModalProps = {
  product: AdminRow | null;
  onClose: () => void;
  onEdit: (product: AdminRow) => void;
  onHide: (product: AdminRow) => void;
  onShow: (product: AdminRow) => void;
  onDelete: (product: AdminRow) => void;
};

export default function AdminProductDetailsModal({
  product,
  onClose,
  onEdit,
  onHide,
  onShow,
  onDelete,
}: AdminProductDetailsModalProps) {
  if (!product) return null;

  const placeholderColor = getAdminProductPlaceholderColor(product.category);
  const addedDate = formatProductAddedDate(product.created_at);

  return (
    <Modal isOpen={!!product} onClose={onClose} scrollable={false}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '85vh',
          backgroundColor: 'var(--admin-surface)',
          borderRadius: 'var(--ds-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Sticky header */}
        <ProductDetailsHeader
          product={product}
          onClose={onClose}
          onHide={onHide}
          onShow={onShow}
          onDelete={onDelete}
        />

        {/* Scrollable body */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--admin-space-lg)',
            padding: 'var(--admin-space-lg)',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Image */}
          <ProductDetailsImage
            product={product}
            placeholderColor={placeholderColor}
          />

          {/* Name */}
          <h2
            style={{
              fontSize: 'var(--admin-size-section-title)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {product.name}
          </h2>

          {/* Row 1 — Price | Supplier cost */}
          <ProductDetailsPricing product={product} />

          {/* Row 2 — Times ordered | Sort order */}
          <ProductDetailsMetrics product={product} />

          {/* Row 3 — Category | Subcategory | SKU */}
          {/* Row 4 — Added | Sizes */}
          <ProductDetailsAttributes
            product={product}
            addedDate={addedDate}
          />

          {/* Row 5 — Description */}
          <ProductDetailsDescription product={product} />
        </div>

        {/* Sticky footer — Close + Edit */}
        <ProductDetailsFooter
          product={product}
          onClose={onClose}
          onEdit={onEdit}
        />
      </div>
    </Modal>
  );
}
