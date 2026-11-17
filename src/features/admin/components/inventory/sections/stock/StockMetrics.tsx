import { FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import { AdminMetric } from '../../../../../../design-system/components';
import type { StockSummary } from '../../types';

type StockMetricsProps = {
  stockSummary: StockSummary;
  disabled: boolean;
};

export default function StockMetrics({
  stockSummary,
  disabled,
}: StockMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <AdminMetric
        label="Stock received"
        value={
          disabled
            ? '—'
            : stockSummary.received.toLocaleString('en-ZA')
        }
        description="Opening stock and replenishment"
        icon={<FiArrowDownCircle size={18} aria-hidden="true" />}
      />

      <AdminMetric
        label="Stock adjusted"
        value={
          disabled
            ? '—'
            : stockSummary.adjusted.toLocaleString('en-ZA')
        }
        description="Units changed by adjustments"
        icon={<FiArrowUpCircle size={18} aria-hidden="true" />}
      />
    </div>
  );
}
