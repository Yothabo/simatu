import React, { useMemo, useState } from 'react';
import type { MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';
import { DISCOVERY_SUBCATEGORIES } from '../../../systems/homepage/discover/discovery-taxonomy';

type Props = { items: MoodboardItem[]; onItemClick?: (item: MoodboardItem) => void; onAddCategory?: () => void; onOpenManual?: () => void; onReturn?: () => void };
type ShapeId = 'horizontal-2' | 'vertical-2' | 'l-3' | 'square-4' | 'wide-8';
type Shape = { id: ShapeId; label: string; cells: Array<[number, number]>; width: number; height: number };
type AdDraft = { id: number; shape: ShapeId; anchor: number };
const BOARD_COLUMNS = 8, BOARD_ROWS = 8, BOARD_COUNT = 64;
const ADMIN_CANVAS_SCALE = 0.35;
const SHAPES: Shape[] = [
  { id: 'horizontal-2', label: 'Horizontal · 2', cells: [[0,0],[0,1]], width: 2, height: 1 },
  { id: 'vertical-2', label: 'Vertical · 2', cells: [[0,0],[1,0]], width: 1, height: 2 },
  { id: 'l-3', label: 'L · 3', cells: [[0,0],[0,1],[1,0]], width: 2, height: 2 },
  { id: 'square-4', label: 'Square · 4', cells: [[0,0],[0,1],[1,0],[1,1]], width: 2, height: 2 },
  { id: 'wide-8', label: 'Wide · 8', cells: [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3]], width: 4, height: 2 },
];
const shapeFor = (id: ShapeId) => SHAPES.find((shape) => shape.id === id)!;
function cellsFor(ad: AdDraft) { const shape=shapeFor(ad.shape), row=Math.floor(ad.anchor/8), col=ad.anchor%8; return shape.cells.map(([dr,dc])=>(row+dr)*8+col+dc); }
function seededRandom(seed: number) { let value=seed; return () => { value=(value*16807)%2147483647; return (value-1)/2147483646; }; }
function homepagePool(items: MoodboardItem[]) {
  const subs=items.flatMap((market)=>(DISCOVERY_SUBCATEGORIES[market.id]||[]).map((sub)=>({id:market.id+'-'+sub.id,image:sub.image,alt:sub.alt,category:market.category,title:sub.title} as MoodboardItem)));
  const pool=Array.from(new Map([...items,...subs].map((item)=>[item.id,item])).values()), random=seededRandom(29);
  for(let i=pool.length-1;i>0;i-=1){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];} return pool;
}
export default function AdminMoodboardLayoutPreview({items,onItemClick,onAddCategory,onOpenManual,onReturn}:Props) {
  const [selectedShape,setSelectedShape]=useState<ShapeId>('horizontal-2'),[ads,setAds]=useState<AdDraft[]>([]),[placementMode,setPlacementMode]=useState(false);
  const pool=useMemo(()=>homepagePool(items),[items]),tiles=pool.slice(0,BOARD_COUNT-1),occupied=useMemo(()=>new Set(ads.flatMap(cellsFor)),[ads]);
  const canPlace=(anchor:number)=>{if(!placementMode||anchor===0)return false;const row=Math.floor(anchor/8),col=anchor%8,shape=shapeFor(selectedShape),cells=shape.cells.map(([dr,dc])=>(row+dr)*8+col+dc);return anchor<BOARD_COUNT&&shape.cells.every(([dr,dc])=>row+dr<BOARD_ROWS&&col+dc<BOARD_COLUMNS)&&cells.every((slot)=>slot<BOARD_COUNT&&!occupied.has(slot));};
  const placeAd=(anchor:number)=>{if(!canPlace(anchor))return;setAds((current)=>[...current,{id:Date.now(),shape:selectedShape,anchor}]);setPlacementMode(false);};
  const adStyle=(ad:AdDraft):React.CSSProperties=>{const shape=shapeFor(ad.shape),row=Math.floor(ad.anchor/8),col=ad.anchor%8;return {gridRow:row+1+' / span '+shape.height,gridColumn:col+1+' / span '+shape.width,clipPath:ad.shape==='l-3'?'polygon(0 0,100% 0,100% 50%,50% 50%,50% 100%,0 100%)':undefined};};
  return <div className="admin-moodboard-layout-preview">
    <div className="admin-moodboard-layout-preview__toolbar">
      <button type="button" onClick={onReturn} aria-label="Home" title="Home">⌂</button>
      <button type="button" onClick={onOpenManual} aria-label="Moodboard settings" title="Moodboard settings">⚙</button>
    </div>
    <div className="admin-moodboard-layout-preview__shape-list" aria-label="Ad shapes">
      {SHAPES.map((shape)=><button type="button" key={shape.id} className={selectedShape===shape.id&&placementMode?'is-selected is-active':''} aria-label={shape.label} title={shape.label} aria-pressed={selectedShape===shape.id&&placementMode} onClick={()=>{if(selectedShape===shape.id&&placementMode){setPlacementMode(false);}else{setSelectedShape(shape.id);setPlacementMode(true);}}}><span className="admin-moodboard-layout-preview__shape-icon">{shape.cells.map(([r,c])=><i key={r+'-'+c} style={{gridRow:r+1,gridColumn:c+1}} />)}</span></button>)}
    </div>
    <div className="admin-moodboard-layout-preview__scroll">
      <div className="admin-moodboard-layout-preview__board" role="grid" aria-label="Homepage moodboard" style={{gridTemplateColumns:'repeat(8, 230px)',gridTemplateRows:'repeat(8, 290px)',zoom:ADMIN_CANVAS_SCALE}}>
        <button type="button" role="gridcell" className="admin-moodboard-layout-preview__add-category" onClick={onAddCategory} aria-label="Add category"><span>+</span><small>Category</small></button>
        {tiles.map((item,index)=>{const slot=index+1;return <button type="button" role="gridcell" key={item.id} className={'admin-moodboard-layout-preview__tile'+(canPlace(slot)?' is-ad-target':'')} onClick={()=>occupied.has(slot)?undefined:canPlace(slot)?placeAd(slot):onItemClick?.(items.find((m)=>m.id===item.id)||items.find((m)=>item.id.startsWith(m.id+'-'))||item)} aria-label={item.category+': '+item.title}><img src={item.image} alt={item.alt} draggable={false} loading={index<8?'eager':'lazy'}/><span>{item.category}</span></button>;})}
        <div className="admin-moodboard-layout-preview__ad-layer">{ads.map((ad)=>{const shape=shapeFor(ad.shape);return <button type="button" key={ad.id} className="admin-moodboard-layout-preview__ad-preview" style={adStyle(ad)} onClick={()=>setAds((current)=>current.filter((entry)=>entry.id!==ad.id))} aria-label={'Remove '+shape.label+' ad placement'}><span>AD SLOT</span><small>{shape.label}</small><b>×</b></button>;})}</div>
      </div>
    </div>
  </div>;
}
