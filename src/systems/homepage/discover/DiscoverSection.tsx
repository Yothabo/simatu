import React, { useState } from "react";

const questions = [
  {
    question: "What is Simatu?",
    answer: "Simatu is a brand network bringing together distinct brands, ideas, experiences and worlds—each with its own identity.",
  },
  {
    question: "What can I explore through Simatu?",
    answer: "Explore the Simatu ecosystem and discover the different brands and experiences within our network.",
  },
  {
    question: "How can I work with Simatu?",
    answer: "If you have an idea or would like to explore a collaboration, use the Let's talk button in the footer. It is not connected yet, but will be enabled in a future update.",
  },
  {
    question: "Do the brands have their own identities?",
    answer: "Yes. Each brand within the network has its own identity and world, while being part of the broader Simatu ecosystem.",
  },
];



interface DiscoverSectionProps {
  onDiscover: () => void;
}

/** The reveal is isolated to this section; the fixed moodboard is managed by HomePage. */
export default function DiscoverSection({ onDiscover }: DiscoverSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="homepage-discover-trigger-section" aria-label="Discover our brand network">
      <div className="homepage-discover-art" aria-hidden="true">
        <span className="homepage-discover-ribbon homepage-discover-ribbon-one" />
        <span className="homepage-discover-ribbon homepage-discover-ribbon-two" />
        <span className="homepage-discover-ribbon homepage-discover-ribbon-three" />
      </div>

      <div className="homepage-discover-content">
        <h2 className="homepage-discover-title">
          Beyond the
          <span>ordinary.</span>
        </h2>
        <div className="homepage-discover-questions">
          {questions.map((item, index) => (
            <div className={`homepage-discover-question ${openIndex === index ? "is-open" : ""}`} key={item.question}>
              <button type="button" className="homepage-discover-question-button" aria-expanded={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span>{item.question}</span>
                <span className="homepage-discover-question-toggle" aria-hidden="true">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && <p className="homepage-discover-question-answer">{item.answer}</p>}
            </div>
          ))}
        </div>
        <div className="homepage-discover-lower">
          <div className="homepage-discover-description">
            <button type="button" className="homepage-discover-trigger" aria-label="Discover our brand network" onClick={onDiscover}>
              Explore our brand network <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .homepage-discover-trigger-section{position:relative;z-index:3;display:flex;align-items:center;justify-content:flex-start;min-height:72svh;width:100%;padding:clamp(64px,10vh,140px) clamp(24px,7.2vw,110px) clamp(24px,7.2vw,110px);box-sizing:border-box;overflow:hidden;isolation:isolate;background:var(--hp-color-background,var(--hp-color-background))}
        .homepage-discover-trigger-section::before{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(ellipse 65% 85% at 76% 54%,color-mix(in srgb,var(--hp-color-primary) 14%,var(--hp-color-background,var(--hp-color-background))) 0%,transparent 70%),linear-gradient(120deg,var(--hp-color-background,var(--hp-color-background)) 0%,var(--hp-color-background) 55%,var(--hp-color-background) 100%)}
        .homepage-discover-art{position:absolute;z-index:-1;top:-12%;right:-12%;width:68%;height:124%;overflow:hidden;pointer-events:none;opacity:.95;filter:saturate(1.12)}
        .homepage-discover-art::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 58% 45%,color-mix(in srgb, var(--hp-color-primary) 22%, transparent),transparent 48%),linear-gradient(90deg,color-mix(in srgb, var(--hp-color-background) 95%, transparent) 0%,color-mix(in srgb, var(--hp-color-background) 10%, transparent) 35%,transparent 65%);z-index:2}
        .homepage-discover-ribbon{position:absolute;display:block;border-radius:48% 52% 40% 60%;transform-origin:center;mix-blend-mode:screen}
        .homepage-discover-ribbon-one{width:118%;height:52%;top:15%;left:8%;transform:rotate(-17deg);background:linear-gradient(160deg,var(--hp-color-background) 4%,var(--hp-color-primary) 22%,var(--hp-color-primary) 34%,var(--hp-color-surface) 48%,var(--hp-color-primary) 62%,var(--hp-color-background) 84%);filter:blur(1px);clip-path:polygon(0 18%,18% 0,38% 22%,60% 8%,83% 35%,100% 18%,92% 74%,68% 84%,44% 64%,24% 100%,8% 74%)}
        .homepage-discover-ribbon-two{width:115%;height:60%;top:39%;left:3%;transform:rotate(13deg);background:linear-gradient(180deg,var(--hp-color-background) 0%,var(--hp-color-primary-hover) 15%,var(--hp-color-primary) 28%,var(--hp-color-primary) 43%,var(--hp-color-background) 58%,var(--hp-color-primary) 73%,var(--hp-color-surface) 88%);filter:blur(2px);clip-path:polygon(0 0,18% 22%,39% 8%,57% 36%,79% 20%,100% 0,94% 72%,72% 100%,51% 68%,30% 92%,10% 62%)}
        .homepage-discover-ribbon-three{width:95%;height:48%;top:5%;left:32%;transform:rotate(24deg);background:linear-gradient(90deg,var(--hp-color-background),var(--hp-color-primary) 18%,var(--hp-color-primary) 35%,var(--hp-color-surface) 58%,var(--hp-color-primary) 76%,var(--hp-color-background));filter:blur(3px);clip-path:polygon(0 20%,24% 0,44% 32%,68% 14%,100% 0,86% 80%,60% 100%,34% 74%,12% 100%)}
        .homepage-discover-questions{width:min(100%,780px);margin:clamp(32px,5vw,72px) 0 0}
        .homepage-discover-question{border-top:1px solid var(--hp-color-border)}
        .homepage-discover-question:last-child{border-bottom:1px solid var(--hp-color-border)}
        .homepage-discover-question-button{display:flex;align-items:center;justify-content:space-between;gap:24px;width:100%;padding:var(--hp-space-5) 0;border:0;background:transparent;color:var(--hp-color-text);text-align:left;font:var(--hp-font-weight-regular) var(--hp-font-size-base)/var(--hp-line-height-normal) var(--hp-font-family);cursor:pointer}
        .homepage-discover-question-toggle{color:var(--hp-color-text-muted);font:var(--hp-font-weight-regular) var(--hp-font-size-base)/var(--hp-line-height-tight) var(--hp-font-family)}
        .homepage-discover-question-answer{margin:0 40px var(--hp-space-5) 0;max-width:620px;color:var(--hp-color-text-muted);font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-relaxed) var(--hp-font-family)}
        .homepage-discover-content{position:relative;z-index:3;width:100%;max-width:none;margin:0;text-align:left}
        .homepage-discover-eyebrow{margin:0 0 clamp(32px,5vh,64px);font:var(--hp-font-weight-medium) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:var(--hp-letter-spacing-wide);text-transform:uppercase;color:var(--hp-color-white-muted)}
        .homepage-discover-title{margin:0;max-width:1100px;margin:0;font-family:var(--hp-font-family);font-size:var(--hp-font-size-display);font-weight:var(--hp-font-weight-regular);line-height:var(--hp-line-height-tight);letter-spacing:var(--hp-letter-spacing-tight);color:var(--hp-color-text);text-wrap:balance}
         .homepage-discover-title span{display:block;margin:clamp(18px,3vh,38px) 0 0 clamp(72px,18vw,260px);color:var(--hp-color-text-subtle)}
        .homepage-discover-lower{display:grid;grid-template-columns:minmax(110px,17%) minmax(250px,440px);gap:clamp(24px,5vw,72px);align-items:start;justify-content:start;margin:clamp(32px,6vh,72px) 0 0 clamp(0px,3vw,48px);max-width:780px;text-align:left}
        
        .homepage-discover-description p{margin:0 0 24px;max-width:440px;font:var(--hp-font-weight-regular) var(--hp-font-size-base)/var(--hp-line-height-relaxed) var(--hp-font-family);letter-spacing:var(--hp-letter-spacing-normal);color:var(--hp-color-text-muted)}
        .homepage-discover-trigger{display:inline-flex;align-items:center;gap:16px;justify-content:center;min-height:48px;padding:0 20px;border:1px solid var(--hp-color-border-strong);border-radius:999px;background:var(--hp-palette-white);color:var(--hp-color-on-primary);font:var(--hp-font-weight-semibold) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:var(--hp-letter-spacing-wide);text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:opacity .55s ease,background .2s,border-color .2s}
        .homepage-discover-trigger span{font-size:var(--hp-font-size-base);line-height:var(--hp-line-height-tight)}
        .homepage-discover-trigger:hover{background:var(--hp-color-text-subtle)6cb;border-color:var(--hp-color-on-primary)}
        .homepage-discover-trigger:active{transform:scale(.98)}
        .homepage-discover-trigger:focus-visible{outline:2px solid var(--hp-color-text);outline-offset:4px}
        .homepage-discover-trigger:disabled{visibility:hidden}
        @media(max-width:820px){.homepage-discover-trigger-section{min-height:88svh;padding:72px 7%}.homepage-discover-art{width:90%;right:-28%;opacity:.68}.homepage-discover-title span{margin:18px 0 0 14vw}.homepage-discover-lower{grid-template-columns:100px minmax(0,380px);gap:24px;justify-content:start;margin:clamp(32px,6vh,72px) 0 0 7vw}}
        @media(max-width:520px){.homepage-discover-trigger-section{min-height:72svh;padding:64px 6%}.homepage-discover-eyebrow{margin-bottom:22px}.homepage-discover-title span{margin-left:18vw}.homepage-discover-art{width:118%;right:-45%;height:110%;top:-5%;opacity:.52}.homepage-discover-lower{grid-template-columns:1fr;gap:22px;justify-content:start;margin:32px 0 0 8vw;max-width:360px;text-align:left}.homepage-discover-description p{max-width:330px;margin-bottom:20px}.homepage-discover-trigger{min-height:46px;padding:0 17px}}
        @media(prefers-reduced-motion:reduce){.homepage-discover-trigger{transition-duration:.01ms!important}}
      `}</style>
    </section>
  );
}
