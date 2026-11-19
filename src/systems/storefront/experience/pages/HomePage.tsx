import Header from "../../../../components/Header.tsx";
import Hero from "../../../../components/Hero.tsx";
import Services from "../../../../components/Services.tsx";
import Footer from "../../../../components/Footer.tsx";

export default function Home() {
  return (
    <main>
      <Header sticky={false} />
      <Hero />
      <Services />
      <Footer />
    </main>
  );
}
