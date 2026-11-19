import type { Dispatch, SetStateAction } from 'react';
import type { Tab } from '../../../features/admin/types/admin.types';
import AdminTopBar from '../../../features/admin/components/AdminTopBar';

type AdminPageHeaderProps = {
  email: string;
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  adminTheme: 'light' | 'dark';
  setAdminTheme: Dispatch<SetStateAction<'light' | 'dark'>>;
  onLogout: () => void;
};

export default function AdminPageHeader({
  email,
  activeTab,
  setActiveTab,
  adminTheme,
  setAdminTheme,
  onLogout,
}: AdminPageHeaderProps) {
  return (
    <AdminTopBar
      email={email}
      onLogout={onLogout}
      onBack={
        activeTab === 'activities'
          ? () => setActiveTab('overview')
          : undefined
      }
      adminTheme={adminTheme}
      onToggleTheme={() =>
        setAdminTheme((current) =>
          current === 'light' ? 'dark' : 'light',
        )
      }
    />
  );
}
