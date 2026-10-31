"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteTransaction, removeReceipt } from "@/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={async () => { await deleteTransaction(id); }} className="flex flex-wrap items-center gap-2">
      <button
        type="submit"
        className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Yes, delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium"
      >
        Keep
      </button>
    </form>
  );
}

export function TransactionRowActions({ id }: { id: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/transactions/${id}/edit`}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Edit
      </Link>
      <DeleteTransactionButton id={id} />
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
