import React, { useEffect, useState } from "react";
import Hero from "../hero/Hero";
import DiscoverSection from "../discover/DiscoverSection";
import KineticMoodboard from "../discover/KineticMoodboard";
import Footer from "../footer";

/** Unified, coordinated homepage transition phases. */
const EXIT_DURATION_MS = 0;
const EXIT_WATCHDOG_MS = 0;
const REVEAL_DURATION_MS = 1450;
const RETURN_DURATION_MS = 780;
export default function HomePage() {
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "exit" | "reveal" | "active" | "return">("idle");

  useEffect(() => {
    if (transitionPhase !== "exit") return;
    const timeout = window.setTimeout(() => setTransitionPhase("reveal"), EXIT_WATCHDOG_MS);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== "reveal") return;
    const timeout = window.setTimeout(() => setTransitionPhase("active"), REVEAL_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== "return") return;
    const timeout = window.setTimeout(() => setTransitionPhase("idle"), RETURN_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);

  const startDiscovery = () => {
    setTransitionPhase("exit");
  };

  const startHomeReturn = () => setTransitionPhase("return");

  const handleRevealTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity") return;
    const target = event.target as HTMLImageElement;
    if (!target.classList.contains("kinetic-moodboard__reveal-sentinel")) return;
    if (transitionPhase === "reveal") setTransitionPhase("active");
    if (transitionPhase === "return") setTransitionPhase("idle");
  };

  return (
    <div className={`nova-page homepage-layered-experience phase-${transitionPhase}`}>
      <div className="homepage-moodboard-background" aria-hidden={transitionPhase === "idle"} onTransitionEnd={handleRevealTransitionEnd}>
        <div className="homepage-moodboard-gradient" aria-hidden="true" />
        <KineticMoodboard colorReveal={transitionPhase === "reveal" || transitionPhase === "active"} interactive={transitionPhase === "active"} onExit={startHomeReturn} />
      </div>
      <div className="homepage-foreground" >
        <main className="homepage-main">
          <Hero />
          <DiscoverSection onDiscover={startDiscovery} />
        </main>
        <Footer />
      </div>
      <style>{`
        .homepage-layered-experience{position:relative;min-height:100vh;background:#111}
        .homepage-moodboard-background{position:fixed;inset:0;z-index:0;overflow:hidden;background:linear-gradient(180deg,rgba(12,12,12,.08) 0%,rgba(12,12,12,.28) 48%,rgba(12,12,12,.62) 100%);opacity:1;transition:none;will-change:auto}
        .homepage-moodboard-background .kinetic-moodboard{position:absolute;inset:0;width:100%;height:100%;z-index:1;opacity:1;pointer-events:none}
        .homepage-moodboard-gradient{position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,rgba(10,10,10,.06) 0%,rgba(10,10,10,.16) 45%,rgba(10,10,10,.48) 100%)}
        .homepage-foreground{position:relative;z-index:2;opacity:1;transform:none;visibility:visible;transition:none;will-change:auto}
        .homepage-layered-experience.phase-exit .homepage-foreground,.homepage-layered-experience.phase-reveal .homepage-foreground,.homepage-layered-experience.phase-active .homepage-foreground,.homepage-layered-experience.phase-return .homepage-foreground{display:none;opacity:0;transform:none;visibility:hidden;pointer-events:none}
        .homepage-layered-experience.phase-active .homepage-moodboard-background .kinetic-moodboard{pointer-events:auto}
        .homepage-layered-experience.phase-reveal .homepage-foreground,.homepage-layered-experience.phase-active .homepage-foreground,.homepage-layered-experience.phase-return .homepage-foreground{pointer-events:none}
                .homepage-layered-experience.phase-reveal,.homepage-layered-experience.phase-active{height:100vh;height:100svh;overflow:hidden}
        @media(prefers-reduced-motion:reduce){.homepage-layered-experience *{transition-duration:.01ms!important;animation-duration:.01ms!important}}
      `}</style>
    </div>
  );
}
