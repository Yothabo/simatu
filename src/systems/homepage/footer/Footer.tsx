import "./footer.css";

export default function Footer() {
  return (
    <footer className="homepage-footer" id="footer">
      <section className="homepage-footer__cta homepage-footer__editorial" id="contact" aria-label="Start a conversation">
        <h2>How can we shape your next idea?</h2>
        <button className="homepage-footer__button" type="button">
          Let’s talk <span aria-hidden="true">↗</span>
        </button>
      </section>

      <div className="homepage-footer__bottom">
        <span>© {new Date().getFullYear()} Simatu. All rights reserved.</span>
      </div>

      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
      />
    </footer>
  );
}
