import React, { useEffect, useMemo, useRef, useState } from "react";
import KineticMoodboard from "./KineticMoodboard";

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
  const [isColorActive, setIsColorActive] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const initialClipRef = useRef<string>("");
  const originalStylesRef = useRef<Record<string, string> | null>(null);
  const colorTimerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);
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

  useEffect(() => () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    if (colorTimerRef.current !== null) window.clearTimeout(colorTimerRef.current);
    document.body.classList.remove("homepage-discover-transition");
  }, []);

  const handleDiscover = () => {
    const section = sectionRef.current;
    if (!section || isMounted) return;
    const rect = section.getBoundingClientRect();
    originalStylesRef.current = { position: section.style.position, inset: section.style.inset, top: section.style.top, left: section.style.left, width: section.style.width, height: section.style.height, margin: section.style.margin, zIndex: section.style.zIndex, transform: section.style.transform, transition: section.style.transition };

    section.style.position = "fixed";
    section.style.inset = "0";
    section.style.top = "0";
    section.style.left = "0";
    section.style.width = "100vw";
    section.style.height = "100vh";
    section.style.height = "100svh";
    section.style.margin = "0";
    section.style.zIndex = "9999";
    section.style.transform = "none";
    section.style.transition = "none";

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const top = Math.max(0, rect.top);
    const left = Math.max(0, rect.left);
    const right = Math.max(0, viewportWidth - rect.right);
    const bottom = Math.max(0, viewportHeight - rect.bottom);
    const initialClip = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
    initialClipRef.current = initialClip;
    section.style.setProperty("--discover-return-clip", initialClip);

    [previewRef.current, expandedRef.current].forEach((surface) => {
      if (!surface) return;
      surface.style.clipPath = initialClip;
      surface.style.transition = "clip-path 1.6s cubic-bezier(.2,.65,.25,1)";
      surface.style.willChange = "clip-path";
    });

    document.body.classList.add("homepage-discover-transition");
    setIsMounted(true);
    // Keep the board grayscale through expansion and a brief settling pause.
    colorTimerRef.current = window.setTimeout(() => setIsColorActive(true), 2150);
    animationFrameRef.current = requestAnimationFrame(() => {
      [previewRef.current, expandedRef.current].forEach((surface) => {
        if (surface) surface.style.clipPath = "inset(0)";
      });
    });
  };

  const handleExitDiscover = () => {
    const section = sectionRef.current;
    if (!section || !isMounted || isExiting) return;
    if (colorTimerRef.current !== null) window.clearTimeout(colorTimerRef.current);
    setIsExiting(true);
    document.body.classList.remove("homepage-discover-transition");
    const returnClip = initialClipRef.current || "inset(0)";
    [previewRef.current, expandedRef.current].forEach((surface) => {
      if (surface) surface.style.clipPath = returnClip;
    });
    window.setTimeout(() => {
      [previewRef.current, expandedRef.current].forEach((surface) => {
        if (!surface) return;
        surface.style.clipPath = "";
        surface.style.transition = "";
        surface.style.willChange = "";
      });
      section.style.removeProperty("--discover-return-clip");
      const original = originalStylesRef.current;
      if (original) Object.entries(original).forEach(([key, value]) => { (section.style as any)[key] = value; });
      originalStylesRef.current = null;
      initialClipRef.current = "";
      setIsColorActive(false);
      setIsMounted(false);
      setIsExiting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1650);
  };


  return (
    <section ref={sectionRef} className={`homepage-discover${isMounted ? " is-live" : ""}${isColorActive ? " is-colored" : ""}${isExiting ? " is-exiting" : ""}`} aria-label="Discover our brand network">
      <style>{`
        .homepage-discover{position:relative;display:block;width:100%;height:100vh;height:100svh;min-height:100vh;min-height:100svh;margin:0;padding:0;box-sizing:border-box;background:#111}
        .homepage-discover__preview{position:absolute;inset:0;display:block;width:100%;height:100%;min-height:0;margin:0;padding:0;box-sizing:border-box;overflow:hidden;background:#111;transition:opacity 1.35s cubic-bezier(.16,.76,.24,1)}
        body.homepage-discover-transition .homepage-main #top,body.homepage-discover-transition .hero-navigation{filter:grayscale(1);opacity:0;transform:translate3d(0,-18px,0);transition:filter 1.45s cubic-bezier(.16,.76,.24,1),opacity 1.45s cubic-bezier(.16,.76,.24,1),transform 1.45s cubic-bezier(.16,.76,.24,1)}\n        body.homepage-discover-transition .homepage-footer{filter:grayscale(1);opacity:0;transform:translate3d(0,24px,0);transition:filter 1.55s cubic-bezier(.16,.76,.24,1),opacity 1.55s cubic-bezier(.16,.76,.24,1),transform 1.55s cubic-bezier(.16,.76,.24,1)}
        .homepage-discover__preview:before,.homepage-discover__preview:after{content:"";position:absolute;z-index:1;left:0;right:0;height:160px;pointer-events:none}.homepage-discover__preview:before{top:0;background:linear-gradient(to bottom,#111 0%,rgba(17,17,17,.7) 35%,transparent 100%)}.homepage-discover__preview:after{bottom:0;background:linear-gradient(to top,#111 0%,rgba(17,17,17,.7) 35%,transparent 100%)}
        .homepage-discover__preview-grid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(8,230px);grid-auto-rows:290px;gap:16px;overflow:hidden;filter:grayscale(1)}
        .homepage-discover__tile{position:relative;width:230px;height:290px;overflow:hidden;border-radius:3px;background:#252525;color:#fff}
        .homepage-discover__tile img{display:block;width:100%;height:100%;object-fit:cover}
        .homepage-discover__tile:after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.65));pointer-events:none}
        .homepage-discover__label{position:absolute;z-index:1;left:16px;right:12px;bottom:15px;display:grid;gap:4px;pointer-events:none}
        .homepage-discover__category{font:600 9px/1.2 sans-serif;letter-spacing:.18em;text-transform:uppercase;opacity:.75}
        .homepage-discover__title{font:500 15px/1.25 sans-serif;letter-spacing:.01em}
        .homepage-discover__trigger{position:absolute;z-index:3;top:78%;left:50%;transform:translate(-50%,-50%);display:inline-flex;min-height:48px;padding:0 24px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.6);border-radius:999px;background:#c4471d;color:#fff;font:600 11px/1.2 var(--hp-font-family,sans-serif);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:background .2s,border-color .2s;opacity:0;visibility:hidden;pointer-events:none}
        .homepage-discover__trigger.is-visible{opacity:1;visibility:visible;pointer-events:auto}
        .homepage-discover__trigger:hover{background:#a93d1a;border-color:#fff}
        .homepage-discover__trigger:focus-visible{outline:2px solid #fff;outline-offset:4px}
        .homepage-discover__expanded{position:absolute;inset:0;display:block;width:100%;height:100%;min-height:0;margin:0;padding:0;box-sizing:border-box;opacity:0;pointer-events:none;transition:opacity 1.6s cubic-bezier(.2,.65,.25,1)}
        .homepage-discover.is-live{position:fixed;inset:0;width:100vw;height:100vh;height:100svh;min-height:0;margin:0;padding:0;box-sizing:border-box;overflow:hidden}
        .homepage-discover.is-exiting .homepage-discover__preview,.homepage-discover.is-exiting .homepage-discover__expanded{clip-path:var(--discover-return-clip, inset(0));transition:clip-path 1.6s cubic-bezier(.2,.65,.25,1)!important;}
        .homepage-discover.is-exiting .homepage-discover__preview{opacity:1;pointer-events:none}
        .homepage-discover.is-exiting .homepage-discover__expanded{opacity:0;pointer-events:none}
        .homepage-discover.is-live .homepage-discover__preview{opacity:0;pointer-events:none}
        .homepage-discover.is-live .homepage-discover__expanded{opacity:1;pointer-events:auto}
        @media(max-width:640px){.homepage-discover__preview-grid{gap:6px}.homepage-discover__trigger{min-height:44px;padding-inline:17px;font-size:10px}}
      `}</style>
      <div ref={previewRef} className="homepage-discover__preview">
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
          onClick={handleDiscover}
          tabIndex={isFullyVisible ? 0 : -1}
        >
          Discover our brand network
        </button>
      </div>
      <div ref={expandedRef} className="homepage-discover__expanded">
        <KineticMoodboard colorReveal={isColorActive} onExit={handleExitDiscover} />
      </div>
    </section>
  );
}
