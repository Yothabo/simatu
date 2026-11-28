import React, { useMemo, useState } from 'react';
import type { MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';

type Props = { items: MoodboardItem[]; onItemClick?: (item: MoodboardItem) => void };
type ShapeId = 'horizontal-2' | 'vertical-2' | 'l-3' | 'square-4' | 'wide-8';
type Shape = { id: ShapeId; label: string; cells: Array<[number, number]>; width: number; height: number; note?: string };
type AdDraft = { id: number; shape: ShapeId; anchor: number };
const INVENTORY_COLUMNS = 6, INVENTORY_ROWS = 8, INVENTORY_COUNT = 46, INVENTORY_SLOTS = INVENTORY_COLUMNS * INVENTORY_ROWS;
const SHAPES: Shape[] = [
  { id: 'horizontal-2', label: 'Horizontal · 2', cells: [[0, 0], [0, 1]], width: 2, height: 1 },
  { id: 'vertical-2', label: 'Vertical · 2', cells: [[0, 0], [1, 0]], width: 1, height: 2 },
  { id: 'l-3', label: 'L · 3', cells: [[0, 0], [0, 1], [1, 0]], width: 2, height: 2 },
  { id: 'square-4', label: 'Square · 4', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
  { id: 'wide-8', label: 'Wide · 8', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3]], width: 4, height: 2, note: 'Occasional premium placement' },
];
function shapeFor(id: ShapeId) { return SHAPES.find((shape) => shape.id === id)!; }
function cellsFor(ad: AdDraft) {
  const shape = shapeFor(ad.shape), row = Math.floor(ad.anchor / INVENTORY_COLUMNS), col = ad.anchor % INVENTORY_COLUMNS;
  return shape.cells.map(([dr, dc]) => (row + dr) * INVENTORY_COLUMNS + col + dc);
}
export default function AdminMoodboardLayoutPreview({ items, onItemClick }: Props) {
  const [selectedShape, setSelectedShape] = useState<ShapeId>('horizontal-2');
  const [ads, setAds] = useState<AdDraft[]>([]);
  const categories = useMemo(() => items.slice(0, 18), [items]);
  const occupied = useMemo(() => new Set(ads.flatMap(cellsFor)), [ads]);
  const selected = shapeFor(selectedShape);
  const canPlace = (anchor: number) => {
    const row = Math.floor(anchor / INVENTORY_COLUMNS), col = anchor % INVENTORY_COLUMNS;
    const cells = selected.cells.map(([dr, dc]) => (row + dr) * INVENTORY_COLUMNS + col + dc);
    return anchor < INVENTORY_COUNT
      && selected.cells.every(([dr, dc]) => row + dr < INVENTORY_ROWS && col + dc < INVENTORY_COLUMNS)
      && cells.every((slot) => slot < INVENTORY_COUNT && !occupied.has(slot));
  };
  const placeAd = (anchor: number) => {
    if (!canPlace(anchor)) return;
    setAds((current) => [...current, { id: Date.now(), shape: selectedShape, anchor }]);
  };
  const adStyle = (ad: AdDraft): React.CSSProperties => {
    const shape = shapeFor(ad.shape), row = Math.floor(ad.anchor / INVENTORY_COLUMNS), col = ad.anchor % INVENTORY_COLUMNS;
    return { gridRow: row + 1 + ' / span ' + shape.height, gridColumn: col + 1 + ' / span ' + shape.width,
      clipPath: ad.shape === 'l-3' ? 'polygon(0 0,100% 0,100% 50%,50% 50%,50% 100%,0 100%)' : undefined };
  };
  return (
    <div className="admin-moodboard-layout-preview" aria-label="Moodboard categories on left and ad inventory on right">
      <div className="admin-moodboard-layout-preview__composer">
        <div className="admin-moodboard-layout-preview__composer-heading"><span>AD FOOTPRINT</span><small>{ads.length} draft {ads.length === 1 ? 'placement' : 'placements'} · preview only</small></div>
        <div className="admin-moodboard-layout-preview__shape-list" role="group" aria-label="Choose ad footprint">
          {SHAPES.map((shape) => <button type="button" key={shape.id} className={selectedShape === shape.id ? 'is-selected' : ''} onClick={() => setSelectedShape(shape.id)} aria-pressed={selectedShape === shape.id}>
            <span className="admin-moodboard-layout-preview__shape-icon" aria-hidden="true">{shape.cells.map(([r, c]) => <i key={r + '-' + c} style={{ gridRow: r + 1, gridColumn: c + 1 }} />)}</span><span>{shape.label}</span>
          </button>)}
        </div>
        <p className="admin-moodboard-layout-preview__instruction">{selected.note || 'Choose a shape, then tap an available duplicate tile. Ad footprints expand over tile gaps without resizing the grid.'}</p>
      </div>
      <div className="admin-moodboard-layout-preview__workspace">
        <section className="admin-moodboard-layout-preview__categories" aria-label="Unique discovery categories">
          <header><span>DISCOVERY</span><small>{categories.length} categories</small></header>
          <div className="admin-moodboard-layout-preview__category-grid">
            {categories.map((item) => <button type="button" key={item.id} className="admin-moodboard-layout-preview__category" onClick={() => onItemClick?.(item)} aria-label={item.category + ' category tile'}>
              <img src={item.image} alt={item.alt} draggable={false}/><span>{item.category}</span>
            </button>)}
          </div>
        </section>
        <section className="admin-moodboard-layout-preview__inventory" aria-label="Duplicate tile ad inventory">
          <header><span>AD CANVAS</span><small>{INVENTORY_COUNT} duplicate units</small></header>
          <div className="admin-moodboard-layout-preview__inventory-board" role="grid" aria-label="46 duplicate tile ad inventory">
            {Array.from({ length: INVENTORY_SLOTS }, (_, index) => index).map((index) => index < INVENTORY_COUNT ? <button type="button" role="gridcell" key={index} className={'admin-moodboard-layout-preview__duplicate-slot' + (canPlace(index) ? ' is-available' : '')} onClick={() => placeAd(index)} aria-label={'Duplicate inventory tile ' + (index + 1) + (canPlace(index) ? ', available for ad' : '')}><span>+</span></button> : <div key={'reserved-' + index} className="admin-moodboard-layout-preview__reserved-slot" aria-hidden="true"/>)}
            <div className="admin-moodboard-layout-preview__ad-layer" aria-label="Ad draft previews">
              {ads.map((ad) => { const shape = shapeFor(ad.shape); return <button type="button" key={ad.id} className={'admin-moodboard-layout-preview__ad-preview admin-moodboard-layout-preview__ad-preview--' + ad.shape} style={adStyle(ad)} onClick={() => setAds((current) => current.filter((entry) => entry.id !== ad.id))} aria-label={'Remove ' + shape.label + ' draft ad'}><span>AD PREVIEW</span><small>{shape.label}</small><b>×</b></button>; })}
            </div>
          </div>
          <aside className="admin-moodboard-layout-preview__right-rail" aria-label="Right perimeter advertising rail"><span>RIGHT AD RAIL</span><small>8 tile units · continuous</small></aside>
          <aside className="admin-moodboard-layout-preview__bottom-rail" aria-label="Bottom perimeter advertising rail"><span>BOTTOM AD RAIL</span><small>6 tile units · continuous</small></aside>
          <div className="admin-moodboard-layout-preview__corner" aria-label="Connected advertising corner">AD</div>
        </section>
      </div>
    </div>
  );
}
