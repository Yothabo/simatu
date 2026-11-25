import type { ProductCategory } from '../../core/hooks/useProducts.ts';

export type MockStorefrontProduct = {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  image_url: string;
};

const mockPoshiesProducts: MockStorefrontProduct[] = [
  {
    id: 'mock-poshies-his-01',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-his-02',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-his-03',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-hers-01',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-hers-02',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-hers-03',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-lounge-01',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-lounge-02',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
  {
    id: 'mock-poshies-lounge-03',
    name: 'Preview item',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Preview',
    description: 'A placeholder used to preview the Poshies storefront. Product information will appear when the catalogue is ready.',
    image_url: '',
  },
];

export function getMockPoshiesProducts(category?: ProductCategory): MockStorefrontProduct[] {
  return category
    ? mockPoshiesProducts.filter((product) => product.category === category)
    : mockPoshiesProducts;
}
