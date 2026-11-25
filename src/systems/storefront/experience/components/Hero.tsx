import { useProducts, getFeaturedProducts } from '../../core/hooks/useProducts.ts';
import { formatPrice } from '../../../../shared/utilities/formatPrice';
import ProductCarousel from './ProductCarousel';
import useStorefront from '../../core/hooks/useStorefront.ts';

const POSHIES_CAMPAIGN_IMAGE = 'https://www.netterose.com/cdn/shop/products/NetteRose5_900x.jpg?v=1669900445';

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
          <a className="poshies-campaign" href={pathFor('catalog')} aria-label="Discover Poshies intimate apparel">
            <img
              className="poshies-campaign__image"
              src={POSHIES_CAMPAIGN_IMAGE}
              alt="South African intimate apparel campaign photographed outdoors"
              fetchPriority="high"
            />
            <span className="poshies-campaign__topline">THE LANGUAGE OF STYLE</span>
            <span className="poshies-campaign__wordmark" aria-label="Poshies">poshies</span>
            <span className="poshies-campaign__bottomline">A world of personal style</span>
            <span className="poshies-campaign__arrow" aria-hidden="true">↗</span>
          </a>
          <div className="poshies-campaign__meta">
            <span>DISCOVER POSHIES</span>
            <span>02 / 02</span>
          </div>
          <p className="poshies-campaign__description">Intimate apparel for the modern life.</p>
        </div>
        <div className="poshies-featured">
          <ProductCarousel
            title="Trending"
            description="Intimate essentials and considered pieces for the way you live."
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
