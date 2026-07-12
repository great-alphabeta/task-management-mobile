import { formatDateKey, parseDateKey } from "./date";

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const WEEKDAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function addDaysToDateKey(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function formatReferenceDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${dateKey} (${date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })})`;
}

function buildDateKey(year: number, monthIndex: number, day: number): string {
  return formatDateKey(new Date(year, monthIndex, day));
}

function resolveUpcomingMonthDay(
  monthIndex: number,
  day: number,
  referenceDateKey: string,
  explicitYear?: number,
): string {
  const reference = parseDateKey(referenceDateKey);
  const year = explicitYear ?? reference.getFullYear();
  let candidate = buildDateKey(year, monthIndex, day);

  if (!explicitYear && parseDateKey(candidate) < reference) {
    candidate = buildDateKey(year + 1, monthIndex, day);
  }

  return candidate;
}

function parseMonthDayFromText(input: string, referenceDateKey: string): string | null {
  const monthFirst = input.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/i,
  );

  if (monthFirst) {
    const monthIndex = MONTH_MAP[monthFirst[1].toLowerCase()];
    const day = Number(monthFirst[2]);
    const year = monthFirst[3] ? Number(monthFirst[3]) : undefined;

    if (monthIndex !== undefined && day >= 1 && day <= 31) {
      return resolveUpcomingMonthDay(monthIndex, day, referenceDateKey, year);
    }
  }

  const dayFirst = input.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:,?\s*(\d{4}))?\b/i,
  );

  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const monthIndex = MONTH_MAP[dayFirst[2].toLowerCase()];
    const year = dayFirst[3] ? Number(dayFirst[3]) : undefined;

    if (monthIndex !== undefined && day >= 1 && day <= 31) {
      return resolveUpcomingMonthDay(monthIndex, day, referenceDateKey, year);
    }
  }

  return null;
}

function parseWeekdayFromText(input: string, referenceDateKey: string): string | null {
  const lower = input.toLowerCase();

  const nextWeekday = lower.match(
    /\bnext\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/,
  );

  if (nextWeekday) {
    const target = WEEKDAY_MAP[nextWeekday[1]];
    const reference = parseDateKey(referenceDateKey);
    const current = reference.getDay();
    let delta = (target - current + 7) % 7;
    if (delta === 0) {
      delta = 7;
    }

    return addDaysToDateKey(referenceDateKey, delta);
  }

  const weekdayOnly = lower.match(
    /\bon\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/,
  );

  if (weekdayOnly) {
    const target = WEEKDAY_MAP[weekdayOnly[1]];
    const reference = parseDateKey(referenceDateKey);
    const current = reference.getDay();
    const delta = (target - current + 7) % 7;

    return addDaysToDateKey(referenceDateKey, delta);
  }

  return null;
}

function parseLooseDateValue(value: string, referenceDateKey: string): string | null {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]) - 1;
    const day = Number(slashMatch[2]);
    const reference = parseDateKey(referenceDateKey);
    let year = slashMatch[3] ? Number(slashMatch[3]) : reference.getFullYear();
    if (year < 100) {
      year += 2000;
    }

    return resolveUpcomingMonthDay(month, day, referenceDateKey, year);
  }

  return parseMonthDayFromText(trimmed, referenceDateKey);
}

export function resolveRelativeDateFromText(
  input: string,
  referenceDateKey: string,
): string | null {
  const lower = input.toLowerCase();

  if (/\bday after tomorrow\b/.test(lower)) {
    return addDaysToDateKey(referenceDateKey, 2);
  }

  if (/\btomorrow\b/.test(lower)) {
    return addDaysToDateKey(referenceDateKey, 1);
  }

  if (/\btoday\b/.test(lower)) {
    return referenceDateKey;
  }

  if (/\byesterday\b/.test(lower)) {
    return addDaysToDateKey(referenceDateKey, -1);
  }

  const weekdayDate = parseWeekdayFromText(input, referenceDateKey);
  if (weekdayDate) {
    return weekdayDate;
  }

  return parseMonthDayFromText(input, referenceDateKey);
}

export function resolveTaskDate(
  input: string,
  referenceDateKey: string,
  aiDate?: string | null,
): string {
  if (aiDate) {
    const fromAi = parseLooseDateValue(aiDate, referenceDateKey);
    if (fromAi) {
      return fromAi;
    }
  }

  const fromText = resolveRelativeDateFromText(input, referenceDateKey);
  if (fromText) {
    return fromText;
  }

  return referenceDateKey;
}
