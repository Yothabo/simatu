import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type CartItem = {
  id: string; name: string; price: string; placeholderColor: string;
  image_url?: string | null; description?: string | null; category: string;
  quantity: number; storefront: string; storeName: string;
};
export type NewCartItem = Omit<CartItem, 'quantity' | 'storeName'> & { storeName?: string };
export type CartState = {
  cartItems: CartItem[];
  addToCart: (item: NewCartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
};
const GlobalCartContext = createContext<CartState | undefined>(undefined);
export const MARKETPLACE_CART_KEY = 'simatu-marketplace-cart';
const parsePrice = (price: string) => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
};
function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .filter(item => typeof item.id === 'string' && typeof item.name === 'string')
    .map(item => {
      const storefront = typeof item.storefront === 'string' ? item.storefront : 'unknown';
      return { id: String(item.id), name: String(item.name), price: String(item.price ?? 'R 0'),
        placeholderColor: String(item.placeholderColor ?? 'bg-[#f1f1ee]'),
        image_url: typeof item.image_url === 'string' ? item.image_url : null,
        description: typeof item.description === 'string' ? item.description : null,
        category: String(item.category ?? 'General'), quantity: Math.max(1, Number(item.quantity) || 1),
        storefront, storeName: typeof item.storeName === 'string' ? item.storeName : storefront };
    });
}
function loadMarketplaceCart(): CartItem[] {
  try { return normalizeItems(window.localStorage.getItem(MARKETPLACE_CART_KEY) ? JSON.parse(window.localStorage.getItem(MARKETPLACE_CART_KEY)!) : []); }
  catch { return []; }
}
export function GlobalCartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadMarketplaceCart);
  useEffect(() => { try { localStorage.setItem(MARKETPLACE_CART_KEY, JSON.stringify(cartItems)); } catch {} }, [cartItems]);
  const addToCart = (item: NewCartItem) => setCartItems(prev => {
    const store = item.storefront || 'unknown';
    const found = prev.find(p => p.id === item.id && p.storefront === store);
    if (found) return prev.map(p => p.id === item.id && p.storefront === store ? { ...p, quantity: p.quantity + 1 } : p);
    return [...prev, { ...item, storefront: store, storeName: item.storeName || store, quantity: 1 }];
  });
  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(item => item.id !== id));
  const increaseQuantity = (id: string) => setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQuantity = (id: string) => setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  const clearCart = () => setCartItems([]);
  const cartTotal = cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  return <GlobalCartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, cartTotal }}>{children}</GlobalCartContext.Provider>;
}
export function useGlobalCart() {
  const context = useContext(GlobalCartContext);
  if (!context) throw new Error('useGlobalCart must be used within a GlobalCartProvider');
  return context;
}
