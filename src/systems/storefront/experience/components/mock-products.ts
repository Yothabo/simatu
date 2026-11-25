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
    name: 'Product',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Underwear',
    description: 'A placeholder product card for the Poshies His collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-his-02',
    name: 'Product',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Underwear',
    description: 'A placeholder product card for the Poshies His collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-his-03',
    name: 'Product',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Underwear',
    description: 'A placeholder product card for the Poshies His collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-hers-01',
    name: 'Product',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Intimates',
    description: 'A placeholder product card for the Poshies Hers collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-hers-02',
    name: 'Product',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Intimates',
    description: 'A placeholder product card for the Poshies Hers collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-hers-03',
    name: 'Product',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Intimates',
    description: 'A placeholder product card for the Poshies Hers collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-lounge-01',
    name: 'Product',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Loungewear',
    description: 'A placeholder product card for the Poshies Lounge collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-lounge-02',
    name: 'Product',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Sleepwear',
    description: 'A placeholder product card for the Poshies Lounge collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
  {
    id: 'mock-poshies-lounge-03',
    name: 'Product',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Loungewear',
    description: 'A placeholder product card for the Poshies Lounge collection. Real product details will be added when the catalogue is connected.',
    image_url: '',
  },
];

export function getMockPoshiesProducts(category?: ProductCategory): MockStorefrontProduct[] {
  return category
    ? mockPoshiesProducts.filter((product) => product.category === category)
    : mockPoshiesProducts;
}
