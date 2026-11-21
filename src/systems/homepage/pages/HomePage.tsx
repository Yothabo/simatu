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
        <KineticMoodboard colorReveal={discoverActive} onExit={() => setDiscoverActive(false)} />
        <div className="homepage-moodboard-gradient" aria-hidden="true" />
      </div>
      <div className="homepage-foreground">
        <main className="homepage-main">
          <Hero />
          <DiscoverSection onDiscover={() => setDiscoverActive(true)} />
        </main>
        <Footer />
      </div>
      <style>{`
        .homepage-layered-experience{position:relative;min-height:100vh;background:#111}
        .homepage-moodboard-background{position:fixed;inset:0;z-index:0;overflow:hidden;background:#111}
        .homepage-moodboard-background .kinetic-moodboard{position:absolute;inset:0;width:100%;height:100%;opacity:1;pointer-events:none;transition:opacity 1.1s cubic-bezier(.2,.65,.25,1)}
        .homepage-moodboard-gradient{display:none}
        .homepage-layered-experience.discover-active .homepage-moodboard-background .kinetic-moodboard{pointer-events:auto}
        
        .homepage-foreground{position:relative;z-index:2}
        .homepage-layered-experience .homepage-main>header,.homepage-layered-experience .homepage-main>.novae-hero{transition:opacity .9s cubic-bezier(.2,.65,.25,1),transform .9s cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience .homepage-main>.homepage-discover-trigger-section{transition:opacity .65s ease,visibility .65s}
        .homepage-layered-experience .homepage-foreground>footer{transition:opacity .9s cubic-bezier(.2,.65,.25,1),transform .9s cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience.discover-active .homepage-main>header,.homepage-layered-experience.discover-active .homepage-main>.novae-hero{opacity:0;transform:translateY(-100px);pointer-events:none}
        .homepage-layered-experience.discover-active .homepage-main>.homepage-discover-trigger-section{opacity:0;visibility:hidden;pointer-events:none}
        .homepage-layered-experience.discover-active .homepage-foreground>footer{opacity:0;transform:translateY(100px);pointer-events:none}
        .homepage-layered-experience.discover-active{height:100vh;height:100svh;overflow:hidden}

        @media(prefers-reduced-motion:reduce){.homepage-foreground,.homepage-moodboard-background .kinetic-moodboard{transition-duration:.01ms}}
      `}</style>
    </div>
  );
}
