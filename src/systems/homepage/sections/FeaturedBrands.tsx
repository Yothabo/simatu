import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./featured-brands.css";

type Brand = {
  id: number;
  name: string;
  headline?: string;
  description: string;
  image: string;
  imageAlt: string;
  position: string;
  isLogo?: boolean;
};

const BRANDS: Brand[] = [
  {
    id: 0,
    name: "Who We Are",
    description: "We bring people, ideas and commercial thinking together to explore opportunities and develop ventures with room to grow.",
    image: "https://images.pexels.com/photos/7169836/pexels-photo-7169836.jpeg?auto=compress&cs=tinysrgb&w=1440",
    imageAlt: "Editorial lifestyle image from the homepage hero visual collection",
    position: "50% 50%",
  },
  {
    id: 1,
    name: "Our Perspective",
    description: "We look beyond convention, bringing fresh thinking and considered decisions to the opportunities ahead.",
    image: "https://images.pexels.com/photos/7170700/pexels-photo-7170700.jpeg?auto=compress&cs=tinysrgb&w=1440",
    imageAlt: "Editorial lifestyle image from the homepage hero visual collection",
    position: "50% 42%",
  },
  {
    id: 2,
    name: "What We Build",
    description: "We bring ideas, technology and commerce together to shape ventures with purpose and room to grow.",
    image: "https://images.pexels.com/photos/9525731/pexels-photo-9525731.jpeg?auto=compress&cs=tinysrgb&w=1440",
    imageAlt: "Editorial lifestyle image from the homepage hero visual collection",
    position: "50% 45%",
  },
  {
    id: 3,
    name: "Opportunity",
    description: "We recognise opportunity in changing markets, emerging needs and ideas ready to move forward.",
    image: "https://images.pexels.com/photos/7170706/pexels-photo-7170706.jpeg?auto=compress&cs=tinysrgb&w=1440",
    imageAlt: "Editorial lifestyle image from the homepage hero visual collection",
    position: "50% 45%",
  },
  {
    id: 4,
    name: "Sustainable Growth",
    description: "Our focus is on building with intention and creating the foundations for sustainable growth.",
    image: "https://images.pexels.com/photos/9525731/pexels-photo-9525731.jpeg?auto=compress&cs=tinysrgb&w=1440",
    imageAlt: "Editorial lifestyle image from the homepage hero visual collection",
    position: "50% 45%",
  },
];


const VISIBLE_CARDS = 4;
const TRANSITION_MS = 900;
const AUTOPLAY_MS = 9000;

