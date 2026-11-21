import React, { useEffect, useState } from "react";
import Hero from "../hero/Hero";
import DiscoverSection from "../discover/DiscoverSection";
import KineticMoodboard from "../discover/KineticMoodboard";
import Footer from "../footer";

/** Coordinates the homepage exit and discovery entrance as separate phases. */
export default function HomePage() {
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "exit" | "reveal" | "active">("idle");

  useEffect(() => {
    if (transitionPhase !== "exit") return;
    const timeout = window.setTimeout(() => setTransitionPhase("reveal"), 1050);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== "reveal") return;
    const timeout = window.setTimeout(() => setTransitionPhase("active"), 1550);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);

  return (
    <div className={`nova-page homepage-layered-experience phase-${transitionPhase}`}>
      <div className="homepage-moodboard-background" aria-hidden={transitionPhase === "idle"}>
        <KineticMoodboard colorReveal={transitionPhase === "reveal" || transitionPhase === "active"} interactive={transitionPhase === "active"} onExit={() => setTransitionPhase("idle")} />
        <div className="homepage-moodboard-gradient" aria-hidden="true" />
      </div>
      <div className="homepage-foreground">
        <main className="homepage-main">
          <Hero />
          <DiscoverSection onDiscover={() => setTransitionPhase("exit")} />
        </main>
        <Footer />
      </div>
      <style>{`
        .homepage-layered-experience{position:relative;min-height:100vh;background:#111}
        .homepage-moodboard-background{position:fixed;inset:0;z-index:0;overflow:hidden;background:#111}
        .homepage-moodboard-background .kinetic-moodboard{position:absolute;inset:0;width:100%;height:100%;opacity:1;pointer-events:none}
        .homepage-moodboard-gradient{display:none}
        .homepage-foreground{position:relative;z-index:2}\n        .homepage-layered-experience.phase-active .homepage-moodboard-background .kinetic-moodboard{pointer-events:auto}
        .homepage-layered-experience .homepage-main>header,.homepage-layered-experience .homepage-main>.novae-hero{will-change:opacity,transform}
        .homepage-layered-experience .homepage-main>header{transition:opacity .55s cubic-bezier(.2,.65,.25,1),transform .55s cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience .homepage-main>.novae-hero{transition:opacity 1s cubic-bezier(.2,.65,.25,1),transform 1s cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience .homepage-main>.homepage-discover-trigger-section{transition:opacity .55s ease,visibility .55s}
        .homepage-layered-experience .homepage-foreground>footer{transition:opacity 1s cubic-bezier(.2,.65,.25,1),transform 1s cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience.phase-exit .homepage-main>header,.homepage-layered-experience.phase-exit .homepage-main>.novae-hero{opacity:0;transform:translateY(-100px);pointer-events:none}
        .homepage-layered-experience.phase-exit .homepage-main>header{transform:translateY(-70px)}
        .homepage-layered-experience.phase-exit .homepage-main>.homepage-discover-trigger-section{opacity:0;visibility:hidden;pointer-events:none}
        .homepage-layered-experience.phase-exit .homepage-foreground>footer{opacity:0;transform:translateY(100px);pointer-events:none}
        .homepage-layered-experience.phase-reveal,.homepage-layered-experience.phase-active{height:100vh;height:100svh;overflow:hidden}
        @media(prefers-reduced-motion:reduce){.homepage-layered-experience *{transition-duration:.01ms!important;animation-duration:.01ms!important}}
      `}</style>
    </div>
  );
}
