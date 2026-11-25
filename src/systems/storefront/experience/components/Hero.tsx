import { useProducts, getFeaturedProducts } from '../../core/hooks/useProducts.ts';
import { formatPrice } from '../../../../shared/utilities/formatPrice';
import ProductCarousel from './ProductCarousel';
import useStorefront from '../../core/hooks/useStorefront.ts';

const POSHIES_HERO_IMAGE = 'https://images.unsplash.com/photo-1770290924629-5c74da19051c?auto=format&fit=crop&w=1800&q=85';

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
        <div className="poshies-hero">
          <div className="poshies-hero__copy">
            <span className="poshies-kicker">THE POSHIES EDIT · INTIMATE ESSENTIALS</span>
            <h1>Feel good<br /><em>in your own skin.</em></h1>
            <p>Thoughtfully chosen intimate essentials, everyday comfort and pieces that make getting dressed feel like a little act of self-care.</p>
            <a className="poshies-button" href={pathFor('catalog')}>Shop the collection <span aria-hidden="true">↗</span></a>
            <span className="poshies-hero__note">Comfort first. Confidence always.</span>
          </div>
          <div className="poshies-hero__visual">
            <img src={POSHIES_HERO_IMAGE} alt="Editorial intimate apparel campaign photography" fetchPriority="high" />
            <div className="poshies-hero__image-caption"><span>01 / THE EVERYDAY EDIT</span><span>Made for you</span></div>
            <div className="poshies-hero__seal">POSHIES<br /><span>FEEL YOURSELF</span></div>
          </div>
          <div className="poshies-hero__vertical">INTIMATE · EVERYDAY · ESSENTIAL</div>
        </div>
        <div className="poshies-benefits" aria-label="Poshies shopping highlights">
          <span>THE EVERYDAY EDIT</span><i />
          <span>COMFORT THAT FITS</span><i />
          <span>CONFIDENCE IN EVERY DETAIL</span>
        </div>
        <div className="w-full poshies-featured">
          <ProductCarousel
            title="The pieces to know"
            description="Everyday essentials and intimate pieces chosen for comfort, confidence and your own kind of style."
            products={featuredProducts}
            placeholderColor="bg-[#f5eeee]"
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
