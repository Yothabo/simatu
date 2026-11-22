import React from "react";
import { navItems } from "../hero/hero.data";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="homepage-footer" id="footer">
      <div className="homepage-footer__top">
        <h2 className="homepage-footer__heading">A collective of brands.</h2>
        <nav className="homepage-footer__links" aria-label="Homepage navigation">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </nav>
      </div>

      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
        aria-hidden="true"
      />

      <div className="homepage-footer__bottom">
        <span>© 2026 Simatu</span>
        <span>A collective of brands</span>
      </div>
    </footer>
  );
}
