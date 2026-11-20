import SectionHeading from "../components/SectionHeading";
import FeaturedBrands from "./FeaturedBrands";
import "./sections.css";

const services = [
  {
    number: "01",
    title: "Brand & identity",
    description: "Build a recognisable identity with a clear point of view, a consistent voice and a visual system made to last.",
  },
  {
    number: "02",
    title: "Digital strategy",
    description: "Turn business goals and audience needs into a focused digital direction, with purpose behind every decision.",
  },
  {
    number: "03",
    title: "Web design & development",
    description: "Create considered, responsive websites that balance expressive design with clarity, speed and usability.",
  },
  {
    number: "04",
    title: "Commerce experiences",
    description: "Make discovering, choosing and buying feel straightforward across every part of the customer journey.",
  },
  {
    number: "05",
    title: "Creative direction",
    description: "Bring campaigns and digital touchpoints together through a distinctive visual language and a strong idea.",
  },
  {
    number: "06",
    title: "Content & motion",
    description: "Use imagery, storytelling and purposeful movement to give digital experiences more depth and character.",
  },
];

const approach = [
  {
    number: "01",
    title: "Discover",
    description: "We listen, ask better questions and understand the people, context and challenge behind the brief.",
  },
  {
    number: "02",
    title: "Strategise",
    description: "We define the opportunity, align on priorities and create a clear direction before moving into design.",
  },
  {
    number: "03",
    title: "Create",
    description: "We shape the identity and experience, then bring the details together through thoughtful execution.",
  },
  {
    number: "04",
    title: "Deliver",
    description: "We refine, test and prepare the work for the real world, with care for the experience after launch.",
  },
];

const journalNotes = [
  {
    number: "01",
    topic: "Clarity",
    title: "Clarity is a design decision.",
    description: "The strongest digital experiences make the next step feel natural. Every element should help people understand where they are and what they can do.",
  },
  {
    number: "02",
    topic: "Trust",
    title: "Good experiences earn trust.",
    description: "Consistency, useful feedback and honest communication turn small interactions into confidence in a brand.",
  },
  {
    number: "03",
    topic: "Craft",
    title: "Details make the difference.",
    description: "A considered transition, a readable line or a simpler interaction can change how an entire experience feels.",
  },
];

export default function HomepageSections() {
  return (
    <div className="hp-sections">
      <section className="hp-section hp-vision" id="vision" aria-label="Our vision">
        <div className="hp-section__inner hp-vision__grid">
          <SectionHeading
            eyebrow="01 / Our vision"
            title={<>Make meaningful things.<br /><span>Move ideas forward.</span></>}
            description="We believe the best digital work brings purpose and imagination together. It should feel distinctive, work beautifully and make a meaningful difference to the people using it."
          />

          <aside className="hp-vision__note">
            <span className="hp-section__kicker">The Simatu point of view</span>
            <p>Technology is the medium. People are the reason. We create with both in mind.</p>
            <a className="hp-inline-link" href="#services">What we do <span aria-hidden="true">↗</span></a>
          </aside>
        </div>
      </section>

      <section className="hp-section hp-services" id="services" aria-label="Our services">
        <div className="hp-section__inner">
          <SectionHeading
            eyebrow="02 / What we do"
            title={<>Strategy, design<br /><span>and digital craft.</span></>}
            description="A connected set of capabilities for building brands and digital experiences with intention."
          />

          <div className="hp-service-grid">
            {services.map((service) => (
              <article className="hp-service-card" key={service.number}>
                <span className="hp-card-number">{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <span className="hp-service-card__mark" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FeaturedBrands />

      <section className="hp-section hp-approach" id="approach" aria-label="Our approach">
        <div className="hp-section__inner">
          <SectionHeading
            eyebrow="04 / How we work"
            title={<>A thoughtful process.<br /><span>Purpose at every step.</span></>}
            description="Good work comes from asking the right questions, making clear decisions and giving every detail the attention it deserves."
          />

          <div className="hp-approach-grid">
            {approach.map((step) => (
              <article className="hp-approach-step" key={step.number}>
                <span className="hp-card-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-journal" id="journal" aria-label="Journal and perspectives">
        <div className="hp-section__inner">
          <div className="hp-journal__heading">
            <SectionHeading
              eyebrow="05 / Journal"
              title={<>Notes from<br /><span>the process.</span></>}
              description="Ideas, observations and principles that shape the way we think about design and digital experiences."
            />
            <span className="hp-section__side-note">A few things we believe<br />are worth thinking about.</span>
          </div>

          <div className="hp-journal-grid">
            {journalNotes.map((note) => (
              <article className="hp-journal-card" key={note.number}>
                <div className="hp-journal-card__top">
                  <span className="hp-card-number">{note.number}</span>
                  <span>{note.topic}</span>
                </div>
                <h3>{note.title}</h3>
                <p>{note.description}</p>
                <span className="hp-journal-card__rule" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hp-section hp-about" id="about" aria-label="About Simatu">
        <div className="hp-section__inner hp-about__grid">
          <SectionHeading
            eyebrow="06 / About Simatu"
            title={<>Curious by nature.<br /><span>Intentional by design.</span></>}
            description="Simatu brings strategy, creativity and technology into one considered approach. We care about the thinking behind the work as much as the way it looks and feels."
          />
          <div className="hp-about__values">
            <div><span>01</span><h3>Clarity</h3><p>Make the complex feel understandable.</p></div>
            <div><span>02</span><h3>Curiosity</h3><p>Stay open, explore and keep asking.</p></div>
            <div><span>03</span><h3>Craft</h3><p>Care about the details and the whole.</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}
