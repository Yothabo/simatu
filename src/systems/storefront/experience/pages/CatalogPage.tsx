import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProducts, type Product, type ProductCategory } from '../../core/hooks/useProducts';
import { formatPrice } from '../../../../shared/utilities/formatPrice';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Header from '../components/Header';
import ProductModal from '../components/ProductModal';
import { FiPlus, FiMinus } from 'react-icons/fi';
import useStorefront from '../../core/hooks/useStorefront';

function accentClasses(role: 'primary' | 'secondary' | 'tertiary') {
  if (role === 'secondary') {
    return { background: 'bg-[var(--sf-accent-secondary)]', text: 'text-[var(--sf-accent-secondary)]' };
  }
  if (role === 'tertiary') {
    return { background: 'bg-[var(--sf-accent-tertiary)]', text: 'text-[var(--sf-accent-tertiary)]' };
  }
  return { background: 'bg-[var(--sf-accent)]', text: 'text-[var(--sf-accent)]' };
}

export default function ViewCatalog() {
  const { categoryOrder, catalog, name: storeName } = useStorefront();
  const categoryConfigs = [...catalog.categories].sort(
    (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  );
  const categories = categoryConfigs.map((item) => item.category);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products: allProducts, isLoading } = useProducts();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestedCategory = queryParams.get('category');
  const marketplaceTerms = (queryParams.get('marketplaceTerms') || '')
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const visibleProducts = marketplaceTerms.length
    ? allProducts.filter((product) => {
        const searchable = [product.name, product.category, product.subcategory].filter(Boolean).join(' ').toLowerCase();
        return marketplaceTerms.some((term) => searchable.includes(term));
      })
    : allProducts;

  const initialCategoryConfig = categoryConfigs.find(
    (item) => item.category === requestedCategory || item.aliases?.includes(requestedCategory ?? '')
  );
  const validInitialCategory = initialCategoryConfig?.category ?? null;
  const [openCategory, setOpenCategory] = useState<ProductCategory | null>(validInitialCategory);
  const [mountedCategories, setMountedCategories] = useState<Set<string>>(
    () => new Set(validInitialCategory ? [validInitialCategory] : [])
  );

  const toggleCategory = (category: ProductCategory) => {
    const isOpening = openCategory !== category;
    setOpenCategory(openCategory === category ? null : category);
    if (isOpening) {
      setMountedCategories((previous) => new Set(previous).add(category));
      window.setTimeout(() => {
        categoryRefs.current[category]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  useEffect(() => {
    if (validInitialCategory && categoryRefs.current[validInitialCategory]) {
      window.setTimeout(() => {
        categoryRefs.current[validInitialCategory]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [validInitialCategory]);

  const newlyAddedProducts = [...visibleProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <>
      <Header sticky={true} showBack={true} />
      <main className="min-h-screen bg-[var(--sf-background)] text-[var(--sf-text)]">
        <section className="w-full bg-[var(--sf-background)] pt-12 pb-8">
          <div className="mx-auto max-w-[1120px] px-6 sm:px-10 lg:px-12">
            <h2 className="font-heading text-3xl italic text-[var(--sf-text)]">{catalog.newlyAddedTitle}</h2>
            <p className="mt-2 max-w-md font-heading text-base leading-relaxed text-[var(--sf-text-muted)]">
              {catalog.newlyAddedDescription.replace('{storeName}', storeName)}
            </p>
          </div>
          <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:px-10 lg:px-12">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex w-[45%] shrink-0 snap-start flex-col sm:w-[30%] lg:w-[22%]">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : newlyAddedProducts.map((product, index) => {
              const theme = categoryConfigs.find((item) => item.category === product.category);
              const accent = accentClasses(theme?.accentRole ?? 'primary');
              return (
                <button key={product.id} type="button" onClick={() => setSelectedProduct(product)}
                  className="flex w-[45%] shrink-0 snap-start cursor-pointer flex-col text-left sm:w-[30%] lg:w-[22%]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}>
                  <div className={`aspect-[4/5] w-full overflow-hidden ${accent.background}`}>
                    {product.image_url && <img src={product.image_url} alt={product.name}
                      loading={index < 2 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'}
                      decoding="async" className="h-full w-full object-contain p-4" />}
                  </div>
                  <div className="mt-1 flex flex-col pt-3 pl-3">
                    <h4 className="font-heading text-base text-[var(--sf-text)]" style={{ lineHeight: '1', margin: 0, padding: 0 }}>{product.name}</h4>
                    <p className={`mt-1 font-heading text-base tracking-wide ${accent.text}`} style={{ lineHeight: '1', margin: 0, padding: 0 }}>
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {categoryConfigs.map((categoryConfig) => {
          const category = categoryConfig.category;
          const items = visibleProducts.filter((product) => product.category === category);
          const subcategories = Array.from(new Set(items.map((item) => item.subcategory)));
          const isOpen = openCategory === category;
          const accent = accentClasses(categoryConfig.accentRole);

          return (
            <div key={category} ref={(element) => { categoryRefs.current[category] = element; }} className="scroll-mt-[76px]">
              <button type="button" onClick={() => toggleCategory(category)}
                className="group flex w-full flex-col border-0 bg-transparent px-6 py-8 text-left outline-none sm:px-10 lg:px-12">
                <div className="flex w-full items-center justify-between">
                  <h2 className="font-heading text-4xl italic text-[var(--sf-text)] sm:text-5xl">{categoryConfig.label}</h2>
                  <span className={`text-2xl text-[var(--sf-text-muted)] transition-transform duration-300 group-hover:${accent.text}`}>
                    {isOpen ? <FiMinus size={28} /> : <FiPlus size={28} />}
                  </span>
                </div>
                <p className="mt-2 font-heading text-base text-[var(--sf-text-muted)]">{categoryConfig.description}</p>
              </button>

              <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  {mountedCategories.has(category) && subcategories.map((subcategory) => {
                    const subItems = items.filter((item) => item.subcategory === subcategory);
                    return (
                      <div key={subcategory} className="mx-auto max-w-[1120px] px-6 pb-16 sm:px-10 lg:px-12">
                        <h3 className="mb-6 font-heading text-2xl italic text-[var(--sf-text-muted)]">{subcategory}</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                          {subItems.map((product) => (
                            <button key={product.id} type="button" onClick={() => setSelectedProduct(product)}
                              className="flex cursor-pointer flex-col text-left" style={{ WebkitTapHighlightColor: 'transparent' }}>
                              <div className={`aspect-[4/5] w-full overflow-hidden ${accent.background}`}>
                                {product.image_url && <img src={product.image_url} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-contain p-4" />}
                              </div>
                              <div className="mt-1 flex flex-col pt-3 pl-3">
                                <h4 className="font-heading text-base text-[var(--sf-text)]" style={{ lineHeight: '1', margin: 0, padding: 0 }}>{product.name}</h4>
                                <p className={`mt-1 font-heading text-base tracking-wide ${accent.text}`} style={{ lineHeight: '1', margin: 0, padding: 0 }}>{formatPrice(product.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <ProductModal
          product={selectedProduct ? { ...selectedProduct, price: formatPrice(selectedProduct.price) } : null}
          bgColor="bg-[var(--sf-surface)]"
          placeholderColor={selectedProduct ? accentClasses(categoryConfigs.find((item) => item.category === selectedProduct.category)?.accentRole ?? 'primary').background : 'bg-[var(--sf-surface-soft)]'}
          accentColor={selectedProduct ? accentClasses(categoryConfigs.find((item) => item.category === selectedProduct.category)?.accentRole ?? 'primary').text : 'text-[var(--sf-text)]'}
          isDark={false}
          onClose={() => setSelectedProduct(null)}
        />
      </main>
    </>
  );
}
