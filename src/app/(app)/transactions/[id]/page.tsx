import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteTransactionButton, RemoveReceiptButton } from "@/components/transactions/DeleteButtons";
import { TypeBadge } from "@/components/TypeBadge";
import { PAID_BY_LABELS, type PaidBy } from "@/lib/constants";
import { formatDisplayDate, formatDisplayDateTime, toDateInput } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { getTransaction } from "@/lib/queries";

export const metadata = {
  title: "Transaction",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transaction = await getTransaction(id);
  if (!transaction) notFound();

  const rows = [
    ["Date", formatDisplayDate(transaction.date)],
    ["Amount", formatUsd(transaction.amountCents)],
    ["App / product", transaction.product?.name ?? "—"],
    ["Category", transaction.category?.name ?? "—"],
    ["Vendor", transaction.vendor ?? "—"],
    ["Payer", transaction.payer ?? "—"],
    [
      "Paid by",
      transaction.paidBy ? PAID_BY_LABELS[transaction.paidBy as PaidBy] ?? transaction.paidBy : "—",
    ],
    ["Note", transaction.notes ?? "—"],
    ["Created", formatDisplayDateTime(transaction.createdAt)],
    ["Last updated", formatDisplayDateTime(transaction.updatedAt)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/transactions" className="hover:underline">
              Transactions
            </Link>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{transaction.description}</h1>
          <div className="mt-2">
            <TypeBadge type={transaction.type} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/transactions/${transaction.id}/edit`}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Edit
          </Link>
          <DeleteTransactionButton id={transaction.id} />
        </div>
      </div>

      <div className="card divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr]">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
        <div className="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr]">
          <p className="text-sm text-slate-500">Receipt or invoice</p>
          {transaction.receipt ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`/api/receipts/${transaction.receipt.id}`}
                className="text-sm font-medium text-blue-700 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {transaction.receipt.originalName}
              </a>
              <RemoveReceiptButton transactionId={transaction.id} />
            </div>
          ) : (
            <p className="text-sm font-medium">None attached</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function transactionFormValues(transaction: NonNullable<Awaited<ReturnType<typeof getTransaction>>>) {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: (transaction.amountCents / 100).toFixed(2),
    date: toDateInput(transaction.date),
    description: transaction.description,
    vendor: transaction.vendor,
    payer: transaction.payer,
    paidBy: transaction.paidBy,
    notes: transaction.notes,
    productId: transaction.productId,
    categoryId: transaction.categoryId,
    receiptName: transaction.receipt?.originalName ?? null,
  };
}
