import React, { useMemo } from 'react';
import type { MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';
import { DISCOVERY_SUBCATEGORIES } from '../../../systems/homepage/discover/discovery-taxonomy';

type Props = { items: MoodboardItem[]; hiddenMarketIds?: string[]; onReactivateCategory?: (id: string) => void; onItemClick?: (item: MoodboardItem) => void; onAddCategory?: () => void; onOpenManual?: () => void; onReturn?: () => void };
const BOARD_COUNT = 64;
const ADMIN_CANVAS_SCALE = 0.35;
function seededRandom(seed: number) { let value=seed; return () => { value=(value*16807)%2147483647; return (value-1)/2147483646; }; }
function homepagePool(items: MoodboardItem[]) {
  const subs=items.flatMap((market)=>(DISCOVERY_SUBCATEGORIES[market.id]||[]).map((sub)=>({id:market.id+'-'+sub.id,image:sub.image,alt:sub.alt,category:market.category,title:sub.title} as MoodboardItem)));
  const pool=Array.from(new Map([...items,...subs].map((item)=>[item.id,item])).values()), random=seededRandom(29);
  for(let i=pool.length-1;i>0;i-=1){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];} return pool;
}
export default function AdminMoodboardLayoutPreview({items,hiddenMarketIds=[],onReactivateCategory,onItemClick,onAddCategory,onOpenManual,onReturn}:Props) {
  const pool=useMemo(()=>homepagePool(items),[items]);
  const tiles=pool.slice(0,BOARD_COUNT-1);
  return <div className="admin-moodboard-layout-preview">
    <header className="admin-moodboard-layout-preview__toolbar" aria-label="Moodboard header">
      <button type="button" onClick={onReturn} aria-label="Home" title="Home">⌂</button>
      <button type="button" onClick={onOpenManual} aria-label="Menu" title="Menu">⋯</button>
    </header>
    <div className="admin-moodboard-layout-preview__scroll">
      <div className="admin-moodboard-layout-preview__board" role="grid" aria-label="Homepage moodboard" style={{gridTemplateColumns:'repeat(8, 230px)',gridTemplateRows:'repeat(8, 290px)',zoom:ADMIN_CANVAS_SCALE}}>
        <button type="button" role="gridcell" className="admin-moodboard-layout-preview__add-category" onClick={onAddCategory} aria-label="Add category"><span>+</span><small>Category</small></button>
        {tiles.map((item,index)=><button type="button" role="gridcell" key={item.id} className={'admin-moodboard-layout-preview__tile'+(hiddenMarketIds.includes(item.id)?' is-hidden':'')} onClick={()=>{if(hiddenMarketIds.includes(item.id)){onReactivateCategory?.(item.id);return;}onItemClick?.(items.find((m)=>m.id===item.id)||items.find((m)=>item.id.startsWith(m.id+'-'))||item);}} aria-label={item.category+': '+item.title}><img src={item.image} alt={item.alt} draggable={false} loading={index<8?'eager':'lazy'}/><span>{item.category}</span></button>)}
      </div>
    </div>
  </div>;
}
