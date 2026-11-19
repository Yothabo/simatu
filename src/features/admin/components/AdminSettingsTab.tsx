import { useState } from 'react';
import { CARD_CHROME } from './shared/cardChrome';
import RequestPanel from './RequestPanel';
import NewRequestForm from './NewRequestForm';
import { useStoreRequests } from '../hooks/useStoreRequests';
import AdminCategories from './AdminCategories';
import AdminManagement from './AdminManagement';
import type { AdminTheme } from '../hooks/useAdminTheme';
import type { Storefront } from '../types/admin.types';

type AdminSettingsTabProps = {
  adminTheme: AdminTheme;
  toggleTheme: () => void;
  storefrontFilter: 'all' | Storefront;
  setStorefrontFilter: (v: 'all' | Storefront) => void;
  adminRole: string | undefined;
  adminStoreSlug: string | undefined;
  accessToken: string | undefined;
  onStorefrontChange: () => void;
};



export default function AdminSettingsTab({


  adminRole,
  adminStoreSlug,
  accessToken,
}: AdminSettingsTabProps) {
  const isSuperAdmin = adminRole === 'super_admin';

  // Store requests (general tickets to the technical team)
  const { requests, addRequest } = useStoreRequests();
  const [newRequestStore, setNewRequestStore] = useState<Storefront | null>(null);

  // For store admins: show only their assigned store.
  // For super admins: show both stores stacked.
  const storesToShow: { slug: Storefront; label: string; color: string }[] =
    adminStoreSlug === 'yotaabo' || adminStoreSlug === 'poshies'
      ? [{ slug: adminStoreSlug, label: adminStoreSlug === 'yotaabo' ? 'Yotaabo' : 'Poshies', color: adminStoreSlug === 'yotaabo' ? '#8aa89b' : '#ff1493' }]
      : [
          { slug: 'yotaabo' as Storefront, label: 'Yotaabo', color: '#8aa89b' },
          { slug: 'poshies' as Storefront, label: 'Poshies', color: '#ff1493' },
        ];

  return (
    <div className="flex w-full flex-col" style={{ gap: 'var(--admin-space-3xl)' }}>
      {/* Header — big title + theme toggle */}
      <header className="flex w-full flex-col" style={{ gap: 'var(--admin-space-xl)' }}>
        <div className="flex items-start justify-between" style={{ gap: 'var(--admin-space-md)' }}>
          <div className="flex flex-col" style={{ gap: 'var(--admin-space-xs)' }}>
            <h1
              style={{
                fontSize: 'var(--admin-greeting-size)',
                lineHeight: 'var(--admin-greeting-line)',
                fontWeight: 'var(--admin-greeting-weight)',
                color: 'var(--admin-text-primary)',
                margin: 0,
              }}
            >
              Settings
            </h1>
            <p
              style={{
                fontSize: 'var(--admin-size-supporting)',
                fontWeight: 'var(--admin-weight-normal)',
                color: 'var(--admin-text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Manage your stores, categories, and admin access.
            </p>
          </div>
        </div>
      </header>

      {/* Categories — one section per store */}
      {accessToken && adminRole && (
        <>
          {storesToShow.map((store) => (
            <section
              key={store.slug}
              className="flex w-full flex-col"
              style={{ gap: 'var(--admin-space-md)' }}
            >
              <div
                style={{
                  width: '100%',
                  backgroundColor: store.color,
                  borderRadius: 'var(--ds-radius-lg)',
                  paddingInline: 'var(--admin-space-md)',
                  paddingBlock: 'var(--admin-space-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <h2
                  style={{
                    fontSize: 'var(--admin-size-heading-2)',
                    fontWeight: 'var(--admin-weight-semibold)',
                    color: 'var(--admin-on-accent)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {store.label} storefront
                </h2>
              </div>

              <AdminCategories
                accessToken={accessToken}
                adminRole={adminRole as 'super_admin' | 'store_admin'}
                assignedStorefront={store.slug}
              />

              <RequestPanel
                storeLabel={store.label}
                requests={requests.filter((r) => r.storefront === store.slug)}
                onNewRequest={() => setNewRequestStore(store.slug)}
              />
            </section>
          ))}
        </>
      )}

      {/* Admin Management — only for super admin */}
      {isSuperAdmin && accessToken && (
        <AdminManagement accessToken={accessToken} />
      )}

      {/* New request form — floats over the whole section */}
      {newRequestStore && (
        <NewRequestForm
          isOpen
          storefront={newRequestStore}
          storeLabel={newRequestStore === 'yotaabo' ? 'Yotaabo' : 'Poshies'}
          onClose={() => setNewRequestStore(null)}
          onSubmit={addRequest}
        />
      )}
    </div>
  );
}
