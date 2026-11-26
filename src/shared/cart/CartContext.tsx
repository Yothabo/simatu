import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type CartItem = {
  id: string; name: string; price: string; placeholderColor: string;
  image_url?: string | null; description?: string | null; category: string;
  quantity: number; storefront: string; storeName: string;
};
export type NewCartItem = Omit<CartItem, 'quantity' | 'storeName'> & { storeName?: string };
export type CartState = {
  cartItems: CartItem[];
  addToCart: (item: NewCartItem) => void;
  removeFromCart: (id: string, storefront?: string) => void;
  increaseQuantity: (id: string, storefront?: string) => void;
  decreaseQuantity: (id: string, storefront?: string) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartState | undefined>(undefined);
export const MARKETPLACE_CART_KEY = 'simatu-marketplace-cart';
export const STOREFRONT_CART_KEYS: Record<string, string> = {
  yotaabo: 'yotaabo-cart',
  poshies: 'poshies-cart',
};

const parsePrice = (price: string) => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
};

function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .filter(item => typeof item.id === 'string' && typeof item.name === 'string')
    .map(item => {
      const storefront = typeof item.storefront === 'string' ? item.storefront : 'unknown';
      return {
        id: String(item.id),
        name: String(item.name),
        price: String(item.price ?? 'R 0'),
        placeholderColor: String(item.placeholderColor ?? 'bg-[#f1f1ee]'),
        image_url: typeof item.image_url === 'string' ? item.image_url : null,
        description: typeof item.description === 'string' ? item.description : null,
        category: String(item.category ?? 'General'),
        quantity: Math.max(1, Number(item.quantity) || 1),
        storefront,
        storeName: typeof item.storeName === 'string' ? item.storeName : storefront,
      };
    });
}

function readCart(storageKey: string): CartItem[] {
  try {
    return normalizeItems(JSON.parse(window.localStorage.getItem(storageKey) || '[]'));
  } catch {
    return [];
  }
}

/** One cart engine; each provider instance is isolated by its storage key and storefront scope. */
export function CartProvider({
  storageKey,
  defaultStorefront,
  children,
}: {
  storageKey: string;
  defaultStorefront?: string;
  children: ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readCart(storageKey));

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(cartItems)); } catch {}
  }, [storageKey, cartItems]);

  const addToCart = (item: NewCartItem) => setCartItems(prev => {
    const storefront = item.storefront || defaultStorefront || 'unknown';
    const found = prev.find(p => p.id === item.id && p.storefront === storefront);
    if (found) return prev.map(p => p.id === item.id && p.storefront === storefront ? { ...p, quantity: p.quantity + 1 } : p);
    return [...prev, {
      ...item,
      storefront,
      storeName: item.storeName || defaultStorefront || storefront,
      quantity: 1,
    }];
  });

  const matches = (item: CartItem, id: string, storefront?: string) =>
    item.id === id && (storefront === undefined || item.storefront === storefront);
  const removeFromCart = (id: string, storefront?: string) => setCartItems(prev => prev.filter(item => !matches(item, id, storefront)));
  const increaseQuantity = (id: string, storefront?: string) => setCartItems(prev => prev.map(item => matches(item, id, storefront) ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQuantity = (id: string, storefront?: string) => setCartItems(prev => prev.map(item => matches(item, id, storefront) ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  const clearCart = () => setCartItems([]);
  const cartTotal = cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);

  return <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, cartTotal }}>{children}</CartContext.Provider>;
}

export function useScopedCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('Cart hooks must be used within a CartProvider scope');
  return context;
}

export function GlobalCartProvider({ children }: { children: ReactNode }) {
  return <CartProvider storageKey={MARKETPLACE_CART_KEY} defaultStorefront="marketplace">{children}</CartProvider>;
}

export const useGlobalCart = useScopedCart;
