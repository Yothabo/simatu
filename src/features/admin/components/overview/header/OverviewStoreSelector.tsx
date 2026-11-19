import type { Storefront } from '../../../types/admin.types';
import { getCategoryTheme } from '../../../../../systems/storefront/core/configuration/categoryTheme';
import AccentButton from '../../AccentButton';

type OverviewStoreSelectorProps = {
  value: 'all' | Storefront;
  onChange: (value: 'all' | Storefront) => void;
};

const STORE_OPTIONS: {
  id: 'all' | Storefront;
  label: string;
  category: string | null;
}[] = [
  { id: 'poshies', label: 'Poshies', category: 'Hers' },
  { id: 'yotaabo', label: 'Yotaabo', category: 'His' },
  { id: 'all', label: 'All', category: null },
];

export default function OverviewStoreSelector({
  value,
  onChange,
}: OverviewStoreSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Filter overview by storefront"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        height: '44px',
        border: '1px solid var(--admin-border-strong)',
        borderRadius: 'var(--ds-radius-xl)',
        overflow: 'hidden',
        backgroundColor: 'var(--admin-surface)',
      }}
    >
      {STORE_OPTIONS.map((option, index) => {
        const isActive = value === option.id;
        const theme = option.category
          ? getCategoryTheme(option.category)
          : null;

        return (
          <AccentButton
            key={option.id}
            shape="pill"
            variant={isActive ? 'active' : 'neutral'}
            storeColor={theme?.hexColor}
            activeColor={theme?.hexColor ?? 'var(--admin-accent)'}
            ariaCurrent={isActive ? 'page' : undefined}
            onClick={() => onChange(option.id)}
            ariaLabel={`Filter by ${option.label}`}
            style={{
              flex: '1 1 0',
              minWidth: 0,
              height: '100%',
              borderRadius: 0,
              border: 'none',
              borderLeft:
                index > 0
                  ? '1px solid var(--admin-border-strong)'
                  : 'none',
              justifyContent: 'center',
              paddingInline: 'var(--admin-space-sm)',
            }}
          >
            {option.label}
          </AccentButton>
        );
      })}
    </div>
  );
}
