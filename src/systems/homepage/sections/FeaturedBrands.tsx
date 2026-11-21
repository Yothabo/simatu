import "./featured-brands.css";

export default function FeaturedBrands() {
  return (
    <section className="epr-page" aria-labelledby="epr-title">
      <div className="epr-stage">
        <div className="epr-mark" aria-hidden="true">
          <img src="/simatu.png" alt="" loading="eager" decoding="async" />
        </div>

        <p className="epr-kicker">ABOUT SIMATU</p>
        <h2 className="epr-title" id="epr-title">
          Who We Are
        </h2>

        <div className="epr-copy">
          <p className="epr-description">
            Bringing together technology, commerce and creative thinking to
            shape new ventures, unlocking opportunities for sustainable growth.
          </p>
        </div>
      </div>
    </section>
  );
}
