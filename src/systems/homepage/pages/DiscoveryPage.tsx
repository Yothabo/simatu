import React, { useState } from 'react';
import KineticMoodboard from '../discover/KineticMoodboard';

/** Direct Discovery entry with a deliberate inactive-state brand overlay. */
export default function DiscoveryPage() {
  const [isInactive, setIsInactive] = useState(true);

  return (
    <main className={`simatu-discovery-page${isInactive ? ' is-inactive' : ' is-active'}`}>
      <KineticMoodboard className="simatu-discovery-page__board" colorReveal interactive />
      {isInactive && (
        <section className="simatu-discovery-page__overlay" aria-label="Simatu introduction">
          <div className="simatu-discovery-page__content">
            <div className="simatu-discovery-page__brand">SIMATU</div>
            <h1>Help hustlers hustle better.</h1>
            <p>Build your presence. Get discovered. Find opportunity. Grow your hustle.</p>
            <button className="simatu-discovery-page__cta" type="button" onClick={() => setIsInactive(false)}>
              DISCOVER <span aria-hidden="true">↗</span>
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
        .simatu-discovery-page.is-inactive .simatu-discovery-page__board {
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
          animation: simatu-discovery-overlay-in .35s ease both;
        }
        .simatu-discovery-page__content {
          width: min(100%, 660px);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .simatu-discovery-page__brand {
          margin-bottom: 26px;
          color: #fff;
          font: 600 clamp(14px, 2vw, 18px)/1.2 system-ui, sans-serif;
          letter-spacing: .34em;
        }
        .simatu-discovery-page__content h1 {
          margin: 0;
          color: #fff;
          font: 500 clamp(30px, 6vw, 58px)/1.08 system-ui, sans-serif;
          letter-spacing: -.045em;
        }
        .simatu-discovery-page__content p {
          max-width: 540px;
          margin: 18px 0 30px;
          color: rgba(255,255,255,.82);
          font: 400 clamp(14px, 2vw, 17px)/1.65 system-ui, sans-serif;
          letter-spacing: .005em;
        }
        .simatu-discovery-page__cta {
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
        @keyframes simatu-discovery-overlay-in {
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
