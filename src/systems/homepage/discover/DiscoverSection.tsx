import React, { useMemo, useState } from "react";

type DiscoveryCategory = "All" | "Style" | "Spaces" | "Living" | "Ideas";

interface DiscoveryCard {
  category: Exclude<DiscoveryCategory, "All">;
  title: string;
  description: string;
  image: string;
  href: string;
  store: string;
}

const DISCOVERIES: DiscoveryCard[] = [
  { category: "Style", title: "A different point of view", description: "Pieces that make everyday style feel personal.", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&q=85", href: "/poshies/catalog", store: "Poshies" },
  { category: "Spaces", title: "Room to reimagine", description: "Spaces, details and ideas worth bringing home.", image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1000&q=85", href: "/yotaabo/catalog", store: "Yotaabo" },
  { category: "Living", title: "Everyday, considered", description: "Small details that make daily living better.", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1000&q=85", href: "/yotaabo/catalog", store: "Yotaabo" },
  { category: "Ideas", title: "Made to inspire", description: "Creative spaces, fresh perspectives and new finds.", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=85", href: "/poshies/catalog", store: "Poshies" },
  { category: "Style", title: "Find your expression", description: "Explore the shapes, textures and looks that speak to you.", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85", href: "/poshies/catalog", store: "Poshies" },
  { category: "Living", title: "Objects with purpose", description: "Useful, beautiful things for the spaces you live in.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=85", href: "/yotaabo/catalog", store: "Yotaabo" },
];

const CATEGORIES: DiscoveryCategory[] = ["All", "Style", "Spaces", "Living", "Ideas"];

export default function DiscoverSection() {
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory>("All");
  const cards = useMemo(
    () => activeCategory === "All" ? DISCOVERIES : DISCOVERIES.filter((card) => card.category === activeCategory),
    [activeCategory],
  );

  return (
    <section className="homepage-discover-section" aria-labelledby="homepage-discover-title">
      <div className="homepage-discover-inner">
        <header className="homepage-discover-heading">
          <div className="homepage-discover-eyebrow">A little more to explore</div>
          <div className="homepage-discover-title-row">
            <h2 id="homepage-discover-title">Discover what moves you.</h2>
            <p>Find inspiration across style, spaces and everyday living. Follow a feeling, explore a collection, or find something unexpected.</p>
          </div>
        </header>

        <nav className="homepage-discover-filters" aria-label="Filter discoveries">
          {CATEGORIES.map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? "is-active" : ""}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        <div className="homepage-discover-grid" aria-live="polite">
          {cards.map((card, index) => (
            <a className={`homepage-discover-card homepage-discover-card-${index + 1}`} href={card.href} key={card.title}>
              <div className="homepage-discover-card-image">
                <img src={card.image} alt="" loading={index > 2 ? "lazy" : "eager"} />
                <span className="homepage-discover-card-category">{card.category}</span>
                <span className="homepage-discover-card-arrow" aria-hidden="true">↗</span>
              </div>
              <div className="homepage-discover-card-copy">
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <span className="homepage-discover-card-store">Explore {card.store}</span>
              </div>
            </a>
          ))}
        </div>

        <footer className="homepage-discover-footer">
          <span>Two stores. Different worlds. One place to explore.</span>
          <div className="homepage-discover-store-links">
            <a href="/yotaabo/catalog">Explore Yotaabo <span aria-hidden="true">↗</span></a>
            <a href="/poshies/catalog">Explore Poshies <span aria-hidden="true">↗</span></a>
          </div>
        </footer>
      </div>

      <style>{`
        .homepage-discover-section{position:relative;isolation:isolate;background:#111;color:#f5f3f0;padding:clamp(56px,8vw,112px) clamp(18px,5vw,72px);overflow:hidden}
        .homepage-discover-inner{max-width:1440px;margin:0 auto}
        .homepage-discover-heading{margin-bottom:38px}
        .homepage-discover-eyebrow{font:600 10px/1.3 var(--hp-font-family,sans-serif);letter-spacing:.2em;text-transform:uppercase;color:#c4775a;margin-bottom:14px}
        .homepage-discover-title-row{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(240px,.7fr);align-items:end;gap:32px}
        .homepage-discover-title-row h2{margin:0;font:500 clamp(34px,5.2vw,72px)/1.04 var(--hp-font-family,sans-serif);letter-spacing:-.045em;max-width:850px}
        .homepage-discover-title-row p{margin:0;max-width:440px;color:#aaa;font:400 14px/1.75 var(--hp-font-family,sans-serif)}
        .homepage-discover-filters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}
        .homepage-discover-filters button{border:1px solid #383838;background:#1b1b1b;color:#a7a7a7;border-radius:999px;padding:10px 16px;font:500 10px/1.2 var(--hp-font-family,sans-serif);letter-spacing:.08em;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
        .homepage-discover-filters button:hover{border-color:#777;color:#fff}
        .homepage-discover-filters button.is-active{border-color:#c4471d;background:#c4471d;color:#fff}
        .homepage-discover-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
        .homepage-discover-card{display:flex;flex-direction:column;min-width:0;text-decoration:none;color:inherit;outline-offset:5px}
        .homepage-discover-card-image{position:relative;aspect-ratio:4/4.5;overflow:hidden;background:#242424;border-radius:3px}
        .homepage-discover-card-image img{width:100%;height:100%;display:block;object-fit:cover;filter:saturate(.88);transition:transform .7s cubic-bezier(.2,.65,.25,1),filter .45s}
        .homepage-discover-card:hover .homepage-discover-card-image img,.homepage-discover-card:focus-visible .homepage-discover-card-image img{transform:scale(1.045);filter:saturate(1)}
        .homepage-discover-card-category{position:absolute;left:14px;top:14px;padding:8px 10px;border-radius:999px;background:#161616;color:#e6e2de;font:600 9px/1 var(--hp-font-family,sans-serif);letter-spacing:.12em;text-transform:uppercase}
        .homepage-discover-card-arrow{position:absolute;right:14px;bottom:14px;display:flex;width:36px;height:36px;align-items:center;justify-content:center;border-radius:50%;background:#c4471d;color:#fff;font:18px/1 sans-serif;transition:transform .25s}
        .homepage-discover-card:hover .homepage-discover-card-arrow{transform:translate(2px,-2px)}
        .homepage-discover-card-copy{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:17px 0 4px}
        .homepage-discover-card-copy h3{margin:0 0 6px;font:500 17px/1.3 var(--hp-font-family,sans-serif);color:#f4f1ee}
        .homepage-discover-card-copy p{margin:0;max-width:320px;color:#929292;font:400 12px/1.65 var(--hp-font-family,sans-serif)}
        .homepage-discover-card-store{flex:0 0 auto;margin-top:3px;color:#c4775a;font:600 9px/1.4 var(--hp-font-family,sans-serif);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
        .homepage-discover-footer{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-top:52px;padding-top:24px;border-top:1px solid #2b2b2b;color:#777;font:400 11px/1.6 var(--hp-font-family,sans-serif)}
        .homepage-discover-store-links{display:flex;flex-wrap:wrap;gap:22px}
        .homepage-discover-store-links a{color:#e2ddd8;text-decoration:none;font:500 10px/1.4 var(--hp-font-family,sans-serif);letter-spacing:.08em;text-transform:uppercase}
        .homepage-discover-store-links a:hover{color:#c4775a}
        @media(max-width:900px){.homepage-discover-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.homepage-discover-title-row{grid-template-columns:1fr;gap:18px}.homepage-discover-title-row p{max-width:560px}}
        @media(max-width:560px){.homepage-discover-section{padding:52px 16px}.homepage-discover-heading{margin-bottom:28px}.homepage-discover-grid{grid-template-columns:1fr;gap:24px}.homepage-discover-card-image{aspect-ratio:4/3.6}.homepage-discover-card-copy{gap:8px}.homepage-discover-card-copy h3{font-size:16px}.homepage-discover-card-copy p{font-size:11px}.homepage-discover-card-store{font-size:8px}.homepage-discover-footer{align-items:flex-start;flex-direction:column;gap:18px;margin-top:36px}.homepage-discover-store-links{gap:16px}}
        @media(prefers-reduced-motion:reduce){.homepage-discover-card-image img,.homepage-discover-card-arrow,.homepage-discover-filters button{transition-duration:.01ms!important}}
      `}</style>
    </section>
  );
}
