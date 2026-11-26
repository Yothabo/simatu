<button type="button" onClick={() => { if (!validSelection) { toast.error(marketplaceVariants.length || hasSizes ? 'Choose a quantity for at least one option' : 'Choose a quantity'); return; } addProductToCart(offer); setSelectedProductGroup(null); }} disabled={!validSelection} style={{ minHeight: 46, padding: '0 20px', border: 0, borderRadius: 999, background: validSelection ? '#f4f1ec' : 'rgba(244,241,236,.18)', color: validSelection ? '#111' : 'rgba(244,241,ec,.42)', font: 'inherit', fontSize: 12, fontWeight: 700, cursor: validSelection ? 'pointer' : 'not-allowed' }}>Add to cart</button>import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useGlobalCart } from '../../../shared/cart/CartContext';
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

const fallback: MoodboardItem = DISCOVERY_MARKETS[0];
type CategoryProduct = { id: string; name: string; storefront: string; productSource?: 'store' | 'marketplace'; variants?: Array<{ id: string; sku: string; name?: string; price: number; options?: Record<string, unknown> }>; attributes?: Array<{ label: string; data_type: string; unit?: string | null; value: unknown }>; marketplace_subcategory_id?: string | null; sku?: string | null; sizes?: string[]; category?: string; subcategory?: string; brand?: string; description?: string | null; storeName: string; href: string; price?: number; image_url?: string | null };
const panel: React.CSSProperties = { padding: 'clamp(24px,5vw,72px)', background: '#111', color: '#f4f1ec', fontFamily: 'inherit' };

