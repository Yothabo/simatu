import { AdminButton } from '../../../../../design-system/components';
import type { AdminRow } from '../../../types/admin.types';

type Props = {
  currentPage: number;
  totalPages: number;
  filteredProducts: AdminRow[];
  onPageChange: (page: number) => void;
};

export default function ProductsPagination({
  currentPage,
  totalPages,
  filteredProducts,
  onPageChange,
}: Props) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        marginTop: 'var(--admin-space-md)',
        paddingTop: 'var(--admin-space-md)',
        borderTop: '1px solid var(--admin-border-subtle)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--admin-size-supporting)',
          fontWeight: 'var(--admin-weight-medium)',
          color: 'var(--admin-text-tertiary)',
          margin: 0,
        }}
      >
        Showing{' '}
        {Math.min((currentPage - 1) * 20 + 1, filteredProducts.length)}–
        {Math.min(currentPage * 20, filteredProducts.length)} of{' '}
        {filteredProducts.length}
      </p>

      {totalPages > 1 && (
        <div
          className="flex items-center"
          style={{ gap: 'var(--admin-space-xs)' }}
        >
          <AdminButton
            variant="neutral"
            shape="circle"
            ariaLabel="Previous page"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{ width: '32px', height: '32px', minWidth: '32px' }}
          >
            ←
          </AdminButton>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 7) return true;
              if (page === 1 || page === totalPages) return true;
              return Math.abs(page - currentPage) <= 1;
            })
            .map((page, index, pages) => {
              const previousPage = pages[index - 1];
              const showEllipsis =
                previousPage && page - previousPage > 1;
              const isActive = page === currentPage;

              return (
                <span
                  key={page}
                  className="flex items-center"
                  style={{ gap: 'var(--admin-space-xs)' }}
                >
                  {showEllipsis && (
                    <span
                      style={{
                        fontSize: 'var(--admin-size-supporting)',
                        color: 'var(--admin-text-tertiary)',
                      }}
                    >
                      …
                    </span>
                  )}
                  <AdminButton
                    variant={isActive ? 'primary' : 'neutral'}
                    shape="circle"
                    ariaLabel={`Page ${page}`}
                    ariaCurrent={isActive ? 'page' : undefined}
                    onClick={() => onPageChange(page)}
                    style={{
                      width: '32px',
                      height: '32px',
                      minWidth: '32px',
                      fontSize: 'var(--admin-size-supporting)',
                    }}
                  >
                    {page}
                  </AdminButton>
                </span>
              );
            })}

          <AdminButton
            variant="neutral"
            shape="circle"
            ariaLabel="Next page"
            onClick={() =>
              onPageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            style={{ width: '32px', height: '32px', minWidth: '32px' }}
          >
            →
          </AdminButton>
        </div>
      )}
    </div>
  );
}
