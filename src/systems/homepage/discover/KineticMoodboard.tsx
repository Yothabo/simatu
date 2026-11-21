import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

  const normalizedSearch = searchQuery.trim().toLowerCase();
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
        .kinetic-moodboard__tile.is-search-hidden{visibility:hidden;pointer-events:none}
        .kinetic-moodboard__search-header{position:absolute;z-index:10;top:0;left:0;right:0;display:flex;justify-content:center;padding:18px 20px;transform:translate3d(0,-125%,0);opacity:0;pointer-events:none;transition:transform .85s cubic-bezier(.2,.65,.25,1),opacity .65s ease;}
        .kinetic-moodboard.is-color-revealing .kinetic-moodboard__search-header{transform:translate3d(0,0,0);opacity:1;pointer-events:auto}
        .kinetic-moodboard__search-shell{width:min(560px,calc(100vw - 40px));height:48px;display:flex;align-items:center;gap:12px;padding:0 18px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:#292929;box-shadow:0 12px 36px rgba(0,0,0,.3);color:#f2f2f2}
        .kinetic-moodboard__search-icon{width:16px;height:16px;flex:0 0 16px;opacity:.62}
        .kinetic-moodboard__search-input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#f2f2f2;font:400 13px/1.2 sans-serif;letter-spacing:.02em}
        .kinetic-moodboard__search-input::placeholder{color:rgba(255,255,255,.45)}
        @media(max-width:640px){.kinetic-moodboard__search-header{padding:12px 12px}.kinetic-moodboard__search-shell{height:44px;width:calc(100vw - 24px)}}
        .kinetic-moodboard__tile:after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.65));pointer-events:none}
        .kinetic-moodboard__label{position:absolute;z-index:1;left:16px;right:12px;bottom:15px;display:grid;gap:4px;pointer-events:none}
        .kinetic-moodboard__category{font:600 9px/1.2 sans-serif;letter-spacing:.18em;text-transform:uppercase;opacity:.75}
        .kinetic-moodboard__title{font:500 15px/1.25 sans-serif;letter-spacing:.01em}
        .kinetic-moodboard__hint{position:absolute;z-index:2;right:24px;bottom:22px;display:flex;align-items:center;gap:9px;color:rgba(255,255,255,.65);font:500 10px/1 sans-serif;letter-spacing:.16em;text-transform:uppercase;pointer-events:none}
        .kinetic-moodboard__hint:before{content:"";width:22px;height:1px;background:currentColor}
        @media(max-width:640px){.kinetic-moodboard{height:100%;min-height:0}.kinetic-moodboard__hint{right:16px;bottom:16px}}
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
              className={`kinetic-moodboard__tile${normalizedSearch && !`${item.category} ${item.title}`.toLowerCase().includes(normalizedSearch) ? ' is-search-hidden' : ''}`}
              key={`${item.id}-${index}`}
              onClick={() => handleTileClick(item)}
              aria-label={`${item.category}: ${item.title}`}
              draggable={false}
            >
              <img src={item.image} alt={item.alt} loading={index < 12 ? 'eager' : 'lazy'} draggable={false} style={{ objectPosition: item.objectPosition || 'center', transitionDelay: colorReveal ? `${Math.floor(index / columns) * 0.42}s` : '0s' }} />
              {showLabels && <span className="kinetic-moodboard__label"><span className="kinetic-moodboard__category">{item.category}</span><span className="kinetic-moodboard__title">{item.title}</span></span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KineticMoodboard;
