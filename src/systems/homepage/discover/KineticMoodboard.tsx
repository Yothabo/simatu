import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiHome } from 'react-icons/fi';

type NetworkProduct = { id: string; name: string; price: number; category: string; subcategory?: string; brand?: string; image_url?: string | null; storeKey: 'yotaabo' | 'poshies'; storeName: string; href: string };
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
  interactive?: boolean;
  onExit?: () => void;
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
  interactive = colorReveal,
  onExit,
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
  const [searchDismissed, setSearchDismissed] = useState(false);
  useEffect(() => { if (colorReveal) setSearchDismissed(false); }, [colorReveal]);
  const [networkProducts, setNetworkProducts] = useState<NetworkProduct[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [activeDiscovery, setActiveDiscovery] = useState<MoodboardItem | null>(null);
  const [isDiscoveryClosing, setIsDiscoveryClosing] = useState(false);
  const closeDiscovery = () => { if (activeDiscovery && !isDiscoveryClosing) setIsDiscoveryClosing(true); };
  const finishDiscoveryClose = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !isDiscoveryClosing) return;
    setActiveDiscovery(null);
    setIsDiscoveryClosing(false);
  };
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
  const searchMatches = (value: string) => value.toLowerCase().includes(normalizedSearch);
  const startsWithSearch = (value: string) => value.toLowerCase().startsWith(normalizedSearch);
  const searchStores = normalizedSearch.length ? NETWORK_STORES.filter((store) => startsWithSearch(store.name)).slice(0, 4) : [];
  const searchCategories = normalizedSearch.length ? Array.from(new Set(networkProducts.flatMap((product) => [product.category, product.subcategory || '']).filter(Boolean))).filter((category) => startsWithSearch(category)).slice(0, 6) : [];
  const matchingProducts = normalizedSearch.length ? networkProducts
    .filter((product) => searchMatches(product.name + ' ' + product.category + ' ' + (product.subcategory || '') + ' ' + (product.brand || '') + ' ' + product.storeName))
    .sort((a, b) => {
      const score = (product: NetworkProduct) => startsWithSearch(product.name) ? 0 : startsWithSearch(product.category) || startsWithSearch(product.subcategory || '') ? 1 : startsWithSearch(product.storeName) ? 2 : 3;
      return score(a) - score(b) || a.name.localeCompare(b.name);
    }).slice(0, 8) : [];
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
    if (!interactive) return;
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
    if (!enableWheel || !interactive) return;
    event.preventDefault();
    stopMotion();
    applyPosition(positionRef.current.x - event.deltaX - (event.shiftKey ? event.deltaY : 0), positionRef.current.y - (event.shiftKey ? 0 : event.deltaY));
  };

  const handleTileClick = (item: MoodboardItem) => {
    if (!dragRef.current.moved) onItemClick?.(item);
    dragRef.current.moved = false;
  };

  return (
    <section className={`kinetic-moodboard ${className}${colorReveal ? ' is-color-revealing' : ''}${interactive ? ' is-interactive' : ''}`} style={style} aria-label="Explore the moodboard">
      <style>{`
        .kinetic-moodboard{position:relative;display:block;width:100%;height:100%;min-height:0;margin:0;padding:0;box-sizing:border-box;overflow:hidden;background:transparent;color:var(--hp-color-text);isolation:isolate}
        .kinetic-moodboard__reveal-sentinel{position:absolute;top:0;left:0;width:var(--hp-border-width);height:var(--hp-border-width);opacity:0;pointer-events:none;transition:opacity .65s ease}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__reveal-sentinel{opacity:.01;transition-delay:0.65s}\n        .kinetic-moodboard__viewport{position:absolute;inset:0;overflow:hidden;cursor:grab;touch-action:none;user-select:none}
        .kinetic-moodboard__viewport.is-dragging{cursor:grabbing}
        .kinetic-moodboard__board{position:absolute;top:0;left:0;display:grid;grid-template-columns:repeat(${columns},${tileWidth}px);gap:${gap}px;will-change:transform;background:transparent}
        .kinetic-moodboard__tile{position:relative;display:block;width:${tileWidth}px;height:${tileHeight}px;padding:0;overflow:hidden;border:0;border-radius:${borderRadius}px;background:transparent;color:inherit;text-align:left;cursor:pointer;opacity:0;transform:translateY(var(--hp-size-14)) scale(.985);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.65,.25,1)}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__tile{opacity:1;transform:translateY(0) scale(1)}
        .kinetic-moodboard__tile img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1);transition:filter .7s ease,transform .7s ease}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__tile img{filter:grayscale(0)}
        .kinetic-moodboard__tile:hover img{transform:scale(1.055);filter:brightness(.82)}
        .kinetic-moodboard__search-header{position:absolute;z-index:10;top:0;left:0;right:0;display:flex;justify-content:center;padding:var(--hp-size-18) var(--hp-size-20);transform:translate3d(0,-125%,0);opacity:0;pointer-events:none;transition:transform .7s cubic-bezier(.2,.65,.25,1),opacity .7s ease}.kinetic-moodboard__search-row{width:min(680px,calc(100vw - var(--hp-size-40)));display:flex;align-items:center;gap:var(--hp-size-10)}.kinetic-moodboard__search-back{width:var(--hp-size-62);height:var(--hp-size-62);flex:0 0 var(--hp-size-62);display:flex;align-items:center;justify-content:center;border:var(--hp-border-width) solid var(--hp-color-border-light);border-radius:50%;background:var(--hp-color-surface);color:var(--hp-color-text-muted);box-shadow:0 var(--hp-size-10) var(--hp-size-28) color-mix(in srgb, var(--hp-color-background) 24%, transparent);cursor:pointer;transition:background .2s,color .2s,transform .2s}.kinetic-moodboard__search-back:hover{background:var(--hp-color-surface-raised);color:var(--hp-color-text)}.kinetic-moodboard__search-back:active{transform:scale(.96)}.kinetic-moodboard__search-back:focus-visible{outline:var(--hp-size-2) solid var(--hp-color-border-strong);outline-offset:var(--hp-size-2)}.kinetic-moodboard__search-back svg{width:var(--hp-size-18);height:var(--hp-size-18)}
        .kinetic-moodboard.is-color-revealing .kinetic-moodboard__search-header{transform:translate3d(0,0,0);opacity:1}.kinetic-moodboard.is-interactive .kinetic-moodboard__search-header{pointer-events:auto}
        .kinetic-moodboard__search-shell{width:auto;min-width:0;flex:1;height:var(--hp-size-62);display:flex;align-items:center;gap:var(--hp-size-12);padding:0 var(--hp-size-18);border:var(--hp-border-width) solid var(--hp-color-border-light);border-radius:999px;background:var(--hp-color-surface);box-shadow:0 var(--hp-size-12) var(--hp-size-36) color-mix(in srgb, var(--hp-color-background) 30%, transparent);color:var(--hp-color-text)}
        .kinetic-moodboard__search-icon{width:var(--hp-size-16);height:var(--hp-size-16);flex:0 0 var(--hp-size-16);opacity:.62}
        .kinetic-moodboard__search-input{-webkit-appearance:none;appearance:none;width:100%;min-width:0;margin:0;padding:0;border:0;border-radius:0;outline:none;box-shadow:none;background:transparent!important;color:var(--hp-color-text);font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.02em;caret-color:var(--hp-color-text-subtle)}
        .kinetic-moodboard__search-input:focus,.kinetic-moodboard__search-input:focus-visible{outline:none!important;border:0!important;box-shadow:none!important;background:transparent!important}
        .kinetic-moodboard__search-input::-webkit-search-decoration,.kinetic-moodboard__search-input::-webkit-search-cancel-button,.kinetic-moodboard__search-input::-webkit-search-results-button,.kinetic-moodboard__search-input::-webkit-search-results-decoration{display:none;-webkit-appearance:none}
        .kinetic-moodboard__search-input:-webkit-autofill,.kinetic-moodboard__search-input:-webkit-autofill:hover,.kinetic-moodboard__search-input:-webkit-autofill:focus{-webkit-text-fill-color:var(--hp-color-text);transition:background-color 9999s ease-out 0s;box-shadow:0 0 0 var(--hp-size-1000) transparent inset}
        .kinetic-moodboard__search-input::placeholder{color:var(--hp-color-text-muted);opacity:1}
        @media(max-width:640px){.kinetic-moodboard__search-header{padding:var(--hp-size-12)}.kinetic-moodboard__search-row{width:100%;gap:var(--hp-size-8)}.kinetic-moodboard__search-back{width:56px;height:56px;flex-basis:56px}.kinetic-moodboard__search-shell{height:var(--hp-size-44);padding:0 var(--hp-size-14)}}
        .kinetic-moodboard__tile:after{content:none}
        .kinetic-moodboard__label{position:absolute;z-index:1;left:var(--hp-size-16);right:var(--hp-size-12);bottom:var(--hp-size-15);display:grid;gap:var(--hp-size-4);pointer-events:none;opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__label{opacity:1;visibility:visible}
        .kinetic-moodboard__category{font:var(--hp-font-weight-semibold) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.18em;text-transform:uppercase;opacity:.75}
        .kinetic-moodboard__title{font:var(--hp-font-weight-medium) var(--hp-font-size-base)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.01em}
        .kinetic-moodboard__search-results{position:absolute;top:98px;left:50%;transform:translateX(-50%);width:min(680px,calc(100vw - var(--hp-size-32)));max-height:min(62vh,var(--hp-size-560));overflow:auto;z-index:11;background:var(--hp-color-surface);border:var(--hp-border-width) solid var(--hp-color-border);border-radius:var(--hp-size-18);padding:var(--hp-size-8);color:var(--hp-color-text);box-shadow:0 var(--hp-size-24) 70px color-mix(in srgb, var(--hp-color-background) 45%, transparent)}
        .kinetic-moodboard__result{display:flex;align-items:center;gap:var(--hp-size-12);padding:var(--hp-size-10);border-radius:var(--hp-size-12);text-decoration:none;color:var(--hp-color-text);transition:background .18s}
        .kinetic-moodboard__result:hover{background:var(--hp-color-surface-raised)}
        .kinetic-moodboard__result-image{width:var(--hp-size-54);height:var(--hp-size-62);object-fit:contain;border-radius:var(--hp-size-8);background:var(--hp-color-surface-raised);flex:0 0 auto}
        .kinetic-moodboard__result-meta{min-width:0;flex:1}
        .kinetic-moodboard__result-name{font:var(--hp-font-weight-medium) var(--hp-font-size-sm)/var(--hp-line-height-normal) var(--hp-font-family);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .kinetic-moodboard__result-store{font:var(--hp-font-weight-regular) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);color:var(--hp-color-text-muted);margin-top:var(--hp-size-4)}
        .kinetic-moodboard__result-price{font:var(--hp-font-weight-semibold) var(--hp-font-size-sm)/var(--hp-line-height-normal) var(--hp-font-family);color:var(--hp-color-text);white-space:nowrap}
        .kinetic-moodboard__search-status{padding:var(--hp-size-14);color:var(--hp-color-text-muted);font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-relaxed) var(--hp-font-family)}
        .kinetic-moodboard__suggestion-group{padding:var(--hp-size-4) 0 var(--hp-size-8)}
        .kinetic-moodboard__suggestion-heading{padding:var(--hp-size-9) var(--hp-size-10) var(--hp-size-6);color:var(--hp-color-white-muted);font:var(--hp-font-weight-semibold) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.14em}
        .kinetic-moodboard__suggestion{display:flex;align-items:center;gap:var(--hp-size-12);padding:var(--hp-size-9) var(--hp-size-10);border-radius:var(--hp-size-10);text-decoration:none;color:var(--hp-color-text-subtle)}
        .kinetic-moodboard__suggestion:hover,.kinetic-moodboard__suggestion:focus{background:var(--hp-color-surface-raised)}
        .kinetic-moodboard__suggestion-icon{width:var(--hp-size-36);height:var(--hp-size-36);display:flex;align-items:center;justify-content:center;border-radius:var(--hp-size-8);background:var(--hp-color-surface-raised);color:var(--hp-color-text-subtle);flex:0 0 auto;font:var(--hp-size-16)/1 sans-serif}
        .kinetic-moodboard__suggestion-text{display:flex;flex-direction:column;gap:var(--hp-size-3);min-width:0}
        .kinetic-moodboard__suggestion-name{font:var(--hp-font-weight-medium) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);color:var(--hp-color-text-subtle)}
        .kinetic-moodboard__suggestion-detail{font:var(--hp-font-weight-regular) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);color:var(--hp-color-text-muted)}
        .kinetic-moodboard__suggestion-button{width:100%;border:0;background:transparent;text-align:left;font:inherit;cursor:pointer}
        .kinetic-moodboard__dialog-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:flex-end;justify-content:center;padding:0;overflow:hidden;box-sizing:border-box;background:transparent;backdrop-filter:blur(0);animation:discover-overlay-in .42s cubic-bezier(.32,.72,0,1) forwards}.kinetic-moodboard__dialog-backdrop.is-closing{animation:discover-overlay-out .48s cubic-bezier(.32,.72,0,1) forwards}
        .kinetic-moodboard__dialog{width:100%;max-height:min(90vh,900px);max-height:min(90dvh,900px);min-height:0;margin:0;box-sizing:border-box;overscroll-behavior:contain;overflow-x:hidden;overflow-y:auto;border:var(--hp-border-width) solid var(--hp-color-border);border-bottom:0;border-radius:var(--hp-size-22) var(--hp-size-22) 0 0;background:var(--hp-color-surface);color:var(--hp-color-text);padding:0 26px calc(26px + env(safe-area-inset-bottom));opacity:1;transform:translateY(100%);animation:discover-sheet-in .48s cubic-bezier(.32,.72,0,1) forwards}.kinetic-moodboard__dialog-backdrop.is-closing .kinetic-moodboard__dialog{animation:discover-sheet-out .48s cubic-bezier(.32,.72,0,1) forwards}
        .kinetic-moodboard__dialog-heading{position:sticky;top:0;z-index:5;display:flex;flex-direction:column;align-items:stretch;gap:0;margin:0 -26px 0;padding:var(--hp-size-18) 26px;background:var(--hp-color-background)}.kinetic-moodboard__dialog-title-row{display:flex;align-items:center;justify-content:space-between;gap:var(--hp-size-12);min-width:0}.kinetic-moodboard__dialog-title-row>div{min-width:0;flex:1}
        .kinetic-moodboard__dialog-title{font:var(--hp-font-weight-medium) var(--hp-font-size-display)/var(--hp-line-height-normal) var(--hp-font-family)}
        .kinetic-moodboard__dialog-intro{font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-relaxed) var(--hp-font-family);color:var(--hp-color-text-muted);margin:var(--hp-size-12) 0 var(--hp-size-22)}
        .kinetic-moodboard__store-list{margin-top:var(--hp-size-18)}.kinetic-moodboard__store-card{display:flex;flex-direction:column;align-items:stretch;gap:var(--hp-border-width);padding:var(--hp-size-16) 0;border-bottom:var(--hp-border-width) solid var(--hp-color-border-light);color:var(--hp-color-text);text-decoration:none}.kinetic-moodboard__store-card:last-of-type{border-bottom:0}
        .kinetic-moodboard__store-topline{display:flex;align-items:center;justify-content:space-between;gap:var(--hp-size-12)}
        .kinetic-moodboard__store-link-row{display:block;margin-top:var(--hp-size-4)}
        .kinetic-moodboard__store-name{font:var(--hp-font-weight-medium) var(--hp-font-size-base)/var(--hp-line-height-normal) var(--hp-font-family);color:var(--hp-color-text-subtle)}
        .kinetic-moodboard__store-description{font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-relaxed) var(--hp-font-family);color:var(--hp-color-text-muted);margin:0;min-width:0;max-width:500px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow:hidden}
        .kinetic-moodboard__store-open{flex:0 0 auto;font:var(--hp-font-weight-medium) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);color:var(--hp-color-text-subtle);white-space:nowrap}
        @keyframes discover-overlay-in{to{background:var(--hp-color-overlay);backdrop-filter:blur(var(--hp-size-10))}}
        @keyframes discover-overlay-out{0%{background:var(--hp-color-overlay);backdrop-filter:blur(var(--hp-size-10))}100%{background:transparent;backdrop-filter:blur(0)}}
        @keyframes discover-dialog-in{to{opacity:1;transform:translateY(0) scale(1)}}\n        @keyframes discover-sheet-in{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes discover-dialog-out{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(var(--hp-size-18)) scale(.985)}}\n        @keyframes discover-sheet-out{from{transform:translateY(0)}to{transform:translateY(100%)}}\n        \n        @media(prefers-reduced-motion:reduce){.kinetic-moodboard__board,.kinetic-moodboard__tile img,.kinetic-moodboard__label,.kinetic-moodboard__search-header{transition-duration:.01ms!important;transition-delay:0s!important}.kinetic-moodboard__dialog-backdrop,.kinetic-moodboard__dialog-backdrop.is-closing,.kinetic-moodboard__dialog,.kinetic-moodboard__dialog-backdrop.is-closing .kinetic-moodboard__dialog{animation-duration:.01ms!important;animation-iteration-count:1!important}}
        .kinetic-moodboard__dialog-close{border:0;border-radius:50%;width:var(--hp-size-36);height:var(--hp-size-36);background:var(--hp-color-surface-raised);color:var(--hp-color-text);font-size:var(--hp-size-22);cursor:pointer}
        .kinetic-moodboard__store-sub{color:var(--hp-color-text-muted);font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-normal) var(--hp-font-family);margin-top:var(--hp-size-4)}
        @media(max-width:640px){.kinetic-moodboard__search-header{padding:var(--hp-size-12)}.kinetic-moodboard__search-shell{height:56px;width:calc(100vw - var(--hp-size-24))}.kinetic-moodboard__search-results{top:var(--hp-size-80)}.kinetic-moodboard__dialog-backdrop{padding:0;padding-top:max(0px,env(safe-area-inset-top))}.kinetic-moodboard__dialog{width:100%;max-height:min(92vh,900px);max-height:min(92dvh,900px);padding:0 var(--hp-size-18) calc(var(--hp-size-18) + env(safe-area-inset-bottom));border-radius:var(--hp-size-22) var(--hp-size-22) 0 0;overflow-y:auto;overscroll-behavior:contain}.kinetic-moodboard__dialog-heading{top:0;margin:0 -var(--hp-size-18);padding:var(--hp-size-18)}}
      `}</style>
      <div className="kinetic-moodboard__search-header" aria-hidden={!colorReveal || searchDismissed} style={searchDismissed ? { transform: "translate3d(0,-125%,0)", opacity: 0, pointerEvents: "none" } : undefined}>
        <div className="kinetic-moodboard__search-row">
          <button type="button" className="kinetic-moodboard__search-back" aria-label="Exit Discover and return home" onClick={() => { setSearchQuery(""); setSearchDismissed(true); onExit?.(); }} tabIndex={interactive && !searchDismissed ? 0 : -1}><FiHome size={20} aria-hidden="true" /></button>
        <label className="kinetic-moodboard__search-shell">
          <svg className="kinetic-moodboard__search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7"/><path d="m16 16 4.3 4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          <input className="kinetic-moodboard__search-input" type="search" placeholder="Search stores, products, brands or categories…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} tabIndex={interactive ? 0 : -1} aria-label="Search the brand network" />
        </label>
        </div>
      </div>
      <span className="kinetic-moodboard__reveal-sentinel" aria-hidden="true" />
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
              disabled={!interactive}
              data-reveal-final={index === tiles.length - 1 ? "true" : "false"}
              style={{ transitionDelay: colorReveal ? `${Math.floor(index / columns) * 0.45}s` : "0s" }}
              draggable={false}
            >
              <img src={item.image} alt={item.alt} loading={index < 12 ? 'eager' : 'lazy'} draggable={false} style={{ objectPosition: item.objectPosition || 'center', transitionDelay: colorReveal ? `${Math.floor(index / columns) * 0.45}s` : '0s' }} />
              {showLabels && <span className="kinetic-moodboard__label" style={{ transitionDelay: colorReveal ? `${Math.floor(index / columns) * 0.12}s` : "0s" }}><span className="kinetic-moodboard__category">{item.category}</span><span className="kinetic-moodboard__title">{item.title}</span></span>}
            </button>
          ))}
        </div>
      </div>
      {normalizedSearch.length >= 1 && interactive && !searchDismissed && (
        <div className="kinetic-moodboard__search-results" role="listbox" aria-label="Predictive search suggestions">
          {networkLoading && <div className="kinetic-moodboard__search-status">Searching across stores…</div>}
          {!networkLoading && networkError && <div className="kinetic-moodboard__search-status">{networkError}</div>}
          {!networkLoading && !networkError && searchStores.length === 0 && searchCategories.length === 0 && matchingProducts.length === 0 && <div className="kinetic-moodboard__search-status">No matches yet. Try a store, product or category.</div>}
          {searchStores.length > 0 && <div className="kinetic-moodboard__suggestion-group"><div className="kinetic-moodboard__suggestion-heading">STORES</div>{searchStores.map((store) => <a className="kinetic-moodboard__suggestion" href={store.href} key={store.key}><span className="kinetic-moodboard__suggestion-icon">⌂</span><span className="kinetic-moodboard__suggestion-text"><span className="kinetic-moodboard__suggestion-name">{store.name}</span><span className="kinetic-moodboard__suggestion-detail">Store · Fashion & lifestyle</span></span></a>)}</div>}
          {searchCategories.length > 0 && <div className="kinetic-moodboard__suggestion-group"><div className="kinetic-moodboard__suggestion-heading">CATEGORIES</div>{searchCategories.map((category) => <button type="button" className="kinetic-moodboard__suggestion kinetic-moodboard__suggestion-button" key={category} onClick={() => setSearchQuery(category)}><span className="kinetic-moodboard__suggestion-icon">⌕</span><span className="kinetic-moodboard__suggestion-text"><span className="kinetic-moodboard__suggestion-name">{category}</span><span className="kinetic-moodboard__suggestion-detail">Browse category</span></span></button>)}</div>}
          {matchingProducts.length > 0 && <div className="kinetic-moodboard__suggestion-group"><div className="kinetic-moodboard__suggestion-heading">PRODUCTS</div>{matchingProducts.map((product) => <a className="kinetic-moodboard__result" href={product.href} key={product.storeKey + product.id}>
            {product.image_url ? <img className="kinetic-moodboard__result-image" src={product.image_url} alt="" /> : <div className="kinetic-moodboard__result-image" />}
            <div className="kinetic-moodboard__result-meta"><div className="kinetic-moodboard__result-name">{product.name}</div><div className="kinetic-moodboard__result-store">{product.storeName} · {product.category}{product.subcategory ? ' / ' + product.subcategory : ''}</div></div>
            <div className="kinetic-moodboard__result-price">{Number(product.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</div>
          </a>)}</div>}
        </div>
      )}
      {activeDiscovery && interactive && (
        <div className={`kinetic-moodboard__dialog-backdrop${isDiscoveryClosing ? " is-closing" : ""}`} onClick={closeDiscovery} onAnimationEnd={finishDiscoveryClose}>
          <div className="kinetic-moodboard__dialog" role="dialog" aria-modal="true" aria-labelledby="discover-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="kinetic-moodboard__dialog-heading"><div className="kinetic-moodboard__dialog-title-row"><div className="kinetic-moodboard__dialog-title" id="discover-dialog-title">{activeDiscovery.category}</div><button className="kinetic-moodboard__dialog-close" type="button" aria-label="Close" onClick={closeDiscovery}>×</button></div><div className="kinetic-moodboard__store-sub">{({ Style: "Explore fashion, accessories, and everyday style.", Fashion: "Discover pieces that express your style.", Spaces: "Explore inspiring interiors and spaces.", Living: "Thoughtful pieces for everyday living.", Objects: "Everyday objects, thoughtfully designed.", Culture: "Discover ideas, places, and inspiration.", Ideas: "Fresh ideas and creative inspiration.", Workspaces: "Spaces designed for focus and creativity.", Everyday: "Essentials for everyday life.", Explore: "Discover something new." } as Record<string, string>)[activeDiscovery.category] || `Explore ${activeDiscovery.category.toLowerCase()} through curated stores and collections.`}</div></div>
            
            <div className="kinetic-moodboard__store-list">
              {networkLoading && <div className="kinetic-moodboard__search-status">Loading store directory…</div>}
              {!networkLoading && networkError && <div className="kinetic-moodboard__search-status">{networkError}</div>}
              {!networkLoading && !networkError && discoveryStores.length === 0 && <div className="kinetic-moodboard__search-status">No stores are available.</div>}
              {discoveryStores.map((store) => <div className="kinetic-moodboard__store-card" key={store.key}><div className="kinetic-moodboard__store-topline"><div className="kinetic-moodboard__store-name">{store.name}</div><a className="kinetic-moodboard__store-open" href={store.href} onClick={() => { try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ discovery: activeDiscovery, position: positionRef.current })); } catch {} }}>Visit {store.name} ↗</a></div><div className="kinetic-moodboard__store-link-row"><div className="kinetic-moodboard__store-description">{store.description}</div></div></div>)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};


export default KineticMoodboard;
