import { TYPE_LABELS, type TransactionType } from "@/lib/constants";
import { centsToDollarInput } from "@/lib/money";
import { toDateInput } from "@/lib/dates";

type CsvTransaction = {
  date: Date;
  type: string;
  description: string;
  vendor: string | null;
  payer: string | null;
  paidBy: string | null;
  notes: string | null;
  amountCents: number;
  createdAt: Date;
  updatedAt: Date;
  product: { name: string } | null;
  category: { name: string } | null;
  receipt: { originalName: string } | null;
};

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function row(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => escapeCsv(value == null ? "" : String(value)))
    .join(",");
}

export function transactionsToCsv(transactions: CsvTransaction[]) {
  const header = row([
    "Date",
    "Type",
    "Description",
    "Vendor",
    "Payer",
    "Paid by",
    "App / product",
    "Category",
    "Amount (USD)",
    "Notes",
    "Receipt",
    "Created at",
    "Updated at",
  ]);

  const lines = transactions.map((transaction) =>
    row([
      toDateInput(transaction.date),
      TYPE_LABELS[transaction.type as TransactionType] ?? transaction.type,
      transaction.description,
      transaction.vendor,
      transaction.payer,
      transaction.paidBy === "owner" ? "Owner" : transaction.paidBy === "llc" ? "LLC" : "",
      transaction.product?.name,
      transaction.category?.name,
      centsToDollarInput(transaction.amountCents),
      transaction.notes,
      transaction.receipt?.originalName ?? "",
      transaction.createdAt.toISOString(),
      transaction.updatedAt.toISOString(),
    ]),
  );

  return [header, ...lines].join("\n");
}

export function summaryToCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return "Label,Amount (USD)\n";
  const keys = Object.keys(rows[0]);
  return [
    row(keys),
    ...rows.map((item) => row(keys.map((key) => item[key]))),
  ].join("\n");
}
