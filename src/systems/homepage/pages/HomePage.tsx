import Hero from "../hero/Hero";
import DiscoverSection from "../discover/DiscoverSection";
import Footer from "../footer";

/** The homepage pairs the hero with an opt-in discovery experience and footer. */
export default function HomePage() {
  return (
    <div className="novae-page">
      <main className="homepage-main">
        <Hero />
        <DiscoverSection />
      </main>
      <Footer />
    </div>
  );
}
