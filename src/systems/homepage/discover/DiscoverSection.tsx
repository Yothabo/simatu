import React, { Suspense, lazy, useState } from "react";

const KineticMoodboard = lazy(() => import("./KineticMoodboard"));

const previewImages = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&q=70",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=70",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=70",
];

export default function DiscoverSection() {
  const [isMounted, setIsMounted] = useState(false);

  return (
    <section className="homepage-discover" aria-label="Discover our brand network">
      <style>{`
        .homepage-discover{position:relative;padding:clamp(28px,5vw,64px) 0 0;background:#111}
        .homepage-discover__preview{position:relative;height:clamp(190px,27vw,310px);margin:0 5%;overflow:hidden;background:#252525;filter:grayscale(1)}
        .homepage-discover__preview-grid{display:grid;width:100%;height:100%;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;transform:scale(1.04)}
        .homepage-discover__preview-grid img{width:100%;height:100%;min-width:0;object-fit:cover;opacity:.55;filter:brightness(.65)}
        .homepage-discover__preview:after{position:absolute;inset:0;content:"";background:linear-gradient(180deg,rgba(17,17,17,.18),rgba(17,17,17,.62))}
        .homepage-discover__trigger{position:absolute;z-index:2;top:22px;left:50%;transform:translateX(-50%);display:inline-flex;min-height:48px;padding:0 24px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.6);border-radius:999px;background:rgba(17,17,17,.82);color:#fff;font:600 11px/1.2 var(--hp-font-family,sans-serif);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:background .2s,border-color .2s}
        .homepage-discover__trigger:hover{background:#292929;border-color:#fff}
        .homepage-discover__trigger:focus-visible{outline:2px solid #fff;outline-offset:4px}
        .homepage-discover__expanded{min-height:560px}
        .homepage-discover__loading{display:grid;min-height:280px;place-items:center;color:rgba(255,255,255,.65);font-size:12px;letter-spacing:.12em;text-transform:uppercase}
        @media(max-width:640px){.homepage-discover{padding-top:22px}.homepage-discover__preview{height:210px;margin-inline:16px}.homepage-discover__preview-grid{gap:6px}.homepage-discover__trigger{top:16px;min-height:44px;padding-inline:17px;font-size:10px}}
      `}</style>

      {!isMounted ? (
        <div className="homepage-discover__preview">
          <div className="homepage-discover__preview-grid" aria-hidden="true">
            {previewImages.map((image) => (
              <img key={image} src={image} alt="" loading="lazy" />
            ))}
          </div>
          <button
            type="button"
            className="homepage-discover__trigger"
            onClick={() => setIsMounted(true)}
          >
            Discover our brand network
          </button>
        </div>
      ) : (
        <div className="homepage-discover__expanded">
          <Suspense fallback={<div className="homepage-discover__loading">Loading discovery...</div>}>
            <KineticMoodboard />
          </Suspense>
        </div>
      )}
    </section>
  );
}
