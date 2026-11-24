import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { MoodboardItem } from '../discover/KineticMoodboard';
import MoodboardSearchBar from '../discover/MoodboardSearchBar';
import MoodboardPredictiveSearch from '../discover/MoodboardPredictiveSearch';
import { DISCOVERY_MARKETS, getMarketById, getSubcategories } from '../discover/discovery-taxonomy';

const stores = [
  { key: 'yotaabo', name: 'Yotaabo', href: '/yotaabo/catalog', note: 'Explore products from Yotaabo' },
  { key: 'poshies', name: 'Poshies', href: '/poshies/catalog', note: 'Explore products from Poshies' },
];
const fallback: MoodboardItem = DISCOVERY_MARKETS[0];
type CategoryProduct = { id: string; name: string; category?: string; subcategory?: string; brand?: string; storeName: string; href: string; price?: number; image_url?: string | null };
const panel: React.CSSProperties = { padding: 'clamp(24px,5vw,72px)', background: '#111', color: '#f4f1ec', fontFamily: 'inherit' };

export default function DiscoveryCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId = '' } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const market = getMarketById(categoryId);
  const item = (location.state as { discovery?: MoodboardItem } | null)?.discovery || market || fallback;
  const subcategories = getSubcategories(market?.id || categoryId);
  const selected = subcategories.find((sub) => sub.id === selectedSubcategory);

  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    Promise.all(stores.map(async (store) => {
      const response = await fetch('/api/products?storefront=' + encodeURIComponent(store.key), { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || ('Unable to load ' + store.name + ' products.'));
      return (Array.isArray(data.products) ? data.products : []).filter((product: any) => product && product.is_active !== false).map((product: any) => ({ ...product, storeName: store.name, href: store.href } as CategoryProduct));
    })).then((results) => { if (!cancelled) { setProducts(results.flat()); setProductsError(''); } })
      .catch((error) => { if (!cancelled) setProductsError(error instanceof Error ? error.message : 'Discovery is unavailable.'); })
      .finally(() => { if (!cancelled) setProductsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const marketProducts = useMemo(() => products.filter((product) => {
    const text = (product.category || '') + ' ' + (product.subcategory || '');
    return (market?.category || categoryId).toLowerCase().split(/\\s+/).some((term) => term && text.toLowerCase().includes(term));
  }), [products, market, categoryId]);

  const scopedProducts = useMemo(() => {
    if (!selected) return marketProducts;
    return marketProducts.filter((product) => {
      const searchable = [product.name, product.category, product.subcategory, product.brand].filter(Boolean).join(' ').toLowerCase();
      return selected.terms.some((term) => searchable.includes(term.toLowerCase()));
    });
  }, [marketProducts, selected]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingProducts = useMemo(() => {
    if (!normalizedQuery) return [];
    return scopedProducts.filter((product) => [product.name, product.category, product.subcategory, product.brand, product.storeName].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery))
      .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);
  }, [normalizedQuery, scopedProducts]);

  const goBack = () => {
    try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ position: (location.state as any)?.position || null })); } catch {}
    navigate('/', { state: { revealMoodboard: true } });
  };

  return <main style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', overflowX: 'hidden' }}>
    <MoodboardSearchBar value={searchQuery} onChange={setSearchQuery} ariaLabel="Search businesses, products or services" onBack={goBack} backIcon="arrow" className="category-search-header" fixed />
    {normalizedQuery && <MoodboardPredictiveSearch query={searchQuery} loading={productsLoading} error={productsError} products={matchingProducts} className="category-search-results" ariaLabel={item.category + ' search suggestions'} />}
    <section style={{ position: 'relative', minHeight: '42vh', display: 'flex', alignItems: 'flex-end', padding: 'clamp(24px,5vw,72px)', overflow: 'hidden' }}>
      <img src={item.image} alt={item.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.objectPosition || 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.12))' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
        <p style={{ letterSpacing: '.18em', fontSize: 12, textTransform: 'uppercase', opacity: .75 }}>DISCOVERY · {item.category.toUpperCase()}</p>
        <h1 style={{ fontSize: 'clamp(40px,8vw,96px)', lineHeight: .95, fontWeight: 500, margin: '18px 0' }}>{item.category}</h1>
        <p style={{ fontSize: 'clamp(14px,1.4vw,18px)', lineHeight: 1.65, maxWidth: 680, color: '#f4f1ec' }}>Explore products, services, independent businesses and things worth discovering.</p>
      </div>
    </section>
    <section style={panel}>
      <h2 style={{ fontSize: 30, fontWeight: 500, margin: 0 }}>Explore {item.category}</h2>
      <p style={{ color: 'rgba(244,241,236,.66)', marginTop: 10 }}>Choose an interest to narrow your discovery.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap: 16, marginTop: 24 }}>
        {subcategories.map((sub) => <button key={sub.id} type="button" onClick={() => setSelectedSubcategory((current) => current === sub.id ? null : sub.id)} aria-pressed={selectedSubcategory === sub.id} style={{ position: 'relative', overflow: 'hidden', minHeight: 220, padding: 0, textAlign: 'left', border: selectedSubcategory === sub.id ? '1px solid #fff' : '1px solid rgba(255,255,255,.14)', borderRadius: 8, background: '#222', color: '#fff', cursor: 'pointer' }}>
          <img src={sub.image} alt={sub.alt} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedSubcategory === sub.id ? 'brightness(.68)' : 'brightness(.55)', transition: 'filter .25s' }} />
          <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.8),rgba(0,0,0,.04) 75%)' }} />
          <span style={{ position: 'absolute', left: 18, right: 18, bottom: 18, zIndex: 1 }}>
            <strong style={{ display: 'block', fontSize: 19, fontWeight: 500 }}>{sub.title}</strong>
            <small style={{ display: 'block', marginTop: 7, lineHeight: 1.5, color: 'rgba(255,255,255,.78)' }}>{sub.description}</small>
          </span>
        </button>)}
      </div>
      {selected && <div style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 500 }}>{selected.title}</h2>
        <p style={{ color: 'rgba(244,241,236,.65)' }}>Discover matching listings and businesses.</p>
        {productsLoading && <p>Loading discoveries…</p>}
        {!productsLoading && !scopedProducts.length && <p>No matching network listings yet. This category remains discoverable as merchants join Simatu.</p>}
        {productsError && <p role="alert">{productsError}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap: 16, marginTop: 20 }}>
          {scopedProducts.map((product) => <a key={product.id} href={product.href} style={{ color: '#f4f1ec', textDecoration: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, overflow: 'hidden' }}>
            {product.image_url && <img src={product.image_url} alt={product.name} loading="lazy" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />}
            <span style={{ display: 'block', padding: 14 }}>
              <strong>{product.name}</strong>
              <small style={{ display: 'block', opacity: .65, marginTop: 5 }}>{product.storeName}{product.subcategory ? ' · ' + product.subcategory : ''}</small>
              {typeof product.price === 'number' && <span style={{ display: 'block', marginTop: 8 }}>R{product.price.toLocaleString('en-ZA')}</span>}
            </span>
          </a>)}
        </div>
      </div>}
      {!selected && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
        {stores.map(store => <a key={store.key} href={store.href} style={{ color: '#f4f1ec', border: '1px solid rgba(255,255,255,.18)', borderRadius: 12, padding: '16px 22px', textDecoration: 'none' }}>{store.name}<span style={{ display: 'block', opacity: .65, fontSize: 13, marginTop: 6 }}>{store.note}</span></a>)}
      </div>}
    </section>
  </main>;
}
