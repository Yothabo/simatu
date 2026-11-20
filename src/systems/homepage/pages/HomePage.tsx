import Hero from "../hero/Hero";
import HomepageSections from "../sections/HomepageSections";
import Footer from "../footer";

/** Full homepage composition. Section styling is driven by the homepage design tokens. */
export default function HomePage() {
  return (
    <div className="novae-page">
      <main className="homepage-main">
        <Hero />
        <HomepageSections />
      </main>
      <Footer />
    </div>
  );
}
