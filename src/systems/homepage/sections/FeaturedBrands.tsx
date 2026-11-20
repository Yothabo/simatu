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
  demo?: boolean;
};

const BRANDS: Brand[] = [
  {
    id: 0,
    name: "Yotaabo",
    description: "A considered selection for everyday living, balancing useful essentials with a modern point of view. The brand is built around making daily choices feel intentional, with approachable style, quality and pieces that fit naturally into your routine.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Contemporary fashion retail interior",
    position: "50% 45%",
    href: "/yotaabo",
  },
  {
    id: 1,
    name: "Poshies",
    description: "A fashion destination for personal expression, bringing together looks that feel confident, versatile and individual. Find your own style, mix inspiration with practical pieces, and make getting dressed feel like an opportunity.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Editorial fashion portrait",
    position: "50% 42%",
    href: "/poshies",
  },
  {
    id: 2,
    name: "FORME",
    description: "Modern essentials through clean silhouettes, thoughtful details and pieces designed to work together. Its understated concept is an invitation to build personal style around comfort, simplicity and versatility.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Minimal contemporary clothing editorial",
    position: "50% 40%",
    demo: true,
  },
  {
    id: 3,
    name: "NOMA HOME",
    description: "Calm spaces and everyday rituals. Considered textures and uncomplicated forms create a quieter atmosphere, making room for comfort, balance and the small moments that make a space feel like yours.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Quiet, curated contemporary home interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 4,
    name: "MUSE BEAUTY",
    description: "Routines that help you feel refreshed and confident. Its concept brings beauty essentials into a simple daily ritual, pairing thoughtful presentation with a personal approach to care and self-expression.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Skincare and beauty product arrangement",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 5,
    name: "OFFCUT",
    description: "Inspired by street culture, individuality and the energy of everyday life. It is built for expressive styling, unexpected combinations and pieces that carry character without chasing every trend.",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Streetwear apparel editorial",
    position: "50% 45%",
    demo: true,
  },
  {
    id: 6,
    name: "ATELIER 09",
    description: "Finishing touches that make an outfit feel complete. Its concept highlights accessories, considered materials and detail-led design, bringing together pieces that add personality and remain easy to wear.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Leather accessories photographed for a fashion campaign",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 7,
    name: "FIELD NOTES",
    description: "Inspired by open landscapes, movement and time spent outside. It brings together outdoor-minded essentials for exploring at your own pace and finding inspiration beyond the everyday.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Open natural landscape",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 8,
    name: "STUDIO OBJECT",
    description: "Consider the things we choose to keep close. It is a collection of functional, thoughtfully designed objects where utility meets character and everyday items become part of an intentional environment.",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Curated design objects in a contemporary interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 9,
    name: "SUNDAY MARKET",
    description: "A relaxed collection of finds for everyday living, bringing together style, discovery and ease. Browse without rush and find pieces that feel useful, distinctive and naturally at home in your life.",
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
  const sectionVisibleRef = useRef(false);
  const scrollPauseUntilRef = useRef(0);

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

    return () => {
      window.clearInterval(timer);
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
    return `thumb-${distanceBehind - 1}`;
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
                className={`epr-card ${slot}`}
                key={brand.id}
                type="button"
                onClick={() => isThumb && activate(brand.id, true)}
                tabIndex={isThumb ? 0 : -1}
                aria-label={isThumb ? `View ${brand.name}` : undefined}
                aria-hidden={!isThumb}
                style={{ "--image-position": brand.position } as CSSProperties}
              >
                <img src={brand.image} alt={brand.imageAlt} draggable={false} loading="eager" decoding="async" fetchPriority={slot === "hero" ? "high" : "low"} />
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
      </div>
    </section>
  );
}
