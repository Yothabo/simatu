import ProductCarousel from './ProductCarousel';
import useStorefront from '../../core/hooks/useStorefront.ts';
import { useProducts, getCategoryProducts } from '../../core/hooks/useProducts.ts';
import { getMockProducts } from '../utils/mock-products.ts';

export default function Services() {
  const { products, isLoading, error } = useProducts();
  const { collections, categoryOrder, pathFor, name: storeName, collectionsClassName } = useStorefront();
  const orderedCollections = [...collections].sort((a, b) => {
    const ai = a.productCategory ? categoryOrder.indexOf(a.productCategory) : Number.MAX_SAFE_INTEGER;
    const bi = b.productCategory ? categoryOrder.indexOf(b.productCategory) : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });

  return (
    <section id="services" className={`storefront-collections w-full ${collectionsClassName ?? ""}`}>
      {orderedCollections.map((collection) => {
        const inverse = collection.textTone === 'inverse';
        const accentClass = collection.accentRole === 'secondary'
          ? 'text-[var(--sf-accent-secondary)]'
          : collection.accentRole === 'tertiary' ? 'text-[var(--sf-accent-tertiary)]' : 'text-[var(--sf-accent)]';
        const accentBackgroundClass = collection.accentRole === 'secondary'
          ? 'bg-[var(--sf-accent-secondary)]'
          : collection.accentRole === 'tertiary' ? 'bg-[var(--sf-accent-tertiary)]' : 'bg-[var(--sf-accent)]';
        const accentToken = collection.accentRole === 'secondary'
          ? 'var(--sf-accent-secondary)'
          : collection.accentRole === 'tertiary' ? 'var(--sf-accent-tertiary)' : 'var(--sf-accent)';
        const collectionProducts = collection.productCategory
          ? getCategoryProducts(products, collection.productCategory, 5).map((product) => ({
              ...product,
              price: `R ${Number(product.price).toFixed(2)}`,
            }))
          : [];
        const mockProducts = collection.mockProductCategory && !isLoading && collectionProducts.length === 0
          ? getMockProducts(collection.mockProductCategory)
          : [];

        return (
          <div key={collection.id} id={collection.id} className={`flex w-full flex-col ${collection.variantClassName ? `storefront-collection-section storefront-collection-section--${collection.variantClassName}` : ''}`}>
            <div className={`relative grid min-h-[100svh] w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-[var(--sf-background)] px-6 py-12 sm:px-12 lg:px-20 lg:py-16 ${inverse ? 'text-[var(--sf-inverse-text)]' : 'text-[var(--sf-text)]'} ${collection.variantClassName ? `storefront-collection-panel storefront-collection-panel--${collection.variantClassName}` : ''}`}>
              {collection.eyebrow && <div className="relative z-20 flex h-8 w-full items-center justify-center text-center sm:h-auto"><h2 className="whitespace-nowrap font-heading text-sm font-medium uppercase tracking-[0.2em] sm:text-2xl">{collection.eyebrow}</h2></div>}
              <div className="relative flex h-full w-full items-center justify-center">
                {collection.hasWatermark && <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center" style={{ height: '45vh', margin: 'auto' }}>
                  <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
                    <text x="50" y="50%" dominantBaseline="middle" textAnchor="middle" textLength="100" lengthAdjust="spacingAndGlyphs" style={{ fontFamily: 'var(--sf-font-display)', fontWeight: 400, fill: accentToken }} fontSize="100">{collection.title}</text>
                  </svg>
                </div>}
                {collection.decorativeWordmark && <div className="pointer-events-none absolute bottom-20 inset-x-0 z-20 w-full min-w-0 sm:bottom-32"><span className="whitespace-nowrap font-accent text-[clamp(80px,12vw,160px)] font-normal leading-[0.7] tracking-normal text-[var(--sf-text)]">{storeName.toLowerCase()}</span></div>}
                {collection.imageSrc && <img src={collection.imageSrc} alt={`${collection.title} collection`} className="storefront-collection-image pointer-events-none absolute bottom-[15%] right-0 z-40 h-[35vh] w-auto object-contain object-right-bottom drop-shadow-2xl sm:bottom-[20%]" />}
              </div>
              <div className="relative z-20 flex w-full pt-4"><div className="max-w-[420px]"><p className="font-heading text-lg leading-[1.6]">{collection.description}</p></div></div>
            </div>
            {collection.productCategory && collection.collectionTitle && <div className={`w-full bg-[var(--sf-background)] ${collection.variantClassName ? `storefront-collection-carousel storefront-collection-carousel--${collection.variantClassName}` : ''}`}>
              <ProductCarousel
                title={collection.collectionTitle}
                sectionHeading={collection.collectionHeading}
                products={collectionProducts}
                mockProducts={mockProducts}
                presentation={collection.carouselVariant ?? 'standard'}
                emptyStateLabel={storeName}
                placeholderColor={accentBackgroundClass}
                bgColor="bg-[var(--sf-surface)]"
                textColor={inverse ? 'text-[var(--sf-inverse-text)]' : 'text-[var(--sf-text)]'}
                accentColor={accentClass}
                themeColor={accentToken}
                isDark={collection.isDark ?? false}
                isLoading={isLoading}
                error={error}
                viewAllHref={pathFor(`catalog?category=${collection.productCategory}`)}
              />
            </div>}
          </div>
        );
      })}
    </section>
  );
}
