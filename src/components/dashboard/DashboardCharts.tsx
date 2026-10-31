"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd } from "@/lib/money";
import { monthLabel } from "@/lib/dates";

const COLORS = ["#3b82f6", "#8b5cf6", "#94a3b8", "#f59e0b", "#14b8a6", "#f43f5e"];

export function IncomeExpenseChart({
  data,
}: {
  data: Array<{ key: string; income: number; expense: number }>;
}) {
  const chartData = data.map((item) => ({
    name: monthLabel(item.key),
    income: item.income / 100,
    expense: item.expense / 100,
  }));

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Income & expenses</h2>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-[#14b8a6]" /> App income
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" /> Expenses
          </span>
        </div>
      </div>
      <div className="h-64">
        {chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={6}>
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value) => formatUsd(Math.round(Number(value) * 100))}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="income" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function CategoryDonut({
  data,
}: {
  data: Array<{ name: string; amountCents: number }>;
}) {
  const total = data.reduce((sum, item) => sum + item.amountCents, 0);
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.amountCents / 100,
  }));

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-base font-semibold">Spending by category</h2>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-52 w-52 shrink-0">
          {chartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatUsd(Math.round(Number(value) * 100))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-semibold">{formatUsd(total)}</p>
                <p className="text-xs text-slate-500">Total expenses</p>
              </div>
            </>
          )}
        </div>
        <ul className="w-full space-y-2 text-sm">
          {data.map((item, index) => {
            const share = total ? Math.round((item.amountCents / total) * 100) : 0;
            return (
              <li key={item.name} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <i
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-medium text-slate-800">{share}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      No amounts in this period yet.
    </div>
  );
}
