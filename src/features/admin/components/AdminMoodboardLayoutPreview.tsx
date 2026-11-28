import React, { useMemo, useState } from 'react';
import type { MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';
import { DISCOVERY_SUBCATEGORIES } from '../../../systems/homepage/discover/discovery-taxonomy';

type Props = { items: MoodboardItem[]; onItemClick?: (item: MoodboardItem) => void };
type ShapeId = 'horizontal-2' | 'vertical-2' | 'l-3' | 'square-4' | 'wide-8';
type Shape = { id: ShapeId; label: string; cells: Array<[number, number]>; width: number; height: number; note?: string };
type AdDraft = { id: number; shape: ShapeId; anchor: number };
const BOARD_COLUMNS = 8, BOARD_ROWS = 8, BOARD_COUNT = 64;
const TILE_WIDTH = 230, TILE_HEIGHT = 290, TILE_GAP = 16;
const SHAPES: Shape[] = [
  { id: 'horizontal-2', label: 'Horizontal · 2', cells: [[0, 0], [0, 1]], width: 2, height: 1 },
  { id: 'vertical-2', label: 'Vertical · 2', cells: [[0, 0], [1, 0]], width: 1, height: 2 },
  { id: 'l-3', label: 'L · 3', cells: [[0, 0], [0, 1], [1, 0]], width: 2, height: 2 },
  { id: 'square-4', label: 'Square · 4', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
  { id: 'wide-8', label: 'Wide · 8', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3]], width: 4, height: 2, note: 'Premium footprint · occupies eight homepage positions' },
];
function shapeFor(id: ShapeId) { return SHAPES.find((shape) => shape.id === id)!; }
function cellsFor(ad: AdDraft) {
  const shape = shapeFor(ad.shape), row = Math.floor(ad.anchor / BOARD_COLUMNS), col = ad.anchor % BOARD_COLUMNS;
  return shape.cells.map(([dr, dc]) => (row + dr) * BOARD_COLUMNS + col + dc);
}
function seededRandom(seed: number) {
  let value = seed;
  return () => { value = (value * 16807) % 2147483647; return (value - 1) / 2147483646; }
}
function homepagePool(items: MoodboardItem[]) {
  const subcategoryTiles = items.flatMap((market) => (DISCOVERY_SUBCATEGORIES[market.id] || []).map((subcategory) => ({
    id: market.id + '-' + subcategory.id, image: subcategory.image, alt: subcategory.alt, category: market.category, title: subcategory.title,
  } as MoodboardItem)));
  const pool = Array.from(new Map([...items, ...subcategoryTiles].map((item) => [item.id, item])).values());
  const random = seededRandom(29);
  for (let i = pool.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool;
}
export default function AdminMoodboardLayoutPreview({ items, onItemClick }: Props) {
  const [selectedShape, setSelectedShape] = useState<ShapeId>('horizontal-2');
  const [ads, setAds] = useState<AdDraft[]>([]);
  const pool = useMemo(() => homepagePool(items), [items]);
  const homepageTiles = pool.slice(0, BOARD_COUNT);
  const occupied = useMemo(() => new Set(ads.flatMap(cellsFor)), [ads]);
  const selected = shapeFor(selectedShape);
  const canPlace = (anchor: number) => {
    const row = Math.floor(anchor / BOARD_COLUMNS), col = anchor % BOARD_COLUMNS;
    const cells = selected.cells.map(([dr, dc]) => (row + dr) * BOARD_COLUMNS + col + dc);
    return anchor < BOARD_COUNT && selected.cells.every(([dr, dc]) => row + dr < BOARD_ROWS && col + dc < BOARD_COLUMNS)
      && cells.every((slot) => slot < BOARD_COUNT && !occupied.has(slot));
  };
  const placeAd = (anchor: number) => { if (canPlace(anchor)) setAds((current) => [...current, { id: Date.now(), shape: selectedShape, anchor }]); };
  const adStyle = (ad: AdDraft): React.CSSProperties => {
    const shape = shapeFor(ad.shape), row = Math.floor(ad.anchor / BOARD_COLUMNS), col = ad.anchor % BOARD_COLUMNS;
    return { gridRow: row + 1 + ' / span ' + shape.height, gridColumn: col + 1 + ' / span ' + shape.width,
      clipPath: ad.shape === 'l-3' ? 'polygon(0 0,100% 0,100% 50%,50% 50%,50% 100%,0 100%)' : undefined };
  };
  return (
    <div className="admin-moodboard-layout-preview" aria-label="Homepage-matched Moodboard and advertising preview">
      <div className="admin-moodboard-layout-preview__composer">
        <div className="admin-moodboard-layout-preview__composer-heading"><span>AD FOOTPRINT</span><small>{ads.length} draft placement{ads.length === 1 ? '' : 's'} · {ads.reduce((sum, ad) => sum + shapeFor(ad.shape).cells.length, 0)} homepage tile units reserved</small></div>
        <div className="admin-moodboard-layout-preview__shape-list" role="group" aria-label="Choose ad footprint">
          {SHAPES.map((shape) => <button type="button" key={shape.id} className={selectedShape === shape.id ? 'is-selected' : ''} onClick={() => setSelectedShape(shape.id)} aria-pressed={selectedShape === shape.id}>
            <span className="admin-moodboard-layout-preview__shape-icon" aria-hidden="true">{shape.cells.map(([r, c]) => <i key={r + '-' + c} style={{ gridRow: r + 1, gridColumn: c + 1 }} />)}</span><span>{shape.label}</span>
          </button>)}
        </div>
        <p className="admin-moodboard-layout-preview__instruction">{selected.note || 'Choose a footprint, then select homepage tile positions. Ads replace discovery tiles in-place; the board never grows, reflows, or adds perimeter space.'}</p>
      </div>
      <section className="admin-moodboard-layout-preview__board-section" aria-label="Homepage 8 by 8 board preview">
        <header className="admin-moodboard-layout-preview__board-header"><span>HOMEPAGE MOODBOARD</span><small>8 × 8 · {BOARD_COUNT} positions · {pool.length} unique taxonomy tiles · {homepageTiles.length} shown</small></header>
        <div className="admin-moodboard-layout-preview__scroll">
          <div className="admin-moodboard-layout-preview__board" role="grid" aria-label="Homepage 64-tile board" style={{ gridTemplateColumns: 'repeat(8, 230px)', gridTemplateRows: 'repeat(8, 290px)' }}>
            {homepageTiles.map((item, index) => <button type="button" role="gridcell" key={item.id} className={'admin-moodboard-layout-preview__tile' + (canPlace(index) ? ' is-ad-target' : '')} onClick={() => occupied.has(index) ? undefined : canPlace(index) ? placeAd(index) : onItemClick?.(items.find((market) => market.id === item.id) || items.find((market) => item.id.startsWith(market.id + '-')) || item)} aria-label={occupied.has(index) ? 'Ad occupied position ' + (index + 1) : canPlace(index) ? 'Select position ' + (index + 1) + ' for ad placement' : item.category + ': ' + item.title}>
              <img src={item.image} alt={item.alt} draggable={false} loading={index < 8 ? 'eager' : 'lazy'} /><span>{item.category}</span>
            </button>)}
            <div className="admin-moodboard-layout-preview__ad-layer" aria-label="Ad draft placements">
              {ads.map((ad) => { const shape = shapeFor(ad.shape); return <button type="button" key={ad.id} className={'admin-moodboard-layout-preview__ad-preview admin-moodboard-layout-preview__ad-preview--' + ad.shape} style={adStyle(ad)} onClick={() => setAds((current) => current.filter((entry) => entry.id !== ad.id))} aria-label={'Remove ' + shape.label + ' draft ad'}><span>SIMATU AD</span><small>{shape.label} · {shape.cells.length} tiles</small><b>×</b></button>; })}
            </div>
          </div>
        </div>
        <footer className="admin-moodboard-layout-preview__board-footer"><span>BOARD SIZE FIXED</span><small>Ads replace selected discovery tiles. Draft placements only — not published.</small></footer>
      </section>
    </div>
  );
}
