import React, { useMemo } from 'react';
import type { MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';

type Props = {
  items: MoodboardItem[];
  onItemClick?: (item: MoodboardItem) => void;
};

const TILE_COUNT = 64;
const COLUMNS = 8;

export default function AdminMoodboardLayoutPreview({ items, onItemClick }: Props) {
  const placements = useMemo(() => {
    const slots: Array<MoodboardItem | null> = Array(TILE_COUNT).fill(null);
    // Distribute unique categories across the 8x8 board, leaving duplicate inventory visible as empty slots.
    items.slice(0, TILE_COUNT).forEach((item, index) => {
      const slot = Math.floor(index * TILE_COUNT / Math.max(items.length, 1));
      slots[slot] = item;
    });
    return slots;
  }, [items]);

  return (
    <div className="admin-moodboard-layout-preview" aria-label="Admin Moodboard 8 by 8 discovery canvas with L-shaped advertising perimeter">
      <div className="admin-moodboard-layout-preview__board" role="grid" aria-label="64-tile discovery board">
        {placements.map((item, index) => item ? (
          <button
            type="button"
            role="gridcell"
            key={item.id}
            className="admin-moodboard-layout-preview__category"
            onClick={() => onItemClick?.(item)}
            aria-label={item.category + ' category tile'}
          >
            <img src={item.image} alt={item.alt} draggable={false} />
            <span>{item.category}</span>
          </button>
        ) : (
          <div key={'duplicate-slot-' + index} role="gridcell" className="admin-moodboard-layout-preview__duplicate-slot" aria-label={'Duplicate tile slot ' + (index + 1)}>
            <span>Duplicate slot</span>
            <small>Ad inventory</small>
          </div>
        ))}
      </div>
      <aside className="admin-moodboard-layout-preview__right-rail" aria-label="Right perimeter advertising rail">
        <span>RIGHT AD RAIL</span>
        <small>8 tile units · continuous</small>
      </aside>
      <aside className="admin-moodboard-layout-preview__bottom-rail" aria-label="Bottom perimeter advertising rail">
        <span>BOTTOM AD RAIL</span>
        <small>8 tile units · continuous</small>
      </aside>
      <div className="admin-moodboard-layout-preview__corner" aria-label="Connected advertising corner">AD</div>
    </div>
  );
}
