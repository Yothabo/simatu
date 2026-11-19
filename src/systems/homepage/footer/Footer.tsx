import "./footer.css";
import FooterLinks from "./FooterLinks";

export default function Footer() {
  return (
    <footer className="homepage-footer" id="services">
      <div className="footer-content">
        <h2 id="contact">How can we shape your next idea?</h2>

        <p>
          We build distinctive identities and immersive digital
          experiences through strategy, imagination and precise
          creative execution.
        </p>

        <div className="footer-service-tags">
          <a href="/yotaabo">Yotaabo</a>
          <a href="/poshies">Poshies</a>
          <a href="#contact">Let's Talk</a>
        </div>
      </div>

      <FooterLinks />

      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
      />
    </footer>
  );
}
