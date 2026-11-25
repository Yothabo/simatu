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
    name: 'Everyday Boxer Brief',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Underwear',
    description: 'A preview of the Poshies everyday essentials collection. Mock product data only; not available to purchase.',
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a6c7?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-his-02',
    name: 'Classic Cotton Trunk',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Underwear',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-his-03',
    name: 'Soft Touch Brief',
    price: 'R 0.00',
    category: 'His',
    subcategory: 'Underwear',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-hers-01',
    name: 'Satin Ease Set',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Intimates',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-hers-02',
    name: 'Everyday Comfort Bra',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Intimates',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1589462132424-7c9f8f8c5d5e?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-hers-03',
    name: 'Lace Detail Set',
    price: 'R 0.00',
    category: 'Hers',
    subcategory: 'Intimates',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1566174053879-315285e5a5e1?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-lounge-01',
    name: 'Slow Morning Lounge Set',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Loungewear',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a6c7?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-lounge-02',
    name: 'Soft Knit Sleep Set',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Sleepwear',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a6c7?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mock-poshies-lounge-03',
    name: 'Weekend Wrap Robe',
    price: 'R 0.00',
    category: 'Lounge',
    subcategory: 'Loungewear',
    description: 'A mock catalogue item used to preview product presentation before inventory is added.',
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a6c7?auto=format&fit=crop&w=900&q=85',
  },
];

export function getMockPoshiesProducts(category?: ProductCategory): MockStorefrontProduct[] {
  return category
    ? mockPoshiesProducts.filter((product) => product.category === category)
    : mockPoshiesProducts;
}
