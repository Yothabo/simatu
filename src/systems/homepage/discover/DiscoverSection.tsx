import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";

const KineticMoodboard = lazy(() => import("./KineticMoodboard"));

const previewItems = [
  { id: "01", image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=900&q=85", alt: "Modern architectural interior", category: "Spaces", title: "New perspectives" },
  { id: "02", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=85", alt: "Contemporary fashion editorial", category: "Style", title: "Personal expression" },
  { id: "03", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85", alt: "Minimal fashion collection", category: "Fashion", title: "Everyday form" },
  { id: "04", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=85", alt: "Warm contemporary home", category: "Living", title: "Considered living" },
  { id: "05", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85", alt: "Minimal product design", category: "Objects", title: "Designed to matter" },
  { id: "06", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=85", alt: "Open landscape at golden hour", category: "Culture", title: "Room to explore" },
  { id: "07", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85", alt: "Creative workspace", category: "Ideas", title: "Work in progress" },
  { id: "08", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=85", alt: "Light-filled creative studio", category: "Workspaces", title: "Space to create" },
  { id: "09", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85", alt: "Streetwear fashion portrait", category: "Fashion", title: "Beyond the ordinary" },
  { id: "10", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=85", alt: "Thoughtful interior details", category: "Living", title: "A different point of view" },
  { id: "11", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=85", alt: "Fresh food and ingredients", category: "Everyday", title: "Made for living" },
  { id: "12", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=85", alt: "Mountain landscape", category: "Explore", title: "Find what moves you" },
];

function seededShuffle<T>(items: T[]) {
  let seed = 29;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function DiscoverSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewTiles = useMemo(() => {
    const shuffled = seededShuffle(previewItems);
    return Array.from({ length: 64 }, (_, index) => shuffled[index % shuffled.length]);
  }, []);

  useEffect(() => {
    if (isMounted || !triggerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFullyVisible(entry.isIntersecting && entry.intersectionRatio >= 1),
      { threshold: 1 },
    );
    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

  return (
    <section className={`homepage-discover${isMounted ? " is-live" : ""}`} aria-label="Discover our brand network">
      <style>{`
        .homepage-discover{position:relative;width:100%;background:#111}
        .homepage-discover__preview{position:relative;width:100%;height:596px;min-height:596px;overflow:hidden;background:#111}
        .homepage-discover__preview:before{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(17,17,17,0) 0%,rgba(17,17,17,0) 22%,rgba(17,17,17,.42) 48%,rgba(17,17,17,.88) 100%)}
        .homepage-discover__preview-grid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(8,230px);grid-auto-rows:290px;gap:16px;overflow:hidden;filter:grayscale(1)}
        .homepage-discover__tile{position:relative;width:230px;height:290px;overflow:hidden;border-radius:3px;background:#252525;color:#fff}
        .homepage-discover__tile img{display:block;width:100%;height:100%;object-fit:cover}
        .homepage-discover__tile:after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.65));pointer-events:none}
        .homepage-discover__label{position:absolute;z-index:1;left:16px;right:12px;bottom:15px;display:grid;gap:4px;pointer-events:none}
        .homepage-discover__category{font:600 9px/1.2 sans-serif;letter-spacing:.18em;text-transform:uppercase;opacity:.75}
        .homepage-discover__title{font:500 15px/1.25 sans-serif;letter-spacing:.01em}
        .homepage-discover__trigger{position:absolute;z-index:3;top:22px;left:50%;transform:translateX(-50%);display:inline-flex;min-height:48px;padding:0 24px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.6);border-radius:999px;background:rgba(17,17,17,.82);color:#fff;font:600 11px/1.2 var(--hp-font-family,sans-serif);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:background .2s,border-color .2s;opacity:0;visibility:hidden;pointer-events:none}
        .homepage-discover__trigger.is-visible{opacity:1;visibility:visible;pointer-events:auto}
        .homepage-discover__trigger:hover{background:#292929;border-color:#fff}
        .homepage-discover__trigger:focus-visible{outline:2px solid #fff;outline-offset:4px}
        .homepage-discover__expanded{width:100%;height:560px;min-height:560px}
        .homepage-discover__loading{display:grid;min-height:280px;place-items:center;color:rgba(255,255,255,.65);font-size:12px;letter-spacing:.12em;text-transform:uppercase}
        .homepage-discover.is-live{padding:0;margin:0}
        @media(max-width:640px){.homepage-discover__preview{height:596px;min-height:596px}.homepage-discover__preview-grid{gap:6px}.homepage-discover__trigger{top:16px;min-height:44px;padding-inline:17px;font-size:10px}.homepage-discover__expanded{height:calc(100svh - 72px);min-height:560px}}
      `}</style>
      {!isMounted ? (
        <div className="homepage-discover__preview">
          <div className="homepage-discover__preview-grid" aria-hidden="true">
            {previewTiles.map((item, index) => (
              <div className="homepage-discover__tile" key={`${item.id}-${index}`}>
                <img src={item.image} alt="" loading={index < 12 ? "eager" : "lazy"} />
                <span className="homepage-discover__label">
                  <span className="homepage-discover__category">{item.category}</span>
                  <span className="homepage-discover__title">{item.title}</span>
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`homepage-discover__trigger${isFullyVisible ? " is-visible" : ""}`}
            ref={triggerRef}
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
