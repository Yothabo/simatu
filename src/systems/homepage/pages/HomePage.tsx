import Hero from "../hero/Hero";
import FeaturedBrands from "../sections/FeaturedBrands";

/** The homepage is intentionally limited to the hero and full-screen brand showcase. */
export default function HomePage() {
  return (
    <div className="novae-page">
      <main className="homepage-main">
        <Hero />
        <FeaturedBrands />
      </main>
    </div>
  );
}
