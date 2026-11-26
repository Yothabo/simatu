import { Link, Navigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useStorefront from '../../core/hooks/useStorefront';

export default function StorefrontDocumentPage() {
  const { pathname } = useLocation();
  const { name: storeName, pathFor, documents } = useStorefront();
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments[segments.length - 1];
  const document = documents[slug];

  if (!document) return <Navigate to={pathFor()} replace />;

  return (
    <>
      <Header sticky={false} />
      <main className="min-h-[60vh] bg-[var(--sf-inverse-background)] px-6 py-16 text-[var(--sf-inverse-text)] sm:px-10 lg:px-16 lg:py-24">
        <article className="mx-auto max-w-[900px]">
          <Link to={pathFor()} className="mb-12 inline-flex items-center gap-2 text-xs text-[var(--sf-inverse-text-muted)] transition-colors hover:text-[var(--sf-accent)]">
            <FiArrowLeft aria-hidden="true" /> Back to {storeName}
          </Link>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--sf-accent)]">
            {storeName} · Customer information
          </p>
          <h1 className="max-w-3xl font-heading text-5xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">{document.title}</h1>
          <div className="mt-12 max-w-2xl border-t border-[var(--sf-inverse-border)] pt-8">
            <h2 className="font-heading text-2xl sm:text-3xl">{document.intro}</h2>
            <p className="mt-5 text-sm leading-8 text-[var(--sf-inverse-text-muted)] sm:text-base">{document.copy}</p>
            <p className="mt-8 text-xs leading-6 text-[var(--sf-inverse-text-muted)]">This information page is being prepared. The complete policy will be published here before orders are accepted.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
