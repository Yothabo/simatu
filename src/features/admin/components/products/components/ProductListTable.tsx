import type { AdminRow } from '../../../types/admin.types';
import ProductTableHead from './ProductTableHead';
import ProductTableRow from './ProductTableRow';

type Props = {
  paginatedProducts: AdminRow[];
  onSelectProduct: (product: AdminRow) => void;
};

export default function ProductListTable({
  paginatedProducts,
  onSelectProduct,
}: Props) {
  return (
    <div
      className="hidden md:block"
      style={{
        width: '100%',
        overflowX: 'auto',
        borderTop: '1px solid var(--admin-border-subtle)',
        borderBottom: '1px solid var(--admin-border-subtle)',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: '760px',
          borderCollapse: 'collapse',
          textAlign: 'left',
        }}
      >
        <ProductTableHead />
        <tbody>
          {paginatedProducts.map((product) => (
            <ProductTableRow
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
