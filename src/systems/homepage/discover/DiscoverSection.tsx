import React, { useState } from "react";

const questions = [
  {
    question: "What is Simatu?",
    answer: "Simatu is a collective of distinct brands, each with its own identity, purpose and vision.",
  },
  {
    question: "What defines the Simatu network?",
    answer: "A growing portfolio of brands, ideas and experiences, built to stand apart and move forward.",
  },
  {
    question: "Can I collaborate with Simatu?",
    answer: "We welcome meaningful ideas and partnerships. Our contact channel will be available soon.",
  },
  {
    question: "What brings our brands together?",
    answer: "A shared vision, with the freedom for every brand to develop its own character and direction.",
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
              <div className="homepage-discover-answer" aria-hidden={openIndex !== index}>
                <div className="homepage-discover-answer-inner">
                  <p className="homepage-discover-question-answer">{item.answer}</p>
                </div>
              </div>
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
        .homepage-discover-trigger-section{position:relative;z-index:3;display:flex;align-items:center;justify-content:flex-start;height:clamp(680px,82svh,980px);min-height:0;width:100%;padding:clamp(var(--hp-size-64),10vh,var(--hp-size-150)) clamp(var(--hp-size-24),7.2vw,var(--hp-size-110));box-sizing:border-box;overflow:hidden;isolation:isolate;background:var(--hp-color-background,var(--hp-color-background))}
        .homepage-discover-trigger-section::before{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(ellipse 65% 85% at 76% 54%,color-mix(in srgb,var(--hp-color-primary) 14%,var(--hp-color-background,var(--hp-color-background))) 0%,transparent 70%),linear-gradient(120deg,var(--hp-color-background,var(--hp-color-background)) 0%,var(--hp-color-background) 55%,var(--hp-color-background) 100%)}
        .homepage-discover-art{position:absolute;z-index:-1;inset:0;width:100%;height:100%;overflow:hidden;pointer-events:none;opacity:.95;filter:saturate(1.12)}
        .homepage-discover-art::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 58% 45%,color-mix(in srgb, var(--hp-color-primary) 22%, transparent),transparent 48%),linear-gradient(90deg,color-mix(in srgb, var(--hp-color-background) 95%, transparent) 0%,color-mix(in srgb, var(--hp-color-background) 10%, transparent) 35%,transparent 65%);z-index:2}
        .homepage-discover-ribbon{position:absolute;display:block;border-radius:48% 52% 40% 60%;transform-origin:center;mix-blend-mode:screen}
        .homepage-discover-ribbon-one{width:118%;height:52%;top:15%;left:8%;transform:rotate(-17deg);background:linear-gradient(160deg,var(--hp-color-background) 4%,var(--hp-color-primary) 22%,var(--hp-color-primary) 34%,var(--hp-color-surface) 48%,var(--hp-color-primary) 62%,var(--hp-color-background) 84%);filter:blur(var(--hp-border-width));clip-path:polygon(0 18%,18% 0,38% 22%,60% 8%,83% 35%,100% 18%,92% 74%,68% 84%,44% 64%,24% 100%,8% 74%)}
        .homepage-discover-ribbon-two{width:115%;height:60%;top:39%;left:3%;transform:rotate(13deg);background:linear-gradient(180deg,var(--hp-color-background) 0%,var(--hp-color-primary-hover) 15%,var(--hp-color-primary) 28%,var(--hp-color-primary) 43%,var(--hp-color-background) 58%,var(--hp-color-primary) 73%,var(--hp-color-surface) 88%);filter:blur(var(--hp-size-xs));clip-path:polygon(0 0,18% 22%,39% 8%,57% 36%,79% 20%,100% 0,94% 72%,72% 100%,51% 68%,30% 92%,10% 62%)}
        .homepage-discover-ribbon-three{width:95%;height:48%;top:5%;left:32%;transform:rotate(24deg);background:linear-gradient(90deg,var(--hp-color-background),var(--hp-color-primary) 18%,var(--hp-color-primary) 35%,var(--hp-color-surface) 58%,var(--hp-color-primary) 76%,var(--hp-color-background));filter:blur(var(--hp-size-sm));clip-path:polygon(0 20%,24% 0,44% 32%,68% 14%,100% 0,86% 80%,60% 100%,34% 74%,12% 100%)}
        .homepage-discover-questions{width:min(100%,var(--hp-size-780));max-height:clamp(180px,42svh,420px);margin:clamp(var(--hp-size-32),5vw,var(--hp-size-75)) 0 0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--hp-color-border-strong) transparent}
        .homepage-discover-question{border-top:var(--hp-border-width) solid var(--hp-color-border)}
        .homepage-discover-question:last-child{border-bottom:var(--hp-border-width) solid var(--hp-color-border)}
        .homepage-discover-question-button{display:flex;align-items:center;justify-content:space-between;gap:var(--hp-size-24);width:100%;padding:var(--hp-space-5) 0;border:0;background:transparent;color:var(--hp-color-text);text-align:left;font:var(--hp-font-weight-regular) var(--hp-font-size-base)/var(--hp-line-height-normal) var(--hp-font-family);cursor:pointer}
        .homepage-discover-question-toggle{color:var(--hp-color-text-muted);font:var(--hp-font-weight-regular) var(--hp-font-size-base)/var(--hp-line-height-tight) var(--hp-font-family)}
        .homepage-discover-answer{display:grid;grid-template-rows:0fr;opacity:0;transform:translateY(calc(-1 * var(--hp-motion-distance-xs)));transition:grid-template-rows var(--hp-motion-duration-slow) var(--hp-motion-ease-in-out),opacity var(--hp-motion-duration-base) var(--hp-motion-ease-out),transform var(--hp-motion-duration-slow) var(--hp-motion-ease-in-out)}.homepage-discover-question.is-open .homepage-discover-answer{grid-template-rows:1fr;opacity:1;transform:translateY(0)}.homepage-discover-answer-inner{min-height:0;overflow:hidden}.homepage-discover-question-answer{margin:0 var(--hp-size-40) var(--hp-space-5) 0;max-width:var(--hp-size-620);color:var(--hp-color-text-muted);font:var(--hp-font-weight-regular) var(--hp-font-size-sm)/var(--hp-line-height-relaxed) var(--hp-font-family)}
        .homepage-discover-content{position:relative;z-index:3;width:100%;max-width:none;margin:0;text-align:left}
        .homepage-discover-eyebrow{margin:0 0 clamp(var(--hp-size-32),5vh,var(--hp-size-64));font:var(--hp-font-weight-medium) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:var(--hp-letter-spacing-wide);text-transform:uppercase;color:var(--hp-color-white-muted)}
        .homepage-discover-title{margin:0;max-width:var(--hp-size-1100);font-family:var(--hp-font-family);font-size:var(--hp-font-size-display);font-weight:var(--hp-font-weight-regular);line-height:.99;letter-spacing:-.085em;color:var(--hp-color-text);text-wrap:balance}
         .homepage-discover-title span{display:block;margin:0 0 0 clamp(var(--hp-size-75),18vw,var(--hp-size-280));color:var(--hp-color-text-subtle)}
        .homepage-discover-lower{display:grid;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);grid-template-columns:minmax(var(--hp-size-110),17%) minmax(var(--hp-size-240),var(--hp-size-440));gap:clamp(var(--hp-size-24),5vw,var(--hp-size-75));align-items:start;justify-content:start;margin:clamp(var(--hp-size-32),6vh,var(--hp-size-75)) 0 0 clamp(0,var(--hp-size-3vw),var(--hp-size-48));max-width:var(--hp-size-780);text-align:left}
        
        .homepage-discover-description p{margin:0 0 var(--hp-size-24);max-width:var(--hp-size-440);font:var(--hp-font-weight-regular) var(--hp-font-size-base)/var(--hp-line-height-relaxed) var(--hp-font-family);letter-spacing:var(--hp-letter-spacing-normal);color:var(--hp-color-text-muted)}
        .homepage-discover-trigger{display:inline-flex;align-items:center;gap:var(--hp-size-16);justify-content:center;min-height:var(--hp-size-48);padding:0 var(--hp-size-20);border:var(--hp-border-width) solid var(--hp-color-border-strong);border-radius:0;background:var(--hp-palette-white);color:var(--hp-color-on-primary);font:var(--hp-font-weight-semibold) var(--hp-font-size-xs)/var(--hp-line-height-normal) var(--hp-font-family);letter-spacing:var(--hp-letter-spacing-wide);text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:opacity var(--hp-motion-duration-slow) var(--hp-motion-ease-out),background var(--hp-motion-duration-fast) var(--hp-motion-ease-standard),border-color var(--hp-motion-duration-fast) var(--hp-motion-ease-standard)}
        .homepage-discover-description{display:flex;justify-content:center;width:100%}
        .homepage-discover-trigger span{font-size:var(--hp-font-size-base);line-height:var(--hp-line-height-tight)}
        .homepage-discover-trigger:hover{background:var(--hp-color-surface-raised);border-color:var(--hp-color-on-primary)}
        .homepage-discover-trigger:active{transform:scale(.98)}
        .homepage-discover-trigger:focus-visible{outline:var(--hp-size-xs) solid var(--hp-color-text);outline-offset:var(--hp-size-md)}
        .homepage-discover-trigger:disabled{visibility:hidden}
        @media(max-width:820px){.homepage-discover-trigger-section{height:clamp(760px,88svh,1000px);min-height:0;padding:var(--hp-space-16) 7%}.homepage-discover-art{width:100%;inset:0;opacity:.68}.homepage-discover-title span{margin:0 0 0 14vw}.homepage-discover-lower{grid-template-columns:var(--hp-size-100) minmax(0,var(--hp-size-380));gap:var(--hp-size-24);justify-content:start;margin:clamp(var(--hp-size-32),6vh,var(--hp-size-75)) 0 0 7vw}}
        @media(max-width:520px){.homepage-discover-trigger-section{height:clamp(720px,88svh,920px);min-height:0;padding:var(--hp-size-64) 6%}.homepage-discover-eyebrow{margin-bottom:var(--hp-size-22)}.homepage-discover-title span{margin-left:18vw}.homepage-discover-art{width:100%;height:100%;inset:0;opacity:.52}.homepage-discover-lower{grid-template-columns:1fr;gap:var(--hp-size-22);justify-content:start;margin:var(--hp-size-32) 0 0 8vw;max-width:var(--hp-size-360);text-align:left}.homepage-discover-description p{max-width:var(--hp-size-360);margin-bottom:var(--hp-size-20)}.homepage-discover-trigger{min-height:var(--hp-size-46);padding:0 var(--hp-size-17)}}
        @media(prefers-reduced-motion:reduce){.homepage-discover-trigger,.homepage-discover-answer{transition-duration:var(--hp-motion-duration-01)!important;transform:none!important}}
      `}</style>
    </section>
  );
}
