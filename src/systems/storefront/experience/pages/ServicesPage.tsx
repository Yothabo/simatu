import Services from '../components/Services';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ServicesPage() {
  return (
    <>
      <Header sticky={false} />
      <main className="flex-1 bg-[var(--sf-inverse-background)] text-[var(--sf-inverse-text)]">
      <Services />
    <Footer />
    </main>
    </>
  );
}
