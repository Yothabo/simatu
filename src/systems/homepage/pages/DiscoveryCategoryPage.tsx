import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { MoodboardItem } from '../discover/KineticMoodboard';
import { TiArrowBack } from 'react-icons/ti';
import { FiSearch } from 'react-icons/fi';
import MoodboardSearchBar from '../discover/MoodboardSearchBar';

const stores = [
  { key: 'yotaabo', name: 'Yotaabo', href: '/yotaabo/catalog', description: 'A considered collection of fragrance, fashion and spaces for everyday living.', note: 'Discover a lifestyle shaped by detail.' },
  { key: 'poshies', name: 'Poshies', href: '/poshies/catalog', description: 'Fashion, accessories and lifestyle pieces with a bold, expressive point of view.', note: 'Find pieces that feel like you.' },
];
const copy: Record<string, { title:string; eyebrow:string; description:string }> = {
  spaces: { title: 'Spaces that inspire.', eyebrow: 'INTERIORS · LIVING', description: 'Explore places and pieces that turn everyday spaces into something personal.' },
  style: { title: 'Make it your own.', eyebrow: 'STYLE · EXPRESSION', description: 'Discover independent style, fresh perspectives and pieces made to be lived in.' },
  fashion: { title: 'A point of view.', eyebrow: 'FASHION · FORM', description: 'Explore fashion that brings personality, confidence and individuality into focus.' },
  living: { title: 'Live thoughtfully.', eyebrow: 'LIVING · EVERYDAY', description: 'Find considered essentials and ideas for the spaces and moments that matter.' },
  objects: { title: 'Designed to matter.', eyebrow: 'OBJECTS · DESIGN', description: 'Discover objects with intention—useful, expressive and worth keeping close.' },
  culture: { title: 'Find your next feeling.', eyebrow: 'CULTURE · DISCOVERY', description: 'Follow ideas, places and experiences that open up a new perspective.' },
  ideas: { title: 'Ideas in motion.', eyebrow: 'IDEAS · CREATIVITY', description: 'Discover independent creative stores, original products, emerging brands and collections shaped by fresh perspectives. Browse inspiring finds, meet makers and businesses bringing ideas to life, and uncover something distinctive to take home or explore further across the Simatu network.' },
  workspaces: { title: 'Room to create.', eyebrow: 'WORK · CREATIVE SPACES', description: 'Explore spaces and inspiration for building, making and doing your best work.' },
  everyday: { title: 'Everyday, elevated.', eyebrow: 'ESSENTIALS · DAILY LIFE', description: 'Discover the small details and essentials that make everyday life feel considered.' },
  explore: { title: 'Go beyond familiar.', eyebrow: 'EXPLORE · DISCOVER', description: 'New interests, new finds and unexpected connections start here.' },
};
const fallback: MoodboardItem = { id: 'explore', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=90', alt: 'Open landscape', category: 'Explore', title: 'Find what moves you' };
const panel: React.CSSProperties = { padding: 'clamp(26px,6vw,88px)', background: '#111', color: '#f4f1ec', fontFamily: 'inherit' };
export default function DiscoveryCategoryPage() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { categoryId = '' } = useParams();
  const item = (location.state as { discovery?: MoodboardItem } | null)?.discovery || fallback;
  const editorial = copy[categoryId] || { title: item.title + '.', eyebrow: item.category.toUpperCase() + ' · DISCOVERY', description: 'Explore curated businesses, products and ideas from across the Simatu network.' };
  const goBack = () => {
    try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ position: (location.state as any)?.position || null })); } catch {}
    navigate('/', { state: { revealMoodboard: true } });
  };
  return <main style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', overflowX: 'hidden' }}>
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', padding: 18, pointerEvents: 'none' }}>
      {!searchOpen ? <div className="header-floating-controls" style={{ pointerEvents: 'auto' }}>
        <button type="button" className="header-float-button" aria-label="Back to Discover" onClick={goBack}><TiArrowBack size={21} /></button>
        <button type="button" className="header-float-button" aria-label="Search" onClick={() => setSearchOpen(true)}><FiSearch size={20} /></button>
      </div> : <MoodboardSearchBar value={searchQuery} onChange={setSearchQuery} ariaLabel="Search brands, products or collections" fixed />}
    </div>
    <section style={{ minHeight: 'min(76vh,760px)', paddingTop: 'calc(clamp(28px,7vw,100px) + 76px)', display: 'flex', alignItems: 'flex-end', padding: 'clamp(28px,7vw,100px)', boxSizing: 'border-box', backgroundImage: 'linear-gradient(180deg,rgba(0,0,0,.24),rgba(0,0,0,.08) 34%,rgba(0,0,0,.78)),url(' + item.image + ')', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ width: 'min(100%,920px)', paddingTop: 90 }}>
        <div style={{ font: '600 10px/1.4 system-ui', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}>{editorial.eyebrow}</div>
        <h1 style={{ margin: '18px 0 16px', font: '400 clamp(48px,10vw,132px)/.92 system-ui', letterSpacing: '-.07em' }}>{editorial.title}</h1>
        <p style={{ maxWidth: 560, color: 'rgba(255,255,255,.82)', font: '400 clamp(15px,1.7vw,18px)/1.65 system-ui' }}>{editorial.description}</p>
      </div>
    </section>
    <section style={panel}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 18 }}>
        {stores.map(store => <a key={store.key} href={store.href} style={{ minHeight: 310, display: 'flex', flexDirection: 'column', padding: 'clamp(24px,4vw,48px)', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,.13)', background: 'linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))', color: 'inherit', textDecoration: 'none' }}>
          <span style={{ font: '500 clamp(26px,4vw,42px)/1 system-ui', letterSpacing: '-.05em' }}>{store.name}</span><h3 style={{ font: '400 clamp(26px,3vw,40px)/1.05 system-ui', letterSpacing: '-.04em', margin: 'auto 0 14px', paddingTop: 48 }}>{store.note}</h3><p style={{ margin: 0, maxWidth: 460, color: 'rgba(255,255,255,.68)', font: '14px/1.65 system-ui' }}>{store.description}</p><span style={{ marginTop: 24, font: '600 11px/1 system-ui', letterSpacing: '.14em', textTransform: 'uppercase' }}>Explore storefront ↗</span>
        </a>)}
      </div>
    </section>
  </main>;
}
