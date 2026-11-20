import { useEffect, useState } from "react";
import "./featured-brands.css";

type BrandSlide = {
  name: string;
  category: string;
  descriptor: string;
  image: string;
  imageAlt: string;
  href?: string;
  demo?: boolean;
};

const brands: BrandSlide[] = [
  {
    name: "Yotaabo",
    category: "Digital commerce",
    descriptor: "Everyday essentials, considered differently.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Contemporary fashion retail interior",
    href: "/yotaabo",
  },
  {
    name: "Poshies",
    category: "Fashion & lifestyle",
    descriptor: "A little more you.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Editorial fashion portrait",
    href: "/poshies",
  },
  {
    name: "FORME",
    category: "Apparel concept store",
    descriptor: "Designed for the everyday uniform.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Minimal contemporary clothing editorial",
    demo: true,
  },
  {
    name: "NOMA HOME",
    category: "Home & living concept store",
    descriptor: "Objects that make a space feel like yours.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Quiet, curated contemporary home interior",
    demo: true,
  },
  {
    name: "MUSE BEAUTY",
    category: "Beauty concept store",
    descriptor: "A daily ritual, made personal.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Skincare and beauty product arrangement",
    demo: true,
  },
  {
    name: "OFFCUT",
    category: "Streetwear concept store",
    descriptor: "Made to move outside the lines.",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Streetwear apparel editorial",
    demo: true,
  },
  {
    name: "ATELIER 09",
    category: "Accessories concept store",
    descriptor: "The finishing touch is never an afterthought.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Leather accessories photographed for a fashion campaign",
    demo: true,
  },
  {
    name: "FIELD NOTES",
    category: "Outdoor concept store",
    descriptor: "For wherever the day takes you.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Open natural landscape",
    demo: true,
  },
  {
    name: "STUDIO OBJECT",
    category: "Design goods concept store",
    descriptor: "Useful things, beautifully resolved.",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Curated design objects in a contemporary interior",
    demo: true,
  },
  {
    name: "SUNDAY MARKET",
    category: "Lifestyle concept store",
    descriptor: "A collection of good things.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2400&q=88",
    imageAlt: "Lifestyle fashion editorial",
    demo: true,
  },
];

export default function FeaturedBrands() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeBrand = brands[activeIndex];

  useEffect(() => {
    if (isPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % brands.length);
    }, 5600);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, isPaused]);

  const goTo = (index: number) => {
    setActiveIndex((index + brands.length) % brands.length);
  };

  return (
    <section
      className="hp-brands"
      id="work"
      aria-label="Featured brands"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="hp-brands__slides" aria-live="off">
        {brands.map((brand, index) => (
          <div
            className={index === activeIndex ? "hp-brands__slide is-active" : "hp-brands__slide"}
            key={brand.name}
            aria-hidden={index !== activeIndex}
          >
            <img
              className="hp-brands__image"
              src={brand.image}
              alt={index === activeIndex ? brand.imageAlt : ""}
              loading={index === activeIndex ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      <div className="hp-brands__scrim" />

      <div className="hp-brands__topline">
        <span>Selected brands</span>
        <span>Simatu / 01—10</span>
      </div>

      <div className="hp-brands__content" key={activeBrand.name}>
        <p className="hp-brands__eyebrow">
          {activeBrand.category}
          {activeBrand.demo && <span className="hp-brands__demo">Visual demo</span>}
        </p>
        <h2>{activeBrand.name}</h2>
        <p className="hp-brands__descriptor">{activeBrand.descriptor}</p>
        {activeBrand.href ? (
          <a className="hp-brands__visit" href={activeBrand.href}>
            Explore the store <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="hp-brands__concept">Concept store / temporary showcase</span>
        )}
      </div>

      <div className="hp-brands__controls" aria-label="Brand carousel controls">
        <div className="hp-brands__counter">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <span className="hp-brands__counter-rule" />
          <span>{String(brands.length).padStart(2, "0")}</span>
        </div>

        <div className="hp-brands__progress" aria-label="Choose a featured brand">
          {brands.map((brand, index) => (
            <button
              className={index === activeIndex ? "is-active" : ""}
              key={brand.name}
              type="button"
              aria-label={`Show ${brand.name}`}
              aria-pressed={index === activeIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>

        <div className="hp-brands__arrows">
          <button type="button" aria-label="Previous brand" onClick={() => goTo(activeIndex - 1)}>←</button>
          <button type="button" aria-label="Next brand" onClick={() => goTo(activeIndex + 1)}>→</button>
        </div>
      </div>

      <span className="hp-brands__side-label" aria-hidden="true">A considered digital ecosystem</span>
    </section>
  );
}
