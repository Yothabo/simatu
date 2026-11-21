import React from "react";
import Hero from "../hero/Hero";
import DiscoverSection from "../discover/DiscoverSection";
import Footer from "../footer";

/** The homepage keeps its normal flow; Discover is an editorial section, not a page transition. */
export default function HomePage() {
  return (
    <div className="nova-page homepage-layered-experience">
      <main className="homepage-main">
        <Hero />
        <DiscoverSection />
      </main>
      <Footer />
    </div>
  );
}
