import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useGlobalCart } from '../../../../shared/cart/CartContext';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { FaOpencart } from 'react-icons/fa';
import RippleButton from '../components/RippleButton';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../../shared/components/ConfirmModal';
import ProductModal from '../components/ProductModal';
import CheckoutModal from '../components/CheckoutModal';
import './MarketplaceCartPage.css';

export default function MarketplaceCartPage() {
  const location = useLocation();
  const isCheckoutView = location.pathname === '/checkout';
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useGlobalCart();
  const initialStorefronts = Array.from(new Set(cartItems.map((item) => item.storefront)));
  const [selectedStorefronts, setSelectedStorefronts] = useState<string[]>(initialStorefronts);
  const previousStorefrontsRef = useRef<string[]>(initialStorefronts);
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
    setSelectedStorefronts((current) => [
      ...current.filter((store) => availableStores.includes(store)),
      ...newlyAddedStores,
    ]);
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
      {cartItems.length > 0 && <header className="marketplace-cart__topbar"><Link to="/" className="marketplace-cart__back">← Discover</Link><Link to="/cart" className="marketplace-cart__toplink">Global cart</Link></header>}
      <main className="marketplace-cart">
        <div className="marketplace-cart__container">

          {cartItems.length > 0 && <header className="marketplace-cart__heading">
            <h1 className="marketplace-cart__title">{isCheckoutView ? 'Choose stores to checkout' : 'Your marketplace cart'}</h1>
            <p className="marketplace-cart__intro">Your products stay together here, grouped by the stores selling them. Select the stores you want to purchase from now.</p>
          </header>}

          {cartItems.length === 0 ? (
            <div className="marketplace-cart__empty">
              <h2 className="marketplace-cart__empty-title">
                Your cart is empty.
              </h2>

              <p className="marketplace-cart__empty-copy">
                Explore the Simatu marketplace to discover products across stores and add them to your global cart.
              </p>

              <Link
                to="/"
                className="marketplace-cart__button marketplace-cart__button--primary"
              >
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="marketplace-cart__groups">
              {storeGroups.map((group) => (
                <section key={group.storefront} className="marketplace-cart__store-group">
                  <label className="marketplace-cart__store-heading">
                    <input type="checkbox" checked={selectedStorefronts.includes(group.storefront)} onChange={(event) => setSelectedStorefronts((current) => event.target.checked ? [...current, group.storefront] : current.filter((store) => store !== group.storefront))} />
                    <strong>{group.storeName}</strong>
                    <span className="marketplace-cart__store-count">{group.items.length} {group.items.length === 1 ? 'product' : 'products'}</span>
                  </label>
                  {group.items.map((item) => (
                <div
                  key={item.id}
                  className={`marketplace-cart__item transition-all duration-300 ease-in-out ${
                    removingId === item.id
                      ? 'opacity-0 scale-95 translate-x-4 pointer-events-none'
                      : 'opacity-100 scale-100 translate-x-0'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(item)}
                    aria-label={`View ${item.name} details`}
                    className={`marketplace-cart__product-image ${item.placeholderColor}`}
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
                        className="marketplace-cart__product-name"
                        aria-label={`View ${item.name} details`}
                      >
                        {item.name}
                      </button>
                      <button
                        onClick={() => handleRemoveClick(item.id, item.name)}
                        aria-label="Remove item"
                        className="marketplace-cart__remove"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    <div className="marketplace-cart__product-meta">
                      <div className="flex items-center">
                        <div className="marketplace-cart__quantity">
                          <RippleButton
                            onClick={() => decreaseQuantity(item.id)}
                            className="marketplace-cart__quantity-button"
                            ariaLabel="Decrease quantity"
                            rippleColor="#c4471d"
                          >
                            <FiMinus size={16} />
                          </RippleButton>
                          <span className="marketplace-cart__quantity-value">
                            {item.quantity}
                          </span>
                          <RippleButton
                            onClick={() => increaseQuantity(item.id)}
                            className="marketplace-cart__quantity-button"
                            ariaLabel="Increase quantity"
                            rippleColor="#c4471d"
                          >
                            <FiPlus size={16} />
                          </RippleButton>
                        </div>
                      </div>

                      <span className="marketplace-cart__price">
                        {item.price}
                      </span>
                    </div>
                  </div>
                </div>
                  ))}
                </section>
              ))}

              <div className="marketplace-cart__summary">
                <div className="marketplace-cart__subtotal">
                  Selected checkout subtotal: <span className="font-medium">R {selectedCartTotal.toFixed(2)}</span>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/"
                    className="marketplace-cart__button marketplace-cart__button--secondary"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    disabled={selectedCartItems.length === 0}
                    className="marketplace-cart__button marketplace-cart__button--primary"
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
        accentColor="text-[var(--hp-color-primary)]"
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
