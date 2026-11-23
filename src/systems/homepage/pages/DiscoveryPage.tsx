import React, { useEffect, useRef, useState } from 'react';
import KineticMoodboard from '../discover/KineticMoodboard';

/** Direct Discovery entry with a deliberate inactive-state brand overlay. */
export default function DiscoveryPage() {
  const [phase, setPhase] = useState<'intro' | 'exiting' | 'revealed'>('intro');
  const revealTimer = useRef<number | null>(null);
  const isInactive = phase !== 'revealed';

  useEffect(() => () => {
    if (revealTimer.current !== null) window.clearTimeout(revealTimer.current);
  }, []);

  const startReveal = () => {
    if (phase !== 'intro') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('revealed');
      return;
    }
    setPhase('exiting');
    revealTimer.current = window.setTimeout(() => setPhase('revealed'), 650);
  };

  return (
    <main className={`simatu-discovery-page is-${phase}`}>
      <KineticMoodboard className="simatu-discovery-page__board" colorReveal={phase === 'revealed'} interactive />
      {phase !== 'revealed' && (
        <section className={`simatu-discovery-page__overlay${phase === 'exiting' ? ' is-exiting' : ''}`} aria-label="Simatu introduction">
          <div className="simatu-discovery-page__content">
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="simatu-discovery-page__brand-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="50"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                textLength="100"
                lengthAdjust="spacingAndGlyphs"
                fill="#EDE8E0"
                fontSize="100"
                fontFamily="Anton, sans-serif"
                fontWeight="400"
              >
                simatu
              </text>
            </svg>
            
            <p>Discover brands, explore products, connect with businesses, and uncover new opportunities.</p>
            <button className="simatu-discovery-page__cta" type="button" onClick={startReveal} disabled={phase === 'exiting'}>
              Discover our Network <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>
      )}
      <style>{`
        .simatu-discovery-page {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          background: #111;
          color: #fff;
        }
        .simatu-discovery-page__board {
          transition: filter .35s ease;
        }
        .simatu-discovery-page.is-intro .simatu-discovery-page__board,\n        .simatu-discovery-page.is-exiting .simatu-discovery-page__board {
          filter: grayscale(1) brightness(.58);
        }
        .simatu-discovery-page__overlay {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: grid;
          place-items: center;
          box-sizing: border-box;
          padding: max(28px, env(safe-area-inset-top)) 24px max(28px, env(safe-area-inset-bottom));
          background: rgba(13, 13, 13, .46);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          text-align: center;
          animation: simatu-discovery-overlay-in .35s ease both;\n          transition: opacity .65s ease, background .65s ease, backdrop-filter .65s ease;
        }
        .simatu-discovery-page__overlay.is-exiting {\n          opacity: 0;\n          background: rgba(13,13,13,0);\n          backdrop-filter: blur(0);\n          -webkit-backdrop-filter: blur(0);\n          pointer-events: none;\n        }\n        .simatu-discovery-page__content {
          width: min(100%, 1000px);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .simatu-discovery-page__brand-svg {\n          animation: simatu-intro-item-in .65s cubic-bezier(.2,.65,.25,1) both;
          display: block;
          width: 100%;
          height: 25vh;
          margin: 0 0 26px;
          overflow: visible;
        }
        .simatu-discovery-page__content h1 {
          margin: 0;
          color: #fff;
          font: 500 clamp(30px, 6vw, 58px)/1.08 system-ui, sans-serif;
          letter-spacing: -.045em;
        }
        .simatu-discovery-page__content p {\n          animation: simatu-intro-item-in .65s cubic-bezier(.2,.65,.25,1) .25s both;
          max-width: 540px;
          margin: 18px 0 30px;
          color: rgba(255,255,255,.82);
          font: 400 clamp(14px, 2vw, 17px)/1.65 system-ui, sans-serif;
          letter-spacing: .005em;
        }
        .simatu-discovery-page__cta {\n          animation: simatu-intro-item-in .65s cubic-bezier(.2,.65,.25,1) .45s both;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          min-height: 52px;
          padding: 0 26px;
          border: 1px solid rgba(255,255,255,.85);
          border-radius: 999px;
          background: #fff;
          color: #151515;
          font: 600 12px/1 system-ui, sans-serif;
          letter-spacing: .12em;
          cursor: pointer;
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }
        .simatu-discovery-page__cta:hover {
          background: transparent;
          color: #fff;
          transform: translateY(-2px);
        }
        .simatu-discovery-page__cta:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 4px;
        }
        @keyframes simatu-intro-item-in {\n          from { opacity: 0; transform: translate3d(0, 16px, 0); }\n          to { opacity: 1; transform: translate3d(0, 0, 0); }\n        }\n        @keyframes simatu-discovery-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 600px) {
          .simatu-discovery-page__overlay { padding-inline: 22px; }
          .simatu-discovery-page__brand { margin-bottom: 20px; }
          .simatu-discovery-page__content p { margin: 14px 0 26px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .simatu-discovery-page__board,
          .simatu-discovery-page__cta,
          .simatu-discovery-page__overlay { transition: none; animation: none; }
        }
      `}</style>
    </main>
  );
}
