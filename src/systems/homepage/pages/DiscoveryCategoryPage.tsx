import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { MoodboardItem } from '../discover/KineticMoodboard';
import MoodboardSearchBar from '../discover/MoodboardSearchBar';
import MoodboardPredictiveSearch from '../discover/MoodboardPredictiveSearch';

const stores = [
  { key: 'yotaabo', name: 'Yotaabo', href: '/yotaabo/catalog', description: 'A considered collection of fragrance, fashion and spaces for everyday living.', note: 'Discover a lifestyle shaped by detail.' },
  { key: 'poshies', name: 'Poshies', href: '/poshies/catalog', description: 'Fashion, accessories and lifestyle pieces with a bold, expressive point of view.', note: 'Find pieces that feel like you.' },
];
const copy: Record<string, { title:string; eyebrow:string; description:string }> = {
  spaces: { title: 'Spaces that inspire.', eyebrow: 'INTERIORS · LIVING', description: 'Explore places and pieces that turn everyday spaces into something personal.' },
  style: { title: 'Make it your own.', eyebrow: 'STYLE · EXPRESSION', description: 'Discover independent style, fresh perspectives and pieces made to be lived in.' },
  fashion: { title: 'A point of view.', eyebrow: 'FASHION · FORM', description: 'Explore fashion that brings personality, confidence and individuality into focus.' },
  living: { title: 'Live thoughtfully.', eyebrow: 'LIVING · EVERYDAY', description: 'Find considered essentials and ideas for the spaces and moments that matter.' },
  objects: { title: 'Designed to matter.', eyebrow: 'OBJECTS · DESIGN', description: 'Discover objects with intention—useful, expressive and worth keeping close.' },
  culture: { title: 'Find your next feeling.', eyebrow: 'CULTURE · DISCOVERY', description: 'Follow ideas, places and experiences that open up a new perspective.' },
  ideas: { title: 'Ideas in motion.', eyebrow: 'IDEAS · CREATIVITY', description: 'Discover independent creative stores, original products, emerging brands and collections shaped by fresh perspectives. Browse inspiring finds, meet makers and businesses bringing ideas to life, and uncover something distinctive to take home or explore further across the Simatu network.' },
  workspaces: { title: 'Room to create.', eyebrow: 'WORK · CREATIVE SPACES', description: 'Explore spaces and inspiration for building, making and doing your best work.' },
  everyday: { title: 'Everyday, elevated.', eyebrow: 'ESSENTIALS · DAILY LIFE', description: 'Discover the small details and essentials that make everyday life feel considered.' },
  explore: { title: 'Go beyond familiar.', eyebrow: 'EXPLORE · DISCOVER', description: 'New interests, new finds and unexpected connections start here.' },
};
const fallback: MoodboardItem = { id: 'explore', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=90', alt: 'Open landscape', category: 'Explore', title: 'Find what moves you' };
type CategoryProduct = { id: string; name: string; category?: string; subcategory?: string; brand?: string; storeName: string; href: string; price?: number; image_url?: string | null };

const categoryTerms: Record<string, string[]> = { lifestyle: ['lifestyle','living','everyday','spaces','home','objects','wellness'], living: ['living','everyday','home','lifestyle','spaces','objects'], everyday: ['everyday','living','lifestyle','essentials','home'], spaces: ['spaces','interiors','home','living','decor','furniture'], style: ['style','fashion','accessories','clothing'], fashion: ['fashion','style','clothing','accessories'], objects: ['objects','design','home','living','decor'], culture: ['culture','art','music','books','experiences','heritage'], ideas: ['ideas','creative','design','art','innovation'], workspaces: ['workspaces','office','work','desk','creative'], explore: [] };
const panel: React.CSSProperties = { padding: 'clamp(26px,6vw,88px)', background: '#111', color: '#f4f1ec', fontFamily: 'inherit' };
export default function DiscoveryCategoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const location = useLocation();
  const { categoryId = '' } = useParams();
  const item = (location.state as { discovery?: MoodboardItem } | null)?.discovery || fallback;
  const contextTerms = categoryTerms[categoryId] || [categoryId.replace(/-/g, ' ')];
  const editorial = copy[categoryId] || { title: item.title + '.', eyebrow: item.category.toUpperCase() + ' · DISCOVERY', description: 'Explore curated businesses, products and ideas from across the Simatu network.' };
  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    Promise.all(stores.map(async (store) => {
      const response = await fetch('/api/products?storefront=' + encodeURIComponent(store.key), { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || ('Unable to load ' + store.name + ' products.'));
      return (Array.isArray(data.products) ? data.products : []).filter((product: any) => product && product.is_active !== false).map((product: any) => ({ ...product, storeName: store.name, href: store.href } as CategoryProduct));
    })).then((results) => { if (!cancelled) { setProducts(results.flat()); setProductsError(''); } })
      .catch((error) => { if (!cancelled) setProductsError(error instanceof Error ? error.message : 'Category search is unavailable.'); })
      .finally(() => { if (!cancelled) setProductsLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const scopedProducts = useMemo(() => products.filter((product) => {
    const taxonomy = (product.category + ' ' + (product.subcategory || '')).toLowerCase();
    return contextTerms.some((term) => taxonomy.includes(term));
  }), [products, contextTerms]);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingProducts = useMemo(() => { if (!normalizedQuery) return []; return scopedProducts.filter((product) => (product.name + ' ' + (product.category || '') + ' ' + (product.subcategory || '') + ' ' + (product.brand || '') + ' ' + product.storeName).toLowerCase().includes(normalizedQuery)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8); }, [normalizedQuery, scopedProducts]);
  const goBack = () => {
    try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ position: (location.state as any)?.position || null })); } catch {}
    navigate('/', { state: { revealMoodboard: true } });
  };
  return <main style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', overflowX: 'hidden' }}>
    <MoodboardSearchBar value={searchQuery} onChange={setSearchQuery} ariaLabel="Search brands, products or collections" onBack={goBack} backIcon="arrow" className="category-search-header" fixed />
    {normalizedQuery && <MoodboardPredictiveSearch query={searchQuery} loading={productsLoading} error={productsError} products={matchingProducts} className="category-search-results" ariaLabel={editorial.eyebrow + ' search suggestions'} />}
