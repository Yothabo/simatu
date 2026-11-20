import { useEffect, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import { visuals } from "./hero.data";

export function useHeroImageRotation() {
  const [activeImage, setActiveImage] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pauseUntil = useRef(0);
  const autoplayTimerRef = useRef<number | null>(null);
  const restartAutoplayRef = useRef<() => void>(() => {});
  const isPageVisible = useRef(true);
  const isHeroVisible = useRef(true);

  useEffect(() => {
    visuals.forEach((source) => {
      const image = new Image();
      image.decoding = "async";
      image.src = source;
    });
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".novae-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible.current = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        hero.classList.toggle("is-offscreen", !isHeroVisible.current);
      },
      { threshold: [0, 0.15] },
    );
    observer.observe(hero);

    const handleVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === "visible";
    };
    let scrollResetTimer: number | null = null;
    const handleScroll = () => {
      pauseUntil.current = Date.now() + 900;
      hero.classList.add("is-scrolling");

      if (scrollResetTimer !== null) window.clearTimeout(scrollResetTimer);
      scrollResetTimer = window.setTimeout(() => {
        hero.classList.remove("is-scrolling");
        scrollResetTimer = null;
      }, 180);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const scheduleNext = (delay: number) => {
      if (autoplayTimerRef.current !== null) window.clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = window.setTimeout(() => {
        if (!isPageVisible.current || !isHeroVisible.current || Date.now() < pauseUntil.current) {
          scheduleNext(1000);
          return;
        }
        setActiveImage((current) => (current + 1) % visuals.length);
        scheduleNext(5500);
      }, delay);
    };
    restartAutoplayRef.current = () => scheduleNext(6500);
    scheduleNext(5500);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", handleScroll);
      if (scrollResetTimer !== null) window.clearTimeout(scrollResetTimer);
      hero.classList.remove("is-scrolling");
      if (autoplayTimerRef.current !== null) window.clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
      restartAutoplayRef.current = () => {};
    };
  }, []);

  const selectImage = (nextImage: number) => {
    pauseUntil.current = Date.now() + 6500;
    restartAutoplayRef.current();
    setActiveImage(nextImage);
  };


  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;

    if (!start || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 45) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;

    pauseUntil.current = Date.now() + 6500;
    restartAutoplayRef.current();
    setActiveImage((current) =>
      deltaX < 0
        ? (current + 1) % visuals.length
        : (current - 1 + visuals.length) % visuals.length,
    );
  };

  const handleTouchCancel = () => {
    touchStart.current = null;
  };

  return {
    activeImage,
    setActiveImage: selectImage,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  };
}

export function useHeroPointer() {
  const heroRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestPointer = useRef<{ x: number; y: number } | null>(null);

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    latestPointer.current = { x: event.clientX, y: event.clientY };

    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const hero = heroRef.current;
      const pointer = latestPointer.current;
      if (!hero || !pointer) return;

      const bounds = hero.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = (pointer.x - bounds.left) / bounds.width - 0.5;
      const y = (pointer.y - bounds.top) / bounds.height - 0.5;

      hero.style.setProperty("--pointer-x", `${x * 27}px`);
      hero.style.setProperty("--pointer-y", `${y * 19}px`);
      hero.style.setProperty("--ring-x", `${x * 16}px`);
      hero.style.setProperty("--ring-y", `${y * 12}px`);
    });
  };

  const resetPointer = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    latestPointer.current = null;
    const hero = heroRef.current;
    if (!hero) return;

    hero.style.setProperty("--pointer-x", "0px");
    hero.style.setProperty("--pointer-y", "0px");
    hero.style.setProperty("--ring-x", "0px");
    hero.style.setProperty("--ring-y", "0px");
  };

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  return {
    heroRef,
    handlePointerMove,
    resetPointer,
  };
}
