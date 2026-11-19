import { useEffect, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import { visuals } from "./hero.data";

export function useHeroImageRotation() {
  const [activeImage, setActiveImage] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    visuals.forEach((source) => {
      const image = new Image();
      image.decoding = "async";
      image.src = source;
    });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setActiveImage((current) => (current + 1) % visuals.length);
    }, 5500);

    return () => window.clearTimeout(timeout);
  }, [activeImage]);

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
    setActiveImage,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  };
}

export function useHeroPointer() {
  const heroRef = useRef<HTMLElement | null>(null);

  const handlePointerMove = (
    event: MouseEvent<HTMLElement>,
  ) => {
    const hero = heroRef.current;

    if (!hero) return;

    const bounds = hero.getBoundingClientRect();

    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    hero.style.setProperty("--pointer-x", `${x * 27}px`);
    hero.style.setProperty("--pointer-y", `${y * 19}px`);
    hero.style.setProperty("--ring-x", `${x * 16}px`);
    hero.style.setProperty("--ring-y", `${y * 12}px`);
  };

  const resetPointer = () => {
    const hero = heroRef.current;

    if (!hero) return;

    hero.style.setProperty("--pointer-x", "0px");
    hero.style.setProperty("--pointer-y", "0px");
    hero.style.setProperty("--ring-x", "0px");
    hero.style.setProperty("--ring-y", "0px");
  };

  return {
    heroRef,
    handlePointerMove,
    resetPointer,
  };
}
