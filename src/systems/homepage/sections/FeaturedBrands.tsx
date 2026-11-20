import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./featured-brands.css";

type Brand = {
  id: number;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  position: string;
  href?: string;
  isLogo?: boolean;
};

const BRANDS: Brand[] = [
  {
    id: 0,
    name: "Poshies",
    description: "No one is perfect. Feel beautiful, comfortable, and confidently yourself in every little detail.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Editorial fashion portrait",
    position: "50% 42%",
    href: "/poshies",
  },
  {
    id: 1,
    name: "Yotaabo",
    description: "Some scents say everything without a single word. Find the fragrance that becomes your signature.",
    image: "https://media.macphun.com/img/uploads/customer/blog/1752169898/1752170008686ffe183af522.98492050.jpg?q=85&w=1680",
    imageAlt: "Atmospheric amber fragrance bottle in dramatic luxury editorial lighting",
    position: "50% 45%",
    href: "/yotaabo",
  },
  {
    id: 2,
    name: "Our Brands",
    description: "Discover Simatu’s growing collection of brands, each created to bring its own style, character, and experience. Explore Poshies and Yotaabo, and find the brand that speaks to you.",
    image: "/simatu.png",
    imageAlt: "Simatu logo",
    position: "50% 50%",
    isLogo: true,
  },
];


const VISIBLE_CARDS = BRANDS.length;
const TRANSITION_MS = 900;
const AUTOPLAY_MS = 9000;

export default function FeaturedBrands() {
  const [active, setActive] = useState(2);
  const [previousActive, setPreviousActive] = useState<number | null>(null);
  const activeRef = useRef(2);
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
      sectionVisibleRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      section.classList.toggle("is-offscreen", !sectionVisibleRef.current);
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
    return distanceBehind === 1 ? "thumb-2" : "thumb-3";
  };

  const current = BRANDS[active];
  const previous = previousActive === null ? null : BRANDS[previousActive];

  return (
    <section className="epr-page" aria-label="Featured brands">
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
          {current.name}
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
                onClick={() => isThumb ? activate(brand.id, true) : brand.href && window.location.assign(brand.href)}
                tabIndex={0}
                aria-label={`View ${brand.name}`}
                aria-hidden={false}
                style={{ "--image-position": brand.position } as CSSProperties}
              >
                <img src={brand.image} alt={brand.imageAlt} className={brand.isLogo ? "epr-logo-image" : undefined} draggable={false} loading="eager" decoding="async" fetchPriority={slot === "hero" ? "high" : "low"} />
                {slot === "hero" && (
                  <span
                    className="epr-hero-arrow"
                    aria-hidden="true"
                    style={{ "--epr-cta-color": brand.id === 2 ? "var(--hp-color-primary)" : brand.id === 1 ? "#ff1493" : "#8aa89b" } as CSSProperties}
                  >{brand.id === 2 ? "Explore Our Brands" : "Visit Site"}</span>
                )}
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
