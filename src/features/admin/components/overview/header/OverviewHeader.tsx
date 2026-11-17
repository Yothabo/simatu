import {
  FiDownload,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';
import type { Storefront } from '../../../types/admin.types';
import AccentButton from '../../AccentButton';
import OverviewAddMenu from './OverviewAddMenu';
import AdminDropdown from '../../AdminDropdown';
import OverviewToolbar from '../shared/OverviewToolbar';
import OverviewStoreSelector from './OverviewStoreSelector';

type OverviewHeaderProps = {
  greeting: string;
  userName: string;
  canSwitchStore: boolean;
  storefrontFilter: 'all' | Storefront;
  onStorefrontChange: (value: 'all' | Storefront) => void;
  activeQuickAction: string;
  quickActionOptions: { value: string; label: string }[];
  onQuickActionChange: (value: string) => void;
  isLoading: boolean;
  onExport: () => void;
  onRefresh: () => void;
  onAdd: () => void;
};

export default function OverviewHeader({
  greeting,
  userName,
  canSwitchStore,
  storefrontFilter,
  onStorefrontChange,
  activeQuickAction,
  quickActionOptions,
  onQuickActionChange,
  isLoading,
  onExport,
  onRefresh,
  onAdd,
}: OverviewHeaderProps) {

  return (
    <header
      className="flex w-full flex-col"
      style={{ gap: 'var(--admin-space-md)' }}
    >
      <div
        className="flex w-full flex-col"
        style={{ gap: 'var(--admin-space-xs)' }}
      >
        <h1
          style={{
            fontSize: 'var(--admin-greeting-size)',
            lineHeight: 'var(--admin-greeting-line)',
            fontWeight: 'var(--admin-greeting-weight)',
            color: 'var(--admin-text-primary)',
            margin: 0,
          }}
        >
          {greeting},{' '}
          <span
            style={{
              fontSize: 'var(--admin-text-page-title-size)',
              fontWeight: 'var(--admin-weight-semibold)',
              color: 'var(--admin-text-primary)',
              lineHeight: 1.1,
            }}
          >
            {userName}
          </span>
        </h1>
      </div>

      <OverviewToolbar align="end">
        <AccentButton
          variant="neutral"
          shape="circle"
          ariaLabel="Export overview report"
          onClick={onExport}
        >
          <FiDownload size={18} aria-hidden="true" />
        </AccentButton>

        <AccentButton
          variant="neutral"
          shape="circle"
          ariaLabel={isLoading ? 'Refreshing overview' : 'Refresh overview'}
          onClick={onRefresh}
        >
          <FiRefreshCw
            size={18}
            aria-hidden="true"
            className={isLoading ? 'animate-spin' : ''}
          />
        </AccentButton>

        <AdminDropdown
          value={activeQuickAction}
          onChange={onQuickActionChange}
          options={quickActionOptions}
          placeholder="Filter period"
          menuWidth="220px"
          compact
          iconOnly
          align="right"
          tone="neutral"
          radioColor="var(--admin-text-primary)"
          ariaLabel="Filter overview by date"
          triggerIcon={<FiFilter size={18} aria-hidden="true" />}
        />

        <OverviewAddMenu />
      </OverviewToolbar>

      {canSwitchStore && (
        <div className="overview-store-row">
          <OverviewStoreSelector
            value={storefrontFilter}
            onChange={onStorefrontChange}
          />
        </div>
      )}
    </header>
  );
}
