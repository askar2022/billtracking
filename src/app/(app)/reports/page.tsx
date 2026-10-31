import { PeriodFilter } from "@/components/PeriodFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { TypeBadge } from "@/components/TypeBadge";
import { TransactionRowActions } from "@/components/transactions/DeleteButtons";
import { TYPE_LABELS } from "@/lib/constants";
import { formatDisplayDate, toDateInput } from "@/lib/dates";
import { formatUsd, signedAmountCents } from "@/lib/money";
import { firstValue, parsePeriod, type SearchRecord } from "@/lib/period";
import {
  getCategorySpending,
  getProductTotals,
  getTotals,
  listCategories,
  listProducts,
  listTransactions,
} from "@/lib/queries";
import { isTransactionType } from "@/lib/validations";

export const metadata = {
  title: "Reports & export",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchRecord>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params);
  const typeValue = firstValue(params.type);
  const productId = firstValue(params.productId);
  const categoryId = firstValue(params.categoryId);
  const filters = {
    start: period.start,
    end: period.end,
    type: typeValue && isTransactionType(typeValue) ? typeValue : undefined,
    productId: productId || undefined,
    categoryId: categoryId || undefined,
  };

  const [totals, products, categories, transactions, productOptions, categoryOptions] =
    await Promise.all([
      getTotals(filters),
      getProductTotals(filters),
      getCategorySpending(filters),
      listTransactions(filters),
      listProducts(),
      listCategories(),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & export</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review weekly, monthly, yearly, or custom-range totals. Export CSV files for
            your records. Receipts stay linked to their transactions.
          </p>
        </div>
        <ExportButtons
          filters={params}
          stamp={`${toDateInput(period.start)}-to-${toDateInput(period.end)}`}
        />
      </div>

      <div className="flex flex-col gap-3">
        <PeriodFilter
          pathname="/reports"
          period={period.period}
          from={period.from}
          to={period.to}
          extra={{ type: typeValue, productId, categoryId }}
        />
        <form className="card grid gap-3 p-4 sm:grid-cols-3">
          <input type="hidden" name="period" value={period.period} />
          {period.from ? <input type="hidden" name="from" value={period.from} /> : null}
          {period.to ? <input type="hidden" name="to" value={period.to} /> : null}
          <select name="type" defaultValue={typeValue ?? ""} className="input">
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="productId" defaultValue={productId ?? ""} className="input">
            <option value="">All apps / products</option>
            {productOptions.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <select name="categoryId" defaultValue={categoryId ?? ""} className="input">
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full border border-border px-4 py-2 text-sm font-medium sm:w-fit">
            Apply filters
          </button>
        </form>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["App income", totals.income],
          ["Business expenses", totals.expense],
          ["Owner contributions", totals.owner_contribution],
          ["Owner draws", totals.owner_draw],
          ["Net business activity", totals.net],
        ].map(([label, value]) => (
          <article key={String(label)} className="card p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold">{formatUsd(Number(value))}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold">By app / product</h2>
          <ul className="space-y-3 text-sm">
            {products.map((product) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span>{product.name}</span>
                <span className="font-medium">{formatUsd(product.net, { sign: true })}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold">By expense category</h2>
          <ul className="space-y-3 text-sm">
            {categories.length === 0 ? (
              <li className="text-slate-500">No expenses in this range.</li>
            ) : (
              categories.map((category) => (
                <li key={category.name} className="flex justify-between gap-3">
                  <span>{category.name}</span>
                  <span className="font-medium">{formatUsd(category.amountCents)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>App / product</th>
                <th>Category</th>
                <th>Receipt</th>
                <th>Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const signed = signedAmountCents(transaction.type, transaction.amountCents);
                return (
                  <tr key={transaction.id}>
                    <td>{formatDisplayDate(transaction.date)}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <TypeBadge type={transaction.type} />
                    </td>
                    <td>{transaction.product?.name ?? "—"}</td>
                    <td>{transaction.category?.name ?? "—"}</td>
                    <td>
                      {transaction.receipt ? (
                        <a
                          href={`/api/receipts/${transaction.receipt.id}`}
                          className="text-blue-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {transaction.receipt.originalName}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={signed < 0 ? "text-rose-600" : "text-emerald-700"}>
                      {formatUsd(signed, { sign: true })}
                    </td>
                    <td>
                      <TransactionRowActions id={transaction.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
