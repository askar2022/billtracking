"use client";

import { useActionState, useState } from "react";
import {
  archiveCategory,
  createCategory,
  renameCategory,
  type SimpleActionState,
} from "@/actions/categories";

type Category = {
  id: string;
  name: string;
};

const empty: SimpleActionState = {};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [createState, createAction, creating] = useActionState(createCategory, empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form action={createAction} className="card p-5">
        <h2 className="mb-4 text-base font-semibold">Add a category</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            className="input"
            placeholder="Marketing, contractors, travel"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {creating ? "Adding…" : "Add category"}
          </button>
        </div>
        {createState.fieldErrors?.name ? (
          <p className="mt-2 help">{createState.fieldErrors.name}</p>
        ) : null}
        {createState.success ? (
          <p className="mt-2 text-sm text-emerald-700">{createState.success}</p>
        ) : null}
      </form>

      <div className="grid gap-3">
        {categories.map((category) => (
          <div key={category.id} className="card flex items-center justify-between gap-4 p-4">
            {editingId === category.id ? (
              <RenameForm category={category} onDone={() => setEditingId(null)} />
            ) : (
              <>
                <p className="font-medium">{category.name}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-700"
                    onClick={() => setEditingId(category.id)}
                  >
                    Rename
                  </button>
                  <form action={async () => { await archiveCategory(category.id); }}>
                    <button type="submit" className="text-sm font-medium text-slate-500">
                      Archive
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RenameForm({
  category,
  onDone,
}: {
  category: Category;
  onDone: () => void;
}) {
  const action = renameCategory.bind(null, category.id);
  const [state, formAction, pending] = useActionState(action, empty);

  return (
    <form action={formAction} className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <input name="name" className="input" defaultValue={category.name} required />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Save
        </button>
        <button type="button" onClick={onDone} className="text-sm text-slate-500">
          Cancel
        </button>
      </div>
      {state.fieldErrors?.name ? <p className="help">{state.fieldErrors.name}</p> : null}
    </form>
  );
}
