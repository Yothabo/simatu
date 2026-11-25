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
  // Each collection is filtered by its exact catalogue category; never combine
  // products from neighbouring collections in the Poshies storefront.
  const orderedCategoryTypes: readonly ProductCategory[] = categoryOrder;
  const isYotaabo = storeName === 'Yotaabo';
  const isPoshies = storeName === 'Poshies';

  const categories: ServiceCategory[] = [
    {
      id: 'his',
      title: isYotaabo ? 'His' : 'Him',
      topText: isYotaabo ? 'REFINED. GROUNDED. REMEMBERED.' : 'COMFORT THAT FEELS LIKE YOURS.',
      description:
        isYotaabo ? 'Crafted for presence. Distinctive scents for the modern man, refined in character, grounded in confidence, and made to be remembered.' : 'Everyday briefs, boxers and trunks with a comfortable fit and a little more confidence in every layer.',
      bgColor: isPoshies ? 'bg-[#242424]' : 'bg-white',
      textColor: isPoshies ? 'text-white' : 'text-[#4d4d4d]',
      textFill: 'fill-[#8aa89b]',
      accentColor: 'text-[#4d4d4d]',
      placeholderColor: 'bg-[#8aa89b]',
      overlayColor: '#000000',
      hasImage: isYotaabo,
      imageSrc: isYotaabo ? '/systems/storefront/shared/images/hisimage.webp' : undefined,
      isDark: false,
      collectionTitle: isYotaabo ? 'His Collection' : 'Him Collection',
      productCategory: 'His',
    },
    {
      id: 'hers',
      title: isYotaabo ? 'Hers' : 'Her',
      topText: isYotaabo ? 'ELEGANCE IN EVERY NOTE' : 'MADE TO FEEL GOOD ON YOUR SKIN.',
      description:
        isYotaabo ? 'Fragrances crafted to complement elegance and individuality, whether soft and floral or bold and warm.' : 'Discover bras, panties, matching sets and lingerie chosen for the way they feel, fit and let you express yourself.',
      bgColor: isPoshies ? 'bg-[#242424]' : 'bg-white',
      textColor: isPoshies ? 'text-white' : 'text-[#4d4d4d]',
      textFill: 'fill-[#ff1493]',
      accentColor: 'text-[#4d4d4d]',
      placeholderColor: 'bg-[#ff1493]',
      overlayColor: '#f2e9d8',
      hasImage: isYotaabo,
      imageSrc: isYotaabo ? '/systems/storefront/shared/images/herimage.webp' : undefined,
      isDark: false,
      collectionTitle: 'Her Collection',
      productCategory: 'Hers',
    },
    {
      id: 'spaces',
      title: isYotaabo ? 'Spaces' : 'Lounge',
      topText: isYotaabo ? 'SCENTS FOR EVERY ROOM' : 'SOFT MOMENTS. YOUR OWN SPACE.',
      description:
        isYotaabo ? 'Extend your signature into every space. Ambient scents for the home and car, quietly shaping the atmosphere wherever you go.' : 'Slip into soft sleepwear, robes and relaxed sets made for slow mornings, quiet evenings and time that belongs to you.',
      bgColor: isPoshies ? 'bg-[#242424]' : 'bg-white',
      textColor: isPoshies ? 'text-white' : 'text-[#4d4d4d]',
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
      topText: isYotaabo ? 'THE STORY BEHIND THE SCENT' : 'INTIMACY, ON YOUR OWN TERMS.',
      description:
        isYotaabo ? 'Born from a simple, enduring belief: fragrance is not merely something you wear, but a reflection of who you are. We curate distinctive scents that speak quietly yet linger long, carefully designed to become an unforgettable part of how you are remembered.' : 'Poshies is a space for intimate essentials, everyday comfort and personal expression. Find pieces that feel right against your skin and let confidence begin with you.',
      bgColor: isPoshies ? 'bg-[#242424]' : 'bg-white',
      textColor: isPoshies ? 'text-white' : 'text-[#4d4d4d]',
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
    <section id="services" className={`storefront-collections w-full ${isPoshies ? 'bg-[#242424] text-white poshies-collections' : 'bg-white'}`}>
      {orderedCategories.map((category) => (
        <div key={category.id} className={`flex flex-col w-full ${isPoshies ? `poshies-collection-section poshies-collection-section--${category.id}` : ""}`}>
          <div
            className={`relative grid min-h-[100svh] w-full grid-rows-[auto_1fr_auto] overflow-hidden ${category.bgColor} ${category.textColor} ${isPoshies ? `poshies-collection-panel poshies-collection-panel--${category.id}` : ""} px-6 py-12 sm:px-12 lg:px-20 lg:py-16`}
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
              {/* Oversized collection watermark is intentionally omitted from About. */}
              {category.id !== 'about' && (
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
              )}

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
                ) : null}
              </div>

              {/* Poshies editorial PNG cutouts sit over, and stay proportionate to, each collection wordmark. */}
              {isPoshies && category.id === 'hers' && (
                <img
                  src="https://thumbs.wbm.im/pw/medium/75c66ab7c75f8c5b32e5fa4550c8561f.png"
                  alt="Woman reclining in a bikini"
                  className="pointer-events-none absolute bottom-[1%] right-[5%] z-10 h-[30vh] max-h-[320px] w-auto max-w-[48vw] object-contain object-bottom drop-shadow-2xl sm:right-[12%] sm:h-[36vh]"
                  loading="lazy"
                  decoding="async"
                />
              )}
              {isPoshies && category.id === 'his' && (
                <img
                  src="https://images.rawpixel.com/image_png_social_portrait/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAyL2stczQ0LW5hbWUtMTM1Mzgtam9iMTUtbC1qb2IxNzE4LnBuZw.png"
                  alt="Male model wearing boxer briefs"
                  className="pointer-events-none absolute bottom-[1%] right-[5%] z-10 h-[30vh] max-h-[320px] w-auto max-w-[48vw] object-contain object-bottom drop-shadow-2xl sm:right-[12%] sm:h-[36vh]"
                  loading="lazy"
                  decoding="async"
                />
              )}

              {/* Image Overlay */}
              {category.hasImage && (
                <img
                  src={category.imageSrc || "/systems/storefront/shared/images/hisimage.webp"}
                  alt={`${category.title} collection`}
                  className="poshies-panel-image pointer-events-none absolute bottom-[15%] right-0 z-40 h-[35vh] w-auto object-contain object-right-bottom drop-shadow-2xl sm:bottom-[20%]"
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
            <div className={`w-full ${category.bgColor} ${isPoshies ? `poshies-collection-carousel poshies-collection-carousel--${category.id}` : ""}`}>
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
