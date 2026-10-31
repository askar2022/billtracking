"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteTransaction, removeReceipt } from "@/actions/transactions";

export function DeleteTransactionButton({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={
          compact
            ? "text-sm font-medium text-rose-600 hover:underline"
            : "rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
        }
      >
        Delete
      </button>
    );
  }

  return (
    <form action={async () => { await deleteTransaction(id); }} className="flex flex-wrap items-center gap-2">
      {compact ? null : <span className="text-sm text-slate-600">Delete this record?</span>}
      <button
        type="submit"
        className={
          compact
            ? "text-sm font-semibold text-rose-700 hover:underline"
            : "rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
        }
      >
        {compact ? "Confirm" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className={compact ? "text-sm text-slate-500 hover:underline" : "rounded-full border border-border px-4 py-2 text-sm"}
      >
        Keep
      </button>
    </form>
  );
}

export function TransactionRowActions({ id }: { id: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Link href={`/transactions/${id}/edit`} className="text-sm font-medium text-blue-700 hover:underline">
        Edit
      </Link>
      <DeleteTransactionButton id={id} compact />
    </div>
  );
}

export function RemoveReceiptButton({ transactionId }: { transactionId: string }) {
  return (
    <form action={async () => { await removeReceipt(transactionId); }}>
      <button type="submit" className="text-sm font-medium text-rose-600 hover:underline">
        Remove receipt
      </button>
    </form>
  );
}
