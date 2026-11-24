import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../../core/context/CartContext';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { FaOpencart } from 'react-icons/fa';
import RippleButton from '../components/RippleButton';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../../shared/components/ConfirmModal';
import ProductModal from '../components/ProductModal';
import CheckoutModal from '../components/CheckoutModal';
import useStorefront from '../../core/hooks/useStorefront';

export default function CartPage() {
  const { primaryAccent } = useStorefront();
  const location = useLocation();
  const isCheckoutView = location.pathname === '/checkout';
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const [selectedStorefronts, setSelectedStorefronts] = useState<string[]>([]);
  const previousStorefrontsRef = useRef<string[]>([]);
  const initializedStoreSelectionRef = useRef(false);
  const storeGroups = Array.from(new Map(cartItems.map((item) => [item.storefront, {
    storefront: item.storefront,
    storeName: item.storeName,
    items: cartItems.filter((candidate) => candidate.storefront === item.storefront),
  }] as const)).values());
  const selectedCartItems = cartItems.filter((item) => selectedStorefronts.includes(item.storefront));
  const selectedCartTotal = selectedCartItems.reduce((total, item) => total + Number(item.price.replace(/[^0-9.]/g, '')) * item.quantity, 0);

  useEffect(() => {
    const availableStores = Array.from(new Set(cartItems.map((item) => item.storefront)));
    const newlyAddedStores = availableStores.filter((store) => !previousStorefrontsRef.current.includes(store));
    const isFirstSelection = !initializedStoreSelectionRef.current;
    initializedStoreSelectionRef.current = true;
    setSelectedStorefronts((current) => isFirstSelection
      ? availableStores
      : [...current.filter((store) => availableStores.includes(store)), ...newlyAddedStores]);
    previousStorefrontsRef.current = availableStores;
  }, [cartItems]);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof cartItems[number] | null>(null);

  const handleRemoveClick = (id: string, name: string) => {
    setItemToDelete({ id, name });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const { id, name } = itemToDelete;
    setItemToDelete(null);
    setSelectedProduct(null);
    setRemovingId(id);

    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
      toast.error(`${name} removed from cart`, {
        style: { background: '#4d4d4d', color: '#fff', borderRadius: 0 },
        iconTheme: { primary: '#fff', secondary: '#4d4d4d' },
      });
    }, 300);
  };

  return (
    <>
      <Header sticky={true} showBack={true} />
      <main className="flex min-h-screen flex-col bg-white px-6 pt-0 pb-12 sm:px-10 lg:px-12 lg:pt-0 lg:pb-20">
        <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col">

          {cartItems.length > 0 && <header className="mb-8 mt-8">
            <h1 className="font-heading text-3xl italic text-[#4d4d4d]">{isCheckoutView ? 'Choose stores to checkout' : 'Your shared cart'}</h1>
            <p className="mt-2 max-w-xl font-heading text-sm leading-relaxed text-[#696964]">Your products stay together here, grouped by the stores selling them. Select the stores you want to purchase from now.</p>
          </header>}

          {cartItems.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center text-center">
              {/* Cart Icon */}
              <FaOpencart size={64} className={primaryAccent === "#ff1493" ? "text-[#ff1493]" : "text-[#8aa89b]"} />

              {/* Heading */}
              <h2 className="mt-8 font-heading text-3xl italic text-black">
                Your cart is empty.
              </h2>

              {/* Paragraph */}
              <p className="mt-3 max-w-sm font-heading text-base leading-relaxed text-[#696964]">
                Explore the Simatu marketplace to discover products from multiple stores and add them to your shared cart.
              </p>

              {/* CTA */}
              <Link
                to="/"
                className={`mt-8 inline-flex min-h-12 items-center justify-center border border-solid px-8 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-transparent ${primaryAccent === "#ff1493" ? "border-[#ff1493] bg-[#ff1493] hover:text-[#ff1493]" : "border-[#8aa89b] bg-[#8aa89b] hover:text-[#8aa89b]"}` }
              >
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-2">
              {storeGroups.map((group) => (
                <section key={group.storefront} className="mb-5">
                  <label className="mb-3 flex items-center gap-3 border-b border-black/10 pb-3 text-sm text-[#4d4d4d]">
                    <input type="checkbox" checked={selectedStorefronts.includes(group.storefront)} onChange={(event) => setSelectedStorefronts((current) => event.target.checked ? [...current, group.storefront] : current.filter((store) => store !== group.storefront))} />
                    <strong>{group.storeName}</strong>
                    <span className="text-xs text-[#4d4d4d]/55">{group.items.length} {group.items.length === 1 ? 'product' : 'products'}</span>
                  </label>
                  {group.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-6 bg-[#fafaf9] pr-3 transition-all duration-300 ease-in-out ${
                    removingId === item.id
                      ? 'opacity-0 scale-95 translate-x-4 pointer-events-none'
                      : 'opacity-100 scale-100 translate-x-0'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(item)}
                    aria-label={`View ${item.name} details`}
                    className={`h-24 w-24 shrink-0 overflow-hidden ${item.placeholderColor} cursor-pointer`}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-2"
                      />
                    )}
                  </button>

                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex w-full items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(item)}
                        className="truncate text-left font-heading text-base text-[#4d4d4d]"
                        aria-label={`View ${item.name} details`}
                      >
                        {item.name}
                      </button>
                      <button
                        onClick={() => handleRemoveClick(item.id, item.name)}
                        aria-label="Remove item"
                        className="shrink-0 flex h-8 w-8 items-center justify-center text-black/30 transition-colors hover:text-red-500"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div className="flex items-center">
                        <div className="flex items-center border border-black/10">
                          <RippleButton
                            onClick={() => decreaseQuantity(item.id)}
                            className="flex h-8 w-8 items-center justify-center bg-[#f1f1ee] text-black/60 transition-colors hover:bg-[#e5e5e1] hover:text-black active:bg-[#dcdcd7]"
                            ariaLabel="Decrease quantity"
                            rippleColor={primaryAccent}
                          >
                            <FiMinus size={16} />
                          </RippleButton>
                          <span className="min-w-[1.75rem] text-center font-heading text-base text-[#4d4d4d]">
                            {item.quantity}
                          </span>
                          <RippleButton
                            onClick={() => increaseQuantity(item.id)}
                            className="flex h-8 w-8 items-center justify-center bg-[#f1f1ee] text-black/60 transition-colors hover:bg-[#e5e5e1] hover:text-black active:bg-[#dcdcd7]"
                            ariaLabel="Increase quantity"
                            rippleColor={primaryAccent}
                          >
                            <FiPlus size={16} />
                          </RippleButton>
                        </div>
                      </div>

                      <span className="shrink-0 text-right font-heading text-base text-[#4d4d4d]/60 tabular-nums">
                        {item.price}
                      </span>
                    </div>
                  </div>
                </div>
                  ))}
                </section>
              ))}

              <div className="sticky bottom-0 mt-6 flex flex-col items-end gap-4 border-t border-black/10 bg-white pt-4 pb-6">
                <div className="font-heading text-xl text-black">
                  Selected checkout subtotal: <span className="font-medium">R {selectedCartTotal.toFixed(2)}</span>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/"
                    className="inline-flex min-h-12 items-center justify-center bg-[#f1f1ee] px-8 text-xs font-semibold tracking-wide text-black/60 transition-colors hover:bg-[#e5e5e1] hover:text-black active:bg-[#dcdcd7]"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    disabled={selectedCartItems.length === 0}
                    className={`inline-flex disabled:cursor-not-allowed disabled:opacity-40 min-h-12 items-center justify-center border border-solid px-8 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-transparent ${primaryAccent === "#ff1493" ? "border-[#ff1493] bg-[#ff1493] hover:text-[#ff1493]" : "border-[#8aa89b] bg-[#8aa89b] hover:text-[#8aa89b]"}` }
                  >
                    {isCheckoutView ? 'Continue to checkout' : 'Checkout selected stores'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ProductModal
        product={selectedProduct}
        bgColor="bg-white"
        placeholderColor={selectedProduct?.placeholderColor ?? ''}
        accentColor={primaryAccent === "#ff1493" ? "text-[#ff1493]" : "text-[#8aa89b]"}
        isDark={false}
        mode="cart"
        cartQuantity={selectedProduct?.quantity ?? 1}
        onQuantityChange={(nextQuantity) => {
          if (!selectedProduct) return;
          const currentItem = cartItems.find((item) => item.id === selectedProduct.id);
          if (!currentItem) return;

          const difference = nextQuantity - currentItem.quantity;
          if (difference > 0) {
            for (let i = 0; i < difference; i++) increaseQuantity(selectedProduct.id);
          } else if (difference < 0) {
            for (let i = 0; i < Math.abs(difference); i++) decreaseQuantity(selectedProduct.id);
          }
        }}
        onRemoveFromCart={() => {
          if (!selectedProduct) return;
          setItemToDelete({
            id: selectedProduct.id,
            name: selectedProduct.name,
          });
        }}
        onClose={() => setSelectedProduct(null)}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Remove from cart?"
        message={itemToDelete ? `Are you sure you want to remove "${itemToDelete.name}" from your cart? This action cannot be undone.` : ''}
        confirmText="Remove"
        cancelText="Keep it"
        variant="green"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={selectedCartItems}
        cartTotal={selectedCartTotal}
        onSuccess={() => selectedCartItems.forEach((item) => removeFromCart(item.id))}
      />
    </>
  );
}
