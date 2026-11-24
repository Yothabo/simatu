import type { CreatedOrder } from './types';

type CheckoutSuccessProps = {
  createdOrder: CreatedOrder;
  primaryAccent: string;
  onDownload: () => void;
  onShare: () => void;
};

export default function CheckoutSuccess({
  createdOrder,
  primaryAccent,
  onDownload,
  onShare,
}: CheckoutSuccessProps) {
  return (
    <div className="py-5 text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${primaryAccent}20`, color: primaryAccent }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="mt-6 font-heading text-2xl font-semibold text-[#4d4d4d]">
        Order placed successfully.
      </h2>

      <p className="mx-auto mt-3 max-w-sm font-heading text-sm leading-6 text-[#4d4d4d]/65">
        Thank you for choosing us. We'll contact you on WhatsApp to arrange payment and delivery.
      </p>

      <p className="mx-auto mt-3 max-w-sm font-heading text-sm leading-6 text-[#4d4d4d]/65">
        We recommend saving or sharing your confirmation receipt for future reference.
      </p>

      <div className="mx-auto mt-7 max-w-xs border-y border-[#4d4d4d]/10 py-5">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4d4d4d]/45">
          Order reference
        </p>
        {createdOrder.storeOrders?.length ? (
          <div className="mt-2 space-y-2">
            {createdOrder.storeOrders.map((order) => (
              <div key={order.order_number} className="flex items-center justify-between gap-3 text-left">
                <span className="font-heading text-sm text-[#4d4d4d]">{order.storefront}</span>
                <span className="font-heading text-sm font-semibold text-[#4d4d4d]">{order.order_number}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 font-heading text-xl font-semibold text-[#4d4d4d]">{createdOrder.order_number}</p>
        )}
        <p className="mt-3 font-heading text-lg tabular-nums text-[#4d4d4d]">
          R {Number(createdOrder.subtotal).toFixed(2)}
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="flex h-11 items-center justify-center border border-[#4d4d4d]/10 bg-[#f5f5f5] font-heading text-sm text-[#4d4d4d] transition-colors hover:bg-[#e5e5e5]"
        >
          Save receipt
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex h-11 items-center justify-center border border-[#4d4d4d]/10 bg-[#f5f5f5] font-heading text-sm text-[#4d4d4d] transition-colors hover:bg-[#e5e5e5]"
        >
          Share receipt
        </button>
      </div>
    </div>
  );
}
