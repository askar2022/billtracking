import Link from "next/link";
import { CategoryDonut, IncomeExpenseChart } from "@/components/dashboard/DashboardCharts";
import { PeriodFilter } from "@/components/PeriodFilter";
import { CardIcon, PlusIcon, TrendIcon, UserIcon } from "@/components/icons";
import { TransactionList } from "@/components/transactions/TransactionList";
import { getPreviousRange } from "@/lib/dates";
import { formatUsd, percentChange } from "@/lib/money";
import { parsePeriod, type SearchRecord } from "@/lib/period";
import {
  getCategorySpending,
  getMonthlySeries,
  getProductTotals,
  getTotals,
  listTransactions,
} from "@/lib/queries";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchRecord>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params);
  const previous = getPreviousRange(period.start, period.end);
  const filters = { start: period.start, end: period.end };

  const [current, last, series, categories, products, recent] = await Promise.all([
    getTotals(filters),
    getTotals({ start: previous.start, end: previous.end }),
    getMonthlySeries(filters),
    getCategorySpending(filters),
    getProductTotals(filters),
    listTransactions(filters),
  ]);

  const cards = [
    {
      label: "App income",
      value: current.income,
      previous: last.income,
      tone: "bg-emerald-50 text-emerald-700",
      icon: <TrendIcon />,
    },
    {
      label: "Business expenses",
      value: current.expense,
      previous: last.expense,
      tone: "bg-rose-50 text-rose-700",
      icon: <CardIcon />,
    },
    {
      label: "Owner contributions",
      value: current.owner_contribution,
      previous: last.owner_contribution,
      tone: "bg-blue-50 text-blue-700",
      icon: <UserIcon />,
      extra: `Owner draws: ${formatUsd(current.owner_draw)}`,
    },
    {
      label: "Net business activity",
      value: current.net,
      previous: last.net,
      tone: "bg-teal-50 text-teal-700",
      icon: <TrendIcon />,
      signed: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track income, expenses, and owner funding in one place. Owner money in or out
            is kept separate from app revenue.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <PeriodFilter
            pathname="/dashboard"
            period={period.period}
            from={period.from}
            to={period.to}
          />
          <Link
            href="/transactions/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add transaction
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const change = percentChange(card.value, card.previous);
          return (
            <article key={card.label} className={`rounded-2xl border border-transparent p-5 ${card.tone.split(" ")[0]}`}>
              <div className="flex items-center justify-between text-slate-500">
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <span className={card.tone.split(" ").slice(1).join(" ")}>{card.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {formatUsd(card.value, { sign: card.signed })}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {change == null
                  ? "No comparison for the prior period"
                  : `${change > 0 ? "+" : ""}${change}% vs last period`}
              </p>
              {card.extra ? <p className="mt-1 text-xs text-slate-500">{card.extra}</p> : null}
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <IncomeExpenseChart data={series} />
        <CategoryDonut data={categories} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent transactions</h2>
            <Link href="/transactions" className="text-sm font-medium text-blue-700">
              View all
            </Link>
          </div>
          <TransactionList transactions={recent.slice(0, 6)} />
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Apps & products</h2>
            <Link href="/products" className="text-sm font-medium text-blue-700">
              View all
            </Link>
          </div>
          <ul className="space-y-4">
            {products.map((product) => (
              <li key={product.id} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatUsd(product.income)} in · {formatUsd(product.expense)} out
                  </p>
                </div>
                <p className={`font-semibold ${product.net < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                  {formatUsd(product.net, { sign: true })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
