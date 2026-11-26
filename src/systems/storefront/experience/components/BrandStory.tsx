import { Link } from 'react-router-dom';
import useStorefront from '../../core/hooks/useStorefront.ts';

export default function BrandStory() {
  const { story, pathFor } = useStorefront();
  const inverse = story.tone === 'inverse';
  return (
    <section id="about" className={`border-b border-[var(--sf-border-subtle)] px-[var(--sf-space-6)] py-[var(--sf-space-20)] sm:px-[var(--sf-space-10)] sm:py-[var(--sf-space-24)] lg:px-[var(--sf-space-12)] lg:py-[var(--sf-space-28)] ${inverse ? 'bg-[var(--sf-inverse-background)] text-[var(--sf-inverse-text)]' : 'bg-[var(--sf-background)] text-[var(--sf-text)]'}`}>
      <div className="mx-auto grid max-w-[var(--sf-content-max-width)] gap-[var(--sf-space-10)] md:grid-cols-[0.7fr_1.3fr] md:gap-[var(--sf-space-16)]">
        <div><h2 className="max-w-md font-heading text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-current sm:text-5xl lg:text-6xl">{story.heading}</h2></div>
        <div className="flex flex-col justify-center">
          {story.paragraphs.map((paragraph, index) => <p key={index} className={`${index ? 'mt-[var(--sf-space-5)]' : ''} max-w-2xl text-sm leading-[1.95] ${inverse ? 'text-[var(--sf-inverse-text-muted)]' : 'text-[var(--sf-text-muted)]'} sm:text-base`}>{paragraph}</p>)}
          <Link to={pathFor('about')} className="group mt-[var(--sf-space-8)] inline-flex w-fit items-center gap-[var(--sf-space-5)] border-b border-current pb-2 text-xs font-semibold text-current transition-colors hover:border-[var(--sf-accent)] hover:text-[var(--sf-accent)]">
            {story.actionLabel} <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
