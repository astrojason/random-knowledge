/** Daily lesson keys use the browser's timezone, never the server's UTC date. */
export function todayStr(timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function daysAgoStr(n: number, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  // UTC arithmetic here operates on an already-local calendar date, not an instant.
  const date = new Date(`${todayStr(timeZone)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - n);
  return date.toISOString().slice(0, 10);
}

export function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
