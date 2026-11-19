import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import RippleButton from './RippleButton';
import useStorefront from '../hooks/useStorefront';
import ConfirmModal from './ConfirmModal';

type Product = {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  placeholderColor?: string;
  image_url?: string | null;
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
  const { name: storeName, primaryAccent } = useStorefront();
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
    const isAlreadyInCart = cartItems.some((item) => item.id === cartItemId);

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
        className={`relative w-full max-w-sm bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-12 scale-90 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0 text-[#4d4d4d]/50 outline-none transition-colors hover:text-[#4d4d4d]"
          style={{ WebkitAppearance: 'none', appearance: 'none', boxShadow: 'none' }}
        >
          <FiX size={20} aria-hidden="true" />
        </button>

        {/* 1. Image */}
        <div className={`aspect-square w-full overflow-hidden ${placeholderColor}`}>
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain p-6"
            />
          )}
        </div>

        {/* 2. Title & Price Row */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-black/10 px-5 py-3">
          <div className="min-w-0">
            <span className="block truncate font-heading text-2xl italic leading-none text-black">
              {product.name}
            </span>
          </div>
          <div>
            <span className={`block font-heading text-xl leading-none ${accentColor}`}>
              {product.price}
            </span>
          </div>
        </div>

        {/* 3. Description */}
        <div className="px-5 pt-3">
          <p className="font-heading text-sm leading-relaxed text-[#4d4d4d]/70">
            {product.description || (isYotaabo
              ? `Experience the essence of ${product.name}. A carefully crafted fragrance designed to leave a lasting impression, blending premium notes for a sophisticated and memorable profile.`
              : 'A thoughtfully selected piece chosen for comfort, quality, and everyday confidence.')}
          </p>
        </div>

        {/* 4. Quantity & Actions */}
        {mode !== 'preview' && <div className="flex gap-3 px-5 py-5">
          <div className="flex items-center border border-[#4d4d4d]/20">
            <RippleButton
              onClick={() => handleQuantityChange(quantity - 1)}
              className="flex h-12 w-10 items-center justify-center bg-[#f1f1ee] text-black/60 transition-colors hover:bg-[#e5e5e1] hover:text-black active:bg-[#dcdcd7]"
              ariaLabel="Decrease quantity"
              rippleColor={primaryAccent}
            >
              <FiMinus size={14} />
            </RippleButton>
            <span className="w-8 text-center font-heading text-lg text-black">{quantity}</span>
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
        </div>}
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
