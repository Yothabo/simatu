import { Link, Navigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useStorefront from '../../core/hooks/useStorefront';

const documents = {
  privacy: {
    title: 'Privacy information',
    intro: 'Your privacy matters.',
    copy: 'This document will explain what personal information Poshies collects, why it is needed, how it is used and stored, and how customers can make requests about their information.',
  },
  terms: {
    title: 'Terms of use',
    intro: 'Clear expectations, from browsing to checkout.',
    copy: 'This document will set out the terms that apply when using Poshies, including ordering, payment, product availability, pricing and customer responsibilities.',
  },
  delivery: {
    title: 'Delivery & returns',
    intro: 'The details you need before placing an order.',
    copy: 'This document will explain delivery areas and timelines, shipping charges, order tracking, returns, exchanges and eligibility. Final operational details will be published here once confirmed.',
  },
} as const;

type DocumentKey = keyof typeof documents;

export default function StorefrontDocumentPage() {
  const { pathname } = useLocation();
  const { name: storeName, pathFor } = useStorefront();
  const slug = pathname.split('/').filter(Boolean).at(-1) as DocumentKey;
  const document = documents[slug];

  if (storeName !== 'Poshies' || !document) return <Navigate to={pathFor()} replace />;

  return (
    <>
      <Header sticky={false} />
      <main className="min-h-[60vh] bg-[#242424] px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-24">
        <article className="mx-auto max-w-[900px]">
          <Link to={pathFor()} className="mb-12 inline-flex items-center gap-2 text-xs text-white/65 transition-colors hover:text-[#ff1493]">
            <FiArrowLeft aria-hidden="true" /> Back to Poshies
          </Link>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff1493]">Poshies · Customer information</p>
          <h1 className="max-w-3xl font-heading text-5xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">{document.title}</h1>
          <div className="mt-12 max-w-2xl border-t border-white/15 pt-8">
            <h2 className="font-heading text-2xl sm:text-3xl">{document.intro}</h2>
            <p className="mt-5 text-sm leading-8 text-white/65 sm:text-base">{document.copy}</p>
            <p className="mt-8 text-xs leading-6 text-white/45">This information page is being prepared. The complete policy will be published here before orders are accepted.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
