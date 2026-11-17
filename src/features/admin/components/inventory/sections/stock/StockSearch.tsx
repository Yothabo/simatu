import { FiSearch } from 'react-icons/fi';

type StockSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function StockSearch({
  value,
  onChange,
}: StockSearchProps) {
  return (
    <div
      style={{
        padding: 'var(--admin-space-sm) var(--admin-space-md)',
        borderBottom: '1px solid var(--admin-border-subtle)',
      }}
    >
      <div className="relative">
        <FiSearch
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--admin-text-tertiary)' }}
        />

        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search product name or SKU"
          aria-label="Search stock balances"
          style={{
            width: '100%',
            paddingBlock: 'var(--admin-space-xs)',
            paddingLeft: 'var(--admin-space-2xl)',
            paddingRight: 'var(--admin-space-sm)',
            borderRadius: 'var(--ds-radius-lg)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--admin-border-subtle)',
            backgroundColor: 'var(--admin-surface)',
            color: 'var(--admin-text-primary)',
            fontSize: 'var(--admin-size-supporting)',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}
