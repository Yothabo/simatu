import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useStorefront from '../hooks/useStorefront.ts';

export type CartItem = {
  id: string;
  name: string;
  price: string;
  placeholderColor: string;
  image_url?: string | null;
  description?: string | null;
  category: string;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);


// Helper to parse "R 890" into 890
const parsePrice = (price: string) => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
};

// Safe localStorage read
const loadCart = (storageKey: string): CartItem[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { name } = useStorefront();
  const storefront = name.toLowerCase();
  const storageKey = `${storefront}-cart`;

  const [cartState, setCartState] = useState<{
    storefront: string;
    items: CartItem[];
  }>(() => ({
    storefront,
    items: loadCart(storageKey),
  }));

  const [hydratedStorageKey, setHydratedStorageKey] = useState(storageKey);

  // Load the correct cart whenever the active storefront changes.
  useEffect(() => {
    const stored = loadCart(storageKey);
    setCartState({ storefront, items: stored });
    setHydratedStorageKey(storageKey);
  }, [storageKey, storefront]);

  // Never write an old storefront's cart into the new storefront's key.
  useEffect(() => {
    if (
      hydratedStorageKey !== storageKey ||
      cartState.storefront !== storefront
    ) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(cartState.items));
    } catch {
      // Ignore quota errors silently
    }
  }, [cartState, hydratedStorageKey, storageKey, storefront]);

  const cartItems = cartState.storefront === storefront
    ? cartState.items
    : [];

  const updateCart = (updater: (items: CartItem[]) => CartItem[]) => {
    setCartState((previous) => ({
      storefront,
      items: updater(
        previous.storefront === storefront ? previous.items : []
      ),
    }));
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    updateCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    updateCart((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    updateCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    updateCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => updateCart(() => []);

  const cartTotal = cartItems.reduce(
    (total, item) => total + parsePrice(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartTotal,
      }}
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
