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
}

const DEFAULT_ITEMS: MoodboardItem[] = [
  { id: '01', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=900&q=85', alt: 'Modern architectural interior', category: 'Spaces', title: 'New perspectives' },
  { id: '02', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=85', alt: 'Contemporary fashion editorial', category: 'Style', title: 'Personal expression' },
  { id: '03', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85', alt: 'Minimal fashion collection', category: 'Fashion', title: 'Everyday form' },
  { id: '04', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=85', alt: 'Warm contemporary home', category: 'Living', title: 'Considered living' },
  { id: '05', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85', alt: 'Minimal product design', category: 'Objects', title: 'Designed to matter' },
  { id: '06', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=85', alt: 'Open landscape at golden hour', category: 'Culture', title: 'Room to explore' },
  { id: '07', image: 'https://images.unsplash.com/photo-1523721820098-7fие', alt: 'Creative workspace', category: 'Ideas', title: 'Work in progress' },
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
    <section className={`kinetic-moodboard ${className}`} style={style} aria-label="Explore the moodboard">
      <style>{`
        .kinetic-moodboard{position:relative;width:100%;height:100%;min-height:560px;overflow:hidden;background:#111;color:#fff;isolation:isolate}
        .kinetic-moodboard__viewport{position:absolute;inset:0;overflow:hidden;cursor:grab;touch-action:none;user-select:none}
        .kinetic-moodboard__viewport.is-dragging{cursor:grabbing}
        .kinetic-moodboard__board{position:absolute;top:0;left:0;display:grid;grid-template-columns:repeat(${columns},${tileWidth}px);gap:${gap}px;will-change:transform}
        .kinetic-moodboard__tile{position:relative;display:block;width:${tileWidth}px;height:${tileHeight}px;padding:0;overflow:hidden;border:0;border-radius:${borderRadius}px;background:#252525;color:inherit;text-align:left;cursor:pointer}
        .kinetic-moodboard__tile img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1),filter .5s}
        .kinetic-moodboard__tile:hover img{transform:scale(1.055);filter:brightness(.82)}
        .kinetic-moodboard__tile:after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.65));pointer-events:none}
        .kinetic-moodboard__label{position:absolute;z-index:1;left:16px;right:12px;bottom:15px;display:grid;gap:4px;pointer-events:none}
        .kinetic-moodboard__category{font:600 9px/1.2 sans-serif;letter-spacing:.18em;text-transform:uppercase;opacity:.75}
        .kinetic-moodboard__title{font:500 15px/1.25 sans-serif;letter-spacing:.01em}
        .kinetic-moodboard__hint{position:absolute;z-index:2;right:24px;bottom:22px;display:flex;align-items:center;gap:9px;color:rgba(255,255,255,.65);font:500 10px/1 sans-serif;letter-spacing:.16em;text-transform:uppercase;pointer-events:none}
        .kinetic-moodboard__hint:before{content:"";width:22px;height:1px;background:currentColor}
        @media(max-width:640px){.kinetic-moodboard{min-height:calc(100svh - 72px)}.kinetic-moodboard__hint{right:16px;bottom:16px}}
      `}</style>
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
              onClick={() => handleTileClick(item)}
              aria-label={`${item.category}: ${item.title}`}
              draggable={false}
            >
              <img src={item.image} alt={item.alt} loading={index < 12 ? 'eager' : 'lazy'} draggable={false} style={{ objectPosition: item.objectPosition || 'center' }} />
              {showLabels && <span className="kinetic-moodboard__label"><span className="kinetic-moodboard__category">{item.category}</span><span className="kinetic-moodboard__title">{item.title}</span></span>}
            </button>
          ))}
        </div>
      </div>
      <div className="kinetic-moodboard__hint" aria-hidden="true">Drag to explore</div>
    </section>
  );
};

export default KineticMoodboard;
