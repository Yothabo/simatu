import React, { useMemo, useState } from 'react';
import type { MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';

type Props = {
  items: MoodboardItem[];
  onItemClick?: (item: MoodboardItem) => void;
};
type ShapeId = 'horizontal-2' | 'vertical-2' | 'l-3' | 'square-4' | 'wide-8';
type Shape = { id: ShapeId; label: string; cells: Array<[number, number]>; width: number; height: number; note?: string };
type AdDraft = { id: number; shape: ShapeId; anchor: number };
const TILE_COUNT = 64;
const SHAPES: Shape[] = [
  { id: 'horizontal-2', label: 'Horizontal · 2', cells: [[0, 0], [0, 1]], width: 2, height: 1 },
  { id: 'vertical-2', label: 'Vertical · 2', cells: [[0, 0], [1, 0]], width: 1, height: 2 },
  { id: 'l-3', label: 'L · 3', cells: [[0, 0], [0, 1], [1, 0]], width: 2, height: 2 },
  { id: 'square-4', label: 'Square · 4', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], width: 2, height: 2 },
  { id: 'wide-8', label: 'Wide · 8', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3]], width: 4, height: 2, note: 'Occasional premium placement' },
];
function shapeFor(id: ShapeId) { return SHAPES.find((shape) => shape.id === id)!; }
function cellsFor(ad: AdDraft) {
  const shape = shapeFor(ad.shape);
  const row = Math.floor(ad.anchor / 8), col = ad.anchor % 8;
  return shape.cells.map(([dr, dc]) => (row + dr) * 8 + col + dc);
}
export default function AdminMoodboardLayoutPreview({ items, onItemClick }: Props) {
  const [selectedShape, setSelectedShape] = useState<ShapeId>('horizontal-2');
  const [ads, setAds] = useState<AdDraft[]>([]);
  const placements = useMemo(() => {
    const slots: Array<MoodboardItem | null> = Array(TILE_COUNT).fill(null);
    items.slice(0, TILE_COUNT).forEach((item, index) => {
      const slot = Math.floor(index * TILE_COUNT / Math.max(items.length, 1));
      slots[slot] = item;
    });
    return slots;
  }, [items]);
  const occupied = useMemo(() => new Set(ads.flatMap(cellsFor)), [ads]);
  const selected = shapeFor(selectedShape);
  const canPlace = (anchor: number) => {
    const row = Math.floor(anchor / 8), col = anchor % 8;
    const cells = selected.cells.map(([dr, dc]) => (row + dr) * 8 + col + dc);
    return selected.cells.every(([dr, dc]) => row + dr < 8 && col + dc < 8)
      && cells.every((slot) => placements[slot] === null && !occupied.has(slot));
  };
  const placeAd = (anchor: number) => {
    if (!canPlace(anchor)) return;
    setAds((current) => [...current, { id: Date.now(), shape: selectedShape, anchor }]);
  };
  const adStyle = (ad: AdDraft): React.CSSProperties => {
    const shape = shapeFor(ad.shape), row = Math.floor(ad.anchor / 8), col = ad.anchor % 8;
    return {
      gridRow: row + 1 + ' / span ' + shape.height,
      gridColumn: col + 1 + ' / span ' + shape.width,
      margin: 'calc(var(--admin-moodboard-gap) * -0.5)',
      clipPath: ad.shape === 'l-3' ? 'polygon(0 0,100% 0,100% 50%,50% 50%,50% 100%,0 100%)' : undefined,
    };
  };
  return (
    <div className="admin-moodboard-layout-preview" aria-label="Moodboard discovery canvas with ad layout composer">
      <div className="admin-moodboard-layout-preview__composer">
        <div className="admin-moodboard-layout-preview__composer-heading">
          <span>AD FOOTPRINT</span><small>{ads.length} draft {ads.length === 1 ? 'placement' : 'placements'} · preview only</small>
        </div>
        <div className="admin-moodboard-layout-preview__shape-list" role="group" aria-label="Choose ad footprint">
          {SHAPES.map((shape) => (
            <button type="button" key={shape.id} className={selectedShape === shape.id ? 'is-selected' : ''} onClick={() => setSelectedShape(shape.id)} aria-pressed={selectedShape === shape.id}>
              <span className="admin-moodboard-layout-preview__shape-icon" aria-hidden="true">{shape.cells.map(([r, c]) => <i key={r + '-' + c} style={{ gridRow: r + 1, gridColumn: c + 1 }} />)}</span>
              <span>{shape.label}</span>
            </button>
          ))}
        </div>
        <p className="admin-moodboard-layout-preview__instruction">{selected.note || 'Tap a duplicate slot to place. Ads occupy duplicate tiles only and absorb internal grid gaps.'}</p>
      </div>
      <div className="admin-moodboard-layout-preview__canvas">
        <div className="admin-moodboard-layout-preview__board" role="grid" aria-label="64 tile discovery board">
          {placements.map((item, index) => item ? (
            <button type="button" role="gridcell" key={item.id} className="admin-moodboard-layout-preview__category" onClick={() => onItemClick?.(item)} aria-label={item.category + ' category tile'}>
              <img src={item.image} alt={item.alt} draggable={false} /><span>{item.category}</span>
            </button>
          ) : (
            <button type="button" role="gridcell" key={'duplicate-slot-' + index} className={'admin-moodboard-layout-preview__duplicate-slot' + (canPlace(index) ? ' is-available' : '')} onClick={() => placeAd(index)} aria-label={'Duplicate tile slot ' + (index + 1) + (canPlace(index) ? ', available for ad' : '')}>
              <span>+</span><small>Ad inventory</small>
            </button>
          ))}
          <div className="admin-moodboard-layout-preview__ad-layer" aria-label="Ad placement previews">
            {ads.map((ad) => {
              const shape = shapeFor(ad.shape);
              return <button type="button" key={ad.id} className={'admin-moodboard-layout-preview__ad-preview admin-moodboard-layout-preview__ad-preview--' + ad.shape} style={adStyle(ad)} onClick={() => setAds((current) => current.filter((entry) => entry.id !== ad.id))} aria-label={'Remove ' + shape.label + ' draft ad'}>
                <span>AD PREVIEW</span><small>{shape.label}</small><b>×</b>
              </button>;
            })}
          </div>
        </div>
        <aside className="admin-moodboard-layout-preview__right-rail" aria-label="Right perimeter advertising rail"><span>RIGHT AD RAIL</span><small>8 tile units · continuous</small></aside>
        <aside className="admin-moodboard-layout-preview__bottom-rail" aria-label="Bottom perimeter advertising rail"><span>BOTTOM AD RAIL</span><small>8 tile units · continuous</small></aside>
        <div className="admin-moodboard-layout-preview__corner" aria-label="Connected advertising corner">AD</div>
      </div>
    </div>
  );
}
