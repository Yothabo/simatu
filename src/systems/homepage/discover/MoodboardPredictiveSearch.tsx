import React from 'react';
import './moodboard-search.css';
type Product={id:string;name:string;category?:string;subcategory?:string;brand?:string;image_url?:string|null;storeKey?:string;storeName:string;href:string;price?:number};
type Store={key:string;name:string;href:string;detail?:string};
type Props={query:string;loading?:boolean;error?:string;stores?:Store[];categories?:string[];products?:Product[];onCategorySelect?:(category:string)=>void;emptyMessage?:string;ariaLabel?:string};
export default function MoodboardPredictiveSearch({query,loading=false,error='',stores=[],categories=[],products=[],onCategorySelect,emptyMessage='No matches yet. Try a store, product or category.',ariaLabel='Predictive search suggestions'}:Props){
 if(!query.trim())return null;
 const hasResults=stores.length||categories.length||products.length;
 return <div className="kinetic-moodboard__search-results" role="listbox" aria-label={ariaLabel}>
 {loading&&<div className="kinetic-moodboard__search-status">Searching across stores…</div>}
 {!loading&&error&&<div className="kinetic-moodboard__search-status">{error}</div>}
 {!loading&&!error&&!hasResults&&<div className="kinetic-moodboard__search-status">{emptyMessage}</div>}
 {stores.length>0&&<div className="kinetic-moodboard__suggestion-group"><div className="kinetic-moodboard__suggestion-heading">STORES</div>{stores.map(s=><a className="kinetic-moodboard__suggestion" href={s.href} key={s.key}><span className="kinetic-moodboard__suggestion-icon">⌂</span><span className="kinetic-moodboard__suggestion-text"><span className="kinetic-moodboard__suggestion-name">{s.name}</span><span className="kinetic-moodboard__suggestion-detail">{s.detail||'Store · Fashion & lifestyle'}</span></span></a>)}</div>}
 {categories.length>0&&<div className="kinetic-moodboard__suggestion-group"><div className="kinetic-moodboard__suggestion-heading">CATEGORIES</div>{categories.map(c=><button type="button" className="kinetic-moodboard__suggestion kinetic-moodboard__suggestion-button" key={c} onClick={()=>onCategorySelect?.(c)}><span className="kinetic-moodboard__suggestion-icon">⌕</span><span className="kinetic-moodboard__suggestion-text"><span className="kinetic-moodboard__suggestion-name">{c}</span><span className="kinetic-moodboard__suggestion-detail">Browse category</span></span></button>)}</div>}
 {products.length>0&&<div className="kinetic-moodboard__suggestion-group"><div className="kinetic-moodboard__suggestion-heading">PRODUCTS</div>{products.map(p=><a className="kinetic-moodboard__result" href={p.href} key={(p.storeKey||p.storeName)+p.id}>{p.image_url?<img className="kinetic-moodboard__result-image" src={p.image_url} alt=""/>:<div className="kinetic-moodboard__result-image"/>}<div className="kinetic-moodboard__result-meta"><div className="kinetic-moodboard__result-name">{p.name}</div><div className="kinetic-moodboard__result-store">{p.storeName} · {p.category}{p.subcategory?' / '+p.subcategory:''}</div></div><div className="kinetic-moodboard__result-price">{Number(p.price||0).toLocaleString('en-ZA',{style:'currency',currency:'ZAR'})}</div></a>)}</div>}
 </div>;
}