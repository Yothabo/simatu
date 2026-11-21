import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type NetworkProduct = { id: string; name: string; price: number; category: string; subcategory?: string; image_url?: string | null; storeKey: 'yotaabo' | 'poshies'; storeName: string; href: string };
const NETWORK_STORES = [{ key: 'yotaabo' as const, name: 'Yotaabo', href: '/yotaabo/catalog', description: 'A curated selection of fragrance, fashion, and spaces for everyday living.', categories: ['His', 'Hers', 'Spaces'] }, { key: 'poshies' as const, name: 'Poshies', href: '/poshies/catalog', description: 'Fashion, accessories, and lifestyle pieces with a bold, expressive point of view.', categories: ['Hers', 'His', 'Lounge'] }];

export interface MoodboardItem {
  id: string;
  image: string;
  alt: string;
  category: string;
  title: string;
  objectPosition?: string;
}

interface KineticMoodboardProps {
  items?: MoodboardItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  borderRadius?: number;
  enableWheel?: boolean;
  enableMomentum?: boolean;
  showLabels?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onItemClick?: (item: MoodboardItem) => void;
  colorReveal?: boolean;
}

const DEFAULT_ITEMS: MoodboardItem[] = [
  { id: '01', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=900&q=85', alt: 'Modern architectural interior', category: 'Spaces', title: 'New perspectives' },
  { id: '02', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=85', alt: 'Contemporary fashion editorial', category: 'Style', title: 'Personal expression' },
  { id: '03', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85', alt: 'Minimal fashion collection', category: 'Fashion', title: 'Everyday form' },
  { id: '04', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=85', alt: 'Warm contemporary home', category: 'Living', title: 'Considered living' },
  { id: '05', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85', alt: 'Minimal product design', category: 'Objects', title: 'Designed to matter' },
  { id: '06', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=85', alt: 'Open landscape at golden hour', category: 'Culture', title: 'Room to explore' },
  { id: '07', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85', alt: 'Creative workspace', category: 'Ideas', title: 'Work in progress' },
  { id: '08', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=85', alt: 'Light-filled creative studio', category: 'Workspaces', title: 'Space to create' },
  { id: '09', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85', alt: 'Streetwear fashion portrait', category: 'Fashion', title: 'Beyond the ordinary' },
  { id: '10', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=85', alt: 'Thoughtful interior details', category: 'Living', title: 'A different point of view' },
  { id: '11', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=85', alt: 'Fresh food and ingredients', category: 'Everyday', title: 'Made for living' },
  { id: '12', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=85', alt: 'Mountain landscape', category: 'Explore', title: 'Find what moves you' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const KineticMoodboard: React.FC<KineticMoodboardProps> = ({
  items = DEFAULT_ITEMS,
  columns = 8,
  tileWidth = 230,
  tileHeight = 290,
  gap = 16,
  borderRadius = 3,
  enableWheel = true,
  enableMomentum = true,
  showLabels = true,
  colorReveal = false,
  className = '',
  style,
  onItemClick,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0, lastX: 0, lastY: 0, lastTime: 0, velocityX: 0, velocityY: 0, moved: false });
  const positionRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkProducts, setNetworkProducts] = useState<NetworkProduct[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [activeDiscovery, setActiveDiscovery] = useState<MoodboardItem | null>(null);
  const restorePositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('simatu-discover-return');
      if (!saved) return;
      sessionStorage.removeItem('simatu-discover-return');
      const context = JSON.parse(saved) as { discovery?: MoodboardItem; position?: { x: number; y: number } };
      if (context.discovery) setActiveDiscovery(context.discovery);
      if (context.position) restorePositionRef.current = context.position;
    } catch {
      sessionStorage.removeItem('simatu-discover-return');
    }
  }, []);

  useEffect(() => {
    if (!activeDiscovery || !colorReveal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [activeDiscovery, colorReveal]);

  const sourceItems = items.length ? items : DEFAULT_ITEMS;
  const tiles = useMemo(() => {
    const random = seededRandom(29);
    const shuffled = [...sourceItems];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return Array.from({ length: columns * columns }, (_, index) => shuffled[index % shuffled.length]);
  }, [sourceItems, columns]);

  useEffect(() => {
    let cancelled = false;
    setNetworkLoading(true);
    Promise.all(NETWORK_STORES.map(async (store) => {
      const response = await fetch('/api/products?storefront=' + encodeURIComponent(store.key), { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || ('Unable to load ' + store.name + ' products.'));
      return (Array.isArray(data.products) ? data.products : []).filter((product: any) => product && product.is_active !== false).map((product: any) => ({ ...product, storeKey: store.key, storeName: store.name, href: store.href } as NetworkProduct));
    }))
      .then((results) => { if (!cancelled) { setNetworkProducts(results.flat()); setNetworkError(''); } })
      .catch((error) => { if (!cancelled) setNetworkError(error instanceof Error ? error.message : 'Network search unavailable.'); })
      .finally(() => { if (!cancelled) setNetworkLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchingProducts = normalizedSearch.length >= 2 ? networkProducts.filter((product) => (product.name + ' ' + product.category + ' ' + (product.subcategory || '') + ' ' + product.storeName).toLowerCase().includes(normalizedSearch)).slice(0, 12) : [];
  const discoveryStores = activeDiscovery ? NETWORK_STORES : [];
  const boardWidth = columns * tileWidth + (columns - 1) * gap;
  const boardHeight = columns * tileHeight + (columns - 1) * gap;

  const applyPosition = useCallback((x: number, y: number) => {
    const next = {
      x: clamp(x, Math.min(0, viewport.width - boardWidth), 0),
      y: clamp(y, Math.min(0, viewport.height - boardHeight), 0),
    };
    positionRef.current = next;
    setPosition(next);
  }, [boardWidth, boardHeight, viewport.width, viewport.height]);

  useEffect(() => {
    const savedPosition = restorePositionRef.current;
    if (!savedPosition || !viewport.width || !viewport.height) return;
    restorePositionRef.current = null;
    applyPosition(savedPosition.x, savedPosition.y);
  }, [viewport.width, viewport.height, applyPosition]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    boundsRef.current = {
      x: Math.min(0, viewport.width - boardWidth),
      y: Math.min(0, viewport.height - boardHeight),
    };
    applyPosition(positionRef.current.x, positionRef.current.y);
  }, [applyPosition, boardWidth, boardHeight, viewport.width, viewport.height]);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  const stopMotion = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  const startMomentum = (vx: number, vy: number) => {
    if (!enableMomentum) return;
    let velocityX = vx;
    let velocityY = vy;
    const step = () => {
      velocityX *= 0.94;
      velocityY *= 0.94;
      const current = positionRef.current;
      const nextX = clamp(current.x + velocityX, boundsRef.current.x, 0);
      const nextY = clamp(current.y + velocityY, boundsRef.current.y, 0);
      applyPosition(nextX, nextY);
      if (Math.abs(velocityX) > 0.25 || Math.abs(velocityY) > 0.25) frameRef.current = requestAnimationFrame(step);
      else frameRef.current = null;
    };
    stopMotion();
    frameRef.current = requestAnimationFrame(step);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stopMotion();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { active: true, startX: event.clientX, startY: event.clientY, originX: positionRef.current.x, originY: positionRef.current.y, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now(), velocityX: 0, velocityY: 0, moved: false };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    const now = performance.now();
    const elapsed = Math.max(1, now - drag.lastTime);
    drag.velocityX = (event.clientX - drag.lastX) / elapsed * 16;
    drag.velocityY = (event.clientY - drag.lastY) / elapsed * 16;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    applyPosition(drag.originX + dx, drag.originY + dy);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.moved) startMomentum(drag.velocityX, drag.velocityY);
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!enableWheel) return;
    event.preventDefault();
    stopMotion();
    applyPosition(positionRef.current.x - event.deltaX - (event.shiftKey ? event.deltaY : 0), positionRef.current.y - (event.shiftKey ? 0 : event.deltaY));
  };

  const handleTileClick = (item: MoodboardItem) => {
    if (!dragRef.current.moved) onItemClick?.(item);
    dragRef.current.moved = false;
  };

  return (
    <section className={`kinetic-moodboard ${className}${colorReveal ? ' is-color-revealing' : ''}`} style={style} aria-label="Explore the moodboard">
      <style>{`
        .kinetic-moodboard{position:relative;display:block;width:100%;height:100%;min-height:0;margin:0;padding:0;box-sizing:border-box;overflow:hidden;background:#111;color:#fff;isolation:isolate}
        .kinetic-moodboard__viewport{position:absolute;inset:0;overflow:hidden;cursor:grab;touch-action:none;user-select:none}
        .kinetic-moodboard__viewport.is-dragging{cursor:grabbing}
        .kinetic-moodboard__board{position:absolute;top:0;left:0;display:grid;grid-template-columns:repeat(${columns},${tileWidth}px);gap:${gap}px;will-change:transform}
        .kinetic-moodboard__tile{position:relative;display:block;width:${tileWidth}px;height:${tileHeight}px;padding:0;overflow:hidden;border:0;border-radius:${borderRadius}px;background:#252525;color:inherit;text-align:left;cursor:pointer}
        .kinetic-moodboard__tile img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1);transition:transform .7s cubic-bezier(.2,.7,.2,1),filter 1.8s cubic-bezier(.2,.65,.25,1)}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__tile img{filter:grayscale(0)}
        .kinetic-moodboard__tile:hover img{transform:scale(1.055);filter:brightness(.82)}
        .kinetic-moodboard__search-header{position:absolute;z-index:10;top:0;left:0;right:0;display:flex;justify-content:center;padding:18px 20px;transform:translate3d(0,-125%,0);opacity:0;pointer-events:none;transition:transform .85s cubic-bezier(.2,.65,.25,1),opacity .65s ease;}
        .kinetic-moodboard.is-color-revealing .kinetic-moodboard__search-header{transform:translate3d(0,0,0);opacity:1;pointer-events:auto}
        .kinetic-moodboard__search-shell{width:min(680px,calc(100vw - 40px));height:62px;display:flex;align-items:center;gap:12px;padding:0 18px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:#292929;box-shadow:0 12px 36px rgba(0,0,0,.3);color:#f2f2f2}
        .kinetic-moodboard__search-icon{width:16px;height:16px;flex:0 0 16px;opacity:.62}
        .kinetic-moodboard__search-input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#f2f2f2;font:400 13px/1.2 sans-serif;letter-spacing:.02em}
        .kinetic-moodboard__search-input::placeholder{color:rgba(255,255,255,.45)}
        @media(max-width:640px){.kinetic-moodboard__search-header{padding:12px 12px}.kinetic-moodboard__search-shell{height:44px;width:calc(100vw - 24px)}}
        .kinetic-moodboard__tile:after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.65));pointer-events:none}
        .kinetic-moodboard__label{position:absolute;z-index:1;left:16px;right:12px;bottom:15px;display:grid;gap:4px;pointer-events:none}
        .kinetic-moodboard__category{font:600 9px/1.2 sans-serif;letter-spacing:.18em;text-transform:uppercase;opacity:.75}
        .kinetic-moodboard__title{font:500 15px/1.25 sans-serif;letter-spacing:.01em}
        .kinetic-moodboard__search-results{position:absolute;top:98px;left:50%;transform:translateX(-50%);width:min(680px,calc(100vw - 32px));max-height:min(62vh,560px);overflow:auto;z-index:11;background:#242424;border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:8px;color:#fff;box-shadow:0 24px 70px rgba(0,0,0,.45)}
        .kinetic-moodboard__result{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;text-decoration:none;color:#fff;transition:background .18s}
        .kinetic-moodboard__result:hover{background:#353535}
        .kinetic-moodboard__result-image{width:54px;height:62px;object-fit:contain;border-radius:8px;background:#333;flex:0 0 auto}
        .kinetic-moodboard__result-meta{min-width:0;flex:1}
        .kinetic-moodboard__result-name{font:500 13px/1.35 sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .kinetic-moodboard__result-store{font:11px/1.4 sans-serif;color:#aaa;margin-top:4px}
        .kinetic-moodboard__result-price{font:600 13px/1.3 sans-serif;color:#f4f4f4;white-space:nowrap}
        .kinetic-moodboard__search-status{padding:14px;color:#aaa;font:12px/1.5 sans-serif}
        .kinetic-moodboard__dialog-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:12px;overflow:hidden;box-sizing:border-box;background:rgba(0,0,0,0);backdrop-filter:blur(0);animation:discover-overlay-in .45s cubic-bezier(.2,.65,.25,1) forwards}
        .kinetic-moodboard__dialog{width:min(680px,100%);max-height:min(78vh,700px);max-height:min(78dvh,700px);min-height:0;box-sizing:border-box;overscroll-behavior:contain;overflow-x:hidden;overflow-y:auto;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:#242424;color:#fff;padding:26px;opacity:0;transform:translateY(24px) scale(.96);animation:discover-dialog-in .55s cubic-bezier(.2,.65,.25,1) .06s forwards}
        .kinetic-moodboard__dialog-heading{position:sticky;top:-26px;z-index:5;display:flex;flex-direction:column;align-items:stretch;gap:0;margin:-26px -26px 0;padding:26px 26px 18px;background:#151515}.kinetic-moodboard__dialog-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}.kinetic-moodboard__dialog-title-row>div{min-width:0;flex:1}
        .kinetic-moodboard__dialog-title{font:500 24px/1.3 sans-serif}
        .kinetic-moodboard__dialog-intro{font:13px/1.65 sans-serif;color:#aaa;margin:12px 0 22px}
        .kinetic-moodboard__store-list{margin-top:18px}.kinetic-moodboard__store-card{display:flex;flex-direction:column;align-items:stretch;gap:1px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.08);color:#fff;text-decoration:none}.kinetic-moodboard__store-card:last-of-type{border-bottom:0}
        .kinetic-moodboard__store-topline{display:flex;align-items:center;justify-content:space-between;gap:12px}\n        .kinetic-moodboard__store-tags{display:flex;flex-wrap:nowrap;gap:7px;max-width:65%;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none;-webkit-overflow-scrolling:touch}\n        .kinetic-moodboard__store-tags::-webkit-scrollbar{display:none}\n        .kinetic-moodboard__store-link-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;margin-top:2px}
        .kinetic-moodboard__store-info{min-width:0;flex:1;overflow:hidden}
        .kinetic-moodboard__store-name{font:500 16px/1.4 sans-serif;color:#fff}
        .kinetic-moodboard__store-description{font:12px/1.5 sans-serif;color:#aaa;margin:0;min-width:0;max-width:500px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
        .kinetic-moodboard__store-tags{margin:0}
        .kinetic-moodboard__store-tags::-webkit-scrollbar{display:none}
        .kinetic-moodboard__store-tag{flex:0 0 auto;font:10px/1 sans-serif;color:#c9c9c9;background:#343434;border:1px solid #414141;padding:7px 9px;border-radius:999px}
        .kinetic-moodboard__store-open{flex:0 0 auto;font:600 11px/1 sans-serif;color:#ccc;white-space:nowrap}
        @keyframes discover-overlay-in{to{background:rgba(0,0,0,.66);backdrop-filter:blur(10px)}}
        @keyframes discover-dialog-in{to{opacity:1;transform:translateY(0) scale(1)}}
        .kinetic-moodboard__dialog-close{border:0;border-radius:50%;width:36px;height:36px;background:#353535;color:#fff;font-size:22px;cursor:pointer}
        .kinetic-moodboard__store-sub{color:#aaa;font:12px/1.4 sans-serif;margin-top:4px}
        @media(max-width:640px){.kinetic-moodboard__search-header{padding:12px}.kinetic-moodboard__search-shell{height:56px;width:calc(100vw - 24px)}.kinetic-moodboard__search-results{top:80px}.kinetic-moodboard__dialog-backdrop{padding:12px;padding-bottom:max(12px,env(safe-area-inset-bottom));padding-top:max(12px,env(safe-area-inset-top))}.kinetic-moodboard__dialog{width:100%;max-height:min(82vh,700px);max-height:min(82dvh,700px);padding:18px;border-radius:16px;overflow-y:auto;overscroll-behavior:contain}.kinetic-moodboard__dialog-heading{top:-18px;margin:-18px -18px 0;padding:18px 18px 14px}}
      `}</style>
      <div className="kinetic-moodboard__search-header" aria-hidden={!colorReveal}>
        <label className="kinetic-moodboard__search-shell">
          <svg className="kinetic-moodboard__search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7"/><path d="m16 16 4.3 4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          <input className="kinetic-moodboard__search-input" type="search" placeholder="Search the network" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} tabIndex={colorReveal ? 0 : -1} aria-label="Search the brand network" />
        </label>
      </div>
      <div
        ref={viewportRef}
        className={`kinetic-moodboard__viewport${dragging ? ' is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div ref={boardRef} className="kinetic-moodboard__board" style={{ transform: `translate3d(${position.x}px,${position.y}px,0)` }}>
          {tiles.map((item, index) => (
            <button
              type="button"
              className="kinetic-moodboard__tile"
              key={`${item.id}-${index}`}
              onClick={() => { handleTileClick(item); setActiveDiscovery(item); }}
              aria-label={`${item.category}: ${item.title}`}
              draggable={false}
            >
              <img src={item.image} alt={item.alt} loading={index < 12 ? 'eager' : 'lazy'} draggable={false} style={{ objectPosition: item.objectPosition || 'center', transitionDelay: colorReveal ? `${Math.floor(index / columns) * 0.42}s` : '0s' }} />
              {showLabels && <span className="kinetic-moodboard__label"><span className="kinetic-moodboard__category">{item.category}</span><span className="kinetic-moodboard__title">{item.title}</span></span>}
            </button>
          ))}
        </div>
      </div>
      {normalizedSearch.length >= 2 && colorReveal && (
        <div className="kinetic-moodboard__search-results" role="listbox" aria-label="Network product search results">
          {networkLoading && <div className="kinetic-moodboard__search-status">Searching stores…</div>}
          {!networkLoading && networkError && <div className="kinetic-moodboard__search-status">{networkError}</div>}
          {!networkLoading && !networkError && matchingProducts.length === 0 && <div className="kinetic-moodboard__search-status">No matching products found across the network.</div>}
          {matchingProducts.map((product) => <a className="kinetic-moodboard__result" href={product.href} key={product.storeKey + product.id}>
            {product.image_url ? <img className="kinetic-moodboard__result-image" src={product.image_url} alt="" /> : <div className="kinetic-moodboard__result-image" />}
            <div className="kinetic-moodboard__result-meta"><div className="kinetic-moodboard__result-name">{product.name}</div><div className="kinetic-moodboard__result-store">{product.storeName} · {product.category}{product.subcategory ? ' / ' + product.subcategory : ''}</div></div>
            <div className="kinetic-moodboard__result-price">{Number(product.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</div>
          </a>)}
        </div>
      )}
      {activeDiscovery && colorReveal && (
        <div className="kinetic-moodboard__dialog-backdrop" onClick={() => setActiveDiscovery(null)}>
          <div className="kinetic-moodboard__dialog" role="dialog" aria-modal="true" aria-labelledby="discover-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="kinetic-moodboard__dialog-heading"><div className="kinetic-moodboard__dialog-title-row"><div className="kinetic-moodboard__dialog-title" id="discover-dialog-title">{activeDiscovery.category}</div><button className="kinetic-moodboard__dialog-close" type="button" aria-label="Close" onClick={() => setActiveDiscovery(null)}>×</button></div><div className="kinetic-moodboard__store-sub">{({ Style: "Explore personal expression through fashion, accessories, and distinctive everyday looks.", Fashion: "Discover clothing and pieces that bring individuality to every look.", Spaces: "Explore interiors, design, and thoughtful ways to shape your surroundings.", Living: "Find considered pieces that make everyday living feel more intentional.", Objects: "Discover well-designed objects where form meets function.", Culture: "Explore ideas, places, and experiences that inspire a different perspective.", Ideas: "Discover creative thinking, fresh perspectives, and inspiration in motion.", Workspaces: "Explore spaces and essentials designed to support creativity and focus.", Everyday: "Find everyday essentials and inspiration for the moments that matter.", Explore: "Follow curiosity into new places, perspectives, and discoveries." } as Record<string, string>)[activeDiscovery.category] || `Explore ${activeDiscovery.category.toLowerCase()} through curated stores and collections.`}</div></div>
            
            <div className="kinetic-moodboard__store-list">
              {networkLoading && <div className="kinetic-moodboard__search-status">Loading store directory…</div>}
              {!networkLoading && networkError && <div className="kinetic-moodboard__search-status">{networkError}</div>}
              {!networkLoading && !networkError && discoveryStores.length === 0 && <div className="kinetic-moodboard__search-status">No stores are available.</div>}
              {discoveryStores.map((store) => <div className="kinetic-moodboard__store-card" key={store.key}><div className="kinetic-moodboard__store-topline"><div className="kinetic-moodboard__store-name">{store.name}</div><div className="kinetic-moodboard__store-tags" aria-label={store.name + ' categories'}>{store.categories.map((category) => <span className="kinetic-moodboard__store-tag" key={category}>{category}</span>)}</div></div><div className="kinetic-moodboard__store-link-row"><div className="kinetic-moodboard__store-description">{store.description}</div><a className="kinetic-moodboard__store-open" href={store.href} onClick={() => { try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ discovery: activeDiscovery, position: positionRef.current })); } catch {} }}>Visit {store.name} ↗</a></div></div>)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};


export default KineticMoodboard;
