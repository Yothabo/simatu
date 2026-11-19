import ProductModal from '../../ProductModal';
import { getCategoryTheme } from '../../../utils/categoryTheme';
import type { PreviewProduct } from './OrderItems';

type OrderProductPreviewProps = {
  product: PreviewProduct | null;
  onClose: () => void;
};

export default function OrderProductPreview({
  product,
  onClose,
}: OrderProductPreviewProps) {
  return (
    <ProductModal
      product={
        product
          ? {
              id: product.id,
              name: product.name,
              price: String(product.price),
              description: product.description,
              image_url: product.image_url,
            }
          : null
      }
      bgColor="bg-white"
      placeholderColor={
        product
          ? getCategoryTheme(product.category).placeholderColor
          : ''
      }
      accentColor={
        product
          ? getCategoryTheme(product.category).accentColor
          : 'text-[#8aa89b]'
      }
      isDark={false}
      mode="preview"
      onClose={onClose}
    />
  );
}
