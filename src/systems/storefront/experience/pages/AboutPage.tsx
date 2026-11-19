import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useStorefront from '../../core/hooks/useStorefront';

export default function About() {
  const { name: storeName, pathFor } = useStorefront();
  const isYotaabo = storeName === 'Yotaabo';

  const principles = isYotaabo
    ? [
        { number: '01', title: 'Personal', copy: 'Choose what resonates with you, not just what is trending.' },
        { number: '02', title: 'Considered', copy: 'Make fragrance part of the details that define your style.' },
        { number: '03', title: 'Memorable', copy: 'Let your scent become part of the impression you leave.' },
      ]
    : [
        { number: '01', title: 'Comfort', copy: 'Everyday essentials should feel as good as they look.' },
        { number: '02', title: 'Confidence', copy: 'Find pieces that make you feel comfortable in your own skin.' },
        { number: '03', title: 'Your way', copy: 'Choose the styles that feel right for you and your everyday.' },
      ];

  return (
    <>
      <Header sticky={false} />
      <main className="flex-1 bg-[#f5f5f2]">
      <section className="px-6 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-20 lg:px-12 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-[1120px]">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-grey)]">
            About {storeName}
          </p>
          <h1 className="max-w-4xl font-heading text-5xl font-medium leading-[0.98] tracking-[-0.045em] text-black sm:text-6xl lg:text-8xl">
            {isYotaabo ? (
              <>Fragrance is personal.<br /><span>Make it yours.</span></>
            ) : (
              <>Comfort is personal.<br /><span>Make it yours.</span></>
            )}
          </h1>

          <div className="mt-10 grid gap-8 border-t border-black/10 pt-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-grey)]">
              Our point of view
            </p>
            <div className="max-w-2xl">
              <p className="text-base leading-[1.9] text-[#444440] sm:text-lg">
                {isYotaabo
                  ? 'We believe fragrance is more than a scent. It is an expression of personality, a reflection of mood, and a detail that can make a lasting impression.'
                  : 'We believe what you wear close to you should feel comfortable, considered, and true to your personal style.'}
              </p>
              <p className="mt-5 text-sm leading-[1.95] text-[#555550]">
                {isYotaabo
                  ? `${storeName} is about discovering fragrances that feel like you. Whether you gravitate towards warm and captivating notes, soft florals, or fresh citrus, the right fragrance should feel personal rather than prescribed.`
                  : `${storeName} brings together intimate essentials, everyday underwear, and comfortable sleepwear. From pieces for him and her to relaxed styles for winding down, find what feels right for you.`}
              </p>
              <p className="mt-5 font-heading text-2xl text-black sm:text-3xl">
                {isYotaabo ? 'Find your signature. Wear it your way.' : 'Feel comfortable. Feel confident. Be yourself.'}
              </p>
              <Link
                to={pathFor('services')}
                className="mt-8 inline-flex items-center gap-5 border-b border-black pb-2 text-xs font-semibold text-black transition-colors hover:text-[var(--color-grey)]"
              >
                {isYotaabo ? 'Explore fragrances' : 'Explore collections'}
                <FiArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[1120px] gap-8 sm:grid-cols-3 sm:gap-10">
          {principles.map((item) => (
            <article key={item.number} className="border-t border-black/10 pt-5">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--color-grey)]">
                {item.number}
              </span>
              <h2 className="mt-4 font-heading text-3xl font-medium text-black">
                {item.title}
              </h2>
              <p className="mt-2 text-xs leading-[1.85] text-[#555550]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>
    <Footer />
    </main>
    </>
  );
}
