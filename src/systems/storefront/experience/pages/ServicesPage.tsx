import { Link } from 'react-router-dom';
import Services from '../../../../components/Services.tsx';
import Header from '../../../../components/Header.tsx';
import Footer from '../../../../components/Footer.tsx';

export default function ServicesPage() {
  return (
    <>
      <Header sticky={false} />
      <main className="flex-1 bg-[#f5f5f2]">
      <Services />
    <Footer />
    </main>
    </>
  );
}
