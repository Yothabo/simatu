import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./featured-brands.css";

type Brand = {
  id: number;
  name: string;
  tagline: string;
  image: string;
  imageAlt: string;
  position: string;
  href?: string;
  demo?: boolean;
};

const BRANDS: Brand[] = [
  {
    id: 0,
    name: "Yotaabo",
    tagline: "Everyday, reimagined",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Contemporary fashion retail interior",
    position: "50% 45%",
    href: "/yotaabo",
  },
  {
    id: 1,
    name: "Poshies",
    tagline: "Style, your way",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Editorial fashion portrait",
    position: "50% 42%",
    href: "/poshies",
  },
  {
    id: 2,
    name: "FORME",
    tagline: "Modern essentials",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Minimal contemporary clothing editorial",
    position: "50% 40%",
    demo: true,
  },
  {
    id: 3,
    name: "NOMA HOME",
    tagline: "Quiet living",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Quiet, curated contemporary home interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 4,
    name: "MUSE BEAUTY",
    tagline: "Daily ritual",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Skincare and beauty product arrangement",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 5,
    name: "OFFCUT",
    tagline: "Street culture",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Streetwear apparel editorial",
    position: "50% 45%",
    demo: true,
  },
  {
    id: 6,
    name: "ATELIER 09",
    tagline: "Finishing details",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Leather accessories photographed for a fashion campaign",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 7,
    name: "FIELD NOTES",
    tagline: "Open outdoors",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Open natural landscape",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 8,
    name: "STUDIO OBJECT",
    tagline: "Useful beauty",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Curated design objects in a contemporary interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 9,
    name: "SUNDAY MARKET",
    tagline: "Curated living",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Lifestyle fashion editorial",
    position: "50% 45%",
    demo: true,
  },
];

const VISIBLE_CARDS = 5;
const TRANSITION_MS = 1200;
const AUTOPLAY_MS = 5600;

export default function FeaturedBrands() {
  const [active, setActive] = useState(0);
  const [previousActive, setPreviousActive] = useState<number | null>(null);
  const activeRef = useRef(0);
  const pauseUntil = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  const activate = useCallback((id: number, fromUser = false) => {
    if (id === activeRef.current || isTransitioningRef.current) return;

    if (fromUser) pauseUntil.current = Date.now() + 9000;

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

  // The five images in the initial composition are requested immediately by
  // the rendered cards. Remaining images are fetched two at a time at low
  // priority so they are cached before the carousel reaches them, without
  // competing with the hero image or blocking the first page paint.
  useEffect(() => {
    let cancelled = false;
    let nextIndex = VISIBLE_CARDS;
    let activeLoads = 0;
    const maxConcurrentLoads = 2;
    const pendingImages: HTMLImageElement[] = [];

    const loadNext = () => {
      if (cancelled) return;

      while (
        activeLoads < maxConcurrentLoads &&
        nextIndex < BRANDS.length
      ) {
        const brand = BRANDS[nextIndex++];
        const image = new Image();
        image.decoding = "async";
        image.fetchPriority = "low";
        activeLoads += 1;
        pendingImages.push(image);

        const finish = () => {
          activeLoads -= 1;
          loadNext();
        };

        image.onload = finish;
        image.onerror = finish;
        image.src = brand.image;
      }
    };

    const startTimer = window.setTimeout(loadNext, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      pendingImages.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (
        document.visibilityState !== "visible" ||
        Date.now() < pauseUntil.current ||
        isTransitioningRef.current
      ) {
        return;
      }

      activate((activeRef.current + 1) % BRANDS.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
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
    return `thumb-${distanceBehind - 1}`;
  };

  const current = BRANDS[active];
  const previous = previousActive === null ? null : BRANDS[previousActive];
  const nextBrand = (active + 1) % BRANDS.length;

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
                className={`epr-card ${slot}`}
                key={brand.id}
                type="button"
                onClick={() => isThumb && activate(brand.id, true)}
                tabIndex={isThumb ? 0 : -1}
                aria-label={isThumb ? `View ${brand.name}` : undefined}
                aria-hidden={!isThumb}
                style={{ "--image-position": brand.position } as CSSProperties}
              >
                <img
                  src={brand.image}
                  alt={brand.imageAlt}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  fetchPriority={slot === "hero" ? "high" : "low"}
                />
                {isThumb && (
                  <span className="epr-meta" aria-hidden="true">
                    <strong>{brand.name}</strong>
                    <small>{brand.tagline}</small>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="epr-copy" aria-live="polite">
          {previous && (
            <article className="epr-copy-layer is-leaving" aria-hidden="true">
              <p className="epr-tagline">{previous.tagline}</p>
              <p className="epr-description">Read about the brand</p>
            </article>
          )}

          <article
            className={`epr-copy-layer ${previous ? "is-entering" : ""}`}
            key={active}
          >
            <p className="epr-tagline">{current.tagline}</p>
            <p className="epr-description">Read about the brand</p>
            {current.href ? (
              <a className="epr-visit" href={current.href}>
                Visit {current.name} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="epr-visit is-unavailable" aria-disabled="true">
                Temporary concept <span aria-hidden="true">—</span>
              </span>
            )}
          </article>
        </div>

        <button
          className="epr-next"
          type="button"
          aria-label={`Show next brand: ${BRANDS[nextBrand].name}`}
          onClick={() => activate(nextBrand, true)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}
