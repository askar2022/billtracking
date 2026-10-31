import { PERIODS, type PeriodKey } from "@/lib/constants";

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function isPeriodKey(value: string | undefined): value is PeriodKey {
  return !!value && (PERIODS as readonly string[]).includes(value);
}

export function getPeriodRange(
  period: PeriodKey,
  from?: string,
  to?: string,
  now = new Date(),
): { start: Date; end: Date; label: string } {
  if (period === "week") {
    const day = now.getDay();
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - day));
    const end = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
    return { start, end, label: "This week" };
  }

  if (period === "year") {
    const start = startOfDay(new Date(now.getFullYear(), 0, 1));
    const end = endOfDay(new Date(now.getFullYear(), 11, 31));
    return { start, end, label: "This year" };
  }

  if (period === "custom") {
    const startDate = from ? parseDateInput(from) : startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const endDate = to ? parseDateInput(to) : endOfDay(now);
    if (!startDate || !endDate) {
      throw new Error("Enter a valid custom date range.");
    }
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    if (start > end) {
      throw new Error("The start date must be on or before the end date.");
    }
    return {
      start,
      end,
      label: `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`,
    };
  }

  const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  return { start, end, label: "This month" };
}

export function getPreviousRange(start: Date, end: Date): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  return { start: previousStart, end: previousEnd };
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    new Date(year, month - 1, 1),
  );
}

export function enumerateMonths(start: Date, end: Date): string[] {
  const months: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}
