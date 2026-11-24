import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, NewCartItem, CartState } from '../../../../shared/cart/CartContext';

const StorefrontCartContext = createContext<CartState | undefined>(undefined);
const PRIVATE_KEYS: Record<string, string> = { yotaabo: 'yotaabo-cart', poshies: 'poshies-cart' };
const parsePrice = (price: string) => { const n = parseFloat(price.replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0; };
function readCart(key: string): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string')
      .map(item => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1), storefront: item.storefront || key.replace('-cart','') }));
  } catch { return []; }
}
export function StorefrontCartProvider({ storefront, children }: { storefront: 'yotaabo' | 'poshies'; children: ReactNode }) {
  const key = PRIVATE_KEYS[storefront];
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readCart(key));
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(cartItems)); } catch {} }, [key, cartItems]);
  const addToCart = (item: NewCartItem) => setCartItems(prev => {
    const existing = prev.find(cartItem => cartItem.id === item.id);
    if (existing) return prev.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
    return [...prev, { ...item, storefront, storeName: item.storeName || (storefront === 'poshies' ? 'Poshies' : 'Yotaabo'), quantity: 1 }];
  });
  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(item => item.id !== id));
  const increaseQuantity = (id: string) => setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQuantity = (id: string) => setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  const clearCart = () => setCartItems([]);
  const cartTotal = cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  return <StorefrontCartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, cartTotal }}>{children}</StorefrontCartContext.Provider>;
}
export function useCart() {
  const context = useContext(StorefrontCartContext);
  if (!context) throw new Error('useCart must be used within StorefrontCartProvider');
  return context;
}
export type { CartItem };
