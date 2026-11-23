import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { MoodboardItem } from '../discover/KineticMoodboard';

type Product = { id: string; name: string; price: number; category: string; subcategory?: string; brand?: string; image_url?: string | null; storeKey: string; storeName: string; href: string };
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
  ideas: { title: 'Ideas in motion.', eyebrow: 'IDEAS · CREATIVITY', description: 'Meet creative thinking, emerging concepts and new ways of looking at things.' },
  workspaces: { title: 'Room to create.', eyebrow: 'WORK · CREATIVE SPACES', description: 'Explore spaces and inspiration for building, making and doing your best work.' },
  everyday: { title: 'Everyday, elevated.', eyebrow: 'ESSENTIALS · DAILY LIFE', description: 'Discover the small details and essentials that make everyday life feel considered.' },
  explore: { title: 'Go beyond familiar.', eyebrow: 'EXPLORE · DISCOVER', description: 'New interests, new finds and unexpected connections start here.' },
};
const fallback: MoodboardItem = { id: 'explore', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=90', alt: 'Open landscape', category: 'Explore', title: 'Find what moves you' };
const panel: React.CSSProperties = { padding: 'clamp(26px,6vw,88px)', background: '#111', color: '#f4f1ec', fontFamily: 'inherit' };
const button: React.CSSProperties = { border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', font: '600 11px/1 system-ui', letterSpacing: '.16em', textTransform: 'uppercase' };
export default function DiscoveryCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId = '' } = useParams();
  const item = (location.state as { discovery?: MoodboardItem } | null)?.discovery || fallback;
  const editorial = copy[categoryId] || { title: item.title + '.', eyebrow: item.category.toUpperCase() + ' · DISCOVERY', description: 'Explore curated businesses, products and ideas from across the Simatu network.' };
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    Promise.all(stores.map(async store => {
      const response = await fetch('/api/products?storefront=' + encodeURIComponent(store.key), { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Products could not be loaded.');
      return (Array.isArray(data.products) ? data.products : []).filter((p: any) => p && p.is_active !== false).map((p: any) => ({ ...p, storeKey: store.key, storeName: store.name, href: store.href } as Product));
    })).then(result => { if (!cancelled) setProducts(result.flat()); }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load network products.'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const matching = useMemo(() => {
    const term = item.category.toLowerCase();
    const filtered = products.filter(p => (p.category + ' ' + (p.subcategory || '') + ' ' + (p.name || '')).toLowerCase().includes(term));
    return (filtered.length ? filtered : products).slice(0, 12);
  }, [products, item.category]);
  const goBack = () => {
    try { sessionStorage.setItem('simatu-discover-return', JSON.stringify({ position: (location.state as any)?.position || null })); } catch {}
    navigate('/', { state: { revealMoodboard: true } });
  };
  return <main style={{ minHeight: '100dvh', background: '#111', color: '#f4f1ec', overflowX: 'hidden' }}>
    <header style={{ position: 'absolute', zIndex: 3, inset: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(18px,4vw,42px)' }}>
      <button style={button} onClick={goBack}>Back to discovery</button><a href="/" style={{ ...button, textDecoration: 'none', fontSize: 13, letterSpacing: '.2em' }}>SIMATU</a>
    </header>
    <section style={{ minHeight: 'min(76vh,760px)', display: 'flex', alignItems: 'flex-end', padding: 'clamp(28px,7vw,100px)', boxSizing: 'border-box', backgroundImage: 'linear-gradient(180deg,rgba(0,0,0,.24),rgba(0,0,0,.08) 34%,rgba(0,0,0,.78)),url(' + item.image + ')', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ width: 'min(100%,920px)', paddingTop: 90 }}>
        <div style={{ font: '600 10px/1.4 system-ui', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}>{editorial.eyebrow}</div>
        <h1 style={{ margin: '18px 0 16px', font: '400 clamp(48px,10vw,132px)/.92 system-ui', letterSpacing: '-.07em' }}>{editorial.title}</h1>
        <p style={{ maxWidth: 560, color: 'rgba(255,255,255,.82)', font: '400 clamp(15px,1.7vw,18px)/1.65 system-ui' }}>{editorial.description}</p>
      </div>
    </section>
    <section style={panel}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 22, marginBottom: 34, flexWrap: 'wrap' }}><h2 style={{ margin: 0, font: '400 clamp(28px,4.5vw,58px)/1 system-ui', letterSpacing: '-.05em' }}>Discover the network</h2><p style={{ margin: 0, color: 'rgba(255,255,255,.58)', font: '12px/1.6 system-ui' }}>Independent businesses. Distinct perspectives.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 18 }}>
        {stores.map(store => <a key={store.key} href={store.href} style={{ minHeight: 310, display: 'flex', flexDirection: 'column', padding: 'clamp(24px,4vw,48px)', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,.13)', background: 'linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))', color: 'inherit', textDecoration: 'none' }}>
          <span style={{ font: '500 clamp(26px,4vw,42px)/1 system-ui', letterSpacing: '-.05em' }}>{store.name}</span><h3 style={{ font: '400 clamp(26px,3vw,40px)/1.05 system-ui', letterSpacing: '-.04em', margin: 'auto 0 14px', paddingTop: 48 }}>{store.note}</h3><p style={{ margin: 0, maxWidth: 460, color: 'rgba(255,255,255,.68)', font: '14px/1.65 system-ui' }}>{store.description}</p><span style={{ marginTop: 24, font: '600 11px/1 system-ui', letterSpacing: '.14em', textTransform: 'uppercase' }}>Explore storefront ↗</span>
        </a>)}
      </div>
    </section>
    <section style={panel}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap', marginBottom: 34 }}><h2 style={{ margin: 0, font: '400 clamp(28px,4.5vw,58px)/1 system-ui', letterSpacing: '-.05em' }}>Selected from the network</h2><p style={{ margin: 0, color: 'rgba(255,255,255,.58)', font: '12px/1.6 system-ui' }}>Products worth a closer look.</p></div>
      {loading ? <p style={{ color: 'rgba(255,255,255,.65)', font: '13px/1.7 system-ui' }}>Curating products…</p> : error ? <p style={{ color: 'rgba(255,255,255,.65)', font: '13px/1.7 system-ui' }}>{error}</p> : matching.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 14 }}>{matching.map(p => <a href={p.href} key={p.storeKey+p.id} style={{ minWidth: 0, color: 'inherit', textDecoration: 'none' }}>{p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', background: '#242424', display: 'block' }} /> : <div style={{ width: '100%', aspectRatio: '4/5', background: '#242424' }} />}<div style={{ marginTop: 12, font: '500 13px/1.45 system-ui' }}>{p.name}</div><div style={{ marginTop: 5, color: 'rgba(255,255,255,.58)', font: '11px/1.5 system-ui' }}>{p.storeName} · {p.category}</div><div style={{ marginTop: 8, font: '600 12px/1.4 system-ui' }}>{Number(p.price).toLocaleString('en-ZA',{style:'currency',currency:'ZAR'})}</div></a>)}</div> : <p style={{ color: 'rgba(255,255,255,.65)', font: '13px/1.7 system-ui' }}>Product selections for this theme are being curated. Explore our storefronts in the meantime.</p>}
    </section>
    <footer style={{ ...panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, borderTop: '1px solid rgba(255,255,255,.1)' }}><button style={button} onClick={goBack}>Back to discovery</button><a href="/" style={{ ...button, textDecoration: 'none' }}>SIMATU</a></footer>
  </main>;
}
