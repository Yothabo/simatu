import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getCategoryTheme } from '../../../systems/storefront/core/configuration/categoryTheme';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export type RevenueSeries = {
  key: string;
  label: string;
  color: string;
  data: (number | null)[];
  dashed?: boolean;
};

type RevenueChartProps = {
  series: RevenueSeries[];
  activeFilter?: string;
};

const formatRand = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `R ${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `R ${Math.round(value).toLocaleString('en-ZA')}`;
};

export default function RevenueChart({ series, activeFilter = 'all' }: RevenueChartProps) {
  const accentColor =
    activeFilter === 'yotaabo'
      ? getCategoryTheme('His').hexColor
      : activeFilter === 'poshies'
        ? getCategoryTheme('Hers').hexColor
        : 'var(--admin-accent)';

  const currentMonthIndex = new Date().getMonth();

  // Build chart data: one row per month, each series contributes its value
  const chartData = MONTHS.map((month, idx) => {
    const row: Record<string, string | number | null> = { month };
    if (idx > currentMonthIndex) {
      for (const s of series) {
        row[s.key] = null;
      }
    } else {
      for (const s of series) {
        row[s.key] = s.data[idx] ?? 0;
      }
    }
    return row;
  });

  return (
    <div
      className="admin-revenue-chart w-full"
      style={{
        height: 'var(--admin-chart-height, 220px)',
        padding: '0 var(--admin-space-md)',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="color-mix(in srgb, var(--admin-border-strong) 40%, transparent)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--admin-text-secondary)', fontSize: 10 }}
            style={{ outline: 'none' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            allowDecimals={false}
            tickFormatter={formatRand}
            tick={{ fill: 'var(--admin-text-secondary)', fontSize: 10 }}
            style={{ outline: 'none' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--admin-surface)',
              border: '1px solid var(--admin-border-strong)',
              borderRadius: 'var(--ds-radius-md)',
              fontSize: 12,
              color: 'var(--admin-text-primary)',
            }}
            labelStyle={{ color: 'var(--admin-text-primary)' }}
            formatter={(value) => {
              if (value === null || value === undefined) return '';
              const num = typeof value === 'number' ? value : Number(value);
              if (Number.isNaN(num)) return '';
              return formatRand(num);
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, color: 'var(--admin-text-secondary)' }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={s.dashed ? 1.5 : 2}
              strokeDasharray={s.dashed ? '4 4' : undefined}
              dot={false}
              activeDot={s.dashed ? false : { r: 4 }}
              connectNulls={false}
              pathLength={s.dashed ? undefined : 1}
              style={
                s.dashed
                  ? undefined
                  : {
                      animation: 'admin-trend-draw 1200ms ease-out forwards',
                      strokeDasharray: 1,
                    }
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
