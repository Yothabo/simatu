import type { StoreRequest } from '../settings/categories/types';
import RequestPanelHeader from './RequestPanelHeader';
import RequestPanelList from './RequestPanelList';

type RequestPanelProps = {
  requests: StoreRequest[];
  onNewRequest: () => void;
  storeLabel: string;
};

export default function RequestPanel({
  requests,
  onNewRequest,
  storeLabel,
}: RequestPanelProps) {
  const openCount = requests.filter((request) => request.status !== 'resolved').length;

  return (
    <section
      className="flex w-full flex-col admin-card-bg overflow-hidden"
      style={{
        borderRadius: 'var(--ds-radius-lg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--admin-border-strong)',
      }}
    >
      <RequestPanelHeader
        openCount={openCount}
        storeLabel={storeLabel}
        onNewRequest={onNewRequest}
      />
      <RequestPanelList requests={requests} />
    </section>
  );
}
