import ProductCarousel from './ProductCarousel';
import useStorefront from '../../core/hooks/useStorefront.ts';
import {
  useProducts,
  getCategoryProducts,
  type ProductCategory,
} from '../../core/hooks/useProducts.ts';

type ServiceCategory = {
  id: string;
  title: string;
  topText: string;
  description: string;
  bgColor: string;
  textColor: string;
  textFill: string;
  accentColor: string;
  placeholderColor?: string;
  overlayColor?: string;
  hasImage: boolean;
  imageSrc?: string;
  isDark?: boolean;
  collectionTitle?: string;
  productCategory?: ProductCategory;
};

export default function Services() {
  const { products, isLoading, error } = useProducts();
  const { categoryOrder, name: storeName, pathFor } = useStorefront();
  const orderedCategoryTypes: readonly ProductCategory[] = categoryOrder;
  const isYotaabo = storeName === 'Yotaabo';

  const categories: ServiceCategory[] = [
    {
      id: 'his',
      title: isYotaabo ? 'His' : 'Him',
      topText: isYotaabo ? 'REFINED. GROUNDED. REMEMBERED.' : 'EVERYDAY COMFORT. MADE FOR HIM.',
      description:
        isYotaabo ? 'Crafted for presence. Distinctive scents for the modern man, refined in character, grounded in confidence, and made to be remembered.' : 'Everyday underwear designed with comfort in mind. From classic boxers to briefs and trunks, find the essentials that fit your day.',
      bgColor: 'bg-white',
      textColor: 'text-[#4d4d4d]',
      textFill: 'fill-[#8aa89b]',
      accentColor: 'text-[#4d4d4d]',
      placeholderColor: 'bg-[#8aa89b]',
      overlayColor: '#000000',
      hasImage: true,
      imageSrc: '/systems/storefront/shared/images/hisimage.webp',
      isDark: false,
      collectionTitle: isYotaabo ? 'His Collection' : 'Him Collection',
      productCategory: 'His',
    },
    {
      id: 'hers',
      title: isYotaabo ? 'Hers' : 'Her',
      topText: isYotaabo ? 'ELEGANCE IN EVERY NOTE' : 'INTIMATE. COMFORTABLE. CONFIDENT.',
      description:
        isYotaabo ? 'Fragrances crafted to complement elegance and individuality, whether soft and floral or bold and warm.' : 'Discover bras, panties, bikinis, lingerie and matching sets chosen to help you feel comfortable and confident.',
      bgColor: 'bg-white',
      textColor: 'text-[#4d4d4d]',
      textFill: 'fill-[#ff1493]',
      accentColor: 'text-[#4d4d4d]',
      placeholderColor: 'bg-[#ff1493]',
      overlayColor: '#f2e9d8',
      hasImage: true,
      imageSrc: '/systems/storefront/shared/images/herimage.webp',
      isDark: false,
      collectionTitle: 'Her Collection',
      productCategory: 'Hers',
    },
    {
      id: 'spaces',
      title: isYotaabo ? 'Spaces' : 'Lounge',
      topText: isYotaabo ? 'SCENTS FOR EVERY ROOM' : 'SLOW DOWN. SETTLE IN. FEEL GOOD.',
      description:
        isYotaabo ? 'Extend your signature into every space. Ambient scents for the home and car, quietly shaping the atmosphere wherever you go.' : 'Comfortable pyjamas, nightwear, robes and relaxed sets for slowing down and enjoying your time at home.',
      bgColor: 'bg-white',
      textColor: 'text-[#4d4d4d]',
      textFill: 'fill-[#c8ad8d]',
      accentColor: 'text-[#4d4d4d]',
      placeholderColor: 'bg-[#c8ad8d]',
      overlayColor: '#e8dec9',
      hasImage: false,
      isDark: false,
      collectionTitle: isYotaabo ? 'Collections' : 'Lounge Collection',
      productCategory: isYotaabo ? 'Spaces' : 'Lounge',
    },
    {
      id: 'about',
      title: 'about',
      topText: isYotaabo ? 'THE STORY BEHIND THE SCENT' : 'THE COMFORT OF BEING YOURSELF',
      description:
        isYotaabo ? 'Born from a simple, enduring belief: fragrance is not merely something you wear, but a reflection of who you are. We curate distinctive scents that speak quietly yet linger long, carefully designed to become an unforgettable part of how you are remembered.' : 'Poshies is about feeling comfortable and confident in what you wear. From everyday intimate essentials to pieces made for relaxing, we bring together styles that fit naturally into your life.',
      bgColor: 'bg-white',
      textColor: 'text-[#4d4d4d]',
      textFill: isYotaabo ? 'fill-[#8aa89b]' : 'fill-[#ff1493]',
      accentColor: 'text-[#4d4d4d]',
      hasImage: false,
    },
  ];

  const orderedCategories = [
    ...categories
      .filter((category) => category.productCategory)
      .sort(
        (a, b) =>
          orderedCategoryTypes.indexOf(a.productCategory!) -
          orderedCategoryTypes.indexOf(b.productCategory!)
      ),
    ...categories.filter((category) => !category.productCategory),
  ];

  return (
    <section id="services" className="storefront-collections w-full bg-white">
      {orderedCategories.map((category) => (
        <div key={category.id} className="flex flex-col w-full">
          <div
            className={`relative grid min-h-[100svh] w-full grid-rows-[auto_1fr_auto] overflow-hidden ${category.bgColor} ${category.textColor} px-6 py-12 sm:px-12 lg:px-20 lg:py-16`}
          >
            {/* Top Center Text */}
            {category.topText && (
              <div className="relative z-20 flex h-8 w-full items-center justify-center text-center sm:h-auto">
                <h2 className="whitespace-nowrap font-heading text-sm font-medium uppercase tracking-[0.2em] sm:text-2xl">
                  {category.topText}
                </h2>
              </div>
            )}

            {/* Main Content Area */}
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Giant Background Word (Stretched) */}
              <div
                className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
                style={{ height: '45vh', margin: 'auto' }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                >
                  <text
                    x="50"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    textLength="100"
                    lengthAdjust="spacingAndGlyphs"
                    style={{ fontFamily: '"Anton", sans-serif', fontWeight: 400 }}
                    className={category.textFill}
                    fontSize="100"
                  >
                    {category.title}
                  </text>
                </svg>
              </div>

              {/* Decorative Script Text */}
              <div className="pointer-events-none absolute inset-0 z-20">
                {category.id === 'about' ? (
                  /* About: Bottom-Right, not rotated */
                  <div className="absolute bottom-20 inset-x-0 w-full min-w-0 sm:bottom-32">
                    {storeName === 'Poshies' ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="block h-[clamp(80px,12vw,160px)] w-full max-w-none"
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
                            fill: '#ff1493',
                          }}
                          fontSize="100"
                        >
                          poshies
                        </text>
                      </svg>
                    ) : (
                      <span className={`whitespace-nowrap font-accent text-[clamp(80px,12vw,160px)] font-normal leading-[0.7] tracking-normal ${category.accentColor}`}>
                        {storeName.toLowerCase()}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Other sections: Rotated on the left */
                  <>
                    <div className="flex flex-col items-center justify-center w-full h-full lg:hidden">
                      <span className={`absolute left-6 top-1/2 origin-left -translate-y-1/2 -rotate-90 whitespace-nowrap font-accent text-[clamp(80px,12vw,120px)] font-normal leading-[0.7] tracking-normal ${category.accentColor}`}>
                        For
                      </span>
                    </div>
                    <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 items-center justify-center">
                      <span className={`origin-left -rotate-90 whitespace-nowrap font-accent text-[clamp(100px,16vw,200px)] font-normal leading-[0.7] tracking-normal ${category.accentColor}`}>
                        For
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Image Overlay */}
              {category.hasImage && (
                <img
                  src={category.imageSrc || "/systems/storefront/shared/images/hisimage.webp"}
                  alt={`${category.title} collection`}
                  className="pointer-events-none absolute bottom-[15%] right-0 z-40 h-[35vh] w-auto object-contain object-right-bottom drop-shadow-2xl sm:bottom-[20%]"
                />
              )}
            </div>

            {/* Bottom Area — Paragraph */}
            <div className="relative z-20 flex w-full pt-4">
              <div className="max-w-[420px]">
                <p className="font-heading text-lg leading-[1.6]">
                  {category.description}
                </p>
              </div>
            </div>
          </div>

          {/* Product Carousel */}
          {category.productCategory &&
            category.collectionTitle &&
            category.placeholderColor &&
            category.isDark !== undefined && (
            <div className={`w-full ${category.bgColor}`}>
              <ProductCarousel
                title={category.collectionTitle}
                products={getCategoryProducts(
                  products,
                  category.productCategory,
                  5
                ).map((product) => ({
                  ...product,
                  price: `R ${Number(product.price).toFixed(2)}`,
                }))}
                placeholderColor={category.placeholderColor}
                bgColor={category.bgColor}
                textColor={category.textColor}
                accentColor={category.accentColor}
                themeColor={
                  category.id === 'his'
                    ? '#8aa89b'
                    : category.id === 'hers'
                      ? '#ff1493'
                      : '#c8ad8d'
                }
                isDark={category.isDark}
                isLoading={isLoading}
                error={error}
                viewAllHref={pathFor(`catalog?category=${category.productCategory}`)}
              />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
