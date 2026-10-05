export const TIMEZONE = "Asia/Makassar";

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Makassar timezone
 */
export function getTodayMakassar(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Validates whether a string is a valid YYYY-MM-DD
 */
export function isValidDateString(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

/**
 * Adds or subtracts days from a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
}

/**
 * Format a YYYY-MM-DD string into a human readable label
 * e.g. "Senin, 05 Okt 2026"
 */
export function formatDateDisplay(dateStr: string, locale: string = "id-ID"): string {
  if (!dateStr || !isValidDateString(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format a date string into a compact format e.g. "05 Okt"
 */
export function formatDateShort(dateStr: string, locale: string = "id-ID"): string {
  if (!dateStr || !isValidDateString(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(date);
}

export interface WeekDayInfo {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa...
  dayShort: string; // Mon, Tue... / Sen, Sel...
  dayNumber: number; // 1-31
  isToday: boolean;
}

/**
 * Given any dateStr (YYYY-MM-DD), returns the 7 days (Monday to Sunday) of that week
 */
export function getWeekDays(dateStr: string): WeekDayInfo[] {
  const validDate = isValidDateString(dateStr) ? dateStr : getTodayMakassar();
  const [y, m, d] = validDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  // In JS getUTCDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const dayOfWeek = date.getUTCDay();
  // We want Monday as start of week (diff: Monday = 0, Sunday = 6)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diffToMonday);

  const todayStr = getTodayMakassar();
  const weekDays: WeekDayInfo[] = [];

  const shortNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const longNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setUTCDate(monday.getUTCDate() + i);
    const currentDateStr = current.toISOString().split("T")[0];

    weekDays.push({
      dateStr: currentDateStr,
      dayName: longNames[i],
      dayShort: shortNames[i],
      dayNumber: current.getUTCDate(),
      isToday: currentDateStr === todayStr,
    });
  }

  return weekDays;
}

/**
 * Returns array of the last N days ending on specified date (or today)
 */
export function getLastNDays(count: number, endDateStr?: string): string[] {
  const end = endDateStr || getTodayMakassar();
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    dates.push(addDays(end, -i));
  }
  return dates;
}
