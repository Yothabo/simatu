import { FiRefreshCw } from 'react-icons/fi';
import {
  AdminButton,
  AdminSectionHeader,
} from '../../../design-system/components';
import AdminListContent from './admin-list/AdminListContent';
import type { AdminListProps } from './admin-list/types';

export type { AdminRecord } from './admin-list/types';

export default function AdminList(props: AdminListProps) {
  const { isLoading } = props;

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--admin-space-md)',
      }}
    >
      <AdminSectionHeader
        title="Administrators"
        as="h3"
        compact
        action={
          <AdminButton
            variant="neutral"
            shape="circle"
            ariaLabel={
              isLoading
                ? 'Refreshing administrators'
                : 'Refresh administrators'
            }
            onClick={props.onRefresh}
            disabled={isLoading}
          >
            <FiRefreshCw
              size={16}
              aria-hidden="true"
              className={isLoading ? 'animate-spin' : ''}
            />
          </AdminButton>
        }
      />

      <AdminListContent {...props} />
    </section>
  );
}
