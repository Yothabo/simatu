import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, FreeMode, Keyboard, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductModal from './ProductModal.tsx';
import ProductCardSkeleton from './ProductCardSkeleton.tsx';
import { getMockPoshiesProducts } from './mock-products.ts';
import { getCategoryTheme } from '../../core/configuration/categoryTheme';
import type { ProductCategory } from '../../core/hooks/useProducts.ts';

type CarouselProduct = {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  description?: string | null;
  image_url?: string | null;
};

type ProductCarouselProps = {
  title: string;
  sectionHeading?: string;
  description?: string;
  products: CarouselProduct[];
  placeholderColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  themeColor: string;
  isDark: boolean;
  isLoading?: boolean;
  error?: string | null;
  viewAllHref: string;
  useProductTheme?: boolean;
};

export default function ProductCarousel({
  title,
  sectionHeading,
  description,
  products,
  placeholderColor,
  bgColor,
  textColor,
  accentColor,
  themeColor,
  isDark,
  isLoading = false,
  error = null,
  viewAllHref,
  useProductTheme = false,
}: ProductCarouselProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<CarouselProduct | null>(null);

  const mockCategory = sectionHeading === 'His'
    ? 'His'
    : sectionHeading === 'Her'
      ? 'Hers'
      : sectionHeading === 'Lounge'
        ? 'Lounge'
        : undefined;
  const carouselProducts = products.length > 0
    ? products
    : !isLoading && mockCategory
      ? getMockPoshiesProducts(mockCategory)
      : [];
  const visibleProducts = carouselProducts.slice(0, 5);
  const isPoshiesMockCarousel = Boolean(mockCategory);

  const selectedTheme = selectedProduct && useProductTheme
    ? getCategoryTheme(selectedProduct.category)
    : null;
  const selectedPlaceholder = selectedTheme?.placeholderColor ?? placeholderColor;
  const selectedAccent = selectedTheme?.accentColor ?? accentColor;

  return (
    <section
      className="yotaabo-product-carousel relative w-full select-none pt-2 pb-12"
      style={{
        '--swiper-theme-color': themeColor,
        WebkitTapHighlightColor: 'transparent',
      } as CSSProperties}
      aria-label={`${title} product collection`}
    >
      <div className="px-6 sm:px-10 lg:px-12">
        <div className="flex items-baseline justify-between">
          <h3
            className={`font-heading text-3xl italic ${title === "Trending" ? "text-[#3a3a3a]" : accentColor}`}
            style={{ lineHeight: 0.9, margin: 0 }}
          >
            {sectionHeading ? (
              <>
                {sectionHeading}{' '}
                <span className="inline-block">Collection</span>
              </>
            ) : title}
          </h3>
        </div>
      </div>
      {description && (
        <p className="mt-2 px-6 font-heading text-base leading-relaxed text-black/60 sm:px-10 lg:px-12">
          {description}
        </p>
      )}

      {error && !visibleProducts.length && !isLoading && (
        <p role="status" className="sr-only">Product feed unavailable; showing placeholders.</p>
      )}
      <Swiper

          modules={[A11y, FreeMode, Keyboard, Navigation, Pagination]}
          className={`yotaabo-product-swiper mt-6 ${isPoshiesMockCarousel ? "poshies-product-swiper" : ""}`}
          slidesPerView={isPoshiesMockCarousel ? 1.25 : 2.15}
          slidesPerGroup={1}
          spaceBetween={isPoshiesMockCarousel ? 12 : 16}
          breakpoints={{
            640: {
              slidesPerView: isPoshiesMockCarousel ? 2.2 : 3.15,
              spaceBetween: isPoshiesMockCarousel ? 16 : 20,
            },
            1024: {
              slidesPerView: isPoshiesMockCarousel ? 3.2 : 4.15,
              spaceBetween: isPoshiesMockCarousel ? 20 : 24,
            },
          }}
          navigation={!isLoading && (visibleProducts.length > 2 || visibleProducts.length === 0)}
          pagination={
            !isLoading && (visibleProducts.length > 1 || visibleProducts.length === 0)
              ? { clickable: true }
              : false
          }
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          speed={480}
          freeMode={isPoshiesMockCarousel ? { enabled: true, sticky: true, momentum: true } : false}
          grabCursor
          watchOverflow
          loop={false}
          a11y={{
            prevSlideMessage: 'Previous products',
            nextSlideMessage: 'Next products',
          }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <SwiperSlide key={"skeleton-" + index}>
                  <ProductCardSkeleton />
                </SwiperSlide>
              ))
            : visibleProducts.length === 0
              ? Array.from({ length: 5 }).map((_, index) => (
                  <SwiperSlide key={"placeholder-" + index}>
                    <div aria-hidden="true" className="flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden bg-[#f4c8b8] px-4 text-center">
                      <div className={"mb-5 h-1 w-10 " + (index % 2 === 0 ? "bg-[#79634e]/35" : "bg-[#79634e]/20")} />
                      <span className="font-heading text-base italic text-[#79634e]/70">Coming soon</span>
                      <span className="mt-2 font-heading text-xs tracking-[0.16em] text-[#79634e]/45">POSHIES</span>
                    </div>
                  </SwiperSlide>
                ))
              : visibleProducts.map((product, index) => {
                const productTheme = getCategoryTheme(product.category);
                const cardPlaceholder = useProductTheme
                  ? productTheme.placeholderColor
                  : placeholderColor;
                const cardAccent = useProductTheme
                  ? productTheme.accentColor
                  : accentColor;

                return (
                  <SwiperSlide key={product.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      aria-label={`View ${product.name}`}
                      className="flex w-full cursor-pointer flex-col text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        userSelect: 'none',
                      }}
                    >
                      <div className={`aspect-[4/5] w-full overflow-hidden ${cardPlaceholder}`}>
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading={index < 2 ? 'eager' : 'lazy'}
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="mt-1 flex min-w-0 flex-col pt-3 pl-3">
                        <h4
                          className={`truncate font-heading text-base ${textColor}`}
                          style={{ lineHeight: '1', margin: 0, padding: 0 }}
                        >
                          {product.name}
                        </h4>

                        <p
                          className={`mt-1 font-heading text-base tracking-wide ${cardAccent}`}
                          style={{ lineHeight: '1', margin: 0, padding: 0 }}
                        >
                          {product.price}
                        </p>
                      </div>
                    </button>
                  </SwiperSlide>
                );
              })}

          {!isLoading && visibleProducts.length > 0 && (
            <SwiperSlide key="view-more">
              <Link
                to={viewAllHref}
                aria-label={`View more ${title} products`}
                className="flex aspect-[4/5] w-full items-center justify-center font-heading text-lg italic text-[#3a3a3a] outline-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                View more
              </Link>
            </SwiperSlide>
          )}
        </Swiper>

      <ProductModal
        product={
          selectedProduct
            ? {
                ...selectedProduct,
                placeholderColor: selectedPlaceholder,
              }
            : null
        }
        bgColor={bgColor}
        placeholderColor={selectedPlaceholder}
        accentColor={selectedAccent}
        isDark={isDark}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
