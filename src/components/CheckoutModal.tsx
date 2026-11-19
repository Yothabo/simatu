import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import ProductModal from './ProductModal';
import useStorefront from '../hooks/useStorefront';
import type { CartItem } from '../context/CartContext';
import CheckoutCartSummary from './checkout/CheckoutCartSummary';
import CheckoutCustomerForm from './checkout/CheckoutCustomerForm';
import CheckoutSuccess from './checkout/CheckoutSuccess';
import CheckoutErrorModal from './checkout/CheckoutErrorModal';
import {
  getReceiptFileName,
  getReceiptText,
} from './checkout/checkoutReceipt';
import type { CreatedOrder } from './checkout/types';

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartTotal: number;
  onSuccess: () => void;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  cartTotal,
  onSuccess,
}: CheckoutModalProps) {
  const { name, primaryAccent, pathFor } = useStorefront();
  const navigate = useNavigate();
  const pendingOrderStorageKey = `${name.toLowerCase()}-pending-order`;
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CartItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(() => {
    try {
      if (typeof window === 'undefined') return null;

      const savedOrder = window.localStorage.getItem(pendingOrderStorageKey);
      if (!savedOrder) return null;

      const parsedOrder = JSON.parse(savedOrder) as CreatedOrder;
      if (!parsedOrder.order_number || !Array.isArray(parsedOrder.items)) {
        window.localStorage.removeItem(pendingOrderStorageKey);
        return null;
      }

      return { ...parsedOrder, orderedAt: new Date(parsedOrder.orderedAt) };
    } catch {
      return null;
    }
  });
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
  });

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    if (value.trim()) {
      setErrors((current) => ({ ...current, fullName: '' }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);

    if (value && isValidPhoneNumber(value)) {
      setErrors((current) => ({ ...current, phoneNumber: '' }));
    }
  };

  const handleContinue = () => {
    const nextErrors = {
      fullName: fullName.trim() ? '' : 'Please enter your full name.',
      phoneNumber: phoneNumber && isValidPhoneNumber(phoneNumber)
        ? ''
        : 'Please enter a valid WhatsApp number.',
    };

    setErrors(nextErrors);

    if (!nextErrors.fullName && !nextErrors.phoneNumber) {
      setShowConfirmation(true);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      setErrors((current) => ({
        ...current,
        phoneNumber: 'Please enter a valid WhatsApp number.',
      }));
      setShowConfirmation(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const orderSnapshot = cartItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.price.replace(/[^0-9.]/g, '')),
    }));
    const orderedAt = new Date();

    try {
      const phone = phoneNumber.replace(/\D/g, '');

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: fullName.trim(),
          customer_phone: phone,
          storefront: name.toLowerCase(),
          items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const responseText = await response.text();
      let data: {
        error?: string;
        order?: { order_number: string; subtotal: number };
      } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          // Handle empty or non-JSON server responses below.
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || 'We could not submit your order. Please try again.'
        );
      }

      if (!data.order) {
        throw new Error(
          'We could not confirm your order. Please try again in a moment.'
        );
      }

      const completedOrder: CreatedOrder = {
        ...data.order,
        customerName: fullName.trim(),
        customerPhone: phone,
        orderedAt,
        items: orderSnapshot,
      };

      try {
        window.localStorage.setItem(
          pendingOrderStorageKey,
          JSON.stringify(completedOrder)
        );
      } catch {
        // Keep the in-memory confirmation if browser storage is unavailable.
      }

      setCreatedOrder(completedOrder);
      setShowConfirmation(false);
      onSuccess();
    } catch (error) {
      setShowConfirmation(false);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to submit your order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReceiptTextForOrder = () => getReceiptText(name, createdOrder);

  const createReceiptPdfForOrder = async () => {
    if (!createdOrder) return null;

    const { createReceiptPdf } = await import('./checkout/checkoutReceiptPdf');
    return createReceiptPdf(name, primaryAccent, createdOrder);
  };

  const getReceiptFileNameForOrder = () =>
    getReceiptFileName(name, createdOrder);

  const downloadReceipt = async () => {
    if (!createdOrder) return;

    try {
      const pdf = await createReceiptPdfForOrder();
      if (!pdf) return;

      pdf.save(getReceiptFileNameForOrder());
      handleContinueShopping();
    } catch (error) {
      console.error('Unable to generate order receipt PDF:', error);
    }
  };

  const shareReceipt = async () => {
    if (!createdOrder) return;

    const receiptText = getReceiptTextForOrder();
    const pdf = await createReceiptPdfForOrder().catch((error: unknown) => {
      console.error('Unable to generate order receipt PDF:', error);
      return null;
    });
    const file = pdf
      ? new File(
          [pdf.output('blob')],
          getReceiptFileNameForOrder(),
          { type: 'application/pdf' }
        )
      : null;

    try {
      if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${name} order confirmation`,
          text: `Order ${createdOrder.order_number}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `${name} order confirmation`,
          text: receiptText,
        });
      } else {
        await navigator.clipboard.writeText(receiptText);
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        await navigator.clipboard.writeText(receiptText);
      }
    } finally {
      handleContinueShopping();
    }
  };

  const handleContinueShopping = () => {
    try {
      window.localStorage.removeItem(pendingOrderStorageKey);
    } catch {
      // Continue navigation even if browser storage is unavailable.
    }

    setCreatedOrder(null);
    onClose();
    navigate(pathFor(''));
  };

  return (
    <>
      <Modal isOpen={isOpen || !!createdOrder} onClose={onClose} maxWidth="max-w-lg">
        <div className="p-6 sm:p-8">
          {createdOrder ? (
            <CheckoutSuccess
              createdOrder={createdOrder}
              primaryAccent={primaryAccent}
              onDownload={downloadReceipt}
              onShare={shareReceipt}
            />
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#4d4d4d]">
                Checkout
              </h2>

              <CheckoutCartSummary
                cartItems={cartItems}
                cartTotal={cartTotal}
                onSelectProduct={setSelectedProduct}
              />

              <CheckoutCustomerForm
                fullName={fullName}
                phoneNumber={phoneNumber}
                errors={errors}
                onFullNameChange={handleFullNameChange}
                onPhoneNumberChange={handlePhoneNumberChange}
              />

              <div className="mt-7 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 flex-1 items-center justify-center bg-[#f5f5f5] font-heading text-base text-[#4d4d4d] transition-colors hover:bg-[#e5e5e5]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex h-12 flex-1 items-center justify-center border border-[#4d4d4d] bg-[#4d4d4d] font-heading text-base text-white transition-colors hover:bg-[#3b3b3b]"
                >
                  Continue
                </button>
              </div>
            </>
          )}
        </div>

        <ConfirmModal
          isOpen={showConfirmation && !createdOrder}
          title="Confirm your order"
          message={`Submit your order for R ${cartTotal.toFixed(2)}? We'll contact you on WhatsApp to arrange payment and delivery.`}
          confirmText="Submit"
          cancelText="Back"
          variant="grey"
          isLoading={isSubmitting}
          onConfirm={handleSubmit}
          onCancel={() => {
            if (!isSubmitting) setShowConfirmation(false);
          }}
        />
      </Modal>

      <CheckoutErrorModal
        submitError={submitError}
        onClose={() => setSubmitError('')}
      />

      <ProductModal
        product={selectedProduct}
        bgColor="bg-white"
        placeholderColor={selectedProduct?.placeholderColor ?? ''}
        accentColor={primaryAccent === "#ff1493" ? "text-[#ff1493]" : "text-[#8aa89b]"}
        isDark={false}
        mode="preview"
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
