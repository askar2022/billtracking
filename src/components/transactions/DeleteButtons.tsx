"use client";

import { useState } from "react";
import { deleteTransaction, removeReceipt } from "@/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={async () => { await deleteTransaction(id); }} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-600">Delete this record?</span>
      <button
        type="submit"
        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Yes, delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full border border-border px-4 py-2 text-sm"
      >
        Keep
      </button>
    </form>
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
