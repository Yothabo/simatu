import type { FormEvent } from 'react';
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminSectionHeader,
  AdminSelect,
} from '../../../design-system/components';

type AdminInviteFormProps = {
  email: string;
  setEmail: (value: string) => void;
  storeSlug: 'yotaabo' | 'poshies';
  setStoreSlug: (value: 'yotaabo' | 'poshies') => void;
  isInviting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AdminInviteForm({
  email,
  setEmail,
  storeSlug,
  setStoreSlug,
  isInviting,
  onSubmit,
}: AdminInviteFormProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--admin-space-md)',
      }}
    >
      <AdminSectionHeader
        title="Invite Store Administrator"
        as="h3"
        compact
      />

      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--admin-space-md)',
        }}
      >
        <AdminField label="Email address" htmlFor="new-admin-email" required>
          <AdminInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            required
            maxLength={254}
            disabled={isInviting}
            id="new-admin-email"
          />
        </AdminField>

        <AdminField label="Assign storefront" htmlFor="new-admin-store">
          <AdminSelect
            id="new-admin-store"
            value={storeSlug}
            onChange={(e) =>
              setStoreSlug(e.target.value as 'yotaabo' | 'poshies')
            }
            options={[
              { value: 'yotaabo', label: 'Yotaabo' },
              { value: 'poshies', label: 'Poshies' },
            ]}
            disabled={isInviting}
          />
        </AdminField>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AdminButton
            variant="primary"
            shape="pill"
            type="submit"
            ariaLabel={isInviting ? 'Sending invitation' : 'Send invitation'}
            disabled={isInviting || !email.trim()}
            loading={isInviting}
          >
            Send invitation
          </AdminButton>
        </div>
      </form>
    </section>
  );
}
