import { AdminButton } from '../../../../design-system/components';
import { SECTIONS } from './constants';
import type { InventorySection } from './types';

type InventorySectionNavigationProps = {
  section: InventorySection;
  onSectionChange: (section: InventorySection) => void;
};

export default function InventorySectionNavigation({
  section,
  onSectionChange,
}: InventorySectionNavigationProps) {
  return (
    <nav
      aria-label="Inventory sections"
      className="grid grid-cols-2 sm:grid-cols-4"
      style={{ gap: 'var(--admin-space-xs)' }}
    >
      {SECTIONS.map(({ id, label, Icon }) => {
        const selected = section === id;

        return (
          <AdminButton
            key={id}
            variant={selected ? 'primary' : 'neutral'}
            shape="pill"
            ariaLabel={label}
            ariaCurrent={selected ? 'page' : undefined}
            onClick={() => onSectionChange(id)}
            fullWidth
          >
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </AdminButton>
        );
      })}
    </nav>
  );
}
