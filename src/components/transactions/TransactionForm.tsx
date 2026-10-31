"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createTransaction,
  updateTransaction,
  type TransactionActionState,
} from "@/actions/transactions";
import { TYPE_LABELS, type TransactionType } from "@/lib/constants";
import { toDateInput } from "@/lib/dates";

type Option = { id: string; name: string; isOverhead?: boolean };

type Existing = {
  id: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  vendor?: string | null;
  payer?: string | null;
  paidBy?: string | null;
  notes?: string | null;
  productId?: string | null;
  categoryId?: string | null;
  receiptName?: string | null;
};

const initial: TransactionActionState = {};

export function TransactionForm({
  products,
  categories,
  transaction,
}: {
  products: Option[];
  categories: Option[];
  transaction?: Existing;
}) {
  const action = transaction
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [type, setType] = useState<TransactionType>(
    (transaction?.type as TransactionType) ?? "income",
  );

  return (
    <form action={formAction} className="card mx-auto max-w-3xl p-5 sm:p-6">
      <input type="hidden" name="type" value={type} />

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(TYPE_LABELS) as TransactionType[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              type === value
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-border text-slate-600 hover:bg-slate-50"
            }`}
          >
            {TYPE_LABELS[value]}
          </button>
        ))}
      </div>

      {state.error ? <p className="mb-4 help">{state.error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="date">Payment date</label>
          <input
            id="date"
            name="date"
            type="date"
            className="input"
            required
            defaultValue={transaction?.date ?? toDateInput(new Date())}
          />
          {state.fieldErrors?.date ? <p className="help">{state.fieldErrors.date}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="amount">Amount (USD)</label>
          <input
            id="amount"
            name="amount"
            className="input"
            inputMode="decimal"
            placeholder="0.00"
            required
            defaultValue={transaction?.amount ?? ""}
          />
          {state.fieldErrors?.amount ? <p className="help">{state.fieldErrors.amount}</p> : null}
        </div>

        <div className="field sm:col-span-2">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            name="description"
            className="input"
            placeholder={
              type === "expense"
                ? "Vercel, Android tablets, subscription payment"
                : "What this payment is for"
            }
            required
            defaultValue={transaction?.description ?? ""}
          />
          {state.fieldErrors?.description ? (
            <p className="help">{state.fieldErrors.description}</p>
          ) : null}
        </div>

        {type === "income" ? (
          <>
            <div className="field">
              <label htmlFor="productId">App / product</label>
              <select
                id="productId"
                name="productId"
                className="input"
                defaultValue={transaction?.productId ?? ""}
                required
              >
                <option value="">Choose an app</option>
                {products
                  .filter((product) => !product.isOverhead)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
              </select>
              {state.fieldErrors?.productId ? (
                <p className="help">{state.fieldErrors.productId}</p>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="payer">Who or what paid</label>
              <input
                id="payer"
                name="payer"
                className="input"
                placeholder="Customer, school, or payer name"
                defaultValue={transaction?.payer ?? ""}
                required
              />
              {state.fieldErrors?.payer ? <p className="help">{state.fieldErrors.payer}</p> : null}
            </div>
          </>
        ) : null}

        {type === "expense" ? (
          <>
            <div className="field">
              <label htmlFor="vendor">Vendor</label>
              <input
                id="vendor"
                name="vendor"
                className="input"
                placeholder="Vercel, Supabase, store name"
                defaultValue={transaction?.vendor ?? ""}
                required
              />
              {state.fieldErrors?.vendor ? <p className="help">{state.fieldErrors.vendor}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="categoryId">Category</label>
              <select
                id="categoryId"
                name="categoryId"
                className="input"
                defaultValue={transaction?.categoryId ?? ""}
                required
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.categoryId ? (
                <p className="help">{state.fieldErrors.categoryId}</p>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="productId">App / product</label>
              <select
                id="productId"
                name="productId"
                className="input"
                defaultValue={transaction?.productId ?? ""}
                required
              >
                <option value="">Choose an app or shared overhead</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.productId ? (
                <p className="help">{state.fieldErrors.productId}</p>
              ) : null}
              <p className="text-xs text-slate-500">
                Use Shared / LLC overhead for costs that support more than one app. This
                app does not split those costs for you.
              </p>
            </div>
            <div className="field">
              <label htmlFor="paidBy">Who paid</label>
              <select
                id="paidBy"
                name="paidBy"
                className="input"
                defaultValue={transaction?.paidBy ?? "llc"}
                required
              >
                <option value="llc">LLC</option>
                <option value="owner">Owner</option>
              </select>
              {state.fieldErrors?.paidBy ? <p className="help">{state.fieldErrors.paidBy}</p> : null}
              <p className="text-xs text-slate-500">
                If you paid with a personal card, choose Owner. Record it once as a
                business expense. Do not add a second income or expense entry.
              </p>
            </div>
          </>
        ) : null}

        <div className="field sm:col-span-2">
          <label htmlFor="notes">Note</label>
          <textarea
            id="notes"
            name="notes"
            className="input min-h-24"
            placeholder="Optional details for review or tax prep. This app does not give tax advice."
            defaultValue={transaction?.notes ?? ""}
          />
        </div>

        <div className="field sm:col-span-2">
          <label htmlFor="receipt">Receipt or invoice</label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="input"
          />
          {transaction?.receiptName ? (
            <p className="text-xs text-slate-500">
              Current file: {transaction.receiptName}. Upload a new file to replace it.
            </p>
          ) : (
            <p className="text-xs text-slate-500">JPG, PNG, WebP, or PDF, up to 8 MB.</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : transaction ? "Save changes" : "Add transaction"}
        </button>
        <Link
          href={transaction ? `/transactions/${transaction.id}` : "/transactions"}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
