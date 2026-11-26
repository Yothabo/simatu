import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, FreeMode, Keyboard, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SharedImage from '../../../../components/SharedImage';
import ProductModal from './ProductModal.tsx';
import ProductCardSkeleton from './ProductCardSkeleton.tsx';
import type { ProductCategory } from '../../core/hooks/useProducts.ts';

type CarouselProduct = {
  id: string; name: string; price: string; category: ProductCategory;
  description?: string | null; image_url?: string | null;
};
type ProductCarouselProps = {
  title: string; sectionHeading?: string; description?: string; products: CarouselProduct[];
  mockProducts?: CarouselProduct[]; presentation?: 'standard' | 'editorial'; emptyStateLabel: string;
  placeholderColor: string; bgColor: string; textColor: string; accentColor: string;
  themeColor: string; isDark: boolean; isLoading?: boolean; error?: string | null;
  viewAllHref: string;
};

export default function ProductCarousel({
  title, sectionHeading, description, products, mockProducts = [], presentation = 'standard',
  emptyStateLabel, placeholderColor, bgColor, textColor, accentColor, themeColor, isDark,
  isLoading = false, error = null, viewAllHref,
}: ProductCarouselProps) {
  const [selectedProduct, setSelectedProduct] = useState<CarouselProduct | null>(null);
  const editorial = presentation === 'editorial';
  const carouselProducts = products.length ? products : (!isLoading ? mockProducts : []);
  const visibleProducts = carouselProducts.slice(0, 5);

  return (
    <section className="storefront-product-carousel relative w-full select-none pt-[var(--sf-space-2)] pb-[var(--sf-space-12)]"
      style={{ '--swiper-theme-color': themeColor, WebkitTapHighlightColor: 'transparent' } as CSSProperties}
      aria-label={`${title} product collection`}>
      <div className="px-[var(--sf-space-6)] sm:px-[var(--sf-space-10)] lg:px-[var(--sf-space-12)]">
        <div className="flex items-baseline justify-between">
          <h3 className={`font-heading text-3xl italic ${textColor}`}
            style={{ lineHeight: 0.9, margin: 0 }}>
            {sectionHeading ? <>{sectionHeading}{' '}<span className="inline-block">Collection</span></> : title}
          </h3>
        </div>
      </div>
      {description && <p className={`mt-[var(--sf-space-2)] px-6 font-heading text-base leading-relaxed sm:px-10 lg:px-12 ${editorial ? 'text-[var(--sf-inverse-text-muted)]' : 'text-[var(--sf-text-muted)]'}`}>{description}</p>}
      {error && !visibleProducts.length && !isLoading && <p role="status" className="sr-only">Product feed unavailable; showing placeholders.</p>}
      <Swiper modules={[A11y, FreeMode, Keyboard, Navigation, Pagination]}
        className={`storefront-product-swiper mt-[var(--sf-space-6)] ${editorial ? 'storefront-product-swiper--editorial' : ''}`}
        slidesPerView={editorial ? 1.25 : 2.15} slidesPerGroup={1} spaceBetween={editorial ? 12 : 16}
        breakpoints={{
          640: { slidesPerView: editorial ? 2.2 : 3.15, spaceBetween: editorial ? 16 : 20 },
          1024: { slidesPerView: editorial ? 3.2 : 4.15, spaceBetween: editorial ? 20 : 24 },
        }}
        navigation={!isLoading && (visibleProducts.length > 2 || visibleProducts.length === 0)}
        pagination={!isLoading && (visibleProducts.length > 1 || visibleProducts.length === 0) ? { clickable: true } : false}
        keyboard={{ enabled: true, onlyInViewport: true }} speed={480}
        freeMode={editorial ? { enabled: true, sticky: true, momentum: true } : false}
        grabCursor watchOverflow loop={false}
        a11y={{ prevSlideMessage: 'Previous products', nextSlideMessage: 'Next products' }}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => <SwiperSlide key={`skeleton-${index}`}><ProductCardSkeleton /></SwiperSlide>)
          : visibleProducts.length === 0
            ? Array.from({ length: 5 }).map((_, index) => <SwiperSlide key={`placeholder-${index}`}>
                <div aria-hidden="true" className="flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden bg-[var(--sf-accent)] px-4 text-center">
                  <div className="mb-5 h-1 w-10 bg-[var(--sf-accent-contrast)]/50" />
                  <span className="font-heading text-base italic text-[var(--sf-accent-contrast)]">Coming soon</span>
                  <span className="mt-[var(--sf-space-2)] font-heading text-xs tracking-[0.16em] text-[var(--sf-accent-contrast)]/75">{emptyStateLabel.toUpperCase()}</span>
                </div>
              </SwiperSlide>)
            : visibleProducts.map((product, index) => {
                const isMock = product.id.startsWith('mock-');
                return <SwiperSlide key={product.id}>
                  <button type="button" onClick={() => setSelectedProduct(product)} aria-label={`View ${product.name}`}
                    className="flex w-full cursor-pointer flex-col text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
                    style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}>
                    <div className={`relative aspect-[4/5] w-full overflow-hidden ${editorial ? 'bg-[var(--sf-accent)]' : placeholderColor}`}>
                      {isMock ? <div className="h-full w-full bg-transparent" aria-label="Preview placeholder" /> : product.image_url
                        ? <SharedImage src={product.image_url} alt={product.name} loading={index < 2 ? 'eager' : 'lazy'}
                            fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"
                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            className="h-full w-full object-contain" />
                        : null}
                    </div>
                    <div className={`relative mt-0 grid min-w-0 grid-rows-[20px_20px] gap-y-3 pt-3 pl-3 ${bgColor}`}>
                      <h4 className={`min-w-0 truncate font-heading text-base ${textColor}`} style={{ lineHeight: '20px', margin: 0, padding: 0 }}>{product.name}</h4>
                      <p className={`font-heading text-base tracking-normal uppercase ${editorial ? 'text-[var(--sf-accent)]' : accentColor}`} style={{ lineHeight: '20px', margin: 0, padding: 0 }}>{product.price}</p>
                    </div>
                  </button>
                </SwiperSlide>;
              })}
        {!isLoading && visibleProducts.length > 0 && <SwiperSlide key="view-more">
          <Link to={viewAllHref} aria-label={`View more ${title} products`}
            className="flex aspect-[4/5] w-full items-center justify-center font-heading text-lg italic text-[var(--sf-accent-contrast)] outline-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4">View more</Link>
        </SwiperSlide>}
      </Swiper>
      <ProductModal product={selectedProduct ? { ...selectedProduct, placeholderColor } : null}
        bgColor={bgColor} mode={selectedProduct?.id.startsWith('mock-') ? 'preview' : 'storefront'}
        placeholderColor={placeholderColor} accentColor={accentColor} isDark={isDark}
        onClose={() => setSelectedProduct(null)} />
    </section>
  );
}
