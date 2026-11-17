import type { OverviewDateSelection } from '../../../types/overview.types';
import { getOverviewDateKey } from '../../../utils/overview/dateRanges';
import { getOverviewQuickActionDates } from '../../../utils/overview/quickActions';
import { QUICK_ACTIONS } from './overview.constants';

export function getFirstName(userName: string): string {
  const firstName = userName.trim().split(/[\s._-]+/)[0];

  if (!firstName) return 'Admin';

  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getSelectionLabel(
  selection: OverviewDateSelection,
): string {
  if (selection.type === 'preset') {
    return String(selection.preset)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  const count = new Set(selection.dates).size;

  if (count === 0) return 'All available dates';

  return `${count} ${count === 1 ? 'day' : 'days'} selected`;
}

export function getSelectionFileKey(
  selection: OverviewDateSelection,
): string {
  if (selection.type === 'preset') {
    return `preset-${selection.preset}`;
  }

  const dates = [...new Set(selection.dates)].sort();

  return dates.length > 0 ? dates.join('_') : 'all-available-dates';
}

export function get2026Dates(now = new Date()): string[] {
  const todayKey = getOverviewDateKey(now);
  const yearStart = Date.UTC(2026, 0, 1);
  const finalDateKey =
    todayKey < '2026-12-31' ? todayKey : '2026-12-31';

  const [year, month, day] = finalDateKey.split('-').map(Number);
  const yearEnd = Date.UTC(year, month - 1, day);

  const count = Math.max(
    0,
    Math.floor((yearEnd - yearStart) / 86400000) + 1,
  );

  return Array.from({ length: count }, (_, index) =>
    getOverviewDateKey(new Date(yearStart + index * 86400000)),
  );
}

export function getQuickActionDates(
  action: string,
  now = new Date(),
): string[] {
  return action === '2026'
    ? get2026Dates(now)
    : getOverviewQuickActionDates(action, now);
}

export function getActiveQuickAction(
  selection: OverviewDateSelection,
): string {
  if (selection.type !== 'dates') return '';

  const selected = [...new Set(selection.dates)].sort();

  return (
    QUICK_ACTIONS.find((action) => {
      const dates = getQuickActionDates(action.key);

      return (
        dates.length > 0 &&
        dates.length === selected.length &&
        dates.every((date, index) => date === selected[index])
      );
    })?.key ?? ''
  );
}
