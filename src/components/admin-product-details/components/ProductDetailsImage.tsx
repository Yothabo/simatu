import type { AdminRow } from '../../../features/admin/types/admin.types';

type ProductDetailsImageProps = {
  product: AdminRow;
  placeholderColor: string;
};

export default function ProductDetailsImage({
  product,
  placeholderColor,
}: ProductDetailsImageProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '220px',
        borderRadius: 'var(--ds-radius-lg)',
        overflow: 'hidden',
        backgroundColor: product.is_active
          ? undefined
          : 'var(--admin-surface-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={product.is_active ? placeholderColor : ''}
    >
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: 'var(--admin-space-md)',
          }}
        />
      )}
    </div>
  );
}
