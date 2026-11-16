import type { Order } from '../../../types/admin.types';

type Props = {
  orderPage: number;
  totalOrderPages: number;
  filteredOrders: Order[];
  onPageChange: (page: number) => void;
};

export default function OrdersPagination({
  orderPage,
  totalOrderPages,
  filteredOrders,
  onPageChange,
}: Props) {
  return (
    <div className="mt-12 flex items-center justify-between border-t border-[#4d4d4d]/10 pt-6">
      <p className="admin-type-supporting text-sm font-medium text-[#4d4d4d]/50">
        Showing {Math.min((orderPage - 1) * 20 + 1, filteredOrders.length)}–
        {Math.min(orderPage * 20, filteredOrders.length)} of{' '}
        {filteredOrders.length}
      </p>

      {totalOrderPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, orderPage - 1))}
            disabled={orderPage === 1}
            className="border-0 bg-transparent px-2 py-1 admin-type-body text-sm font-medium text-[#4d4d4d]/60 transition-colors hover:text-[#4d4d4d] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ←
          </button>

          {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] border-0 bg-transparent px-2 py-1 admin-type-numeric text-sm font-medium transition-colors ${
                  page === orderPage
                    ? 'text-[#4d4d4d] underline underline-offset-4 decoration-1'
                    : 'text-[#4d4d4d]/40 hover:text-[#4d4d4d]'
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() =>
              onPageChange(Math.min(totalOrderPages, orderPage + 1))
            }
            disabled={orderPage === totalOrderPages}
            className="border-0 bg-transparent px-2 py-1 admin-type-body text-sm font-medium text-[#4d4d4d]/60 transition-colors hover:text-[#4d4d4d] disabled:cursor-not-allowed disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
