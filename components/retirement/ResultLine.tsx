"use client";

// One output line with an expandable "How is this calculated?" note.
// tone: "gain" uses the ledger token, "loss" uses rust (financial meaning only).

import type { ReactNode } from "react";

export function ResultLine({
  label,
  value,
  sub,
  how,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  how?: ReactNode;
  tone?: "gain" | "loss" | "neutral";
}) {
  const color =
    tone === "gain" ? "text-ledger" : tone === "loss" ? "text-rust" : "text-slate-900";
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-slate-700">{label}</span>
        <span className={`text-right text-base font-semibold tabular-nums ${color}`}>{value}</span>
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
      {how && (
        <details className="mt-1 text-xs text-slate-600 print:hidden">
          <summary className="cursor-pointer select-none text-slate-500 hover:text-slate-800">
            How is this calculated?
          </summary>
          <div className="mt-1 space-y-1 leading-relaxed">{how}</div>
        </details>
      )}
    </div>
  );
}
