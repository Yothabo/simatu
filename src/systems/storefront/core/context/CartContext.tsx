import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: string;
  placeholderColor: string;
  image_url?: string | null;
  description?: string | null;
  category: string;
  quantity: number;
  storefront: string;
  storeName: string;
};

type NewCartItem = Omit<CartItem, 'quantity' | 'storeName'> & {
  storeName?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: NewCartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const SHARED_CART_KEY = 'simatu-shared-cart';

// Helper to parse a displayed price such as "R 890" into 890.
const parsePrice = (price: string) => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
};

function normalizeCartItems(value: unknown, storefront: string): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .filter((item) => typeof item.id === 'string' && typeof item.name === 'string')
    .map((item) => {
      const itemStorefront = typeof item.storefront === 'string' ? item.storefront : storefront;
      return {
        id: String(item.id),
        name: String(item.name),
        price: String(item.price ?? 'R 0'),
        placeholderColor: String(item.placeholderColor ?? 'bg-[#f1f1ee]'),
        image_url: typeof item.image_url === 'string' ? item.image_url : null,
        description: typeof item.description === 'string' ? item.description : null,
        category: String(item.category ?? 'General'),
        quantity: Math.max(1, Number(item.quantity) || 1),
        storefront: itemStorefront,
        storeName: typeof item.storeName === 'string'
          ? item.storeName
          : itemStorefront === 'poshies' ? 'Poshies' : itemStorefront === 'yotaabo' ? 'Yotaabo' : itemStorefront,
      };
    });
}

function loadSharedCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const shared = window.localStorage.getItem(SHARED_CART_KEY);
    if (shared) return normalizeCartItems(JSON.parse(shared), 'yotaabo');

    // Migrate the two legacy storefront carts into the shared cart once.
    const legacyYotaabo = normalizeCartItems(
      JSON.parse(window.localStorage.getItem('yotaabo-cart') || '[]'),
      'yotaabo',
    );
    const legacyPoshies = normalizeCartItems(
      JSON.parse(window.localStorage.getItem('poshies-cart') || '[]'),
      'poshies',
    );
    const merged = [...legacyYotaabo, ...legacyPoshies];
    const unique = new Map(merged.map((item) => [item.id, item]));
    return Array.from(unique.values());
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadSharedCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(SHARED_CART_KEY, JSON.stringify(cartItems));
    } catch {
      // Keep the in-memory cart usable when browser storage is unavailable.
    }
  }, [cartItems]);

  const addToCart = (item: NewCartItem) => {
    const storefront = item.storefront || 'yotaabo';
    const storeName = item.storeName || (
      storefront === 'poshies' ? 'Poshies' : storefront === 'yotaabo' ? 'Yotaabo' : storefront
    );

    setCartItems((previous) => {
      const existing = previous.find(
        (cartItem) => cartItem.id === item.id && cartItem.storefront === storefront,
      );

      if (existing) {
        return previous.map((cartItem) =>
          cartItem.id === item.id && cartItem.storefront === storefront
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...previous, { ...item, storefront, storeName, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((previous) => previous.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setCartItems((previous) =>
      previous.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item),
    );
  };

  const decreaseQuantity = (id: string) => {
    setCartItems((previous) =>
      previous.map((item) => item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity - 1) }
        : item),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce(
    (total, item) => total + parsePrice(item.price) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
