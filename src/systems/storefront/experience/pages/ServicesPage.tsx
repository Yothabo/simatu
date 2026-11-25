import { Link } from 'react-router-dom';
import Services from '../components/Services';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ServicesPage() {
  return (
    <>
      <Header sticky={false} />
      <main className="flex-1 bg-[#292426]">
      <Services />
    <Footer />
    </main>
    </>
  );
}
