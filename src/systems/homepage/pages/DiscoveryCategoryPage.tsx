import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { MoodboardItem } from '../discover/KineticMoodboard';
import MoodboardSearchBar from '../discover/MoodboardSearchBar';

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
  const matchingProducts = useMemo(() => normalizedQuery ? scopedProducts.filter((product) => (product.name + ' ' + (product.category || '') + ' ' + (product.subcategory || '') + ' ' + (product.brand || '') + ' ' + product.storeName).toLowerCase().includes(normalizedQuery)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8) : [], [normalizedQuery, scopedProducts]);
  const goBack = () => {
    try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ position: (location.state as any)?.position || null })); } catch {}
    navigate('/', { state: { revealMoodboard: true } });
  };
  return <main style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', overflowX: 'hidden' }}>
    <MoodboardSearchBar value={searchQuery} onChange={setSearchQuery} ariaLabel="Search brands, products or collections" onBack={goBack} backIcon="arrow" className="category-search-header" fixed />
    {normalizedQuery && <section aria-label={editorial.eyebrow + ' search results'} style={{ position: 'relative', zIndex: 5, padding: '18px clamp(18px,5vw,64px)', background: '#111', color: '#f4f1ec', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
      <div style={{ font: '600 10px/1.4 system-ui', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 14 }}>{categoryId.replace(/-/g, ' ')} · search</div>
      {productsLoading && <p style={{ color: 'rgba(255,255,255,.65)', font: '13px system-ui' }}>Searching this category…</p>}
      {productsError && <p role="status" style={{ color: 'rgba(255,255,255,.65)', font: '13px system-ui' }}>{productsError}</p>}
      {!productsLoading && !productsError && matchingProducts.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: 10 }}>{matchingProducts.map(product => <a key={product.id} href={product.href + '?search=' + encodeURIComponent(searchQuery)} style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 15, border: '1px solid rgba(255,255,255,.13)', background: 'rgba(255,255,255,.04)', color: 'inherit', textDecoration: 'none' }}><strong style={{ font: '500 15px/1.3 system-ui' }}>{product.name}</strong><span style={{ font: '12px system-ui', color: 'rgba(255,255,255,.58)' }}>{product.brand || product.storeName} · {product.category}{product.subcategory ? ' / ' + product.subcategory : ''}</span></a>)}</div>}
      {!productsLoading && !productsError && matchingProducts.length === 0 && <p style={{ color: 'rgba(255,255,255,.65)', font: '13px/1.6 system-ui' }}>No matches in {categoryId.replace(/-/g, ' ')}. Try a different search within this category.</p>}
    </section>}
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'min(88svh,920px)', display: 'flex', alignItems: 'flex-end', padding: 'clamp(28px,7vw,100px)', paddingBottom: 'clamp(100px,12vh,160px)', boxSizing: 'border-box', background: '#111' }}>
      <img src={item.image} alt={item.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.objectPosition || 'center', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.28)),linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.62) 34%,rgba(0,0,0,.24) 68%,rgba(0,0,0,0) 100%),linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.12) 24%,rgba(0,0,0,0) 52%)' }} />
      <div style={{ position: 'relative', zIndex: 2, width: 'min(100%,920px)', paddingTop: 90 }}>
        <div style={{ font: '600 10px/1.4 system-ui', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}>{editorial.eyebrow}</div>
        <h1 style={{ margin: '18px 0 16px', font: '400 clamp(48px,10vw,132px)/.92 system-ui', letterSpacing: '-.07em' }}>{editorial.title}</h1>
        <p style={{ maxWidth: 560, color: 'rgba(255,255,255,.82)', font: '400 clamp(15px,1.7vw,18px)/1.65 system-ui' }}>{editorial.description}</p>
      </div>
    </section>
    <section style={panel}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 18 }}>
        {stores.map(store => <a key={store.key} href={store.href} style={{ minHeight: 310, display: 'flex', flexDirection: 'column', padding: 'clamp(24px,4vw,48px)', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,.13)', background: 'linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))', color: 'inherit', textDecoration: 'none' }}>
          <span style={{ font: '500 clamp(26px,4vw,42px)/1 system-ui', letterSpacing: '-.05em' }}>{store.name}</span><h3 style={{ font: '400 clamp(26px,3vw,40px)/1.05 system-ui', letterSpacing: '-.04em', margin: 'auto 0 14px', paddingTop: 48 }}>{store.note}</h3><p style={{ margin: 0, maxWidth: 460, color: 'rgba(255,255,255,.68)', font: '14px/1.65 system-ui' }}>{store.description}</p><span style={{ marginTop: 24, font: '600 11px/1 system-ui', letterSpacing: '.14em', textTransform: 'uppercase' }}>Explore storefront ↗</span>
        </a>)}
      </div>
    </section>
  </main>;
}
