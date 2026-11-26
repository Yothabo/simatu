import type { ReactNode } from 'react';
import { CartProvider, STOREFRONT_CART_KEYS, useScopedCart } from '../../../../shared/cart/CartContext';

export function StorefrontCartProvider({
  storefront,
  children,
}: {
  storefront: string;
  children: ReactNode;
}) {
  return (
    <CartProvider storageKey={STOREFRONT_CART_KEYS[storefront] ?? `${storefront}-cart`} defaultStorefront={storefront}>
      {children}
    </CartProvider>
  );
}

export const useCart = useScopedCart;
export type { CartItem, NewCartItem, CartState } from '../../../../shared/cart/CartContext';
