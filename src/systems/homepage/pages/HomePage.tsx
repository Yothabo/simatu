import React, { useState } from "react";
import Hero from "../hero/Hero";
import DiscoverSection from "../discover/DiscoverSection";
import KineticMoodboard from "../discover/KineticMoodboard";
import Footer from "../footer";

/** The moodboard is a fixed canvas beneath the independently scrolling homepage. */
export default function HomePage() {
  const [discoverActive, setDiscoverActive] = useState(false);

  return (
    <div className={`novae-page homepage-layered-experience${discoverActive ? " discover-active" : ""}`}>
      <div className="homepage-moodboard-background" aria-hidden={!discoverActive}>
        <KineticMoodboard colorReveal={discoverActive} onExit={() => setDiscoverActive(false)} />\n        <div className="homepage-moodboard-gradient" aria-hidden="true" />
      </div>
      <div className="homepage-foreground">
        <main className="homepage-main">
          <Hero />
          <DiscoverSection active={discoverActive} onDiscover={() => setDiscoverActive(true)} />
        </main>
        <Footer />
      </div>
      <style>{`
        .homepage-layered-experience{position:relative;min-height:100vh;background:#111}
        .homepage-moodboard-background{position:fixed;inset:0;z-index:0;overflow:hidden;background:#111}
        .homepage-moodboard-background .kinetic-moodboard{position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none;transition:opacity 1.1s cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience.discover-active .homepage-moodboard-background .kinetic-moodboard{opacity:1;pointer-events:auto}
        .homepage-foreground{position:relative;z-index:2;transition:opacity 1.1s cubic-bezier(.2,.65,.25,1),visibility 1.1s}
        .homepage-layered-experience.discover-active .homepage-foreground{opacity:0;visibility:hidden;pointer-events:none}
        .homepage-layered-experience.discover-active{height:100vh;height:100svh;overflow:hidden}
        .homepage-layered-experience.discover-active .homepage-moodboard-background{z-index:5}
        @media(prefers-reduced-motion:reduce){.homepage-foreground,.homepage-moodboard-background .kinetic-moodboard{transition-duration:.01ms}}
      `}</style>
    </div>
  );
}
