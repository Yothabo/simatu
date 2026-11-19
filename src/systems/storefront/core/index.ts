export { STOREFRONTS, isStorefrontKey } from './configuration/storefronts';
export type {
  StorefrontCategory,
  StorefrontConfiguration,
  StorefrontDesignSystem,
  StorefrontKey,
} from './types/storefront';

export { CartProvider, useCart } from './context/CartContext';
export { default as useStorefront } from './hooks/useStorefront';
export {
  useProducts,
  getFeaturedProducts,
  getCategoryProducts,
  invalidateProductsCache,
} from './hooks/useProducts';
export type { Product, ProductCategory } from './hooks/useProducts';
export { default as StorefrontThemeProvider } from './components/StorefrontThemeProvider';
