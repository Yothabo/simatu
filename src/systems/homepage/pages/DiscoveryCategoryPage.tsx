import React, { useEffect, useMemo, useState } from 'react';
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
type CategoryProduct = { id: string; name: string; storefront: string; marketplace_subcategory_id?: string | null; sku?: string | null; sizes?: string[]; category?: string; subcategory?: string; brand?: string; description?: string | null; storeName: string; href: string; price?: number; image_url?: string | null };
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
  const [purchaseSelections, setPurchaseSelections] = useState<Record<string, { size: string; quantity: number }>>({});
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
    fetch('/api/products?scope=marketplace', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load marketplace products.');
        return Array.isArray(data.products) ? data.products : [];
      })
      .then((availableProducts) => {
        if (cancelled) return;
        const mapped = availableProducts
          .filter((product: any) => product && product.is_active !== false && typeof product.storefront === 'string')
          .map((product: any) => ({
            ...product,
            price: Number(product.price),
            storeName: product.storefront === 'poshies' ? 'Poshies' : product.storefront === 'yotaabo' ? 'Yotaabo' : product.storefront,
            href: '/' + product.storefront + '/catalog',
          } as CategoryProduct));
        setProducts(mapped);
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
        if (!next[key]) next[key] = { size: offer.sizes?.[0] || '', quantity: 1 };
      });
      return next;
    });
    setSelectedProductGroup(group);
  };

  const addProductToCart = (product: CategoryProduct) => {
    if (!product.storefront || typeof product.price !== 'number') return;
    const selection = purchaseSelections[offerSelectionKey(product)] || { size: product.sizes?.[0] || '', quantity: 1 };
    if ((product.sizes?.length || 0) > 0 && !selection.size) {
      toast.error('Please select a size');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: 'R ' + product.price.toFixed(2),
      placeholderColor: 'bg-[#f1f1ee]',
      image_url: product.image_url ?? null,
      description: product.description ?? null,
      category: product.category || item.category,
      storefront: product.storefront,
      storeName: product.storeName,
      size: selection.size || null,
      quantity: selection.quantity,
    });
    toast.success(selection.quantity + ' × ' + product.name + (selection.size ? ' (' + selection.size + ')' : '') + ' added to your shared cart');
  };

  const marketplaceGroups = useMemo(() => {
    const grouped = new Map<string, CategoryProduct[]>();
    scopedProducts.forEach((product) => {
      const normalizedName = product.name.trim().toLowerCase().replace(/\s+/g, ' ');
      const identity = 'name:' + normalizedName;
      grouped.set(identity, [...(grouped.get(identity) || []), product]);
    });
    return Array.from(grouped.entries()).map(([id, offers]) => ({
      id,
      name: offers[0].name,
      image_url: offers.find((offer) => offer.image_url)?.image_url || null,
      offers: offers.slice().sort((a, b) => Number(a.price || 0) - Number(b.price || 0)),
    }));
  }, [scopedProducts]);

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
              <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#222', overflow: 'hidden' }}>
                {group.image_url && <img src={group.image_url} alt={group.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 8, minHeight: 164, padding: '10px 11px 11px' }}>
                <strong style={{ display: '-webkit-box', minHeight: '2.6em', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, fontSize: 13, lineHeight: 1.3, fontWeight: 550 }}>{group.name}</strong>
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
        style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(8px)' }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="marketplace-product-modal-title"
          onClick={(event) => event.stopPropagation()}
          style={{ position: 'relative', width: '100%', maxWidth: 680, maxHeight: 'min(88dvh,820px)', overflowY: 'auto', border: '1px solid rgba(255,255,255,.16)', borderRadius: 12, background: '#171717', color: '#f4f1ec' }}
        >
          <button type="button" onClick={() => setSelectedProductGroup(null)} aria-label="Close product details" style={{ position: 'absolute', zIndex: 2, top: 12, right: 12, width: 38, height: 38, border: '1px solid rgba(255,255,255,.35)', borderRadius: '50%', background: 'rgba(17,17,17,.8)', color: '#fff', fontSize: 22, cursor: 'pointer' }}>×</button>
          {selectedProductGroup.image_url && <img src={selectedProductGroup.image_url} alt={selectedProductGroup.name} style={{ display: 'block', width: '100%', maxHeight: 340, objectFit: 'cover', background: '#222' }} />}
          <div style={{ padding: '20px clamp(16px,4vw,28px) 24px' }}>
            <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', opacity: .58 }}>Marketplace product</p>
            <h2 id="marketplace-product-modal-title" style={{ margin: '7px 44px 8px 0', fontSize: 'clamp(21px,4vw,30px)', lineHeight: 1.15, fontWeight: 550 }}>{selectedProductGroup.name}</h2>
            {selectedProductGroup.offers[0]?.brand && <p style={{ margin: '0 0 10px', fontSize: 13, opacity: .68 }}>{selectedProductGroup.offers[0].brand}</p>}
            {selectedProductGroup.offers[0]?.description && <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.6, opacity: .78 }}>{selectedProductGroup.offers[0].description}</p>}
            {(selectedProductGroup.offers[0]?.sizes ?? []).length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
              {selectedProductGroup.offers[0].sizes?.map((size) => <span key={size} style={{ padding: '5px 9px', border: '1px solid rgba(255,255,255,.2)', borderRadius: 999, fontSize: 11 }}>{size}</span>)}
            </div>}
            <h3 style={{ margin: '18px 0 8px', fontSize: 14, fontWeight: 600 }}>Available sellers</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {selectedProductGroup.offers.map((offer, offerIndex) => <div key={`${offer.storefront}-${offer.id}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,.12)' }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 13, fontWeight: 550 }}>{offer.storeName}</strong>
                  <strong style={{ display: 'block', marginTop: 4, fontSize: 13, fontWeight: 650 }}>{typeof offer.price === 'number' ? 'R' + offer.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Price unavailable'}</strong>
                  <span style={{ display: 'block', marginTop: 3, fontSize: 11, opacity: .58 }}>{offer.subcategory || offer.category || 'Marketplace seller'}{offerIndex === 0 && selectedProductGroup.offers.length > 1 ? ' · Lowest price' : ''}</span>
                  <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                    {offer.sizes?.length ? <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                      <legend style={{ marginBottom: 7, fontSize: 11, opacity: .7 }}>Choose size</legend>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {offer.sizes.map((size) => <button key={size} type="button" aria-pressed={(purchaseSelections[offerSelectionKey(offer)]?.size || offer.sizes?.[0]) === size} onClick={() => setPurchaseSelections((current) => ({ ...current, [offerSelectionKey(offer)]: { size, quantity: current[offerSelectionKey(offer)]?.quantity || 1 } }))} style={{ minWidth: 42, minHeight: 34, padding: '0 11px', border: (purchaseSelections[offerSelectionKey(offer)]?.size || offer.sizes?.[0]) === size ? '1px solid #f4f1ec' : '1px solid rgba(255,255,255,.25)', borderRadius: 6, background: (purchaseSelections[offerSelectionKey(offer)]?.size || offer.sizes?.[0]) === size ? '#f4f1ec' : 'transparent', color: (purchaseSelections[offerSelectionKey(offer)]?.size || offer.sizes?.[0]) === size ? '#111' : '#f4f1ec', cursor: 'pointer' }}>{size}</button>)}
                      </div>
                    </fieldset> : <span style={{ fontSize: 11, opacity: .62 }}>No size selection required</span>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 11, opacity: .7 }}>Quantity</span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,.25)', borderRadius: 999, overflow: 'hidden' }}>
                        <button type="button" aria-label="Decrease quantity" disabled={(purchaseSelections[offerSelectionKey(offer)]?.quantity || 1) <= 1} onClick={() => setPurchaseSelections((current) => ({ ...current, [offerSelectionKey(offer)]: { size: current[offerSelectionKey(offer)]?.size || offer.sizes?.[0] || '', quantity: Math.max(1, (current[offerSelectionKey(offer)]?.quantity || 1) - 1) } }))} style={{ width: 36, height: 36, border: 0, background: 'transparent', color: '#f4f1ec', fontSize: 18, cursor: 'pointer' }}>−</button>
                        <output aria-live="polite" style={{ minWidth: 30, textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{purchaseSelections[offerSelectionKey(offer)]?.quantity || 1}</output>
                        <button type="button" aria-label="Increase quantity" onClick={() => setPurchaseSelections((current) => ({ ...current, [offerSelectionKey(offer)]: { size: current[offerSelectionKey(offer)]?.size || offer.sizes?.[0] || '', quantity: (current[offerSelectionKey(offer)]?.quantity || 1) + 1 } }))} style={{ width: 36, height: 36, border: 0, background: 'transparent', color: '#f4f1ec', fontSize: 18, cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
                    <a href={'/' + offer.storefront} style={{ color: '#f4f1ec', fontSize: 12, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Visit storefront <span aria-hidden="true">↗</span></a>
                    <a href={offer.href} style={{ color: 'rgba(244,241,236,.72)', fontSize: 11, textDecoration: 'underline', textUnderlineOffset: 3 }}>Learn more from seller <span aria-hidden="true">↗</span></a>
                  </div>
                </div>
                <button type="button" onClick={() => addProductToCart(offer)} disabled={typeof offer.price !== 'number'} style={{ minHeight: 38, padding: '0 13px', border: '1px solid rgba(255,255,255,.55)', borderRadius: 999, background: '#f4f1ec', color: '#111', font: 'inherit', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>Add to cart</button>
              </div>)}
            </div>
          </div>
        </section>
      </div>}
  </main>;
}
