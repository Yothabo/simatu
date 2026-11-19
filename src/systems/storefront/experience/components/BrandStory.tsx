import { Link } from 'react-router-dom';
import useStorefront from '../hooks/useStorefront';

export default function BrandStory() {
  const { name: storeName, pathFor } = useStorefront();
  const isYotaabo = storeName === 'Yotaabo';
  return (
    <section
      id="about"
      className="border-b border-black/10 bg-white px-6 py-20 sm:px-10 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
        <div>
          <h2 className="max-w-md font-heading text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl lg:text-6xl">
            {isYotaabo ? 'A scent should feel like you.' : 'Comfort should feel like you.'}
          </h2>
        </div>

        <div className="flex flex-col justify-center">
          <p className="max-w-2xl text-sm leading-[1.95] text-[#555550] sm:text-base">
            {isYotaabo
              ? 'Fragrance is more than something you wear. It can express a mood, complete a personal style, and become part of the way people remember you.'
              : 'What you wear close to you should feel comfortable, look good, and fit naturally into your everyday life.'}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-[1.95] text-[#555550] sm:text-base">
            {isYotaabo
              ? `${storeName} is built around that personal connection: finding scents that feel considered, distinctive, and right for the moment.`
              : `${storeName} is built around everyday comfort, thoughtful details, and intimate pieces that let you feel good in your own skin.`}
          </p>
          <Link
            to={pathFor('about')}
            className="group mt-8 inline-flex w-fit items-center gap-5 border-b border-black pb-2 text-xs font-semibold text-black transition-colors hover:border-[var(--color-grey)] hover:text-[var(--color-grey)]"
          >
            Discover our story
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
