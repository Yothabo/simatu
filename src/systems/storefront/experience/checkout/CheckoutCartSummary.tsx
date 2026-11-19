import CheckoutItemCard from '../CheckoutItemCard';
import type { CartItem } from '../../context/CartContext';

type CheckoutCartSummaryProps = {
  cartItems: CartItem[];
  cartTotal: number;
  onSelectProduct: (item: CartItem) => void;
};

export default function CheckoutCartSummary({
  cartItems,
  cartTotal,
  onSelectProduct,
}: CheckoutCartSummaryProps) {
  return (
    <div className="mt-6">
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
        {cartItems.map((item) => {
          const unitPrice = Number(item.price.replace(/[^0-9.]/g, ''));

          return (
            <CheckoutItemCard
              key={item.id}
              name={item.name}
              leftContent={
                <>
                  <span className="font-heading tabular-nums">{item.quantity}</span>
                  {' × '}
                  <span className="font-heading tabular-nums">R {unitPrice.toFixed(2)}</span>
                </>
              }
              rightContent={`R ${(unitPrice * item.quantity).toFixed(2)}`}
              onClick={() => onSelectProduct(item)}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between py-4">
        <span className="font-heading text-base text-[#4d4d4d]">
          Subtotal
        </span>
        <span className="font-heading text-xl font-semibold text-[#4d4d4d] tabular-nums">
          R {cartTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
