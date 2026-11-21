import React from "react";

interface DiscoverSectionProps {
  onDiscover: () => void;
}

/** The reveal is isolated to this section; the fixed moodboard is managed by HomePage. */
export default function DiscoverSection({ onDiscover }: DiscoverSectionProps) {
  return (
    <section className="homepage-discover-trigger-section" aria-label="Discover our brand network">
      <div className="homepage-discover-art" aria-hidden="true">
        <span className="homepage-discover-ribbon homepage-discover-ribbon-one" />
        <span className="homepage-discover-ribbon homepage-discover-ribbon-two" />
        <span className="homepage-discover-ribbon homepage-discover-ribbon-three" />
      </div>

      <div className="homepage-discover-content">
        <p className="homepage-discover-eyebrow">Explore beyond the expected</p>
        <h2 className="homepage-discover-title">
          Beyond the
          <span>ordinary.</span>
        </h2>
        <div className="homepage-discover-lower">
          <div className="homepage-discover-meta">
            <span>SIMATU</span>
            <span>Brand network</span>
          </div>
          <div className="homepage-discover-description">
            <p>Discover a collection of brands, ideas, experiences and worlds — each with its own identity.</p>
            <button type="button" className="homepage-discover-trigger" onClick={onDiscover}>
              Explore our brand network <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .homepage-discover-trigger-section{position:relative;z-index:3;display:flex;align-items:center;justify-content:center;min-height:100vh;min-height:100svh;width:100%;padding:clamp(64px,10vh,140px) clamp(24px,7.2vw,110px) clamp(24px,7.2vw,110px);box-sizing:border-box;overflow:hidden;isolation:isolate;background:var(--hp-color-background,#111)}
        .homepage-discover-trigger-section::before{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(ellipse 65% 85% at 76% 54%,color-mix(in srgb,#c4471d 14%,var(--hp-color-background,#111)) 0%,transparent 70%),linear-gradient(120deg,var(--hp-color-background,#111) 0%,#141312 55%,#101010 100%)}
        .homepage-discover-art{position:absolute;z-index:-1;top:-12%;right:-12%;width:68%;height:124%;overflow:hidden;pointer-events:none;opacity:.95;filter:saturate(1.12)}
        .homepage-discover-art::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 58% 45%,rgba(255,111,18,.22),transparent 48%),linear-gradient(90deg,rgba(17,17,17,.95) 0%,rgba(17,17,17,.1) 35%,transparent 65%);z-index:2}
        .homepage-discover-ribbon{position:absolute;display:block;border-radius:48% 52% 40% 60%;transform-origin:center;mix-blend-mode:screen}
        .homepage-discover-ribbon-one{width:118%;height:52%;top:15%;left:8%;transform:rotate(-17deg);background:linear-gradient(160deg,#411706 4%,#a53b08 22%,#f47718 34%,#5b2107 48%,#d85a0c 62%,#230d03 84%);filter:blur(1px);clip-path:polygon(0 18%,18% 0,38% 22%,60% 8%,83% 35%,100% 18%,92% 74%,68% 84%,44% 64%,24% 100%,8% 74%)}
        .homepage-discover-ribbon-two{width:115%;height:60%;top:39%;left:3%;transform:rotate(13deg);background:linear-gradient(180deg,#240d03 0%,#8e3307 15%,#f06b12 28%,#9d410a 43%,#2a1005 58%,#e65d0a 73%,#6b2805 88%);filter:blur(2px);clip-path:polygon(0 0,18% 22%,39% 8%,57% 36%,79% 20%,100% 0,94% 72%,72% 100%,51% 68%,30% 92%,10% 62%)}
        .homepage-discover-ribbon-three{width:95%;height:48%;top:5%;left:32%;transform:rotate(24deg);background:linear-gradient(90deg,#341305,#bc4d0a 18%,#ff7b19 35%,#682605 58%,#e8660d 76%,#250b02);filter:blur(3px);clip-path:polygon(0 20%,24% 0,44% 32%,68% 14%,100% 0,86% 80%,60% 100%,34% 74%,12% 100%)}
        .homepage-discover-content{position:relative;z-index:3;width:100%;max-width:1240px;margin:0 auto;text-align:center}
        .homepage-discover-eyebrow{margin:0 0 clamp(32px,5vh,64px);font:500 10px/1.4 var(--hp-font-family,sans-serif);letter-spacing:.22em;text-transform:uppercase;color:rgba(245,245,245,.48)}
        .homepage-discover-title{margin:0;max-width:1100px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;font-size:clamp(68px,11.8vw,178px);font-weight:400;line-height:.82;letter-spacing:-.075em;color:#f1e7d8;text-wrap:balance}
         .homepage-discover-title span{display:block;margin:clamp(18px,3vh,38px) auto 0;color:#eee2d0}
        .homepage-discover-lower{display:grid;grid-template-columns:140px minmax(250px,440px);gap:clamp(28px,5vw,72px);align-items:start;justify-content:center;margin:clamp(72px,12vh,150px) auto 0;max-width:780px;text-align:left}
        .homepage-discover-meta{display:flex;flex-direction:column;gap:10px;padding-top:2px;font:400 10px/1.5 var(--hp-font-family,sans-serif);letter-spacing:.04em;color:rgba(245,245,245,.35)}
        .homepage-discover-description p{margin:0 0 24px;max-width:440px;font:400 15px/1.65 var(--hp-font-family,sans-serif);letter-spacing:.01em;color:rgba(245,245,245,.62)}
        .homepage-discover-trigger{display:inline-flex;align-items:center;gap:16px;justify-content:center;min-height:48px;padding:0 20px;border:1px solid rgba(245,245,245,.35);border-radius:999px;background:rgba(196,71,29,.94);color:#fff;font:600 10px/1.2 var(--hp-font-family,sans-serif);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:opacity .55s ease,background .2s,border-color .2s}
        .homepage-discover-trigger span{font-size:15px;line-height:1}
        .homepage-discover-trigger:hover{background:#a93d1a;border-color:rgba(255,255,255,.75)}
        .homepage-discover-trigger:active{transform:scale(.98)}
        .homepage-discover-trigger:focus-visible{outline:2px solid #fff;outline-offset:4px}
        .homepage-discover-trigger:disabled{visibility:hidden}
        @media(max-width:820px){.homepage-discover-trigger-section{min-height:88svh;padding:72px 7%}.homepage-discover-art{width:90%;right:-28%;opacity:.68}.homepage-discover-title{font-size:clamp(64px,13vw,120px)}.homepage-discover-title span{margin:18px auto 0}.homepage-discover-lower{grid-template-columns:100px minmax(0,380px);gap:24px;justify-content:center;margin:clamp(56px,10vh,90px) auto 0}.homepage-discover-description p{font-size:14px}}
        @media(max-width:520px){.homepage-discover-trigger-section{min-height:100svh;padding:64px 6%}.homepage-discover-eyebrow{font-size:9px;letter-spacing:.18em;margin-bottom:22px}.homepage-discover-title{font-size:clamp(58px,15vw,84px);line-height:.88;letter-spacing:-.08em}.homepage-discover-title span{margin-left:18vw}.homepage-discover-art{width:118%;right:-45%;height:110%;top:-5%;opacity:.52}.homepage-discover-lower{grid-template-columns:1fr;gap:22px;justify-content:center;margin:64px auto 0;max-width:360px;text-align:center}.homepage-discover-meta{flex-direction:row;justify-content:center;gap:22px;font-size:9px}.homepage-discover-description p{max-width:330px;font-size:13px;line-height:1.65;margin-bottom:20px}.homepage-discover-trigger{min-height:46px;padding:0 17px;font-size:9px}}
        @media(prefers-reduced-motion:reduce){.homepage-discover-trigger{transition-duration:.01ms!important}}
      `}</style>
    </section>
  );
}
