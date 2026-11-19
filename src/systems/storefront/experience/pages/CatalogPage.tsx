import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProducts, Product } from '../../core/hooks/useProducts';
import { formatPrice } from '../../../../shared/utilities/formatPrice';
import { getCategoryTheme } from '../../core/configuration/categoryTheme';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Header from '../components/Header';
import ProductModal from '../components/ProductModal';
import { FiPlus, FiMinus } from 'react-icons/fi';
import useStorefront from '../../core/hooks/useStorefront';

export default function ViewCatalog() {
  const { categoryOrder, name: storeName } = useStorefront();
  const categories = categoryOrder;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products: allProducts, isLoading } = useProducts();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestedCategory = queryParams.get('category');
  const initialCategory = (
    storeName === 'Poshies' && requestedCategory === 'Spaces'
      ? 'Lounge'
      : requestedCategory
  );
  const validInitialCategory = categoryOrder.find(
    (category) => category === initialCategory
  ) ?? null;

  const [openCategory, setOpenCategory] = useState<string | null>(
    validInitialCategory
  );
  const [mountedCategories, setMountedCategories] = useState<Set<string>>(
    () => new Set(validInitialCategory ? [validInitialCategory] : [])
  );

  const toggleCategory = (category: string) => {
    const isOpening = openCategory !== category;
    setOpenCategory(openCategory === category ? null : category);

    if (isOpening) {
      setMountedCategories((previous) => new Set(previous).add(category));
    }

    if (isOpening) {
      setTimeout(() => {
        categoryRefs.current[category]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  // Auto-scroll to the expanded category on initial load
  useEffect(() => {
    if (validInitialCategory && categoryRefs.current[validInitialCategory]) {
      setTimeout(() => {
        categoryRefs.current[validInitialCategory]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }
  }, [validInitialCategory]);

  const newlyAddedProducts = [...allProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const categoryOneLiners: Record<string, string> = storeName === 'Yotaabo'
    ? {
        His: 'Distinctive scents for the modern man.',
        Hers: 'Fragrances that celebrate elegance and individuality.',
        Spaces: 'Bring your signature scent into every room and ride.',
      }
    : {
        His: 'Everyday comfort. Underwear made for him.',
        Hers: 'Intimate essentials chosen for comfort and confidence.',
        Lounge: 'Sleepwear and relaxed essentials for winding down.',
      };

  return (
    <>
      <Header sticky={true} showBack={true} />
      <main className="min-h-screen bg-white">
        {/* ============= TRENDING SECTION ============= */}
        <section className="w-full bg-white pt-12 pb-8">
          <div className="mx-auto max-w-[1120px] px-6 sm:px-10 lg:px-12">
            <h2 className="font-heading text-3xl italic text-[#4d4d4d]">Newly Added</h2>
            <p className="mt-2 max-w-md font-heading text-base leading-relaxed text-[#4d4d4d]/60">
              The latest additions to the {storeName} collection.
            </p>
          </div>

          <div className="mt-8 flex gap-4 snap-x snap-mandatory overflow-x-auto px-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:px-10 lg:px-12">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex w-[45%] shrink-0 snap-start flex-col sm:w-[30%] lg:w-[22%]"
                >
                  <ProductCardSkeleton />
                </div>
              ))
            ) : (
              newlyAddedProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="flex w-[45%] shrink-0 snap-start flex-col cursor-pointer sm:w-[30%] lg:w-[22%]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className={`aspect-[4/5] w-full overflow-hidden ${getCategoryTheme(product.category).placeholderColor}`}>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        decoding="async"
                        className="h-full w-full object-contain p-4"
                      />
                    )}
                  </div>
                  <div className="mt-1 flex flex-col pt-3 pl-3">
                    <h4
                      className="font-heading text-base text-[#4d4d4d]"
                      style={{ lineHeight: '1', margin: 0, padding: 0 }}
                    >
                      {product.name}
                    </h4>
                    <p
                      className={`mt-1 font-heading text-base tracking-wide ${getCategoryTheme(product.category).accentColor}`}
                      style={{ lineHeight: '1', margin: 0, padding: 0 }}
                    >
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ============= CATEGORY ACCORDIONS ============= */}
        {categories.map((category) => {
          const items: Product[] = allProducts.filter((p) => p.category === category);
          const subcategories: string[] = Array.from(new Set(items.map((i) => i.subcategory)));
          const isOpen = openCategory === category;

          return (
            <div key={category} ref={(el) => { categoryRefs.current[category] = el; }} className="scroll-mt-[76px]">
              <button
                onClick={() => toggleCategory(category)}
                className="group flex w-full flex-col border-0 bg-transparent px-6 py-8 text-left outline-none sm:px-10 lg:px-12"
              >
                <div className="flex w-full items-center justify-between">
                  <h2 className="font-heading text-4xl italic text-[#4d4d4d] sm:text-5xl">
                    {category === 'Spaces' && storeName === 'Yotaabo' ? 'Spaces & Home' : category === 'His' && storeName !== 'Yotaabo' ? 'Him' : category === 'Hers' && storeName !== 'Yotaabo' ? 'Her' : category}
                  </h2>
                  <span className="text-2xl text-[#4d4d4d]/50 transition-transform duration-300 group-hover:text-[#4d4d4d]">
                    {isOpen ? <FiMinus size={28} /> : <FiPlus size={28} />}
                  </span>
                </div>
                <p className="mt-2 font-heading text-base text-[#4d4d4d]/60">
                  {categoryOneLiners[category]}
                </p>
              </button>

              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  {mountedCategories.has(category) && subcategories.map((sub) => {
                    const subItems: Product[] = items.filter((i) => i.subcategory === sub);
                    return (
                      <div key={sub} className="mx-auto max-w-[1120px] px-6 pb-16 sm:px-10 lg:px-12">
                        <h3 className="mb-6 font-heading text-2xl italic text-[#4d4d4d]/60">
                          {sub}
                        </h3>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                          {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                              <ProductCardSkeleton key={i} />
                            ))
                          ) : (
                            subItems.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className="flex cursor-pointer flex-col"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >
                                <div className={`aspect-[4/5] w-full overflow-hidden ${getCategoryTheme(product.category).placeholderColor}`}>
                                  {product.image_url && (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-contain p-4"
                                    />
                                  )}
                                </div>
                                <div className="mt-1 flex flex-col pt-3 pl-3">
                                  <h4
                                    className="font-heading text-base text-[#4d4d4d]"
                                    style={{ lineHeight: '1', margin: 0, padding: 0 }}
                                  >
                                    {product.name}
                                  </h4>
                                  <p
                                    className={`mt-1 font-heading text-base tracking-wide ${getCategoryTheme(product.category).accentColor}`}
                                    style={{ lineHeight: '1', margin: 0, padding: 0 }}
                                  >
                                    {formatPrice(product.price)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* ============= SHARED MODAL ============= */}
        <ProductModal
          product={selectedProduct ? { ...selectedProduct, price: formatPrice(selectedProduct.price) } : null}
          bgColor="bg-white"
          placeholderColor={selectedProduct ? getCategoryTheme(selectedProduct.category).placeholderColor : 'bg-gray-200'}
          accentColor={selectedProduct ? getCategoryTheme(selectedProduct.category).accentColor : 'text-[#4d4d4d]'}
          isDark={false}
          onClose={() => setSelectedProduct(null)}
        />
      </main>
    </>
  );
}
