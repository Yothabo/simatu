import Hero from "../hero/Hero";
import KineticMoodboard from "../discover/KineticMoodboard";

/** The homepage pairs the hero with the interactive discovery experience. */
export default function HomePage() {
  return (
    <div className="novae-page">
      <main className="homepage-main">
        <Hero />
        <KineticMoodboard />
      </main>
    </div>
  );
}