export default function SimatuIntroduction() {
  const [active, setActive] = useState(0);
  const [previousActive, setPreviousActive] = useState<number | null>(null);
  const activeRef = useRef(0);
  const pauseUntil = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const restartAutoplayRef = useRef<() => void>(() => {});
  const isTransitioningRef = useRef(false);
  const sectionVisibleRef = useRef(false);
  const scrollPauseUntilRef = useRef(0);

  const activate = useCallback((id: number, fromUser = false) => {
    if (fromUser) {
      pauseUntil.current = Date.now() + 9000;
      restartAutoplayRef.current();
    }
    if (id === activeRef.current || (isTransitioningRef.current && !fromUser)) return;

    isTransitioningRef.current = true;
    setPreviousActive(activeRef.current);
    activeRef.current = id;
    setActive(id);

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setPreviousActive(null);
      isTransitioningRef.current = false;
      transitionTimerRef.current = null;
    }, TRANSITION_MS);
  }, []);

  useEffect(() => {
    const section = document.querySelector(".epr-page");
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      const hasJustEntered = isVisible && !sectionVisibleRef.current;

      sectionVisibleRef.current = isVisible;
      section.classList.toggle("is-offscreen", !isVisible);

      // Whenever the section comes into view, lead with the introduction slide.
      if (hasJustEntered && activeRef.current !== 0) {
        activate(0);
      }
    }, { threshold: [0, 0.1] });
    observer.observe(section);

    let scrollResetTimer: number | null = null;
    const handleScroll = () => {
      scrollPauseUntilRef.current = Date.now() + 900;
      section.classList.add("is-scrolling");

      if (scrollResetTimer !== null) window.clearTimeout(scrollResetTimer);
      scrollResetTimer = window.setTimeout(() => {
        section.classList.remove("is-scrolling");
        scrollResetTimer = null;
      }, 180);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const timer = window.setInterval(() => {
      if (
        document.visibilityState !== "visible" ||
        !sectionVisibleRef.current ||
        Date.now() < pauseUntil.current ||
        Date.now() < scrollPauseUntilRef.current ||
        isTransitioningRef.current
      ) {
        return;
      }

      activate((activeRef.current + 1) % BRANDS.length);
    }, AUTOPLAY_MS);
    autoplayTimerRef.current = timer;
    restartAutoplayRef.current = () => {
      if (autoplayTimerRef.current !== null) window.clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = window.setInterval(() => {
        if (document.visibilityState !== "visible" || !sectionVisibleRef.current || Date.now() < pauseUntil.current || Date.now() < scrollPauseUntilRef.current || isTransitioningRef.current) return;
        activate((activeRef.current + 1) % BRANDS.length);
      }, AUTOPLAY_MS);
    };

    return () => {
      window.clearInterval(timer);
      if (autoplayTimerRef.current !== null) window.clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
      restartAutoplayRef.current = () => {};
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (scrollResetTimer !== null) window.clearTimeout(scrollResetTimer);
      section.classList.remove("is-scrolling");
    };
  }, [activate]);

  useEffect(
    () => () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    },
    [],
  );

  const deck = Array.from({ length: VISIBLE_CARDS }, (_, offset) => {
    const id = (active - offset + BRANDS.length) % BRANDS.length;
    return BRANDS[id];
  });

  const slotFor = (id: number) => {
    if (id === active) return "hero";
    const distanceBehind = (active - id + BRANDS.length) % BRANDS.length;
    if (distanceBehind === 1) return "thumb-2";
    if (distanceBehind === 2) return "thumb-3";
    return "thumb-0";
  };

  const current = BRANDS[active];
  const previous = previousActive === null ? null : BRANDS[previousActive];

  return (
    <section className="epr-page" aria-label="About Simatu">
      <div className="epr-stage">
        <p className="epr-count" aria-label={`Brand ${active + 1} of ${BRANDS.length}`}>
          <span className="epr-count-window" aria-hidden="true">
            {previousActive !== null && (
              <span className="epr-count-number is-leaving">
                {String(previousActive + 1).padStart(2, "0")}
              </span>
            )}
            <span
              className={`epr-count-number ${previousActive !== null ? "is-entering" : ""}`}
              key={active}
            >
              {String(active + 1).padStart(2, "0")}
            </span>
          </span>{" "}
          / {String(BRANDS.length).padStart(2, "0")}
        </p>

        <h2 className="epr-title" key={current.id}>
          {current.headline ?? current.name}
        </h2>

        <div className="epr-deck" aria-label="Choose a featured brand">
          {deck.map((brand) => {
            const slot = slotFor(brand.id);
            const isThumb = slot.startsWith("thumb");

            return (
              <button
                className={`epr-card ${slot} ${brand.isLogo ? "is-logo" : ""}`}
                key={brand.id}
                type="button"
                onClick={() => isThumb && activate(brand.id, true)}
                tabIndex={0}
                aria-label={`View ${brand.name}`}
                aria-hidden={false}
                style={{ "--image-position": brand.position } as CSSProperties}
              >
                <img src={brand.image} alt={brand.imageAlt} className={brand.isLogo ? "epr-logo-image" : undefined} draggable={false} loading="eager" decoding="async" fetchPriority={slot === "hero" ? "high" : "low"} />
                {isThumb && (
                  <span className="epr-meta" aria-hidden="true">
                    <strong>{brand.name}</strong>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="epr-copy" aria-live="polite">
          {previous && (
            <article className="epr-copy-layer is-leaving" aria-hidden="true">
              <p className="epr-description">{previous.description}</p>
            </article>
          )}

          <article
            className={`epr-copy-layer ${previous ? "is-entering" : ""}`}
            key={active}
          >
            <p className="epr-description">{current.description}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
