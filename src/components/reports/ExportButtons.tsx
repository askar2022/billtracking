"use client";

import { useState } from "react";
import { exportSummaryCsv, exportTransactionsCsv } from "@/actions/export";
import { DownloadIcon } from "@/components/icons";
import type { SearchRecord } from "@/lib/period";

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({
  filters,
  stamp,
}: {
  filters: SearchRecord;
  stamp: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "transactions" | "summary") {
    setBusy(kind);
    setError(null);
    try {
      const csv =
        kind === "transactions"
          ? await exportTransactionsCsv(filters)
          : await exportSummaryCsv(filters);
      download(csv, `automation-llc-${kind}-${stamp}.csv`);
    } catch {
      setError("Could not export that file. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run("transactions")}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          <DownloadIcon className="h-4 w-4" />
          {busy === "transactions" ? "Exporting…" : "Export transactions"}
        </button>
        <button
          type="button"
          onClick={() => run("summary")}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <DownloadIcon className="h-4 w-4" />
          {busy === "summary" ? "Exporting…" : "Export summary"}
        </button>
      </div>
      {error ? <p className="help">{error}</p> : null}
    </div>
  );
}
