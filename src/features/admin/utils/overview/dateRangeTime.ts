export const OVERVIEW_TIME_ZONE = 'Africa/Johannesburg';

type LocalDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function getLocalDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: OVERVIEW_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

/**
 * Converts a Johannesburg wall-clock date/time into its UTC timestamp.
 * The iterative offset calculation avoids assuming that local time is UTC.
 */
function localDateTimeToUtc(value: LocalDateTime): Date {
  const targetUtc = Date.UTC(
    value.year,
    value.month - 1,
    value.day,
    value.hour,
    value.minute,
    value.second,
  );

  let timestamp = targetUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: OVERVIEW_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(timestamp));

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    const representedUtc = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );

    const difference = targetUtc - representedUtc;

    if (difference === 0) break;

    timestamp += difference;
  }

  return new Date(timestamp);
}

export function addCalendarDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

export function getLocalMidnight(parts: {
  year: number;
  month: number;
  day: number;
}): Date {
  return localDateTimeToUtc({
    ...parts,
    hour: 0,
    minute: 0,
    second: 0,
  });
}

export function getLocalEndOfDay(parts: {
  year: number;
  month: number;
  day: number;
}): Date {
  return new Date(
    localDateTimeToUtc({
      ...parts,
      hour: 23,
      minute: 59,
      second: 59,
    }).getTime() + 999,
  );
}