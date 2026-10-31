import { getPeriodRange, isPeriodKey } from "@/lib/dates";
import type { PeriodKey } from "@/lib/constants";

export type SearchRecord = Record<string, string | string[] | undefined>;

export function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePeriod(searchParams: SearchRecord) {
  const rawPeriod = firstValue(searchParams.period);
  const period: PeriodKey = isPeriodKey(rawPeriod) ? rawPeriod : "month";
  const from = firstValue(searchParams.from);
  const to = firstValue(searchParams.to);
  const range = getPeriodRange(period, from, to);
  return { period, from, to, ...range };
}

export function periodQuery(period: PeriodKey, from?: string, to?: string) {
  const params = new URLSearchParams();
  params.set("period", period);
  if (period === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  return params.toString();
}
