import "./footer.css";

export default function Footer() {
  return (
    <footer className="homepage-footer" id="footer">
      <section className="homepage-footer__cta" id="contact" aria-label="Start a conversation">
        <h2>How can we shape your next idea?</h2>
        <p>
          We bring strategy, imagination and thoughtful execution together to
          create digital experiences with purpose. Explore the Simatu ecosystem
          and see what is possible.
        </p>

      </section>

      <img
        className="footer-wordmark"
        src="/systems/homepage/images/simatu-wordmark.svg"
        alt="Simatu"
      />

      <div className="homepage-footer__bottom">
        <span>© {new Date().getFullYear()} Simatu. All rights reserved.</span>
      </div>
    </footer>
  );
}
