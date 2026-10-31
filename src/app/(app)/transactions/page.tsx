import Link from "next/link";
import { PeriodFilter } from "@/components/PeriodFilter";
import { PlusIcon } from "@/components/icons";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TYPE_LABELS } from "@/lib/constants";
import { firstValue, parsePeriod, type SearchRecord } from "@/lib/period";
import { listCategories, listProducts, listTransactions } from "@/lib/queries";
import { isTransactionType } from "@/lib/validations";

export const metadata = {
  title: "Transactions",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchRecord>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params);
  const typeValue = firstValue(params.type);
  const productId = firstValue(params.productId);
  const categoryId = firstValue(params.categoryId);
  const [transactions, products, categories] = await Promise.all([
    listTransactions({
      start: period.start,
      end: period.end,
      type: typeValue && isTransactionType(typeValue) ? typeValue : undefined,
      productId: productId || undefined,
      categoryId: categoryId || undefined,
    }),
    listProducts(),
    listCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add income, business expenses, owner contributions, and owner draws.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <PeriodFilter
            pathname="/transactions"
            period={period.period}
            from={period.from}
            to={period.to}
            extra={{ type: typeValue, productId, categoryId }}
          />
          <Link
            href="/transactions/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <PlusIcon className="h-4 w-4" />
            Add transaction
          </Link>
        </div>
      </div>

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
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        <select name="categoryId" defaultValue={categoryId ?? ""} className="input">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full border border-border px-4 py-2 text-sm font-medium sm:col-span-3 sm:w-fit">
          Apply filters
        </button>
      </form>

      <TransactionList transactions={transactions} />
    </div>
  );
}
