import React, { Suspense, lazy, useEffect, useRef, useState } from "react";

const KineticMoodboard = lazy(() => import("./KineticMoodboard"));

const previewImages = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=70",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=70",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=70",
];

export default function DiscoverSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMounted || !previewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFullyVisible(entry.isIntersecting && entry.intersectionRatio >= 1),
      { threshold: 1 },
    );
    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

  return (
    <section className={`homepage-discover${isMounted ? " is-live" : ""}`} aria-label="Discover our brand network">
      <style>{`
        .homepage-discover{position:relative;width:100%;background:#111}
        .homepage-discover__preview{position:relative;width:100%;height:560px;min-height:560px;overflow:hidden;background:#252525;filter:grayscale(1)}
        .homepage-discover__preview-grid{display:grid;width:100%;height:100%;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
        .homepage-discover__preview-grid img{width:100%;height:100%;min-width:0;object-fit:cover;opacity:.55;filter:brightness(.65)}
        .homepage-discover__preview:after{position:absolute;inset:0;content:"";background:linear-gradient(180deg,rgba(17,17,17,.18),rgba(17,17,17,.62));pointer-events:none}
        .homepage-discover__trigger{position:absolute;z-index:2;top:22px;left:50%;transform:translateX(-50%);display:inline-flex;min-height:48px;padding:0 24px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.6);border-radius:999px;background:rgba(17,17,17,.82);color:#fff;font:600 11px/1.2 var(--hp-font-family,sans-serif);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:background .2s,border-color .2s;opacity:0;visibility:hidden;pointer-events:none}
        .homepage-discover__trigger.is-visible{opacity:1;visibility:visible;pointer-events:auto}
        .homepage-discover__trigger:hover{background:#292929;border-color:#fff}
        .homepage-discover__trigger:focus-visible{outline:2px solid #fff;outline-offset:4px}
        .homepage-discover__expanded{width:100%;height:560px;min-height:560px}
        .homepage-discover__loading{display:grid;min-height:280px;place-items:center;color:rgba(255,255,255,.65);font-size:12px;letter-spacing:.12em;text-transform:uppercase}
        .homepage-discover.is-live{padding:0;margin:0}
        .homepage-discover.is-live .homepage-discover__expanded{height:560px;min-height:560px}
        @media(max-width:640px){.homepage-discover__preview{height:calc(100svh - 72px);min-height:560px}.homepage-discover__preview-grid{gap:6px}.homepage-discover__trigger{top:16px;min-height:44px;padding-inline:17px;font-size:10px}.homepage-discover__expanded{height:calc(100svh - 72px);min-height:560px}.homepage-discover.is-live .homepage-discover__expanded{height:calc(100svh - 72px);min-height:560px}}
      `}</style>

      {!isMounted ? (
        <div className="homepage-discover__preview" ref={previewRef}>
          <div className="homepage-discover__preview-grid" aria-hidden="true">
            {previewImages.map((image) => (
              <img key={image} src={image} alt="" loading="lazy" />
            ))}
          </div>
          <button
            type="button"
            className={`homepage-discover__trigger${isFullyVisible ? " is-visible" : ""}`}
            onClick={() => setIsMounted(true)}
            tabIndex={isFullyVisible ? 0 : -1}
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
