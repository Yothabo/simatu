import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodboardSearchBar from './MoodboardSearchBar';
import MoodboardPredictiveSearch from './MoodboardPredictiveSearch';
import { DISCOVERY_MARKETS, DISCOVERY_SUBCATEGORIES } from './discovery-taxonomy';

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
  decorativeOnly?: boolean;
}

const DEFAULT_ITEMS: MoodboardItem[] = DISCOVERY_MARKETS;

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
  decorativeOnly = false,
  className = '',
  style,
  onItemClick,
}) => {
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0, lastX: 0, lastY: 0, lastTime: 0, velocityX: 0, velocityY: 0, moved: false });
  const positionRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDismissed, setSearchDismissed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { if (colorReveal) setSearchDismissed(false); }, [colorReveal]);
  const [networkProducts, setNetworkProducts] = useState<NetworkProduct[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const restorePositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (decorativeOnly) return;
    try {
      const saved = sessionStorage.getItem('simatu-discover-return');
      if (!saved) return;
      sessionStorage.removeItem('simatu-discover-return');
      const context = JSON.parse(saved) as { position?: { x: number; y: number } };
      if (context.position) restorePositionRef.current = context.position;
    } catch {
      sessionStorage.removeItem('simatu-discover-return');
    }
  }, []);

  const sourceItems = items.length ? items : DEFAULT_ITEMS;
  const boardTilePool = useMemo(() => {
    const subcategoryTiles = DISCOVERY_MARKETS.flatMap((market) =>
      (DISCOVERY_SUBCATEGORIES[market.id] || []).map((subcategory) => ({
        id: `${market.id}-${subcategory.id}`,
        image: subcategory.image,
        alt: subcategory.alt,
        category: market.category,
        title: subcategory.title,
      } as MoodboardItem))
    );
    return [...sourceItems, ...subcategoryTiles];
  }, [sourceItems]);
  const tiles = useMemo(() => {
    const random = seededRandom(29);
    const uniquePool = Array.from(new Map(boardTilePool.map((item) => [item.id, item])).values());
    for (let i = uniquePool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [uniquePool[i], uniquePool[j]] = [uniquePool[j], uniquePool[i]];
    }
    const tileCount = 64;
    return uniquePool.slice(0, tileCount);
  }, [boardTilePool]);

  useEffect(() => {
    if (decorativeOnly || !interactive) return;
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
  }, [interactive, decorativeOnly]);
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
  const boardColumns = Math.min(columns, tiles.length);
  const boardRows = Math.ceil(tiles.length / boardColumns);
  const boardWidth = boardColumns * tileWidth + (boardColumns - 1) * gap;
  const boardHeight = boardRows * tileHeight + (boardRows - 1) * gap;

  const applyPosition = useCallback((x: number, y: number) => {
    const next = {
      x: clamp(x, Math.min(0, viewport.width - boardWidth), 0),
      y: clamp(y, Math.min(0, viewport.height - boardHeight), 0),
    };
    positionRef.current = next;
    if (boardRef.current) boardRef.current.style.transform = `translate3d(${next.x}px,${next.y}px,0)`;
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
      const next = { width: entry.contentRect.width, height: entry.contentRect.height };
      setViewport((current) => current.width === next.width && current.height === next.height ? current : next);
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
    if (!dragRef.current.moved) {
      if (onItemClick) onItemClick(item);
      else if (!decorativeOnly) navigate(`/discover/${item.id}`, { state: { discovery: item, position: positionRef.current } });
    }
    dragRef.current.moved = false;
  };

  return (
    <section className={`kinetic-moodboard ${decorativeOnly ? 'is-decorative ' : ''}${className}${colorReveal ? ' is-color-revealing' : ''}${interactive ? ' is-interactive' : ''}`} style={style} aria-label="Explore the moodboard">
      <style>{`
        .kinetic-moodboard.is-decorative .kinetic-moodboard__tile{opacity:1;transform:none;cursor:default}.kinetic-moodboard.is-decorative .kinetic-moodboard__tile img{filter:grayscale(1)}.kinetic-moodboard.is-decorative .kinetic-moodboard__label,.kinetic-moodboard.is-decorative .kinetic-moodboard__search-header,.kinetic-moodboard.is-decorative .kinetic-moodboard__join-network,.kinetic-moodboard.is-decorative .kinetic-moodboard__search-results{display:none!important}.kinetic-moodboard.is-decorative .kinetic-moodboard__viewport{pointer-events:none;cursor:default}
        .kinetic-moodboard{position:relative;display:block;width:100%;height:100%;min-height:0;margin:0;padding:0;box-sizing:border-box;overflow:hidden;background:transparent;color:var(--hp-color-text);isolation:isolate}.kinetic-moodboard:before,.kinetic-moodboard:after{content:"";position:absolute;left:0;right:0;z-index:8;pointer-events:none}.kinetic-moodboard:before{top:0;height:clamp(160px,28vh,320px);background:linear-gradient(180,rgba(0,0,0,.82) 0%,rgba(0,0,0,.48) 42%,rgba(0,0,0,0) 100%)}.kinetic-moodboard:after{bottom:0;height:clamp(180px,32vh,360px);background:linear-gradient(0,rgba(0,0,0,.82) 0%,rgba(0,0,0,.42) 45%,rgba(0,0,0,0) 100%)}
        .kinetic-moodboard__reveal-sentinel{position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;transition:opacity 1.25s ease}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__reveal-sentinel{opacity:.01}\n        .kinetic-moodboard__viewport{position:absolute;inset:0;overflow:hidden;cursor:grab;touch-action:none;user-select:none}
        .kinetic-moodboard__viewport.is-dragging{cursor:grabbing}
        .kinetic-moodboard__join-network{position:absolute;z-index:12;right:clamp(var(--hp-size-18),4vw,var(--hp-size-48));bottom:max(clamp(var(--hp-size-20),4vh,var(--hp-size-42)),env(safe-area-inset-bottom));display:inline-flex;align-items:center;justify-content:center;gap:var(--hp-size-12);min-height:var(--hp-size-52);padding:0 clamp(var(--hp-size-20),3vw,var(--hp-size-32));border:0;border-radius:var(--hp-radius-pill);background:rgba(255,255,255,.15);color:#fff;font:var(--hp-font-weight-semibold) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;backdrop-filter:blur(26px) saturate(185%);-webkit-backdrop-filter:blur(26px) saturate(185%);box-shadow:0 var(--hp-size-12) var(--hp-size-36) rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(255,255,255,.06);cursor:pointer;transition:background .24s ease,transform .24s ease,box-shadow .24s ease}
         .kinetic-moodboard.is-color-revealing .kinetic-moodboard__join-network{animation:discover-control-in .72s cubic-bezier(.2,.65,.25,1) both;opacity:1}\n        @keyframes discover-control-in{from{transform:translate3d(0,var(--hp-size-12),0)}to{transform:translate3d(0,0,0)}}\n        @keyframes discover-tile-in{from{opacity:0;transform:translate3d(0,-16px,0)}to{opacity:1;transform:translate3d(0,0,0)}}\n        .kinetic-moodboard__join-network:hover{background:rgba(255,255,255,.2);box-shadow:0 var(--hp-size-14) var(--hp-size-40) rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -1px 0 rgba(255,255,255,.08);transform:translateY(-2px)}
        .kinetic-moodboard__join-network:active{transform:scale(.97)}
        .kinetic-moodboard__join-network:focus-visible{outline:2px solid rgba(255,255,255,.85);outline-offset:4px}
        .kinetic-moodboard__join-network span{font-size:var(--hp-font-size-base);letter-spacing:normal}
        @media(max-width:640px){.kinetic-moodboard__join-network{right:max(var(--hp-size-16),env(safe-area-inset-right));bottom:max(var(--hp-size-18),env(safe-area-inset-bottom));min-height:var(--hp-size-48);padding:0 var(--hp-size-20);font-size:var(--hp-font-size-xs)}}

        .kinetic-moodboard__board{position:absolute;top:0;left:0;display:grid;grid-template-columns:repeat(${boardColumns},${tileWidth}px);gap:${gap}px;will-change:transform;background:transparent}
        .kinetic-moodboard__tile{position:relative;display:block;width:${tileWidth}px;height:${tileHeight}px;padding:0;overflow:hidden;border:0;border-radius:${borderRadius}px;background:transparent;color:inherit;text-align:left;cursor:pointer;opacity:1;transform:none}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__tile{animation:discover-tile-in .72s cubic-bezier(.2,.65,.25,1) both;animation-delay:calc(var(--discover-row, 0) * 42ms)}
        .kinetic-moodboard__tile img{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1);transition:filter 1s ease,transform .34s ease}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__tile img{filter:grayscale(0)}
        .kinetic-moodboard__tile:hover img{transform:scale(1.055);filter:brightness(.82)}
         .kinetic-moodboard__search-header{position:absolute;z-index:10;top:0;left:0;right:0;display:flex;justify-content:center;padding:var(--hp-size-18) var(--hp-size-20);transform:translate3d(0,-125%,0);opacity:1;pointer-events:none;transition:transform .72s cubic-bezier(.2,.65,.25,1)}.kinetic-moodboard__search-row{width:min(var(--hp-size-700),calc(100vw - var(--hp-size-40)));display:flex;align-items:center;gap:var(--hp-size-10)}.kinetic-moodboard__search-back{width:var(--hp-size-62);height:var(--hp-size-62);flex:0 0 var(--hp-size-62);display:flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:rgba(128,128,128,.35);color:#fff;backdrop-filter:blur(26px) saturate(185%);-webkit-backdrop-filter:blur(26px) saturate(185%);box-shadow:0 var(--hp-size-12) var(--hp-size-36) rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(255,255,255,.06);cursor:pointer;transition:background .24s ease,transform .24s,box-shadow .24s}.kinetic-moodboard__search-back:hover{background:rgba(150,150,150,.42);color:#fff;box-shadow:0 var(--hp-size-14) var(--hp-size-40) rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -1px 0 rgba(255,255,255,.08);transform:translateY(-2px)}.kinetic-moodboard__search-back:active{transform:scale(.96)}.kinetic-moodboard__search-back:focus-visible{outline:var(--hp-size-xs) solid var(--hp-color-border-strong);outline-offset:var(--hp-size-xs)}.kinetic-moodboard__search-back svg{width:var(--hp-size-18);height:var(--hp-size-18);color:#fff}
         .kinetic-moodboard.is-color-revealing .kinetic-moodboard__search-header{transform:translate3d(0,0,0);transition-delay:0s}.kinetic-moodboard.is-interactive .kinetic-moodboard__search-header{pointer-events:auto}
        .kinetic-moodboard__search-row.menu-expanded .kinetic-moodboard__search-shell{height:var(--hp-size-200);align-items:flex-start;padding-top:var(--hp-size-18);transition:height .3s ease,padding .3s ease}.kinetic-moodboard__search-row.menu-expanded .kinetic-moodboard__search-input{align-self:flex-start}.kinetic-moodboard__search-row.menu-expanded .kinetic-moodboard__menu-button{height:var(--hp-size-200);align-self:stretch;transition:height .3s ease}
        .kinetic-moodboard__search-shell{width:auto;min-width:0;flex:1;height:var(--hp-size-62);display:flex;align-items:center;gap:var(--hp-size-12);padding:0 var(--hp-size-18);border:0;border-radius:var(--hp-radius-pill);background:rgba(128,128,128,.35);backdrop-filter:blur(26px) saturate(185%);-webkit-backdrop-filter:blur(26px) saturate(185%);box-shadow:0 var(--hp-size-12) var(--hp-size-36) rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(255,255,255,.06);color:#fff}
        .kinetic-moodboard__search-input{-webkit-appearance:none;appearance:none;width:100%;min-width:0;margin:0;padding:0;border:0;border-radius:0;outline:none;box-shadow:none;background:transparent!important;color:#fff;font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.02em;caret-color:var(--hp-color-text-subtle)}
        .kinetic-moodboard__search-input:focus,.kinetic-moodboard__search-input:focus-visible{outline:none!important;border:0!important;box-shadow:none!important;background:transparent!important}
        .kinetic-moodboard__search-input::-webkit-search-decoration,.kinetic-moodboard__search-input::-webkit-search-cancel-button,.kinetic-moodboard__search-input::-webkit-search-results-button,.kinetic-moodboard__search-input::-webkit-search-results-decoration{display:none;-webkit-appearance:none}
        .kinetic-moodboard__search-input:-webkit-autofill,.kinetic-moodboard__search-input:-webkit-autofill:hover,.kinetic-moodboard__search-input:-webkit-autofill:focus{-webkit-text-fill-color:var(--hp-color-text);transition:background-color 9999s ease-out 0s;box-shadow:0 0 0 var(--hp-size-1000) transparent inset}
        .kinetic-moodboard__search-input::placeholder{color:#fff;opacity:.72}
        @media(max-width:640px){.kinetic-moodboard__search-header{padding:var(--hp-size-12)}.kinetic-moodboard__search-row{width:100%;gap:var(--hp-size-8)}.kinetic-moodboard__search-back{width:var(--hp-size-55);height:var(--hp-size-55);flex-basis:var(--hp-size-55)}.kinetic-moodboard__search-shell{height:var(--hp-size-44);padding:0 var(--hp-size-14)}}
        .kinetic-moodboard__tile:after{content:"";position:absolute;z-index:1;inset:38% 0 0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,.16) 24%,rgba(0,0,0,.48) 60%,rgba(0,0,0,.76) 100%)}
        .kinetic-moodboard__label{position:absolute;z-index:2;left:var(--hp-size-16);right:var(--hp-size-12);bottom:var(--hp-size-15);display:grid;gap:var(--hp-size-md);pointer-events:none;opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s}.kinetic-moodboard.is-color-revealing .kinetic-moodboard__label{opacity:1;visibility:visible}
        .kinetic-moodboard__category{font:var(--hp-font-weight-semibold) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.18em;text-transform:uppercase;opacity:.75}
        .kinetic-moodboard__title{font:var(--hp-font-weight-medium) var(--hp-font-size-base)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:.01em}
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        .kinetic-moodboard__dialog-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:flex-end;justify-content:center;padding:0;overflow:hidden;box-sizing:border-box;background:transparent;backdrop-filter:blur(0);animation:discover-overlay-in .42s cubic-bezier(.32,.72,0,1) forwards}.kinetic-moodboard__dialog-backdrop.is-closing{animation:discover-overlay-out .48s cubic-bezier(.32,.72,0,1) forwards}
        .kinetic-moodboard__dialog{width:100%;max-height:min(90vh,var(--hp-size-950));max-height:min(90dvh,var(--hp-size-950));min-height:0;margin:0;box-sizing:border-box;overscroll-behavior:contain;overflow-x:hidden;overflow-y:auto;border:var(--hp-border-width) solid var(--hp-color-border);border-bottom:0;border-radius:var(--hp-size-22) var(--hp-size-22) 0 0;background:var(--hp-color-surface);color:var(--hp-color-text);padding:0 var(--hp-size-25) calc(var(--hp-size-25) + env(safe-area-inset-bottom));opacity:1;transform:translateY(100%);animation:discover-sheet-in .48s cubic-bezier(.32,.72,0,1) forwards}.kinetic-moodboard__dialog-backdrop.is-closing .kinetic-moodboard__dialog{animation:discover-sheet-out .48s cubic-bezier(.32,.72,0,1) forwards}
        .kinetic-moodboard__dialog-heading{position:sticky;top:0;z-index:5;display:flex;flex-direction:column;align-items:stretch;gap:0;margin:0 -26px 0;padding:var(--hp-size-18) var(--hp-size-25);background:var(--hp-color-background)}.kinetic-moodboard__dialog-title-row{display:flex;align-items:center;justify-content:space-between;gap:var(--hp-size-12);min-width:0}.kinetic-moodboard__dialog-title-row>div{min-width:0;flex:1}
        .kinetic-moodboard__dialog-title{font:var(--hp-font-weight-medium) var(--hp-font-size-display)/var(--hp-line-height-normal) var(--hp-font-family)}
        .kinetic-moodboard__dialog-intro{font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/1.5 var(--hp-font-family);color:var(--hp-color-text-muted);margin:var(--hp-size-12) 0 var(--hp-size-22)}
        .kinetic-moodboard__store-list{margin-top:var(--hp-size-18)}.kinetic-moodboard__store-card{display:flex;flex-direction:column;align-items:stretch;gap:var(--hp-border-width);padding:var(--hp-size-16) 0;border-bottom:var(--hp-border-width) solid var(--hp-color-border-light);color:var(--hp-color-text);text-decoration:none;opacity:0;transform:translateY(var(--hp-size-12));animation:discover-store-item-in .42s cubic-bezier(.2,.65,.25,1) forwards}.kinetic-moodboard__store-card:last-of-type{border-bottom:0}
        .kinetic-moodboard__store-topline{display:flex;align-items:center;justify-content:space-between;gap:var(--hp-size-12)}
        .kinetic-moodboard__store-link-row{display:block;margin-top:var(--hp-size-md)}
        .kinetic-moodboard__store-name{font:var(--hp-font-weight-medium) var(--hp-font-size-base)/var(--hp-line-height-normal) var(--hp-font-family);color:#fff}
        .kinetic-moodboard__store-description{font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/1.5 var(--hp-font-family);color:var(--hp-color-text-muted);margin:0;min-width:0;max-width:var(--hp-size-520);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow:hidden}
        .kinetic-moodboard__store-open{flex:0 0 auto;font:var(--hp-font-weight-medium) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);color:#fff;white-space:nowrap}
        @keyframes discover-overlay-in{to{background:var(--hp-color-overlay);backdrop-filter:blur(var(--hp-size-10))}}
        @keyframes discover-overlay-out{0%{background:var(--hp-color-overlay);backdrop-filter:blur(var(--hp-size-10))}100%{background:transparent;backdrop-filter:blur(0)}}
        @keyframes discover-dialog-in{to{opacity:1;transform:translateY(0) scale(1)}}\n        @keyframes discover-sheet-in{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes discover-dialog-out{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(var(--hp-size-18)) scale(.985)}}\n        @keyframes discover-sheet-out{from{transform:translateY(0)}to{transform:translateY(100%)}}\n        @keyframes discover-store-item-in{from{opacity:0;transform:translateY(var(--hp-size-12))}to{opacity:1;transform:translateY(0)}}\n        \n        @media(prefers-reduced-motion:reduce){.kinetic-moodboard__join-network{animation-duration:.01ms!important;animation-delay:0s!important}.kinetic-moodboard__board,.kinetic-moodboard__tile,.kinetic-moodboard__tile img,.kinetic-moodboard__label,.kinetic-moodboard__search-header{transition-duration:.01ms!important;transition-delay:0s!important;animation-duration:.01ms!important;animation-delay:0s!important}.kinetic-moodboard__dialog-backdrop,.kinetic-moodboard__dialog-backdrop.is-closing,.kinetic-moodboard__dialog,.kinetic-moodboard__dialog-backdrop.is-closing .kinetic-moodboard__dialog,.kinetic-moodboard__store-card{animation-duration:.01ms!important;animation-iteration-count:1!important}}
        .kinetic-moodboard__dialog-close{border:0;border-radius:50%;width:var(--hp-size-36);height:var(--hp-size-36);background:transparent;color:var(--hp-color-text);font-size:var(--hp-size-22);cursor:pointer}
        .kinetic-moodboard__store-sub{color:var(--hp-color-text-muted);font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-normal) var(--hp-font-family);margin-top:var(--hp-size-md)}
        @media(max-width:640px){.kinetic-moodboard__search-header{padding:var(--hp-size-12)}.kinetic-moodboard__search-shell{height:var(--hp-size-55);width:calc(100vw - var(--hp-size-24))}.kinetic-moodboard__search-results{top:var(--hp-size-80)}.kinetic-moodboard__dialog-backdrop{padding:0;padding-top:max(0px,env(safe-area-inset-top))}.kinetic-moodboard__dialog{width:100%;max-height:min(92vh,900px);max-height:min(92dvh,var(--hp-size-950));padding:0 var(--hp-size-18) calc(var(--hp-size-18) + env(safe-area-inset-bottom));border-radius:var(--hp-size-22) var(--hp-size-22) 0 0;overflow-y:auto;overscroll-behavior:contain}.kinetic-moodboard__dialog-heading{top:0;margin:0 -var(--hp-size-18);padding:var(--hp-size-18)}}
      `}</style>
      <MoodboardSearchBar value={searchQuery} onChange={setSearchQuery} onBack={onExit ? () => { setSearchQuery(""); setSearchDismissed(true); onExit(); } : undefined} visible={colorReveal && !searchDismissed} showMenu onMenuClick={() => setMenuOpen((open) => !open)} className={menuOpen ? "menu-expanded" : ""} />
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
        <div ref={boardRef} className="kinetic-moodboard__board" style={{ transform: `translate3d(${positionRef.current.x}px,${positionRef.current.y}px,0)` }}>
          {tiles.map((item, index) => (
            <button
              type="button"
              className="kinetic-moodboard__tile"
              key={`${item.id}-${index}`}
              onClick={() => { if (dragRef.current.moved) { handleTileClick(item); return; } handleTileClick(item); try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ position: positionRef.current })); } catch {} navigate('/discover/' + item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), { state: { discovery: item, position: positionRef.current } }); }}
              aria-label={`${item.category}: ${item.title}`}
              disabled={!interactive}
              data-reveal-final={index === tiles.length - 1 ? "true" : "false"}
              style={{ '--discover-row': Math.floor(index / columns) } as React.CSSProperties}
              draggable={false}
            >
              <img src={item.image} alt={item.alt} loading={index < 4 ? 'eager' : 'lazy'} decoding="async" draggable={false} style={{ objectPosition: item.objectPosition || 'center', transitionDelay: colorReveal ? `${Math.floor(index / columns) * 0.05}s` : '0s' }} />
              {showLabels && <span className="kinetic-moodboard__label" style={{ transitionDelay: colorReveal ? `${Math.floor(index / columns) * 0.025}s` : "0s" }}><span className="kinetic-moodboard__category">{item.category}</span><span className="kinetic-moodboard__title">{item.title}</span></span>}
            </button>
          ))}
        </div>
      </div>


      {normalizedSearch.length >= 1 && interactive && !searchDismissed && <MoodboardPredictiveSearch query={searchQuery} loading={networkLoading} error={networkError} stores={searchStores.map(store => ({ key: store.key, name: store.name, href: store.href }))} categories={searchCategories} products={matchingProducts} onCategorySelect={setSearchQuery} />}

    </section>
  );
};


export default KineticMoodboard;
