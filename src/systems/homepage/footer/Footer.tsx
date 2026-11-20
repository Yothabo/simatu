import "./footer.css";
import FooterLinks from "./FooterLinks";

export default function Footer() {
  return (
    <footer className="homepage-footer" id="footer">
      <section className="homepage-footer__cta" id="contact" aria-label="Start a conversation">
        <span className="homepage-footer__eyebrow">Have an idea worth making real?</span>
        <h2>How can we shape your next idea?</h2>
        <p>
          We bring strategy, imagination and thoughtful execution together to
          create digital experiences with purpose. Explore the Simatu ecosystem
          and see what is possible.
        </p>

        <div className="homepage-footer__actions">
          <a href="/yotaabo">Explore Yotaabo <span aria-hidden="true">↗</span></a>
          <a href="/poshies">Explore Poshies <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <div className="homepage-footer__resources" id="footer-links">
        <FooterLinks />
      </div>

      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
      />

      <div className="homepage-footer__bottom">
        <span>© {new Date().getFullYear()} Simatu. All rights reserved.</span>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
