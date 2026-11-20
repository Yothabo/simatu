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
  category: string;
  descriptor?: string;
  videoSrc?: string;
};

const BRANDS: Brand[] = [
  {
    id: 0,
    category: "Lifestyle",
    descriptor: "Atmosphere",
    videoSrc: "/videos/brands/yotaabo.mp4",
    name: "Yotaabo",
    description: "Some scents say everything without a single word. Find the fragrance that becomes your signature.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Contemporary fashion retail interior",
    position: "50% 45%",
    href: "/yotaabo",
  },
  {
    id: 1,
    category: "Apparel",
    descriptor: "Femininity",
    videoSrc: "/videos/brands/poshies.mp4",
    name: "Poshies",
    description: "No one is perfect. Feel beautiful, comfortable, and confidently yourself in every little detail.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Editorial fashion portrait",
    position: "50% 42%",
    href: "/poshies",
  },
  {
    id: 2,
    category: "Apparel",
    descriptor: "Minimalism",
    name: "FORME",
    description: "Less noise, more style. Explore everyday essentials shaped by simplicity, comfort, and effortless confidence.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Minimal contemporary clothing editorial",
    position: "50% 40%",
    demo: true,
  },
  {
    id: 3,
    category: "Home",
    descriptor: "Serenity",
    name: "NOMA HOME",
    description: "Make room for calm. Thoughtful pieces and soft textures turn everyday spaces into places you love being.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Quiet, curated contemporary home interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 4,
    category: "Beauty",
    descriptor: "Ritual",
    name: "MUSE BEAUTY",
    description: "Your daily dose of feeling good. Beauty essentials that make self-care a moment worth keeping.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Skincare and beauty product arrangement",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 5,
    category: "Streetwear",
    descriptor: "Edge",
    name: "OFFCUT",
    description: "Wear your own rules. Street-inspired pieces for individuality, attitude, and unapologetic expression.",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Streetwear apparel editorial",
    position: "50% 45%",
    demo: true,
  },
  {
    id: 6,
    category: "Accessories",
    descriptor: "Detail",
    name: "ATELIER 09",
    description: "It is all in the details. Accessories that add character, elevate the everyday, and make a look your own.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Leather accessories photographed for a fashion campaign",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 7,
    category: "Outdoor",
    descriptor: "Adventure",
    name: "FIELD NOTES",
    description: "Take the long way. Essentials made for fresh air, new places, and a little more adventure.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Open natural landscape",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 8,
    category: "Home",
    descriptor: "Purpose",
    name: "STUDIO OBJECT",
    description: "Objects with purpose and personality. Thoughtful design for the spaces and rituals that matter.",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Curated design objects in a contemporary interior",
    position: "50% 50%",
    demo: true,
  },
  {
    id: 9,
    category: "Lifestyle",
    descriptor: "Discovery",
    name: "SUNDAY MARKET",
    description: "Good finds, no rush. Explore everyday pieces with charm, character, and a little unexpected delight.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=88",
    imageAlt: "Lifestyle fashion editorial",
    position: "50% 45%",
    demo: true,
  },
];

const VISIBLE_CARDS = 5;
const TRANSITION_MS = 900;
const AUTOPLAY_MS = 12000;

export default function FeaturedBrands() {
  const [active, setActive] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [previousActive, setPreviousActive] = useState<number | null>(null);
  const activeRef = useRef(0);
  const pauseUntil = useRef(0);
  const transitionTimerRef = useRef<number | null>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const restartAutoplayRef = useRef<() => void>(() => {});
  const isTransitioningRef = useRef(false);
  const sectionVisibleRef = useRef(false);
  const heroVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
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
      setSectionVisible(sectionVisibleRef.current);
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
    return `thumb-${distanceBehind - 1}`;
  };

  useEffect(() => {
    heroVideoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.playbackRate = [1, 0.82, 1.08, 0.92][index] ?? 1;
    });
  }, [active, sectionVisible]);

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
                onClick={() => isThumb ? activate(brand.id, true) : brand.href && window.location.assign(brand.href)}
                tabIndex={0}
                aria-label={`View ${brand.name}`}
                aria-hidden={false}
                style={{ "--image-position": brand.position } as CSSProperties}
              >
                {!(slot === "hero" && sectionVisible && brand.videoSrc) && (
                  <img src={brand.image} alt={brand.imageAlt} draggable={false} loading="eager" decoding="async" fetchPriority={slot === "hero" ? "high" : "low"} />
                )}
                {slot === "hero" && sectionVisible && brand.videoSrc && (
                  <div className="epr-video-mosaic" aria-hidden="true">
                    <video
                      ref={(video) => { heroVideoRefs.current[0] = video; }}
                      className="epr-video-panel epr-video-panel-top"
                      src={brand.videoSrc}
                      muted loop autoPlay playsInline preload="none"
                    />
                    <video
                      ref={(video) => { heroVideoRefs.current[1] = video; }}
                      className="epr-video-panel epr-video-panel-left"
                      src={brand.videoSrc}
                      muted loop autoPlay playsInline preload="none"
                    />
                    <div className="epr-video-right">
                      <video
                        ref={(video) => { heroVideoRefs.current[2] = video; }}
                        className="epr-video-panel epr-video-panel-square"
                        src={brand.videoSrc}
                        muted loop autoPlay playsInline preload="none"
                      />
                      <video
                        ref={(video) => { heroVideoRefs.current[3] = video; }}
                        className="epr-video-panel epr-video-panel-bottom"
                        src={brand.videoSrc}
                        muted loop autoPlay playsInline preload="none"
                      />
                    </div>
                  </div>
                )}
                {slot === "hero" && (
                  <span
                    className="epr-hero-arrow"
                    aria-hidden="true"
                    style={{ "--epr-cta-color": brand.id === 1 ? "#ff1493" : "#8aa89b" } as CSSProperties}
                  >Visit Site</span>
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
            <span className={`epr-category-label ${current.descriptor ? "is-descriptor" : ""}`}>{current.descriptor ?? current.category}</span>
          </article>
        </div>
      </div>
    </section>
  );
}
