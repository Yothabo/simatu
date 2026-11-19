import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import {
  getAdminProductAccentColor,
  getAdminProductPlaceholderColor,
} from '../../../features/admin/utils/adminProductCategoryTheme';
import type { PreviewProduct } from './OrderItems';

type OrderProductPreviewProps = {
  product: PreviewProduct | null;
  onClose: () => void;
};

export default function OrderProductPreview({ product, onClose }: OrderProductPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setIsMounted(true);
      requestAnimationFrame(() => setTimeout(() => setIsOpen(true), 10));
    } else {
      setIsOpen(false);
      const timer = setTimeout(() => setIsMounted(false), 400);
      return () => clearTimeout(timer);
    }
  }, [product]);

  useEffect(() => {
    if (isMounted) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isMounted]);

  if (!isMounted || !product || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div className={`absolute inset-0 bg-white/40 backdrop-blur-sm transition-opacity duration-400 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <div
        className={`relative w-full max-w-sm bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-90 opacity-0'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product preview"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0 text-[#4d4d4d]/50 outline-none transition-colors hover:text-[#4d4d4d]"
          style={{ WebkitAppearance: 'none', appearance: 'none', boxShadow: 'none' }}
        >
          <FiX size={20} aria-hidden="true" />
        </button>
        <div className={`aspect-square w-full overflow-hidden ${getAdminProductPlaceholderColor(product.category)}`}>
          {product.image_url && <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-6" />}
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-black/10 px-5 py-3">
          <span className="block truncate font-heading text-2xl italic leading-none text-black">{product.name}</span>
          <span className={`block font-heading text-xl leading-none ${getAdminProductAccentColor(product.category)}`}>R {Number(product.price).toFixed(2)}</span>
        </div>
        <div className="px-5 py-4">
          <p className="font-heading text-sm leading-relaxed text-[#4d4d4d]/70">{product.description || 'No product description available.'}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
