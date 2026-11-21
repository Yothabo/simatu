import React from "react";

interface DiscoverSectionProps {
  onDiscover: () => void;
}

/** The reveal is isolated to this section; the fixed moodboard is managed by HomePage. */
export default function DiscoverSection({ onDiscover }: DiscoverSectionProps) {
  return (
    <section className="homepage-discover-trigger-section" aria-label="Discover our brand network">
      <button type="button" className="homepage-discover-trigger" onClick={onDiscover}>
        Discover our brand network
      </button>
      <style>{`
        .homepage-discover-trigger-section{position:relative;z-index:3;display:flex;align-items:center;justify-content:center;min-height:60vh;min-height:60svh;padding:36px 20px;box-sizing:border-box;background:transparent;isolation:isolate}
        .homepage-discover-trigger-section::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(180,var(--hp-color-background) 0 20%,transparent 20% 80%,#111 80% 100%),radial-gradient(ellipse 82% 60% at 50% 50%,var(--hp-color-surface) 0%,color-mix(in srgb,var(--hp-color-surface) 65%,#111 35%) 42%,#111 100%);background-repeat:no-repeat}
        .homepage-discover-trigger{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          min-height:48px;
          padding:0 24px;
          border:1px solid rgba(255,255,255,.6);
          border-radius:999px;
          background:#c4471d;
          color:#fff;
          font:600 11px/1.2 var(--hp-font-family,sans-serif);
          letter-spacing:.12em;
          text-transform:uppercase;
          white-space:nowrap;
          cursor:pointer;
          transition:opacity .55s ease
        }
        .homepage-discover-trigger:hover{background:#a93d1a;border-color:#fff}
        .homepage-discover-trigger:active{transform:scale(.98)}
        .homepage-discover-trigger:focus-visible{outline:2px solid #fff;outline-offset:4px}
        .homepage-discover-trigger:disabled{visibility:hidden}
      `}</style>
    </section>
  );
}
