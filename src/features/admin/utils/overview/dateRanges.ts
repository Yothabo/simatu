import type {
  OverviewDateSelection,
  OverviewDateRangeValue,
} from '../../types/overview.types';

import {
  addCalendarDays,
  getLocalDateParts,
  getLocalEndOfDay,
  getLocalMidnight,
} from './dateRangeTime';
export { OVERVIEW_TIME_ZONE } from './dateRangeTime';

export function getOverviewDateRange(
  selection: OverviewDateSelection,
  storeCreatedAt?: string,
  now = new Date(),
): OverviewDateRangeValue {
  const today = getLocalDateParts(now);
  const todayEnd = getLocalEndOfDay(today);
  const createdAt = storeCreatedAt ? new Date(storeCreatedAt) : null;

  if (createdAt && !Number.isFinite(createdAt.getTime())) {
    throw new Error('Invalid store creation date supplied to Overview.');
  }

  let start: Date | null = null;
  let end = todayEnd;

  const makeStart = (year: number, month: number, day: number) =>
    getLocalMidnight({ year, month, day });

  const makeEnd = (year: number, month: number, day: number) =>
    getLocalEndOfDay({ year, month, day });

  if (selection.type === 'preset') {
    switch (selection.preset) {
      case 'today':
        start = makeStart(today.year, today.month, today.day);
        break;

      case 'yesterday': {
        const day = addCalendarDays(
          new Date(Date.UTC(today.year, today.month - 1, today.day)),
          -1,
        );
        start = makeStart(
          day.getUTCFullYear(),
          day.getUTCMonth() + 1,
          day.getUTCDate(),
        );
        end = makeEnd(
          day.getUTCFullYear(),
          day.getUTCMonth() + 1,
          day.getUTCDate(),
        );
        break;
      }

      case 'last-7-days':
      case 'last-30-days': {
        const count = selection.preset === 'last-7-days' ? 7 : 30;
        const first = addCalendarDays(
          new Date(Date.UTC(today.year, today.month - 1, today.day)),
          -(count - 1),
        );
        start = makeStart(
          first.getUTCFullYear(),
          first.getUTCMonth() + 1,
          first.getUTCDate(),
        );
        break;
      }

      case 'this-month':
        start = makeStart(today.year, today.month, 1);
        break;

      case 'last-month': {
        const previousMonth = new Date(Date.UTC(today.year, today.month - 2, 1));
        const year = previousMonth.getUTCFullYear();
        const month = previousMonth.getUTCMonth() + 1;
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
        start = makeStart(year, month, 1);
        end = makeEnd(year, month, lastDay);
        break;
      }

      case 'this-year':
        start = makeStart(today.year, 1, 1);
        break;

      case 'last-year':
        start = makeStart(today.year - 1, 1, 1);
        end = makeEnd(today.year - 1, 12, 31);
        break;

      case 'all-time':
        start = createdAt;
        break;
    }
  } else {
    if (selection.dates.length === 0) {
      return {
        start: null,
        end: todayEnd,
      };
    }

    const ranges = [...new Set(selection.dates)]
      .filter((dateKey) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;

        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        return (
          date.getUTCFullYear() === year &&
          date.getUTCMonth() + 1 === month &&
          date.getUTCDate() === day
        );
      })
      .sort()
      .map((dateKey) => {
        const [year, month, day] = dateKey.split('-').map(Number);
        let rangeStart = makeStart(year, month, day);
        let rangeEnd = makeEnd(year, month, day);

        if (rangeEnd.getTime() > todayEnd.getTime()) {
          rangeEnd = todayEnd;
        }

        return { start: rangeStart, end: rangeEnd };
      })
      .filter((range) => range.start.getTime() <= range.end.getTime());

    return {
      start: ranges[0]?.start ?? null,
      end: ranges[ranges.length - 1]?.end ?? todayEnd,
      ranges,
    };
  }

  if (start && createdAt && createdAt.getTime() > start.getTime()) {
    start = createdAt;
  }

  if (end.getTime() > todayEnd.getTime()) {
    end = todayEnd;
  }

  return { start, end };
}

export function getOverviewDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date supplied to Overview.');
  }

  const { year, month, day } = getLocalDateParts(date);

  return [
    String(year),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

export function isWithinOverviewRange(
  value: string,
  range: OverviewDateRangeValue,
): boolean {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  if (range.ranges) {
    return range.ranges.some(
      (part) =>
        timestamp >= part.start.getTime() &&
        timestamp <= part.end.getTime(),
    );
  }

  if (range.start && timestamp < range.start.getTime()) {
    return false;
  }

  return timestamp <= range.end.getTime();
}
