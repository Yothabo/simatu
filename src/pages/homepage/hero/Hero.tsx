
import Header from "../header";
import { visuals, heroCopy } from "./hero.data";
import {
  useHeroImageRotation,
  useHeroPointer,
} from "./hero.hooks";
import "./hero.css";
import Footer from "../footer";

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
    <main className="novae-page">
      <Header />

      <section
        ref={heroRef}
        className="novae-hero"
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
              aria-label={
                index === activeImage
                  ? "Futuristic creative portrait"
                  : ""
              }
              className={
                activeImage === index
                  ? "main-image hero-bg-image active-main-image"
                  : "main-image hero-bg-image"
              }
              style={{ backgroundImage: `url(${visual})` }}
            />
          ))}

          <div className="image-wash" />

          <div
            className="smear smear-one"
            style={{ backgroundImage: `url(${visuals[activeImage]})` }}
          />

          <div
            className="smear smear-two"
            style={{ backgroundImage: `url(${visuals[activeImage]})` }}
          />

          <div
            className="smear smear-three"
            style={{ backgroundImage: `url(${visuals[activeImage]})` }}
          />

          <div
            className="smear smear-four"
            style={{ backgroundImage: `url(${visuals[activeImage]})` }}
          />

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

        <div className="hero-copy">
          <div className="social-proof">
            <div className="social-icons">
              <a href="#instagram" aria-label="Instagram">
                <FaInstagram aria-hidden="true" />
              </a>
              <a href="#social" aria-label="Twitter">
                <FaTwitter aria-hidden="true" />
              </a>
              <a href="#facebook" aria-label="Facebook">
                <FaFacebookF aria-hidden="true" />
              </a>
              <a href="#whatsapp" aria-label="WhatsApp">
                <FaWhatsapp aria-hidden="true" />
              </a>
            </div>
          </div>

          <h1 className="hero-copy-title">
            {heroCopy.tagline}
          </h1>
        </div>

        <div className="hero-description">
          <p className="hero-copy-description">
            {heroCopy.description}
          </p>
        </div>

        <div className="image-selector">
          <div className="selector-controls">
            {visuals.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show visual ${index + 1}`}
                aria-pressed={activeImage === index}
                onClick={() => setActiveImage(index)}
                className={
                  activeImage === index
                    ? "selector-dot active-selector-dot"
                    : "selector-dot"
                }
              />
            ))}
          </div>

          <div className="selector-images">
            {visuals.map((visual, index) => (
              <div
                key={visual}
                className={
                  activeImage === index
                    ? "selector-image selector-bg-image active-selector-image"
                    : "selector-image selector-bg-image"
                }
                style={{ backgroundImage: `url(${visual})` }}
              />
            ))}

            <div className="selector-overlay" />
            <div className="selector-shine" />

            <a
              href="#contact"
              className="selector-cta"
              aria-label="Let's talk"
            >
              ↗
            </a>
          </div>
        </div>

        <div className="corner corner-top-left" />
        <div className="corner corner-top-right" />
        <div className="corner corner-bottom-left" />
        <div className="corner corner-bottom-right" />
      </section>

      <Footer />
    </main>
  );
}
