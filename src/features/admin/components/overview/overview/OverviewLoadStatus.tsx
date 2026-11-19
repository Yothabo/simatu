type Props = {
  isLoading: boolean;
  ordersLoadError: string | null;
  productsLoadError: string | null;
};

export default function OverviewLoadStatus({
  isLoading,
  ordersLoadError,
  productsLoadError,
}: Props) {
  const hasLoadError = Boolean(ordersLoadError || productsLoadError);

  return (
    <>
      {isLoading && (
        <p
          role="status"
          style={{
            margin: 0,
            fontSize: 'var(--admin-size-supporting)',
            color: 'var(--admin-text-tertiary)',
          }}
        >
          Refreshing overview data…
        </p>
      )}

      {hasLoadError && (
        <div
          role="alert"
          className="admin-card-bg"
          style={{
            borderRadius: 'var(--ds-radius-lg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--admin-border-subtle)',
            padding: 'var(--admin-space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--admin-space-xs)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--admin-size-body)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
            }}
          >
            Some overview data could not be refreshed.
          </p>

          {ordersLoadError && (
            <p
              style={{
                margin: 0,
                fontSize: 'var(--admin-size-supporting)',
                color: 'var(--admin-text-secondary)',
              }}
            >
              Orders: {ordersLoadError}
            </p>
          )}

          {productsLoadError && (
            <p
              style={{
                margin: 0,
                fontSize: 'var(--admin-size-supporting)',
                color: 'var(--admin-text-secondary)',
              }}
            >
              Products: {productsLoadError}
            </p>
          )}

          <p
            style={{
              margin: 0,
              fontSize: 'var(--admin-size-micro)',
              color: 'var(--admin-text-tertiary)',
            }}
          >
            Displayed figures may reflect the last successfully loaded snapshot.
          </p>
        </div>
      )}
    </>
  );
}
