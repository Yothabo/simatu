import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../../core/context/CartContext.tsx';
import RippleButton from './RippleButton.tsx';
import useStorefront from '../../core/hooks/useStorefront.ts';
import ConfirmModal from '../../../../shared/components/ConfirmModal.tsx';
import SharedImage from '../../../../components/SharedImage';

type Product = {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  placeholderColor?: string;
  image_url?: string | null;
  storefront?: string;
  storeName?: string;
};

type ProductModalProps = {
  product: Product | null;
  bgColor: string;
  placeholderColor: string;
  accentColor: string;
  isDark: boolean;
  mode?: 'storefront' | 'cart' | 'preview';
  cartQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
  onRemoveFromCart?: () => void;
  onClose: () => void;
};

export default function ProductModal({
  product,
  placeholderColor,
  accentColor,
  mode = 'storefront',
  cartQuantity,
  onQuantityChange,
  onRemoveFromCart,
  onClose
}: ProductModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [initialCartQuantity, setInitialCartQuantity] = useState(1);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);

  const { cartItems, addToCart } = useCart();
  const { name: storeName, storeKey, primaryAccent } = useStorefront();
  const isYotaabo = storeName === 'Yotaabo';

  useEffect(() => {
    if (product) {
      setIsMounted(true);
      const startingQuantity = mode === 'cart' ? Math.max(1, cartQuantity ?? 1) : 1;
      setQuantity(startingQuantity);
      setInitialCartQuantity(startingQuantity);
      setShowDuplicateConfirm(false);
      requestAnimationFrame(() => {
        setTimeout(() => setIsOpen(true), 10);
      });
    } else {
      setIsOpen(false);
      const timer = setTimeout(() => setIsMounted(false), 400);
      return () => clearTimeout(timer);
    }
  }, [product, mode, cartQuantity]);

  // Lock body scroll without layout shift
  useEffect(() => {
    if (isMounted) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMounted]);

  if (!isMounted || !product) return null;

  const cartItemId = product.id;

  const handleQuantityChange = (nextQuantity: number) => {
    const safeQuantity = Math.max(1, nextQuantity);
    setQuantity(safeQuantity);

    if (mode === 'cart') {
      onQuantityChange?.(safeQuantity);
    }
  };

  const handleAddToCart = () => {
    if (mode === 'cart') {
      if (quantity !== initialCartQuantity) {
        onQuantityChange?.(quantity);
        setInitialCartQuantity(quantity);
        onClose();
      } else {
        onRemoveFromCart?.();
      }
      return;
    }
    const productStorefront = product.storefront || storeKey;
    const isAlreadyInCart = cartItems.some((item) => item.id === cartItemId && item.storefront === productStorefront);

    if (isAlreadyInCart) {
      setShowDuplicateConfirm(true);
    } else {
      performAddToCart();
    }
  };

  const performAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: cartItemId,
        name: product.name,
        price: product.price,
        placeholderColor: placeholderColor,
        image_url: product.image_url ?? null,
        category: 'General',
        storefront: product.storefront || storeKey,
        storeName: product.storeName || storeName,
      });
    }
    toast.success(`${quantity > 1 ? `${quantity}x ` : ''}${product.name} added to cart`);
    setShowDuplicateConfirm(false);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-white/40 backdrop-blur-sm transition-opacity duration-400 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-none bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-12 scale-90 opacity-0'
        }`}
        style={{ borderRadius: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute z-20 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/70 p-0 text-[#4d4d4d]/70 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md outline-none transition-all duration-200 hover:bg-white/90 hover:text-[#4d4d4d] active:scale-95"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            top: '1rem',
            right: '1rem',
          }}
        >
          <FiX size={20} aria-hidden="true" />
        </button>

        {/* 1. Full-bleed image with integrated gradient, title and price */}
        <div className={`relative aspect-[4/5] w-full overflow-hidden ${placeholderColor}`}>
          {mode === 'preview' ? (
            <div className="absolute inset-0 bg-[#f8d9ce]" />
          ) : product.image_url ? (
            <SharedImage
              src={product.image_url}
              alt={product.name}
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full"
            />
          ) : null}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-[58%] to-white"
          />
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 px-5 pb-5 pt-24">
            <span className={`min-w-0 text-2xl leading-tight text-black ${mode === "preview" ? "" : "font-heading"}`} style={mode === "preview" ? { fontFamily: "Antony, sans-serif" } : undefined}>
              {product.name}
            </span>
            <span className={`whitespace-nowrap text-base leading-[1.25] ${accentColor} ${mode === "preview" ? "opacity-50" : "font-heading"}`} style={mode === "preview" ? { fontFamily: "Montserrat, sans-serif" } : undefined}>
              {product.price}
            </span>
          </div>
        </div>

        {/* 3. Description */}
        <div className="px-5 pt-3">
          <p className={`text-sm leading-relaxed text-[#4d4d4d]/70 ${mode === "preview" ? "" : "font-heading"}`} style={mode === "preview" ? { fontFamily: "Montserrat, sans-serif" } : undefined}>
            {product.description || (isYotaabo
              ? `Experience the essence of ${product.name}. A carefully crafted fragrance designed to leave a lasting impression, blending premium notes for a sophisticated and memorable profile.`
              : 'A thoughtfully selected piece chosen for comfort, quality, and everyday confidence.')}
          </p>
        </div>

        {/* 4. Quantity & Actions */}
        <div className={`grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-3 px-5 py-5 ${mode === 'preview' ? 'opacity-45' : ''}`}>
          <div className="flex h-12 items-stretch border border-[#4d4d4d]/20">
            <RippleButton
              onClick={() => handleQuantityChange(quantity - 1)}
              className="flex h-12 w-10 items-center justify-center bg-[#f1f1ee] text-black/60 transition-colors hover:bg-[#e5e5e1] hover:text-black active:bg-[#dcdcd7]"
              ariaLabel="Decrease quantity"
              rippleColor={primaryAccent}
            >
              <FiMinus size={14} />
            </RippleButton>
            <span className="flex h-12 w-8 items-center justify-center text-center font-heading text-lg text-black">{quantity}</span>
            <RippleButton
              onClick={() => handleQuantityChange(quantity + 1)}
              className="flex h-12 w-10 items-center justify-center bg-[#f1f1ee] text-black/60 transition-colors hover:bg-[#e5e5e1] hover:text-black active:bg-[#dcdcd7]"
              ariaLabel="Increase quantity"
              rippleColor={primaryAccent}
            >
              <FiPlus size={14} />
            </RippleButton>
          </div>

          <button
            onClick={handleAddToCart}
            className="group flex h-12 flex-1 items-center justify-between border border-solid border-[#4d4d4d] bg-[#4d4d4d] px-5 text-xs font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-transparent hover:text-[#4d4d4d]"
          >
            <span>
              {mode === 'cart'
                ? quantity !== initialCartQuantity ? 'Save' : 'Remove from Cart'
                : 'Add to Cart'}
            </span>
            <span className="text-base transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              {mode === 'cart'
                ? quantity !== initialCartQuantity ? '✓' : <FiTrash2 size={16} />
                : '↗'}
            </span>
          </button>
        </div>
      </div>

      {/* Duplicate Warning Dialog */}
      <ConfirmModal
        isOpen={showDuplicateConfirm}
        title="Already in cart"
        message={`"${product.name}" is already in your cart. Continuing will increase its quantity.`}
        confirmText="Continue"
        cancelText="Cancel"
        variant="green"
        onConfirm={performAddToCart}
        onCancel={() => setShowDuplicateConfirm(false)}
      />
    </div>,
    document.body
  );
}
