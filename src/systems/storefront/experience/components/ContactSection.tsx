import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import useStorefront from '../../core/hooks/useStorefront.ts';

export default function ContactSection() {
  const { name: storeName, pathFor } = useStorefront();
  const isYotaabo = storeName === 'Yotaabo';
  return (
    <section
      id="contact"
      className={`relative z-10 -mb-px px-[var(--sf-space-6)] py-[var(--sf-space-20)] sm:px-[var(--sf-space-10)] sm:py-[var(--sf-space-24)] lg:px-[var(--sf-space-12)] lg:py-[var(--sf-space-28)] ${isYotaabo ? "bg-[var(--sf-background)]" : "bg-[var(--sf-inverse-background)] text-[var(--sf-inverse-text)]"}`}
    >
      <div className="mx-auto max-w-[var(--sf-content-max-width)] p-[var(--sf-space-7)] sm:p-[var(--sf-space-10)] lg:p-[var(--sf-space-14)]">

        {/* 1. Heading stands alone */}
        <h2 className="max-w-2xl font-heading text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-current sm:text-5xl lg:text-6xl">
          {isYotaabo ? 'Find the scent that feels like you.' : 'Find the pieces that feel like you.'}
        </h2>

        {/* 2. Paragraph and Button are in a flex row together */}
        <div className="mt-[var(--sf-space-5)] flex flex-col gap-[var(--sf-space-6)] md:flex-row md:items-start md:justify-between md:gap-[var(--sf-space-12)]">
          <p className="max-w-xl text-sm leading-[1.9] text-[var(--sf-inverse-text-muted)]">
            {isYotaabo
              ? 'Explore the collection and discover a fragrance direction that fits your mood, your style, and your everyday.'
              : 'Explore intimate essentials, everyday underwear, and comfortable pieces for relaxing and unwinding.'}
          </p>

          <Link
            to={pathFor('services')}
            className="inline-flex shrink-0 min-h-12 items-center justify-between gap-8 border border-[var(--sf-accent)] bg-[var(--sf-accent)] px-5 text-xs font-semibold text-[var(--sf-accent-contrast)] transition-colors hover:bg-[var(--sf-inverse-background)] hover:text-[var(--sf-accent)] md:mt-1 md:min-w-[200px]"
          >
            {isYotaabo ? 'Explore fragrances' : 'Explore collections'}
            <FiArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>

      </div>
    </section>
  );
}
