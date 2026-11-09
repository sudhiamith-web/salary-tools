"use client";

// Small local controls, kept inside this tool so they can't clash with shared components.

import type { ReactNode } from "react";

export function Segmented<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`min-h-[40px] flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            o.value === value ? "bg-accent text-white" : "text-charcoal/70 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ChoiceCards<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; title: string; sub: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="space-y-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`block w-full rounded-lg px-4 py-3 text-left transition-colors ${
              on ? "border-2 border-accent bg-accent/5" : "border border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="block text-[15px] font-semibold text-ink">{o.title}</span>
            <span className="mt-0.5 block text-sm text-charcoal/60">{o.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

export function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="w-36">
        <Segmented label={label} value={value} onChange={onChange} options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
      </div>
    </div>
  );
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal/60">{title}</h3>
      {children}
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-charcoal/60">{children}</p>;
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <div className="text-xs text-charcoal/60">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-ink">{value}</div>
    </div>
  );
}

export function Note({ tone = "info", title, children }: { tone?: "info" | "warn"; title: string; children: ReactNode }) {
  const cls = tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-accent/20 bg-accent/5 text-ink";
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${cls}`}>
      <strong>{title}</strong> {children}
    </div>
  );
}

export function Bar({ label, value, pct, good }: { label: string; value: string; pct: number; good: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-semibold tabular-nums text-ink">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${label}: ${value}`}>
        <div className={`h-full rounded-full ${good ? "bg-ledger" : "bg-slate-400"}`} style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}
