import Header from "../header";
import { visuals, heroCopy } from "./hero.data";
import {
  useHeroImageRotation,
  useHeroPointer,
} from "./hero.hooks";
import "./hero.css";

import { FaInstagram, FaTwitter, FaFacebookF, FaWhatsapp } from "react-icons/fa";

export default function AuralisCreativeHero() {
  const {
    activeImage,
    setActiveImage,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  } = useHeroImageRotation();

  const {
    heroRef,
    handlePointerMove,
    resetPointer,
  } = useHeroPointer();

  return (
    <>
      <Header />

      <section
        id="top"
        ref={heroRef}
        className="novae-hero relative isolate flex w-full min-h-[780px] h-[calc(100svh-104px)] max-h-[1100px] items-center overflow-hidden"
        onMouseMove={handlePointerMove}
        onMouseLeave={resetPointer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="hero-background" />

        <div className="main-visual">
          {visuals.map((visual, index) => (
            <div
              key={visual}
              role="img"
              aria-label={index === activeImage ? "Futuristic creative portrait" : ""}
              className={activeImage === index ? "main-image hero-bg-image active-main-image" : "main-image hero-bg-image"}
              style={{ backgroundImage: `url(${visual})` }}
            />
          ))}

          <div className="image-wash" />

          <div className="smear smear-one" style={{ backgroundImage: `url(${visuals[activeImage]})` }} />
          <div className="smear smear-two" style={{ backgroundImage: `url(${visuals[activeImage]})` }} />
          <div className="smear smear-three" style={{ backgroundImage: `url(${visuals[activeImage]})` }} />
          <div className="smear smear-four" style={{ backgroundImage: `url(${visuals[activeImage]})` }} />

          <div className="light-streak light-streak-one" />
          <div className="light-streak light-streak-two" />
          <div className="light-streak light-streak-three" />
        </div>

        <div className="hero-glow" />
        <div className="hero-noise" />
        <div className="hero-vignette" />

        <div className="orbit-stage">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="orbit orbit-four" />
          <div className="orbit-highlight" />
        </div>

        <div className="hero-copy relative z-[6] w-[58%] mt-[35px] ml-[10.5%] pointer-events-none max-[1100px]:w-[66%] max-[1100px]:ml-[7%] max-[820px]:w-[85%] max-[820px]:mt-[-55px] max-[820px]:ml-[7%] max-[520px]:w-[92%] max-[520px]:mt-[-95px] max-[520px]:ml-[6%] min-[1500px]:ml-[12%]">
          <div className="social-proof relative z-[7] w-fit mb-6 pointer-events-auto">
            <div className="social-icons flex items-center gap-[11px] max-[520px]:gap-[7px]">
              <a href="#instagram" aria-label="Instagram"><FaInstagram aria-hidden="true" /></a>
              <a href="#social" aria-label="Twitter"><FaTwitter aria-hidden="true" /></a>
              <a href="#facebook" aria-label="Facebook"><FaFacebookF aria-hidden="true" /></a>
              <a href="#whatsapp" aria-label="WhatsApp"><FaWhatsapp aria-hidden="true" /></a>
            </div>
          </div>

          <h1 className="hero-copy-title block max-w-[850px] m-0 text-[#F5F5F5] text-[clamp(52px,7.2vw,108px)] font-medium leading-[0.99] tracking-[-0.085em] [text-wrap:balance] max-[1100px]:text-[clamp(55px,8vw,88px)] max-[820px]:text-[clamp(52px,10vw,78px)] max-[520px]:text-[clamp(44px,11vw,60px)] max-[520px]:leading-[1.02] max-[520px]:tracking-[-0.075em]">
            {heroCopy.tagline}
          </h1>
        </div>

        <div className="hero-description absolute z-[6] right-[8%] bottom-[19%] w-[min(300px,25%)]">
          <p className="hero-copy-description m-0 text-[rgba(245,245,245,0.67)] text-base font-normal leading-[1.75] tracking-[0.1px] max-[820px]:text-[15px] max-[520px]:leading-[1.7]">
            {heroCopy.description}
          </p>
        </div>

        <div className="image-selector absolute z-[8] right-[8%] bottom-[7%] flex items-center gap-[17px]">
          <div className="selector-controls">
            {visuals.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show visual ${index + 1}`}
                aria-pressed={activeImage === index}
                onClick={() => setActiveImage(index)}
                className={activeImage === index ? "selector-dot active-selector-dot" : "selector-dot"}
              />
            ))}
          </div>

          <div className="selector-images">
            {visuals.map((visual, index) => (
              <div
                key={visual}
                className={activeImage === index ? "selector-image selector-bg-image active-selector-image" : "selector-image selector-bg-image"}
                style={{ backgroundImage: `url(${visual})` }}
              />
            ))}

            <div className="selector-overlay" />
            <div className="selector-shine" />
            <a href="#contact" className="selector-cta" aria-label="Let's talk">↗</a>
          </div>
        </div>

        <div className="corner corner-top-left" />
        <div className="corner corner-top-right" />
        <div className="corner corner-bottom-left" />
        <div className="corner corner-bottom-right" />
      </section>
    </>
  );
}
