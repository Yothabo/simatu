import React from "react";
import "./footer.css";

const socialLinks = ["Instagram", "X", "Facebook", "WhatsApp"];

export default function Footer() {
  return (
    <footer className="homepage-footer" id="footer">
      <div className="homepage-footer__top">
        <h2 className="homepage-footer__heading">A collective of brands.</h2>
      </div>

      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
        aria-hidden="true"
      />

      <div className="homepage-footer__bottom">
        <nav className="homepage-footer__socials" aria-label="Social media">
          {socialLinks.map((social) => (
            <a key={social} href={`#${social.toLowerCase()}`}>{social}</a>
          ))}
        </nav>
        <span>© 2026 Simatu</span>
      </div>
    </footer>
  );
}