export default function DiscoveryCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId = '' } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageContinueClicked, setAgeContinueClicked] = useState(false);
  const { addToCart } = useGlobalCart();
  const [savedDiscoveries, setSavedDiscoveries] = useState<MoodboardItem[]>(() => {
    try {
      const stored = localStorage.getItem('simatu-saved-discoveries');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed as MoodboardItem[] : [];
    } catch { return []; }
  });
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [marketplaceSubcategories, setMarketplaceSubcategories] = useState<Array<{ id: string; slug: string; category_slug: string }>>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(() => getSubcategories(categoryId)[0]?.id ?? null);
  const [outgoingStoreTitle, setOutgoingStoreTitle] = useState<string | null>(null);
  const [selectedProductGroup, setSelectedProductGroup] = useState<{ id: string; name: string; image_url: string | null; offers: CategoryProduct[] } | null>(null);
  const [purchaseSelections, setPurchaseSelections] = useState<Record<string, { quantity: number; sizeQuantities: Record<string, number> }>>({});
  const market = getMarketById(categoryId);
  const marketplaceCategorySlug = categoryId === 'spaces' ? 'home-living' : categoryId;
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
    fetch('/api/marketplace-subcategories', { headers: { Accept: 'application/json' } })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Taxonomy unavailable'); return Array.isArray(data.subcategories) ? data.subcategories : []; })
      .then((data) => { if (!cancelled) setMarketplaceSubcategories(data); })
      .catch((error) => { if (!cancelled) console.warn('[Discovery] Platform taxonomy lookup unavailable', error); });
    return () => { cancelled = true; };
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    Promise.all([
      fetch('/api/products?scope=marketplace', { headers: { Accept: 'application/json' } }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load store marketplace products.');
        return Array.isArray(data.products) ? data.products : [];
      }),
      fetch('/api/marketplace-products', { headers: { Accept: 'application/json' } }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load Simatu catalogue products.');
        return Array.isArray(data.products) ? data.products : [];
      }),
    ])
      .then(([storeProducts, independentProducts]) => {
        if (cancelled) return;
        const mappedStoreProducts = storeProducts
          .filter((product: any) => product && product.is_active !== false && typeof product.storefront === 'string')
          .map((product: any) => ({
            ...product,
            productSource: 'store',
            price: Number(product.price),
            storeName: product.storefront === 'poshies' ? 'Poshies' : product.storefront === 'yotaabo' ? 'Yotaabo' : product.storefront,
            href: '/' + product.storefront + '/catalog',
          } as CategoryProduct));
        const mappedIndependentProducts = independentProducts
          .filter((product: any) => product && product.is_active !== false && product.marketplace_visible === true && typeof product.id === 'string')
          .map((product: any) => ({
            ...product,
            productSource: 'marketplace',
            storefront: 'marketplace',
            category: product.category_name,
            subcategory: product.subcategory_name,
            marketplace_subcategory_id: product.marketplace_subcategory_id,
            price: Number(product.price),
            storeName: 'Simatu Marketplace',
            href: '/discover',
            sizes: [],
          } as CategoryProduct));
        setProducts([...mappedStoreProducts, ...mappedIndependentProducts]);
        setProductsError('');
      })
      .catch((error) => { if (!cancelled) setProductsError(error instanceof Error ? error.message : 'Discovery is unavailable.'); })
      .finally(() => { if (!cancelled) setProductsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Marketplace products are sourced from the public product API and classified by
  // their marketplace subcategory. Store participation cards are supplementary and
  // must not gate product visibility.
  const marketProducts = useMemo(() => products, [products]);

  const selectedMarketplaceSubcategoryId = useMemo(() => {
    if (!selected) return null;
    return marketplaceSubcategories.find((subcategory) => subcategory.category_slug === marketplaceCategorySlug && subcategory.slug === selected.id)?.id ?? null;
  }, [selected, marketplaceSubcategories, marketplaceCategorySlug]);


  const scopedProducts = useMemo(() => {
    if (!selected) return marketProducts;
    if (!selectedMarketplaceSubcategoryId) return [];
    return marketProducts.filter((product) => product.marketplace_subcategory_id === selectedMarketplaceSubcategoryId);
  }, [marketProducts, selected, selectedMarketplaceSubcategoryId]);

  const offerSelectionKey = (product: CategoryProduct) => product.storefront + ':' + product.id;

  const openProductGroup = (group: { id: string; name: string; image_url: string | null; offers: CategoryProduct[] }) => {
    setPurchaseSelections((current) => {
      const next = { ...current };
      group.offers.forEach((offer) => {
        const key = offerSelectionKey(offer);
        if (!next[key]) next[key] = { quantity: offer.productSource === 'marketplace' ? 0 : 1, sizeQuantities: {} };
      });
      return next;
    });
    setSelectedProductGroup(group);
  };

  const addProductToCart = (product: CategoryProduct) => {
    if (product.productSource === 'marketplace') {
      const selection = purchaseSelections[offerSelectionKey(product)] || { quantity: 0, sizeQuantities: {} };
      const variants = product.variants || [];
      if (variants.length) {
        const chosen = variants.filter((variant) => (selection.sizeQuantities[variant.id] || 0) > 0);
        if (!chosen.length) { toast.error('Select a quantity for at least one variant'); return; }
        chosen.forEach((variant) => addToCart({
          id: product.id, variantId: variant.id, variantName: variant.name || Object.values(variant.options || {}).join(' · '),
          variantOptions: variant.options || null, name: product.name + (variant.name ? ' · ' + variant.name : ''),
          price: 'R ' + variant.price.toFixed(2), placeholderColor: 'bg-[var(--sf-surface-soft)]', image_url: product.image_url ?? null,
          description: product.description ?? null, category: product.category || item.category, storefront: 'marketplace', storeName: 'Simatu Marketplace', size: null,
          quantity: selection.sizeQuantities[variant.id],
        }));
        toast.success('Selected variants added to your cart');
        return;
      }
      if (typeof product.price !== 'number' || selection.quantity < 1) { toast.error('Choose a quantity'); return; }
      addToCart({ id:product.id,name:product.name,price:'R '+product.price.toFixed(2),placeholderColor:'bg-[var(--sf-surface-soft)]',image_url:product.image_url??null,description:product.description??null,category:product.category||item.category,storefront:'marketplace',storeName:'Simatu Marketplace',size:null,quantity:selection.quantity });
      toast.success(selection.quantity+' × '+product.name+' added to cart');
      return;
    }
    if (!product.storefront || typeof product.price !== 'number') return;
    const selection = purchaseSelections[offerSelectionKey(product)] || { quantity: 1, sizeQuantities: {} };
    const hasSizes = (product.sizes?.length || 0) > 0;
    const allocations = hasSizes
      ? Object.entries(selection.sizeQuantities).filter(([, quantity]) => quantity > 0)
      : [[ '', selection.quantity ] as [string, number]];

    if (hasSizes && allocations.length === 0) {
      toast.error('Choose a quantity for at least one size');
      return;
    }

    allocations.forEach(([size, quantity]) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: 'R ' + product.price!.toFixed(2),
        placeholderColor: 'bg-[#f1f1ee]',
        image_url: product.image_url ?? null,
        description: product.description ?? null,
        category: product.category || item.category,
        storefront: product.storefront,
        storeName: product.storeName,
        size: size || null,
        quantity,
      });
    });

    const allocatedQuantity = allocations.reduce((sum, [, quantity]) => sum + quantity, 0);
    toast.success(allocatedQuantity + ' × ' + product.name + ' added to your shared cart');
  };

  const marketplaceGroups = useMemo(() => scopedProducts.map((product) => ({
    id: product.storefront + ':' + product.id,
    name: product.name,
    image_url: product.image_url || null,
    offers: [product],
  })), [scopedProducts]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingProducts = useMemo(() => {
    if (!normalizedQuery) return [];
    return scopedProducts.filter((product) => [product.name, product.category, product.subcategory, product.brand, product.storeName].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery))
      .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);
  }, [normalizedQuery, scopedProducts]);

  useEffect(() => {
    if (!selectedProductGroup) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProductGroup(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProductGroup]);

  const isSaved = savedDiscoveries.some((saved) => saved.id === item.id);

  const toggleSavedDiscovery = () => {
    setSavedDiscoveries((current) => {
      const next = current.some((saved) => saved.id === item.id)
        ? current.filter((saved) => saved.id !== item.id)
        : [item, ...current];
      try { localStorage.setItem('simatu-saved-discoveries', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const shareDiscovery = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: item.title, text: 'Discover ' + item.title + ' on Simatu', url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt('Copy this discovery link:', url);
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        try { window.prompt('Copy this discovery link:', url); } catch {}
      }
    }
  };

  const goBack = () => {
    try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ position: (location.state as any)?.position || null })); } catch {}
    navigate('/', { state: { revealMoodboard: true } });
  };

  if (categoryId === 'age-restricted') {
    return <main className="discovery-category-page" style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', padding: 'clamp(24px,5vw,72px)', display: 'grid', placeItems: 'center' }}>
      <section style={{ maxWidth: 560, width: '100%', border: '1px solid rgba(255,255,255,.16)', borderRadius: 12, padding: 'clamp(24px,5vw,48px)' }}>
        <p style={{ letterSpacing: '.14em', textTransform: 'uppercase', opacity: .65, fontSize: 12 }}>Simatu · Restricted destination</p>
        <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', lineHeight: 1.05, margin: '18px 0' }}>Age-Restricted</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, opacity: .78 }}>This destination is intended for adults aged 18 and over. Restricted listings will be kept separate from general marketplace categories and discovery.</p>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '24px 0', fontSize: 14, lineHeight: 1.5 }}>
          <input type="checkbox" checked={ageConfirmed} onChange={(event) => { setAgeConfirmed(event.target.checked); setAgeContinueClicked(false); }} style={{ marginTop: 4 }} />
          I confirm that I am 18 years of age or older.
        </label>
        <button type="button" disabled={!ageConfirmed} onClick={() => setAgeContinueClicked(true)} style={{ width: '100%', minHeight: 48, border: 0, borderRadius: 999, background: ageConfirmed ? '#f4f1ec' : '#555', color: '#111', fontWeight: 650, cursor: ageConfirmed ? 'pointer' : 'not-allowed' }}>Continue</button>
        <p role="status" style={{ fontSize: 13, lineHeight: 1.5, opacity: .65, marginTop: 18 }}>{ageContinueClicked ? 'Age confirmation noted for this screen. Restricted listings remain unavailable until secure age verification and backend access controls are implemented.' : ageConfirmed ? 'Select Continue to proceed.' : 'Age confirmation is required to continue.'}</p>
        <button type="button" onClick={() => navigate('/discover')} style={{ marginTop: 8, background: 'transparent', color: '#f4f1ec', border: '1px solid rgba(255,255,255,.25)', borderRadius: 999, padding: '10px 16px', cursor: 'pointer' }}>Return to discovery</button>
      </section>
    </main>;
  }

  return <main className="discovery-category-page" style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', overflowX: 'hidden' }}>
    <MoodboardSearchBar value={searchQuery} onChange={setSearchQuery} ariaLabel="Search businesses, products or services" onBack={goBack} backIcon="arrow" className="category-search-header" fixed />
    {normalizedQuery && <MoodboardPredictiveSearch query={searchQuery} loading={productsLoading} error={productsError} products={matchingProducts} className="category-search-results" ariaLabel={item.category + ' search suggestions'} />}
    <section className="discovery-hero" style={{ position: 'relative', minHeight: '42vh', display: 'flex', alignItems: 'flex-end', padding: 'clamp(24px,5vw,72px)', overflow: 'hidden' }}>
      <img className="discovery-hero-image" src={item.image} alt={item.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.objectPosition || 'center' }} />
      <div className="discovery-hero-overlay" aria-hidden="true" style={{ position: 'absolute', inset: '-1px 0 -3px', background: 'linear-gradient(0deg, #111 0%, rgba(17,17,17,.92) 14%, rgba(17,17,17,.38) 58%, rgba(17,17,17,0) 100%)' }} />
      <div className="discovery-hero-copy" style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
        <h1 style={{ fontSize: 'clamp(40px,8vw,96px)', lineHeight: .95, fontWeight: 500, margin: '18px 0' }}>{item.category}</h1>
        <p style={{ fontSize: 'clamp(14px,1.4vw,18px)', lineHeight: 1.65, maxWidth: 680, color: '#f4f1ec' }}>Explore products, services, independent businesses and things worth discovering.</p>
        <div className="discovery-category-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
          <button type="button" onClick={toggleSavedDiscovery} aria-pressed={isSaved} aria-label={isSaved ? 'Remove from Saved Discoveries' : 'Save to Saved Discoveries'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 42, padding: '0 16px', border: '1px solid rgba(255,255,255,.42)', borderRadius: 999, background: isSaved ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.18)', color: '#fff', font: 'inherit', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(12px)' }}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 4.75h11a1 1 0 0 1 1 1v14l-6.5-3.9-6.5 3.9v-14a1 1 0 0 1 1-1Z"/></svg>
            {isSaved ? 'Saved' : 'Save discovery'}
          </button>
          <button type="button" onClick={() => { void shareDiscovery(); }} aria-label="Share this discovery" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 42, padding: '0 16px', border: '1px solid rgba(255,255,255,.42)', borderRadius: 999, background: 'rgba(0,0,0,.18)', color: '#fff', font: 'inherit', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(12px)' }}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></svg>
            Share discovery
          </button>
        </div>
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
        {productsLoading && <p>Loading discoveries…</p>}
        {productsError && <p role="alert">{productsError}</p>}
        {marketplaceGroups.length > 0 && <div className="discovery-product-grid" style={{ display: 'grid', gap: 12, marginTop: 20 }}>
          {marketplaceGroups.map((group, index) => {
            const lowestOffer = group.offers[0];
            return <article
              className="discovery-product-card"
              key={group.id}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${group.name}`}
              onClick={() => openProductGroup(group)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openProductGroup(group);
                }
              }}
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms`, minWidth: 0, color: '#f4f1ec', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#222', overflow: 'hidden' }}>
                {group.image_url && <img src={group.image_url} alt={group.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.84) 0%,rgba(0,0,0,.22) 36%,transparent 72%)' }} />
                <strong style={{ position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 1, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, fontSize: 14, lineHeight: 1.25, fontWeight: 550, textShadow: '0 1px 8px rgba(0,0,0,.45)' }}>{group.name}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 8, minHeight: 92, padding: '10px 11px 11px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 7, alignContent: 'end', fontSize: 11 }}>
                  <span style={{ opacity: .58 }}>From</span>
                  <strong style={{ fontSize: 14, whiteSpace: 'nowrap' }}>{lowestOffer && typeof lowestOffer.price === 'number' ? 'R' + lowestOffer.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Price unavailable'}</strong>
                </div>
                <button type="button" onClick={(event) => { event.stopPropagation(); openProductGroup(group); }} disabled={!lowestOffer} style={{ minHeight: 36, width: '100%', marginTop: 'auto', padding: '0 10px', border: '1px solid rgba(255,255,255,.55)', borderRadius: 999, background: '#f4f1ec', color: '#111', font: 'inherit', fontSize: 11, fontWeight: 650, cursor: 'pointer' }}>
                  Choose options
                </button>
              </div>
            </article>;
          })}
        </div>}
        {!productsLoading && !productsError && marketplaceGroups.length === 0 && <p style={{ marginTop: 24, color: 'rgba(244,241,236,.62)' }}>No marketplace products are listed in this category yet.</p>}
      </div>}
    </section>
      {selectedProductGroup && <div
        role="presentation"
        onClick={() => setSelectedProductGroup(null)}
        style={{ position: 'fixed', inset: 0, zIndex: 2147483000, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.76)', backdropFilter: 'blur(12px)' }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="marketplace-product-modal-title"
          onClick={(event) => event.stopPropagation()}
          style={{ position: 'relative', isolation: 'isolate', width: '100%', maxWidth: 720, maxHeight: 'min(92dvh,820px)', overflowY: 'auto', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, background: '#111', color: '#f4f1ec', boxShadow: '0 32px 120px rgba(0,0,0,.8)' }}
        >
          <button type="button" onClick={() => setSelectedProductGroup(null)} aria-label="Close product details" style={{ position: 'absolute', zIndex: 5, top: 14, right: 14, width: 38, height: 38, border: '1px solid rgba(255,255,255,.35)', borderRadius: '50%', background: 'rgba(17,17,17,.88)', color: '#fff', fontSize: 22, cursor: 'pointer' }}>×</button>
          <div className="marketplace-product-modal-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, .9fr) minmax(0, 1.1fr)' }}>
            <div className="marketplace-product-modal-image" style={{ position: 'relative', minHeight: 320, background: '#222', overflow: 'hidden' }}>
              {selectedProductGroup.image_url
                ? <img src={selectedProductGroup.image_url} alt={selectedProductGroup.name} style={{ display: 'block', width: '100%', height: '100%', minHeight: 320, maxHeight: 520, objectFit: 'cover' }} />
                : <div style={{ minHeight: 320, display: 'grid', placeItems: 'center', color: 'rgba(244,241,236,.35)', fontSize: 12 }}>Image unavailable</div>}
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.88) 0%,rgba(0,0,0,.28) 34%,transparent 72%)' }} />
              <h2 id="marketplace-product-modal-title" style={{ position: 'absolute', left: 22, right: 22, bottom: 22, zIndex: 1, margin: 0, fontSize: 'clamp(24px,4vw,36px)', lineHeight: 1.08, fontWeight: 550 }}>{selectedProductGroup.name}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: 'clamp(20px,4vw,30px)' }}>
              {selectedProductGroup.offers[0]?.description && <p style={{ margin: '0 0 18px', fontSize: 13, lineHeight: 1.65, opacity: .76 }}>{selectedProductGroup.offers[0].description}</p>}
              {selectedProductGroup.offers[0]?.productSource === 'marketplace' && (selectedProductGroup.offers[0]?.attributes?.length || selectedProductGroup.offers[0]?.variants?.length) > 0 && <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
                {selectedProductGroup.offers[0]?.attributes?.length ? <div><h3 style={{ margin: '0 0 8px', fontSize: 12, opacity: .65, textTransform: 'uppercase', letterSpacing: '.08em' }}>Product details</h3><dl style={{ display: 'grid', gap: 7, margin: 0 }}>{selectedProductGroup.offers[0].attributes.map((attribute, index) => <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12 }}><dt style={{ opacity: .7 }}>{attribute.label}</dt><dd style={{ margin: 0, textAlign: 'right' }}>{String(attribute.value)}{attribute.unit ? ' ' + attribute.unit : ''}</dd></div>)}</dl></div> : null}
                {selectedProductGroup.offers[0]?.variants?.length ? <div><h3 style={{ margin: '0 0 8px', fontSize: 12, opacity: .65, textTransform: 'uppercase', letterSpacing: '.08em' }}>Available variants</h3><div style={{ display: 'grid', gap: 6 }}>{selectedProductGroup.offers[0].variants.map((variant) => <div key={variant.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12 }}><span>{variant.name || Object.values(variant.options || {}).join(' · ') || variant.sku}</span><span>R{Number(variant.price).toFixed(2)}</span></div>)}</div></div> : null}
              </div>}
              {selectedProductGroup.offers[0]?.brand && <p style={{ margin: '0 0 18px', fontSize: 12, opacity: .62 }}>{selectedProductGroup.offers[0].brand}</p>}
              {selectedProductGroup.offers.map((offer) => {
                const selection = purchaseSelections[offerSelectionKey(offer)] || { quantity: 1, sizeQuantities: {} };
                const hasSizes = (offer.sizes?.length || 0) > 0;
                const hasAllocatedSizeQuantity = Object.values(selection.sizeQuantities).some((quantity) => quantity > 0);
                const marketplaceVariants = offer.productSource === 'marketplace' ? (offer.variants || []) : [];
                const hasMarketplaceVariantQty = marketplaceVariants.some((variant) => (selection.sizeQuantities[variant.id] || 0) > 0);
                const validSelection = typeof offer.price === 'number' && (marketplaceVariants.length ? hasMarketplaceVariantQty : (!hasSizes || hasAllocatedSizeQuantity)) && (offer.productSource !== 'marketplace' || marketplaceVariants.length > 0 || selection.quantity > 0);
                const updateQuantity = (size: string | null, nextQuantity: number) => {
                  setPurchaseSelections((current) => {
                    const previous = current[offerSelectionKey(offer)] || { quantity: 1, sizeQuantities: {} };
                    return {
                      ...current,
                      [offerSelectionKey(offer)]: size
                        ? { ...previous, sizeQuantities: { ...previous.sizeQuantities, [size]: Math.max(0, nextQuantity) } }
                        : { ...previous, quantity: Math.max(offer.productSource === 'marketplace' ? 0 : 1, nextQuantity) },
                    };
                  });
                };
                const quantityControl = (quantity: number, label: string, onDecrease: () => void, onIncrease: () => void) => (
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,.25)', borderRadius: 7, overflow: 'hidden' }}>
                    <button type="button" aria-label={'Decrease ' + label} disabled={quantity <= 0} onClick={onDecrease} style={{ width: 38, height: 38, border: 0, background: 'transparent', color: '#f4f1ec', fontSize: 18, cursor: quantity > 0 ? 'pointer' : 'not-allowed', opacity: quantity > 0 ? 1 : .35 }}>−</button>
                    <output aria-live="polite" style={{ minWidth: 30, textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{quantity}</output>
                    <button type="button" aria-label={'Increase ' + label} onClick={onIncrease} style={{ width: 38, height: 38, border: 0, background: 'transparent', color: '#f4f1ec', fontSize: 18, cursor: 'pointer' }}>+</button>
                  </div>
                );
                return <div key={offer.storefront + '-' + offer.id} style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 20 }}>
                  <strong style={{ fontSize: 22, fontWeight: 550, fontVariantNumeric: 'tabular-nums' }}>{typeof offer.price === 'number' ? 'R' + offer.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Price unavailable'}</strong>
                  {marketplaceVariants.length > 0
                    ? <div role="group" aria-label="Marketplace variant quantities" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        {marketplaceVariants.map((variant) => { const quantity = selection.sizeQuantities[variant.id] || 0; const variantLabel = variant.name || Object.values(variant.options || {}).join(' · ') || variant.sku; return <div key={variant.id} style={{ display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',alignItems:'center',gap:12,padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.12)' }}><span style={{fontSize:13,fontWeight:550}}>{variantLabel}<small style={{display:'block',opacity:.65}}>R{variant.price.toFixed(2)}</small></span>{quantityControl(quantity,variantLabel+' quantity',()=>updateQuantity(variant.id,quantity-1),()=>updateQuantity(variant.id,quantity+1))}</div>; })}
                      </div>
                    : null}
                  {hasSizes
                    ? <div role="group" aria-label="Quantity by size" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        {offer.sizes?.map((size) => {
                          const quantity = selection.sizeQuantities[size] || 0;
                          return <div key={size} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
                            <span style={{ fontSize: 13, fontWeight: 550 }}>{size}</span>
                            {quantityControl(quantity, size + ' quantity', () => updateQuantity(size, quantity - 1), () => updateQuantity(size, quantity + 1))}
                          </div>;
                        })}
                      </div>
                    : <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 550 }}>Quantity</span>
                        {quantityControl(selection.quantity, 'quantity', () => updateQuantity(null, selection.quantity - 1), () => updateQuantity(null, selection.quantity + 1))}
                      </div>}
                  {<button type="button" onClick={() => { if (!validSelection) { if (marketplaceVariants.length || hasSizes) toast.error('Choose a quantity for at least one option'); else toast.error('Choose a quantity'); return; } addProductToCart(offer); setSelectedProductGroup(null); }} disabled={!validSelection} style={{ minHeight: 46, padding: '0 20px', border: 0, borderRadius: 999, background: validSelection ? '#f4f1ec' : 'rgba(244,241,236,.18)', color: validSelection ? '#111' : 'rgba(244,241,ec,.42)', font: 'inherit', fontSize: 12, fontWeight: 700, cursor: validSelection ? 'pointer' : 'not-allowed' }}>Add to cart</button>} onClick={() => { if (!validSelection) { if (hasSizes) toast.error('Choose a quantity for at least one size'); return; } addProductToCart(offer); setSelectedProductGroup(null); }} disabled={!validSelection} style={{ minHeight: 46, padding: '0 20px', border: 0, borderRadius: 999, background: validSelection ? '#f4f1ec' : 'rgba(244,241,236,.18)', color: validSelection ? '#111' : 'rgba(244,241,236,.42)', font: 'inherit', fontSize: 12, fontWeight: 700, cursor: validSelection ? 'pointer' : 'not-allowed' }}>Add to cart</button>}
                  <a href={offer.href} className="marketplace-store-collection-link" style={{ alignSelf: 'center', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: 7, color: 'rgba(244,241,236,.72)', fontSize: 12, lineHeight: 1.4, textDecoration: 'none' }}>Discover more from the {offer.storeName} collection.<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10" /></svg></a>
                </div>;
              })}
            </div>
          </div>
        </section>
      </div>}
  </main>;
}
