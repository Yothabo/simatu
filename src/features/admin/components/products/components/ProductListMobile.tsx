import AdminItemCard from '../../../../../components/AdminItemCard';
import { formatPrice } from '../../../../../utils/formatPrice';
import { getCategoryTheme } from '../../../../../utils/categoryTheme';
import type { AdminRow } from '../../../types/admin.types';

type Props = {
  paginatedProducts: AdminRow[];
  onSelectProduct: (product: AdminRow) => void;
};

export default function ProductListMobile({
  paginatedProducts,
  onSelectProduct,
}: Props) {
  return (
    <div
      className="flex flex-col md:hidden"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      {paginatedProducts.map((product) => {
        const theme = getCategoryTheme(product.category);
        const isActive = product.is_active;

        return (
          <AdminItemCard
            key={product.id}
            layout="product"
            title={product.name}
            status={isActive ? 'Active' : 'Inactive'}
            price={formatPrice(product.price)}
            meta={`${product.category} · ${product.subcategory}`}
            onClick={() => onSelectProduct(product)}
            ariaLabel={`View product ${product.name}`}
            leftClassName={
              isActive ? theme.placeholderColor : 'bg-gray-300'
            }
            leftContent={
              product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-2"
                />
              ) : null
            }
            statusClassName={
              isActive ? 'text-[#4d4d4d]/40' : 'text-red-500'
            }
            className={!isActive ? 'opacity-60' : ''}
          />
        );
      })}
    </div>
  );
}
