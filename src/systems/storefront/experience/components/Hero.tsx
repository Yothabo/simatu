import { useProducts, getFeaturedProducts } from '../../core/hooks/useProducts.ts';
import { formatPrice } from '../../../../shared/utilities/formatPrice';
import ProductCarousel from './ProductCarousel';
import useStorefront from '../../core/hooks/useStorefront.ts';

const THREADS_COLOR: [number, number, number] = [0.5412, 0.6588, 0.6078];

export default function Hero() {
  const { products, isLoading, error } = useProducts();
  const { name: storeName, pathFor, primaryAccent } = useStorefront();

  const featuredProducts = getFeaturedProducts(products, 5).map((product) => ({
    ...product,
    price: formatPrice(product.price),
  }));

  return (
    <section
      id="home"
      aria-label="Hero"
      className="storefront-hero relative flex w-full select-none flex-col bg-white pt-16 pb-12"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        userSelect: 'none',
      }}
    >
      {/* Hero Wordmark */}
      <div className="relative isolate mb-12 flex min-h-[45vh] w-full items-center justify-center overflow-hidden px-6">
        <div className="storefront-wordmark storefront-hero__wordmark relative z-10 w-full max-w-none">
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              display: 'block',
              width: '100%',
              height: '25vh',
              background: 'transparent',
            }}
          >
            <text
              x="50"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              textLength="100"
              lengthAdjust="spacingAndGlyphs"
              style={{
                fontFamily: '"Anton", sans-serif',
                fontWeight: 400,
                fill: primaryAccent,
              }}
              fontSize="100"
            >
              {storeName.toLowerCase()}
            </text>
          </svg>
        </div>
      </div>

      {/* Featured products */}
      <div className="w-full">
        <ProductCarousel
          title="Trending"
          description={
            storeName === 'Yotaabo'
              ? "The scents our community loves most."
              : "Everyday essentials and intimate pieces chosen for comfort and confidence."
          }
          products={featuredProducts}
          placeholderColor="bg-[#f5f5f5]"
          bgColor="bg-white"
          textColor="text-black"
          accentColor={primaryAccent === "#ff1493" ? "text-[#ff1493]" : "text-[#8aa89b]"}
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
