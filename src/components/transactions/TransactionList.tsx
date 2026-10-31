import { TypeBadge } from "@/components/TypeBadge";
import { TransactionRowActions } from "@/components/transactions/DeleteButtons";
import { PAID_BY_LABELS, type PaidBy } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/dates";
import { formatUsd, signedAmountCents } from "@/lib/money";
import type { TransactionRecord } from "@/lib/types";

export function TransactionList({ transactions }: { transactions: TransactionRecord[] }) {
  if (transactions.length === 0) {
    return (
      <div className="card px-5 py-10 text-center text-slate-500">
        No transactions match these filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const signed = signedAmountCents(transaction.type, transaction.amountCents);
        return (
          <article
            key={transaction.id}
            className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={transaction.type} />
                <p className="font-semibold">{transaction.description}</p>
              </div>
              <p className="text-sm text-slate-500">
                {formatDisplayDate(transaction.date)}
                {transaction.product?.name ? ` · ${transaction.product.name}` : ""}
                {transaction.category?.name ? ` · ${transaction.category.name}` : ""}
                {transaction.paidBy
                  ? ` · Paid by ${PAID_BY_LABELS[transaction.paidBy as PaidBy] ?? transaction.paidBy}`
                  : ""}
              </p>
              <p className={`text-lg font-semibold ${signed < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                {formatUsd(signed, { sign: true })}
              </p>
            </div>
            <TransactionRowActions id={transaction.id} />
          </article>
        );
      })}
    </div>
  );
}
