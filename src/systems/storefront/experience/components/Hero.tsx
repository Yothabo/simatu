import { useProducts, getFeaturedProducts } from '../../core/hooks/useProducts.ts';
import { formatPrice } from '../../../../shared/utilities/formatPrice';
import ProductCarousel from './ProductCarousel';
import useStorefront from '../../core/hooks/useStorefront.ts';

const POSHIES_CAMPAIGN_IMAGE = 'https://mediaslide-us.storage.googleapis.com/soulartist/pictures/1011/9431/large-1663688680-b10c77c1427eca5267cf9e6d506e7583.jpg';

export default function Hero() {
  const { products, isLoading, error } = useProducts();
  const { name: storeName, pathFor, primaryAccent } = useStorefront();
  const isPoshies = storeName === 'Poshies';
  const featuredProducts = getFeaturedProducts(products, 5).map((product) => ({
    ...product,
    price: formatPrice(product.price),
  }));

  if (isPoshies) {
    return (
      <section id="home" aria-label="Poshies home" className="storefront-hero poshies-home">
        <div className="poshies-campaign-wrap">
          <div className="poshies-campaign">
            <img
              className="poshies-campaign__image"
              src={POSHIES_CAMPAIGN_IMAGE}
              alt="Black male model wearing boxer briefs in a softly lit interior"
              fetchPriority="high"
            />
          </div>
        </div>
        <div className="poshies-featured">
          <ProductCarousel
            title="The intimate edit"
            description="Bras, underwear, sleepwear and feel-good pieces selected for comfort, fit and self-expression."
            products={featuredProducts}
            placeholderColor="bg-[#f5f5f5]"
            bgColor="bg-white"
            textColor="text-black"
            accentColor="text-[#ff1493]"
            themeColor={primaryAccent}
            isDark={false}
            isLoading={isLoading}
            error={error}
            viewAllHref={pathFor('catalog')}
            useProductTheme
          />
        </div>
      </section>
    );
  }

  return (
    <section id="home" aria-label="Hero" className="storefront-hero relative flex w-full select-none flex-col bg-white pt-16 pb-12">
      <div className="relative isolate mb-12 flex min-h-[45vh] w-full items-center justify-center overflow-hidden px-6">
        <div className="storefront-wordmark storefront-hero__wordmark relative z-10 w-full max-w-none">
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '25vh', background: 'transparent' }}>
            <text x="50" y="50%" dominantBaseline="middle" textAnchor="middle" textLength="100" lengthAdjust="spacingAndGlyphs" style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400, fill: primaryAccent }} fontSize="100">
              {storeName.toLowerCase()}
            </text>
          </svg>
        </div>
      </div>
      <div className="w-full">
        <ProductCarousel
          title="Trending"
          description="The scents our community loves most."
          products={featuredProducts}
          placeholderColor="bg-[#f5f5f5]"
          bgColor="bg-white"
          textColor="text-black"
          accentColor="text-[#8aa89b]"
          themeColor={primaryAccent}
          isDark={false}
          isLoading={isLoading}
          error={error}
          viewAllHref={pathFor('catalog')}
          useProductTheme
        />
      </div>
    </section>
  );
}
