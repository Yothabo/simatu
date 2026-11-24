import React, { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './DiscoveryCategoryPage.motion.css';
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(() => getSubcategories(categoryId)[0]?.id ?? null);
  const [outgoingStoreTitle, setOutgoingStoreTitle] = useState<string | null>(null);
  const market = getMarketById(categoryId);
  const item = (location.state as { discovery?: MoodboardItem } | null)?.discovery || market || fallback;
  const subcategories = getSubcategories(market?.id || categoryId);
  const selected = subcategories.find((sub) => sub.id === selectedSubcategory);

  useEffect(() => {
    setOutgoingStoreTitle(null);
    setSelectedSubcategory(subcategories[0]?.id ?? null);

    const visitedCategory = market?.category || item.category;
    if (visitedCategory) {
      try {
        const stored = localStorage.getItem('simatu-recent-discovery-categories');
        const previous = stored ? JSON.parse(stored) : [];
        const recent = Array.isArray(previous)
          ? previous.filter((value): value is string => typeof value === 'string' && value !== visitedCategory)
          : [];
        localStorage.setItem('simatu-recent-discovery-categories', JSON.stringify([visitedCategory, ...recent].slice(0, 8)));
      } catch {
        // Browsing the category should continue even when browser storage is unavailable.
      }
    }
  }, [categoryId]);

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

  return <main className="discovery-category-page" style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', overflowX: 'hidden' }}>
    <MoodboardSearchBar value={searchQuery} onChange={setSearchQuery} ariaLabel="Search businesses, products or services" onBack={goBack} backIcon="arrow" className="category-search-header" fixed />
    {normalizedQuery && <MoodboardPredictiveSearch query={searchQuery} loading={productsLoading} error={productsError} products={matchingProducts} className="category-search-results" ariaLabel={item.category + ' search suggestions'} />}
    <section className="discovery-hero" style={{ position: 'relative', minHeight: '42vh', display: 'flex', alignItems: 'flex-end', padding: 'clamp(24px,5vw,72px)', overflow: 'hidden' }}>
      <img className="discovery-hero-image" src={item.image} alt={item.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.objectPosition || 'center' }} />
      <div className="discovery-hero-overlay" aria-hidden="true" style={{ position: 'absolute', inset: '-1px 0 -3px', background: 'linear-gradient(0deg, #111 0%, rgba(17,17,17,.92) 14%, rgba(17,17,17,.38) 58%, rgba(17,17,17,0) 100%)' }} />
      <div className="discovery-hero-copy" style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
        <h1 style={{ fontSize: 'clamp(40px,8vw,96px)', lineHeight: .95, fontWeight: 500, margin: '18px 0' }}>{item.category}</h1>
        <p style={{ fontSize: 'clamp(14px,1.4vw,18px)', lineHeight: 1.65, maxWidth: 680, color: '#f4f1ec' }}>Explore products, services, independent businesses and things worth discovering.</p>
      </div>
    </section>
    <section className="discovery-category-content" style={panel}>
      <Swiper
        modules={[A11y, Keyboard, Navigation, Pagination]}
        slidesPerView={1.35}
        slidesPerGroup={1}
        spaceBetween={14}
        speed={520}
        threshold={6}
        resistanceRatio={0.85}
        roundLengths
        watchSlidesProgress
        breakpoints={{
          480: { slidesPerView: 2.15, spaceBetween: 16 },
          768: { slidesPerView: 3.15, spaceBetween: 20 },
          1100: { slidesPerView: 4.15, spaceBetween: 24 },
        }}
        navigation={subcategories.length > 2}
        pagination={subcategories.length > 1 ? { clickable: true } : false}
        keyboard={{ enabled: true, onlyInViewport: true }}
        grabCursor
        slideToClickedSlide
        watchOverflow
        loop={false}
        aria-label={item.category + ' interests'}
        style={{ paddingBottom: 34, overflow: 'visible', '--swiper-theme-color': '#f4f1ec' } as React.CSSProperties}
      >
        {subcategories.map((sub) => (
          <SwiperSlide key={sub.id}>
            <button
              type="button"
              onClick={() => {
                if (selectedSubcategory === sub.id) {
                  setOutgoingStoreTitle(selected?.title ?? null);
                  setSelectedSubcategory(null);
                  return;
                }
                setOutgoingStoreTitle(selected?.title ?? null);
                setSelectedSubcategory(sub.id);
              }}
              aria-pressed={selectedSubcategory === sub.id}
              className="discovery-subcategory-card" style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 5', padding: 0, textAlign: 'left', border: selectedSubcategory === sub.id ? '1px solid #fff' : '1px solid rgba(255,255,255,.14)', borderRadius: 8, background: '#222', color: '#fff', cursor: 'pointer', overflow: 'hidden' }}
            >
              <img className="discovery-subcategory-image" src={sub.image} alt={sub.alt} loading="lazy" decoding="async" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedSubcategory === sub.id ? 'brightness(.72)' : 'brightness(.58)', transition: 'filter .25s' }} />
              <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.8),rgba(0,0,0,.02) 76%)' }} />
              <span style={{ position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 1 }}>
                <strong style={{ display: 'block', fontSize: 18, fontWeight: 500 }}>{sub.title}</strong>
                {selectedSubcategory === sub.id && <span className="discovery-subcategory-description" style={{ display: 'block', marginTop: 7, fontSize: 13, lineHeight: 1.45, fontWeight: 400, color: 'rgba(255,255,255,.82)' }}>{sub.description}</span>}
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {selected && <div className="discovery-results">
        <div className="discovery-store-stage" style={{ position: 'relative', marginTop: 12 }}>
          {outgoingStoreTitle && <div
            className="discovery-store-exit"
            aria-hidden="true"
            onAnimationEnd={() => setOutgoingStoreTitle(null)}
            style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 16, pointerEvents: 'none' }}
          >
            {stores.map((store) => <div className={`discovery-store-card discovery-store-card--${store.key}`} key={store.key} style={{ color: '#f4f1ec', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, padding: '14px 15px', background: 'rgba(255,255,255,.035)' }}>
              <strong style={{ fontSize: 15, fontWeight: 550, letterSpacing: '.015em' }}>{store.name}</strong>
              <span style={{ display: 'block', opacity: .62, fontSize: 12, marginTop: 5 }}>Explore {outgoingStoreTitle} listings</span>
            </div>)}
          </div>}
          <div key={selectedSubcategory} className="discovery-store-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 16 }}>
            {stores.map((store, index) => <a className={`discovery-store-card discovery-store-card--${store.key}`} key={store.key} href={store.href} style={{ animationDelay: `${index * 70}ms`, color: '#f4f1ec', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, padding: '14px 15px', textDecoration: 'none', background: 'rgba(255,255,255,.035)' }}>
              <span className="discovery-store-card-top">
                <strong style={{ fontSize: 15, fontWeight: 550, letterSpacing: '.015em' }}>{store.name}</strong>
                <span className="discovery-store-arrow" aria-hidden="true">↗</span>
              </span>
              <span style={{ display: 'block', opacity: .62, fontSize: 12, marginTop: 5 }}>Explore {selected.title} listings</span>
            </a>)}
          </div>
        </div>

        {productsLoading && <p>Loading discoveries…</p>}
        {productsError && <p role="alert">{productsError}</p>}
        {scopedProducts.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap: 16, marginTop: 20 }}>
          {scopedProducts.map((product, index) => <a className="discovery-product-card" key={product.id} href={product.href} style={{ animationDelay: `${Math.min(index, 8) * 45}ms`, color: '#f4f1ec', textDecoration: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, overflow: 'hidden' }}>
            {product.image_url && <img src={product.image_url} alt={product.name} loading="lazy" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />}
            <span style={{ display: 'block', padding: 14 }}>
              <strong>{product.name}</strong>
              <small style={{ display: 'block', opacity: .65, marginTop: 5 }}>{product.storeName}{product.subcategory ? ' · ' + product.subcategory : ''}</small>
              {typeof product.price === 'number' && <span style={{ display: 'block', marginTop: 8 }}>R{product.price.toLocaleString('en-ZA')}</span>}
            </span>
          </a>)}
        </div>}
      </div>}
    </section>
  </main>;
}
