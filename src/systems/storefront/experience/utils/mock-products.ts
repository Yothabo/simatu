import type { ProductCategory } from '../../core/hooks/useProducts.ts';

export type MockStorefrontProduct = {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  description: string;
  image_url: string;
};

/** Neutral preview cards for a configured collection without catalogue items. */
export function getMockProducts(category: ProductCategory): MockStorefrontProduct[] {
  return Array.from({ length: 3 }, (_, index) => ({
    id: `mock-${category.toLowerCase()}-${index + 1}`,
    name: 'Product',
    price: 'R 0.00',
    category,
    description: `A preview placeholder for the ${category} collection. Product details will appear when the catalogue is connected.`,
    image_url: '',
  }));
}
