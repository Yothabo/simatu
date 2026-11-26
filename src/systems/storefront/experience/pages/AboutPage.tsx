import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useStorefront from '../../core/hooks/useStorefront';

export default function About() {
  const { name: storeName, pathFor, aboutPage } = useStorefront();

  return (
    <>
      <Header sticky={false} />
      <main className="flex-1 bg-[var(--sf-inverse-background)] text-[var(--sf-inverse-text)]">
        <section className="px-6 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-20 lg:px-12 lg:pb-24 lg:pt-24">
          <div className="mx-auto max-w-[1120px]">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--sf-inverse-text-muted)]">
              {aboutPage.eyebrow}
            </p>
            <h1 className="max-w-4xl font-heading text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              {aboutPage.headline}
            </h1>
            <div className="mt-10 grid gap-8 border-t border-[var(--sf-inverse-border)] pt-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sf-inverse-text-muted)]">
                {storeName}
              </p>
              <div className="max-w-2xl">
                <p className="text-base leading-[1.9] sm:text-lg">{aboutPage.lead}</p>
                <p className="mt-5 text-sm leading-[1.95] text-[var(--sf-inverse-text-muted)]">{aboutPage.description}</p>
                <p className="mt-5 font-heading text-2xl sm:text-3xl">{aboutPage.closing}</p>
                <Link to={pathFor('services')}
                  className="mt-8 inline-flex items-center gap-5 border-b border-current pb-2 text-xs font-semibold text-current transition-colors hover:text-[var(--sf-accent)]">
                  {aboutPage.actionLabel}<FiArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="border-y border-[var(--sf-inverse-border)] bg-[var(--sf-inverse-background)] px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="sr-only">{aboutPage.principlesHeading}</h2>
            <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
              {aboutPage.principles.map((item) => (
                <article key={item.number} className="border-t border-[var(--sf-inverse-border)] pt-5">
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--sf-inverse-text-muted)]">{item.number}</span>
                  <h3 className="mt-4 font-heading text-3xl font-medium">{item.title}</h3>
                  <p className="mt-2 text-xs leading-[1.85] text-[var(--sf-inverse-text-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
