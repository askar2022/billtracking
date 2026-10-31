"use client";

import { useRouter } from "next/navigation";
import { CalendarIcon } from "@/components/icons";
import type { PeriodKey } from "@/lib/constants";
import { toDateInput } from "@/lib/dates";

export function PeriodFilter({
  pathname,
  period,
  from,
  to,
  extra,
}: {
  pathname: string;
  period: PeriodKey;
  from?: string;
  to?: string;
  extra?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const today = toDateInput(new Date());

  function navigate(next: { period: PeriodKey; from?: string; to?: string }) {
    const params = new URLSearchParams();
    params.set("period", next.period);
    if (next.period === "custom") {
      if (next.from) params.set("from", next.from);
      if (next.to) params.set("to", next.to);
    }
    for (const [key, value] of Object.entries(extra ?? {})) {
      if (value) params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm">
        <CalendarIcon className="h-4 w-4 text-slate-400" />
        <label className="sr-only" htmlFor="period">
          Date range
        </label>
        <select
          id="period"
          className="bg-transparent pr-1 font-medium outline-none"
          value={period}
          onChange={(event) => {
            const next = event.target.value as PeriodKey;
            navigate({
              period: next,
              from: from || today,
              to: to || today,
            });
          }}
        >
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="custom">Custom range</option>
        </select>
      </div>
      {period === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            className="input !w-auto !py-2"
            value={from || ""}
            onChange={(event) =>
              navigate({ period: "custom", from: event.target.value, to })
            }
          />
          <span className="text-sm text-slate-500">to</span>
          <input
            type="date"
            className="input !w-auto !py-2"
            value={to || ""}
            onChange={(event) =>
              navigate({ period: "custom", from, to: event.target.value })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
