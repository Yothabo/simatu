import { useCallback, useEffect, useRef, useState } from "react";
import "./featured-brands.css";

type Brand = {
  id: number;
  name: string;
  category: string;
  descriptor: string;
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
    category: "Digital commerce",
    descriptor: "Everyday essentials, considered differently.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Contemporary fashion retail interior",
    position: "50% 45%",
    href: "/yotaabo",
  },
  {
    id: 1,
    name: "Poshies",
    category: "Fashion & lifestyle",
    descriptor: "A little more you.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Editorial fashion portrait",
    position: "50% 42%",
    href: "/poshies",
  },
  {
    id: 2,
    name: "FORME",
    category: "Apparel concept store",
    descriptor: "Designed for the everyday uniform.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Minimal contemporary clothing editorial",
    position: "50% 40%",
    demo: true,
  },
  {
    id: 3,
    name: "NOMA HOME",
    category: "Home & living concept store",
    descriptor: "Objects that make a space feel like yours.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Quiet, curated contemporary home interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 4,
    name: "MUSE BEAUTY",
    category: "Beauty concept store",
    descriptor: "A daily ritual, made personal.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Skincare and beauty product arrangement",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 5,
    name: "OFFCUT",
    category: "Streetwear concept store",
    descriptor: "Made to move outside the lines.",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Streetwear apparel editorial",
    position: "50% 45%",
    demo: true,
  },
  {
    id: 6,
    name: "ATELIER 09",
    category: "Accessories concept store",
    descriptor: "The finishing touch is never an afterthought.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Leather accessories photographed for a fashion campaign",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 7,
    name: "FIELD NOTES",
    category: "Outdoor concept store",
    descriptor: "For wherever the day takes you.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Open natural landscape",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 8,
    name: "STUDIO OBJECT",
    category: "Design goods concept store",
    descriptor: "Useful things, beautifully resolved.",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Curated design objects in a contemporary interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 9,
    name: "SUNDAY MARKET",
    category: "Lifestyle concept store",
    descriptor: "A collection of good things.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Lifestyle fashion editorial",
    position: "50% 45%",
    demo: true,
  },
];

const TRANSITION_MS = 1100;

export default function FeaturedBrands() {
  const [active, setActive] = useState(0);
  const [previousActive, setPreviousActive] = useState<number | null>(null);
  const activeRef = useRef(active);
  const pauseUntil = useRef(0);
  const transitionTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const isTransitioningRef = useRef(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  const activate = useCallback((id: number, fromUser = false) => {
    if (id === activeRef.current || isTransitioningRef.current) return;

    if (fromUser) pauseUntil.current = Date.now() + 5200;

    const previous = activeRef.current;
    isTransitioningRef.current = true;
    setPreviousActive(previous);
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
    BRANDS.forEach(({ image }) => {
      const img = new Image();
      img.src = image;
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Date.now() < pauseUntil.current || isTransitioningRef.current) return;
      activate((activeRef.current + 1) % BRANDS.length);
    }, 3400);

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

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let x = -80;
    let y = -80;

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const target = event.target;
      const overButton =
        target instanceof Element && Boolean(target.closest("button"));
      cursor.classList.toggle("is-hovering", overButton);

      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          frame = 0;
        });
      }
    };

    const down = () => cursor.classList.add("is-down");
    const up = () => cursor.classList.remove("is-down");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const slotFor = (id: number) => {
    if (id === active) return "hero";
    const distanceBehind = (active - id + BRANDS.length) % BRANDS.length;
    if (distanceBehind === 1) return "thumb-0";
    if (distanceBehind === 2) return "thumb-1";
    if (distanceBehind === 3) return "thumb-2";
    return "thumb-3";
  };

  // Keep the same five-card choreography as the supplied reference while
  // allowing the carousel to cycle through all ten brand entries.
  const deck = Array.from({ length: 5 }, (_, offset) => {
    const id = (active - offset + BRANDS.length) % BRANDS.length;
    return BRANDS[id];
  });
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

        <h2 className="epr-title">Brands</h2>

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
                style={{ "--image-position": brand.position } as React.CSSProperties}
              >
                <img src={brand.image} alt="" draggable={false} />
                <span className="epr-progress" aria-hidden="true" />
                <span className="epr-meta" aria-hidden="true">
                  <strong>{brand.name}</strong>
                  <small>{brand.category}{brand.demo ? " · Visual demo" : ""}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="epr-copy" aria-live="polite">
          {previous && (
            <article className="epr-copy-layer is-leaving" aria-hidden="true">
              <header className="epr-author">
                <strong>{previous.name}</strong>
                <span>{previous.category}</span>
              </header>
              <p className="epr-description">{previous.descriptor}</p>
            </article>
          )}

          <article
            className={`epr-copy-layer ${previous ? "is-entering" : ""}`}
            key={active}
          >
            <header className="epr-author">
              <strong>{current.name}</strong>
              <span>{current.category}{current.demo ? " · Temporary visual demo" : ""}</span>
            </header>
            <p className="epr-description">{current.descriptor}</p>
            {current.href ? (
              <a className="epr-visit" href={current.href}>
                Explore the store <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="epr-concept">Concept store / temporary showcase</span>
            )}
          </article>
        </div>

        <button
          className="epr-next"
          type="button"
          aria-label="Show next brand"
          onClick={() => activate(nextBrand, true)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="epr-cursor" ref={cursorRef} aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
