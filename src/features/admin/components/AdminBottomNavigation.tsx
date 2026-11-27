import { FiGrid, FiPackage, FiSettings, FiBriefcase, FiShoppingBag } from 'react-icons/fi';
import { VscPackage } from 'react-icons/vsc';
import { FaOpencart } from 'react-icons/fa';
import type { Tab } from '../types/admin.types';
import AccentButton from './AccentButton';

type AdminBottomNavigationProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;\n  adminRole?: string;
};

export default function AdminBottomNavigation({
  activeTab,
  onTabChange,
}: AdminBottomNavigationProps) {
  const tabs: { tab: Tab; label: string; Icon: typeof FiGrid }[] = [
    { tab: 'overview', label: 'Overview', Icon: FiGrid },
    { tab: 'products', label: 'Products', Icon: VscPackage },
    { tab: 'orders', label: 'Orders', Icon: FaOpencart },
    { tab: 'inventory', label: 'Inventory', Icon: FiPackage },
    { tab: 'business', label: 'Business', Icon: FiBriefcase },\n    ...(adminRole === 'super_admin' ? [{ tab: 'marketplace' as Tab, label: 'Market', Icon: FiShoppingBag }] : []),
    { tab: 'settings', label: 'Settings', Icon: FiSettings },
  ];

  return (
    <nav
      aria-label="Admin navigation"
      className="fixed inset-x-0 bottom-0 z-50"
      style={{
        paddingInline: 'var(--admin-space-sm, 12px)',
        paddingBottom: 'max(var(--admin-space-sm, 12px), env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="relative mx-auto flex items-center justify-around"
        style={{
          maxWidth: 'var(--admin-bottom-nav-max-width)',
          paddingInline: 'var(--admin-space-xs, 8px)',
          paddingBlock: 'var(--admin-space-xs, 8px)',
          borderRadius: 'var(--ds-radius-xl, 0.75rem)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--admin-border-subtle)',
          backgroundColor: 'var(--admin-surface)',
          boxShadow: 'var(--admin-shadow-mobile-nav)',
        }}
      >
        {tabs.map(({ tab, label, Icon }) => {
          const isActive = activeTab === tab;
          return (
            <AccentButton
              key={tab}
              variant={isActive ? 'dark' : 'transparent'}
              shape="tab"
              onClick={() => onTabChange(tab)}
              ariaLabel={label}
              ariaCurrent={isActive ? 'page' : undefined}
              style={{ border: 0 }}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </AccentButton>
          );
        })}

      </div>
    </nav>
  );
}
