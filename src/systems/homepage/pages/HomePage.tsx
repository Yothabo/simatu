import React, { useEffect, useRef, useState } from "react";
import Hero from "../hero/Hero";
import DiscoverSection from "../discover/DiscoverSection";
import KineticMoodboard from "../discover/KineticMoodboard";
import Footer from "../footer";

/** Coordinates homepage motion with transition events and conservative watchdog fallbacks. */
const EXIT_ANIMATION_MS = 1000;
const EXIT_WATCHDOG_MS = EXIT_ANIMATION_MS + 250;
const DISCOVERY_REVEAL_WATCHDOG_MS = 2000; // Activates controls promptly; tile reveal continues independently.
const HOME_RETURN_WATCHDOG_MS = 900;
export default function HomePage() {
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "exit" | "reveal" | "active" | "return">("idle");
  const exitCompletion = useRef({ header: false, hero: false, footer: false, discover: false });

  useEffect(() => {
    if (transitionPhase !== "exit") return;
    const timeout = window.setTimeout(() => setTransitionPhase("reveal"), EXIT_WATCHDOG_MS);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);


  useEffect(() => {
    if (transitionPhase !== "reveal") return;
    const timeout = window.setTimeout(() => setTransitionPhase("active"), DISCOVERY_REVEAL_WATCHDOG_MS);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== "return") return;
    const timeout = window.setTimeout(() => setTransitionPhase("idle"), HOME_RETURN_WATCHDOG_MS);
    return () => window.clearTimeout(timeout);
  }, [transitionPhase]);

  const startDiscovery = () => {
    exitCompletion.current = { header: false, hero: false, footer: false, discover: false };
    setTransitionPhase("exit");
  };

  const startHomeReturn = () => setTransitionPhase("return");

  const handleExitTransitionEnd = (event: React.TransitionEvent<HTMLElement>) => {
    if (transitionPhase !== "exit") return;
    const target = event.target as HTMLElement;
    if (target.classList.contains("hero-navigation") && event.propertyName === "transform") exitCompletion.current.header = true;
    if (target.classList.contains("novae-hero") && event.propertyName === "transform") exitCompletion.current.hero = true;
    if (target.tagName === "FOOTER" && event.propertyName === "transform") exitCompletion.current.footer = true;
    if (target.classList.contains("homepage-discover-trigger-section") && event.propertyName === "opacity") exitCompletion.current.discover = true;
    const finished = Object.values(exitCompletion.current).every(Boolean);
    if (finished) setTransitionPhase("reveal");
  };

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
        <KineticMoodboard colorReveal={transitionPhase === "reveal" || transitionPhase === "active"} interactive={transitionPhase === "reveal" || transitionPhase === "active"} onExit={startHomeReturn} />
      </div>
      <div className="homepage-foreground" onTransitionEnd={handleExitTransitionEnd}>
        <main className="homepage-main">
          <Hero />
          <DiscoverSection onDiscover={startDiscovery} />
        </main>
        <Footer />
      </div>
      <style>{`
        .homepage-layered-experience{position:relative;min-height:100vh;background:#111}
        .homepage-moodboard-background{position:fixed;inset:0;z-index:0;overflow:hidden;background:linear-gradient(180deg,rgba(12,12,12,.08) 0%,rgba(12,12,12,.28) 48%,rgba(12,12,12,.62) 100%)}
        .homepage-moodboard-background .kinetic-moodboard{position:absolute;inset:0;width:100%;height:100%;z-index:1;opacity:1;pointer-events:none}
        .homepage-moodboard-gradient{position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,rgba(10,10,10,.06) 0%,rgba(10,10,10,.16) 45%,rgba(10,10,10,.48) 100%)}
        .homepage-foreground{position:relative;z-index:2}
        .homepage-layered-experience.phase-active .homepage-moodboard-background .kinetic-moodboard{pointer-events:auto}
        .homepage-layered-experience.phase-reveal .homepage-foreground,.homepage-layered-experience.phase-active .homepage-foreground,.homepage-layered-experience.phase-return .homepage-foreground{pointer-events:none}
        .homepage-layered-experience .homepage-main>.hero-navigation,.homepage-layered-experience .homepage-main>.novae-hero{will-change:opacity,transform}
        .homepage-layered-experience .homepage-main>.hero-navigation{transition:opacity .55s cubic-bezier(.2,.65,.25,1),transform .55s cubic-bezier(.2,.65,.25,1);color:#fff}.homepage-layered-experience .homepage-main>.hero-navigation .brand{color:#fff}
        .homepage-layered-experience .homepage-main>.novae-hero{transition:opacity ${EXIT_ANIMATION_MS}ms cubic-bezier(.2,.65,.25,1),transform ${EXIT_ANIMATION_MS}ms cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience .homepage-main>.homepage-discover-trigger-section{transition:opacity .55s ease,visibility .55s}
        .homepage-layered-experience .homepage-foreground>footer{transition:opacity 1s cubic-bezier(.2,.65,.25,1),transform 1s cubic-bezier(.2,.65,.25,1)}
        .homepage-layered-experience.phase-exit .homepage-main>.hero-navigation,.homepage-layered-experience.phase-reveal .homepage-main>.hero-navigation,.homepage-layered-experience.phase-active .homepage-main>.hero-navigation,.homepage-layered-experience.phase-return .homepage-main>.hero-navigation{opacity:0;transform:translateY(-110%);pointer-events:none}.homepage-layered-experience.phase-exit .homepage-main>.novae-hero,.homepage-layered-experience.phase-reveal .homepage-main>.novae-hero,.homepage-layered-experience.phase-active .homepage-main>.novae-hero,.homepage-layered-experience.phase-return .homepage-main>.novae-hero{opacity:0;transform:translateY(-100px);pointer-events:none}
        
        .homepage-layered-experience.phase-exit .homepage-main>.homepage-discover-trigger-section,.homepage-layered-experience.phase-reveal .homepage-main>.homepage-discover-trigger-section,.homepage-layered-experience.phase-active .homepage-main>.homepage-discover-trigger-section,.homepage-layered-experience.phase-return .homepage-main>.homepage-discover-trigger-section{opacity:0;visibility:hidden;pointer-events:none}
        .homepage-layered-experience.phase-exit .homepage-foreground>footer,.homepage-layered-experience.phase-reveal .homepage-foreground>footer,.homepage-layered-experience.phase-active .homepage-foreground>footer,.homepage-layered-experience.phase-return .homepage-foreground>footer{opacity:0;transform:translateY(100px);pointer-events:none}
        .homepage-layered-experience.phase-reveal,.homepage-layered-experience.phase-active{height:100vh;height:100svh;overflow:hidden}
        @media(prefers-reduced-motion:reduce){.homepage-layered-experience *{transition-duration:.01ms!important;animation-duration:.01ms!important}}
      `}</style>
    </div>
  );
}
