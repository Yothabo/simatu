export const QUICK_ACTIONS = [
  { key: '7-days', label: 'Last 7 days' },
  { key: 'month', label: 'Last month' },
  { key: '3-months', label: 'Last 3 months' },
  { key: 'quarter', label: 'Previous quarter' },
  { key: '6-months', label: 'Last 6 months' },
  { key: '2026', label: '2026' },
] as const;

export const QUICK_ACTION_OPTIONS = QUICK_ACTIONS.map((action) => ({
  value: action.key,
  label: action.label,
}));
