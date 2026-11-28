import React, { useState } from 'react';
import KineticMoodboard, { type MoodboardItem } from '../../../systems/homepage/discover/KineticMoodboard';
import { getSubcategories } from '../../../systems/homepage/discover/discovery-taxonomy';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../../systems/homepage/design-system/index.css';

type Props = { onReturn: () => void; };

export default function SimatuMarketplaceAdmin({ onReturn }: Props) {
  const [activeMarket, setActiveMarket] = useState<MoodboardItem | null>(null);
  const subcategories = activeMarket ? getSubcategories(activeMarket.id) : [];

  return (
    <div className="admin-marketplace-moodboard" aria-label="Marketplace management" style={{ position: 'fixed', inset: 0, zIndex: 10, overflow: 'hidden', background: '#111', color: '#f4f1ec' }}>
      <button type="button" onClick={activeMarket ? () => setActiveMarket(null) : onReturn} aria-label={activeMarket ? 'Back to Admin Market categories' : 'Return to Admin dashboard'} style={{ position: 'fixed', zIndex: 30, top: 18, left: 18, minHeight: 46, padding: '0 16px', border: '1px solid rgba(255,255,255,.35)', borderRadius: 999, background: 'rgba(17,17,17,.72)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(12px)' }}>{activeMarket ? '← Back' : '← Return'}</button>
      {!activeMarket ? (
        <KineticMoodboard colorReveal interactive adminMode onItemClick={setActiveMarket} />
      ) : (
        <main style={{ minHeight: '100dvh', overflowY: 'auto', background: '#111', color: '#f4f1ec' }}>
          <section style={{ position: 'relative', minHeight: '42vh', display: 'flex', alignItems: 'flex-end', padding: 'clamp(24px,5vw,72px)', overflow: 'hidden' }}>
            <img src={activeMarket.image} alt={activeMarket.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: activeMarket.objectPosition || 'center' }} />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#111 0%,rgba(17,17,17,.92) 14%,rgba(17,17,17,.38) 58%,transparent 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
              <h1 style={{ fontSize: 'clamp(40px,8vw,96px)', lineHeight: .95, fontWeight: 500, margin: '18px 0' }}>{activeMarket.category}</h1>
              <p style={{ fontSize: 'clamp(14px,1.4vw,18px)', lineHeight: 1.65, maxWidth: 680 }}>{activeMarket.title}</p>
            </div>
          </section>
          <section style={{ padding: 'clamp(24px,5vw,72px)' }}>
            <Swiper modules={[A11y, Keyboard, Navigation, Pagination]} slidesPerView={1.35} slidesPerGroup={1} spaceBetween={14} speed={520} threshold={6} resistanceRatio={0.85} roundLengths watchSlidesProgress breakpoints={{ 480: { slidesPerView: 2.15, spaceBetween: 16 }, 768: { slidesPerView: 3.15, spaceBetween: 20 }, 1100: { slidesPerView: 4.15, spaceBetween: 24 } }} navigation={subcategories.length > 2} pagination={subcategories.length > 1 ? { clickable: true } : false} keyboard={{ enabled: true, onlyInViewport: true }} grabCursor slideToClickedSlide watchOverflow loop={false} aria-label={activeMarket.category + ' subcategories'} style={{ paddingBottom: 34, overflow: 'visible', '--swiper-theme-color': '#f4f1ec' } as React.CSSProperties}>
              {subcategories.map((sub) => (
                <SwiperSlide key={sub.id}>
                  <button type="button" className="discovery-subcategory-card" style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 5', padding: 0, textAlign: 'left', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, background: '#222', color: '#fff', overflow: 'hidden', cursor: 'pointer' }}>
                    <img src={sub.image} alt={sub.alt} loading="lazy" decoding="async" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.58)' }} />
                    <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.8),rgba(0,0,0,.02) 76%)' }} />
                    <span style={{ position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 1 }}>
                      <strong style={{ display: 'block', fontSize: 18, fontWeight: 500 }}>{sub.title}</strong>
                      <span style={{ display: 'block', marginTop: 7, fontSize: 13, lineHeight: 1.45, fontWeight: 400, color: 'rgba(255,255,255,.82)' }}>{sub.description}</span>
                    </span>
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        </main>
      )}
    </div>
  );
}
