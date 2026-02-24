export type DateRange = { start: string; end: string };

export function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function defaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return { start: formatDateForInput(start), end: formatDateForInput(end) };
}

export function isDateInRange(dateStr: string, range: DateRange): boolean {
  return dateStr >= range.start && dateStr <= range.end;
}

export function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDateForInput(d);
}
