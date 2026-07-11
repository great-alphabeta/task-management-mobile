export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDay(left: Date, right: Date): boolean {
  return formatDateKey(left) === formatDateKey(right);
}

export function combineDateAndTime(dateKey: string, time: Date): string {
  const date = parseDateKey(dateKey);
  date.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return date.toISOString();
}

export function formatDisplayDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("en-US", { month: "short" })}, ${date.getFullYear()}`;
}
