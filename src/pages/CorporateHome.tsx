import './CorporateHome.css';

const operatingPrinciples = [
  {
    number: '01',
    title: 'Distinct brands',
    description:
      'We develop individual retail brands with their own identities, audiences and shopping experiences.',
  },
  {
    number: '02',
    title: 'Connected operations',
    description:
      'Shared systems and coordinated operations support the businesses across our growing portfolio.',
  },
  {
    number: '03',
    title: 'Built to grow',
    description:
      'Our model allows us to develop new brands and departments as customer needs and opportunities evolve.',
  },
];

export default function CorporateHome() {
  return (
    <main className="simatu-site">
      <header className="simatu-header">
        <a className="simatu-brand" href="/" aria-label="Simatu Cooperative home">
          <img src="/simatu.png" alt="Simatu Cooperative" />
          <span>
            <strong>SIMATU</strong>
            <small>COOPERATIVE</small>
          </span>
        </a>

        <nav className="simatu-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#approach">Our approach</a>
          <a href="#businesses">Our businesses</a>
        </nav>

        <a className="simatu-header-link" href="#businesses">
          Explore our brands <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="simatu-hero">
        <div className="simatu-hero-grid" aria-hidden="true" />
        <div className="simatu-hero-content">
          <p className="simatu-eyebrow">
            AN INDEPENDENT MULTI-BRAND COMMERCE GROUP
          </p>

          <h1>
            Building businesses.
            <br />
            Connecting markets.
            <br />
            <span>Creating access.</span>
          </h1>

          <p className="simatu-hero-description">
            Simatu Cooperative develops and operates retail brands that make
            products and shopping experiences more accessible. Different
            businesses, connected by a shared vision and operating foundation.
          </p>

          <div className="simatu-hero-actions">
            <a className="simatu-button simatu-button-light" href="#businesses">
              Discover our businesses <span aria-hidden="true">↗</span>
            </a>
            <a className="simatu-text-link" href="#about">
              Learn about Simatu <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="simatu-hero-aside" aria-hidden="true">
          <span className="simatu-hero-aside-line" />
          <span>ONE GROUP</span>
          <span className="simatu-hero-aside-dot" />
          <span>MULTIPLE BRANDS</span>
          <span className="simatu-hero-aside-dot" />
          <span>SHARED PURPOSE</span>
        </div>

        <div className="simatu-hero-index" aria-hidden="true">
          SIMATU COOPERATIVE <span>01 / 04</span>
        </div>
      </section>

      <section className="simatu-intro" id="about">
        <div className="simatu-section-label">
          <span>01</span>
          <span>WHO WE ARE</span>
        </div>

        <div className="simatu-intro-content">
          <p className="simatu-kicker">A GROUP WITH A CLEAR PURPOSE</p>
          <h2>
            Different needs.
            <br />
            <span>One connected vision.</span>
          </h2>
          <div className="simatu-intro-bottom">
            <p>
              Simatu Cooperative is a multi-brand commerce group focused on
              developing retail businesses that make products and shopping
              experiences more accessible. Through distinct brands, carefully
              developed departments and shared operational infrastructure, we
              are building a growing portfolio designed to serve evolving
              consumer needs.
            </p>
            <div className="simatu-intro-mark" aria-hidden="true">
              <span>S</span>
              <small>SIMATU COOPERATIVE</small>
            </div>
          </div>
        </div>
      </section>

      <section className="simatu-approach" id="approach">
        <div className="simatu-section-label simatu-section-label-light">
          <span>02</span>
          <span>HOW WE OPERATE</span>
        </div>

        <div className="simatu-approach-heading">
          <p className="simatu-kicker">THE SIMATU MODEL</p>
          <h2>
            Independent identities.
            <br />
            <span>Shared foundations.</span>
          </h2>
          <p>
            Each business serves its own market while benefiting from the
            systems, structure and direction of a connected group.
          </p>
        </div>

        <div className="simatu-principles">
          {operatingPrinciples.map((principle) => (
            <article className="simatu-principle" key={principle.number}>
              <span className="simatu-principle-number">
                {principle.number}
              </span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
              <span className="simatu-principle-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="simatu-businesses" id="businesses">
        <div className="simatu-section-label">
          <span>03</span>
          <span>OUR BUSINESSES</span>
        </div>

        <div className="simatu-businesses-heading">
          <div>
            <p className="simatu-kicker">THE PORTFOLIO</p>
            <h2>
              Businesses with
              <br />
              <span>their own identity.</span>
            </h2>
          </div>
          <p>
            Our brands operate as distinct businesses within the wider Simatu
            group. Each has its own customer experience, supported by a shared
            operational foundation.
          </p>
        </div>

        <div className="simatu-brand-grid">
          <article className="simatu-brand-card simatu-brand-yotaabo">
            <div className="simatu-brand-card-top">
              <span>BRAND 01</span>
              <span>RETAIL &amp; COMMERCE</span>
            </div>
            <div className="simatu-brand-card-main">
              <p className="simatu-brand-overline">A SIMATU BUSINESS</p>
              <h3>Yotaabo<span>.</span></h3>
              <p>
                A fragrance brand built around personal expression and
                memorable scent experiences.
              </p>
            </div>
            <a href="/yotaabo" className="simatu-brand-card-link">
              Explore Yotaabo <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className="simatu-brand-card simatu-brand-poshies">
            <div className="simatu-brand-card-top">
              <span>BRAND 02</span>
              <span>RETAIL &amp; COMMERCE</span>
            </div>
            <div className="simatu-brand-card-main">
              <p className="simatu-brand-overline">A SIMATU BUSINESS</p>
              <h3>Poshies<span>.</span></h3>
              <p>
                A consumer retail brand with its own identity and shopping
                experience.
              </p>
            </div>
            <a href="/poshies" className="simatu-brand-card-link">
              Explore Poshies <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>

        <p className="simatu-portfolio-note">
          Our portfolio is designed to grow as new opportunities and customer
          needs emerge.
        </p>
      </section>

      <section className="simatu-outlook">
        <div className="simatu-outlook-inner">
          <p className="simatu-kicker">LOOKING AHEAD</p>
          <h2>
            Growth with
            <br />
            <span>intention.</span>
          </h2>
          <p>
            We are building a business group with room to evolve. Our focus is
            to strengthen the businesses we operate today while creating the
            foundation for future brands, departments and opportunities.
          </p>
          <a href="#businesses" className="simatu-button simatu-button-dark">
            Explore our portfolio <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="simatu-outlook-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <footer className="simatu-footer">
        <div className="simatu-footer-main">
          <a className="simatu-brand simatu-footer-brand" href="/">
            <img src="/simatu.png" alt="" />
            <span>
              <strong>SIMATU</strong>
              <small>COOPERATIVE</small>
            </span>
          </a>
          <p>
            Building businesses.
            <br />
            Connecting markets.
            <br />
            Creating access.
          </p>
        </div>

        <div className="simatu-footer-bottom">
          <span>© {new Date().getFullYear()} Simatu Cooperative.</span>
          <span>A MULTI-BRAND COMMERCE GROUP</span>
          <div>
            <a href="/yotaabo">Yotaabo</a>
            <a href="/poshies">Poshies</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
