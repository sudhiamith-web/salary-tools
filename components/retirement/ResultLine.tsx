"use client";

// A .ledger-row (label ⋯⋯ value) with an optional sub-line and an
// expandable "How is this calculated?" note.
// tone: "gain" → text-ledger, "loss" → text-rust (financial meaning only).

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
  const toneCls = tone === "gain" ? "text-ledger" : tone === "loss" ? "text-rust" : "";
  return (
    <div>
      <div className="ledger-row">
        <span className="label">{label}</span>
        <span className="fill" />
        <span className={`value ${toneCls}`}>{value}</span>
      </div>
      {sub && <p className="text-xs text-charcoal/50 -mt-1 mb-1">{sub}</p>}
      {how && (
        <details className="text-xs text-charcoal/60 mb-2 print:hidden">
          <summary className="cursor-pointer text-accent hover:text-accentDark">How is this calculated?</summary>
          <div className="mt-1.5 space-y-1.5 leading-relaxed">{how}</div>
        </details>
      )}
    </div>
  );
}
