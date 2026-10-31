"use client";

import { useActionState, useState } from "react";
import {
  archiveProduct,
  createProduct,
  updateProduct,
  type SimpleActionState,
} from "@/actions/products";
import { formatUsd } from "@/lib/money";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  isOverhead: boolean;
  income: number;
  expense: number;
  net: number;
};

const empty: SimpleActionState = {};

export function ProductManager({ products }: { products: ProductRow[] }) {
  const [createState, createAction, creating] = useActionState(createProduct, empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form action={createAction} className="card p-5">
        <h2 className="mb-4 text-base font-semibold">Add a product</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" className="input" placeholder="ParentPickup" required />
            {createState.fieldErrors?.name ? (
              <p className="help">{createState.fieldErrors.name}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              className="input"
              placeholder="Optional"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {creating ? "Adding…" : "Add product"}
            </button>
          </div>
        </div>
        {createState.error ? <p className="mt-3 help">{createState.error}</p> : null}
        {createState.success ? (
          <p className="mt-3 text-sm text-emerald-700">{createState.success}</p>
        ) : null}
      </form>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>App / product</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Net</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {editingId === product.id ? (
                      <EditProduct
                        product={product}
                        onDone={() => setEditingId(null)}
                      />
                    ) : (
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {product.isOverhead
                            ? "Shared costs stay here. They are not split across apps."
                            : product.description}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="text-emerald-700">{formatUsd(product.income)}</td>
                  <td className="text-rose-600">{formatUsd(product.expense)}</td>
                  <td className={product.net < 0 ? "text-rose-600" : "text-slate-900"}>
                    {formatUsd(product.net, { sign: true })}
                  </td>
                  <td className="text-right">
                    {editingId === product.id ? null : (
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-700"
                          onClick={() => setEditingId(product.id)}
                        >
                          Rename
                        </button>
                        {product.isOverhead ? null : (
                          <form action={async () => { await archiveProduct(product.id); }}>
                            <button type="submit" className="text-sm font-medium text-slate-500">
                              Archive
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EditProduct({
  product,
  onDone,
}: {
  product: ProductRow;
  onDone: () => void;
}) {
  const action = updateProduct.bind(null, product.id);
  const [state, formAction, pending] = useActionState(action, empty);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-2">
      <input name="name" className="input" defaultValue={product.name} required />
      <input
        name="description"
        className="input"
        defaultValue={product.description ?? ""}
        placeholder="Optional description"
      />
      {state.fieldErrors?.name ? <p className="help">{state.fieldErrors.name}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Save
        </button>
        <button type="button" onClick={onDone} className="text-xs text-slate-500">
          Cancel
        </button>
      </div>
    </form>
  );
}
