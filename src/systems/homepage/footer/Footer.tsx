import React from "react";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="homepage-footer" id="footer">
      <div className="homepage-footer__editorial">
        <h2 className="homepage-footer__heading">A collective of brands.</h2>
        <p className="homepage-footer__copy">
          Simatu brings distinct brands together under a shared vision—each with its own identity, direction and ambition.
        </p>
      </div>
      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
        aria-hidden="true"
      />
    </footer>
  );
}
