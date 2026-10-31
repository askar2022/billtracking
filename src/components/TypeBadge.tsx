import { TYPE_LABELS, type TransactionType } from "@/lib/constants";

const STYLES: Record<TransactionType, string> = {
  income: "bg-emerald-50 text-emerald-700",
  expense: "bg-rose-50 text-rose-700",
  owner_contribution: "bg-blue-50 text-blue-700",
  owner_draw: "bg-violet-50 text-violet-700",
};

export function TypeBadge({ type }: { type: string }) {
  const key = type as TransactionType;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[key] ?? "bg-slate-100"}`}>
      {TYPE_LABELS[key] ?? type}
    </span>
  );
}
