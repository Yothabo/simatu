import { useProducts, getFeaturedProducts } from '../../core/hooks/useProducts.ts';
import { formatPrice } from '../../../../shared/utilities/formatPrice';
import ProductCarousel from './ProductCarousel';
import useStorefront from '../../core/hooks/useStorefront.ts';

export default function Hero() {
  const { products, isLoading, error } = useProducts();
  const { name: storeName, pathFor, primaryAccent, hero } = useStorefront();
  const featuredProducts = getFeaturedProducts(products, 5).map((product) => ({ ...product, price: formatPrice(product.price) }));

  if (hero.variant === 'campaign') {
    return <section id="home" aria-label={`${storeName} home`} className="storefront-hero poshies-home"><div className="poshies-campaign-wrap"><div className="poshies-campaign"><span className="poshies-campaign__wordmark" aria-label={hero.wordmark}>{hero.wordmark}</span></div></div></section>;
  }

  return (
    <section id="home" aria-label="Hero" className="storefront-hero relative flex w-full select-none flex-col bg-[var(--sf-background)] pt-16 pb-12">
      <div className="relative isolate mb-12 flex min-h-[45vh] w-full items-center justify-center overflow-hidden px-6">
        <div className="storefront-wordmark storefront-hero__wordmark relative z-10 w-full max-w-none">
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '25vh', background: 'transparent' }}>
            <text x="50" y="50%" dominantBaseline="middle" textAnchor="middle" textLength="100" lengthAdjust="spacingAndGlyphs" style={{ fontFamily: 'var(--sf-font-display)', fontWeight: 400, fill: primaryAccent }} fontSize="100">{hero.wordmark.toLowerCase()}</text>
          </svg>
        </div>
      </div>
      <div className="w-full">
        <ProductCarousel title="Trending" description={hero.description} products={featuredProducts} placeholderColor="bg-[var(--sf-surface-soft)]" bgColor="bg-[var(--sf-surface)]" textColor="text-[var(--sf-text)]" accentColor="text-[var(--sf-accent)]" themeColor={primaryAccent} isDark={false} isLoading={isLoading} error={error} viewAllHref={pathFor('catalog')} useProductTheme />
      </div>
    </section>
  );
}
