"use client";

// Small shared controls for the "For HR & Payroll" tools.

import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card px-6 py-5 ${className}`}>{children}</div>;
}

export function HowToUse({ steps }: { steps: string[] }) {
  return (
    <section aria-labelledby="how-to-use" className="card mb-8 px-6 py-5 print:hidden">
      <h2 id="how-to-use" className="mb-4 font-display text-lg text-ink">
        How to use this tool
      </h2>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3 text-sm text-charcoal/80">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PiiNotice({ needs }: { needs: string }) {
  return (
    <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Don’t upload employee personal data.</strong> Use employee IDs only – leave out names, PAN, Aadhaar, UAN, bank details, phone
      numbers, emails and addresses. This tool needs only {needs}. Your file is processed in your browser and is never uploaded or stored.
    </div>
  );
}

export function Segmented<T extends string | number>({
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
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium ${o.value === value ? "bg-accent text-white" : "text-charcoal/70 hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  hint?: ReactNode;
}) {
  return (
    <label className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <span className="text-sm font-medium text-ink">
        {label}
        {hint && <span className="block text-xs font-normal text-charcoal/50">{hint}</span>}
      </span>
      <span className="flex w-40 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-accent">
        {prefix && <span className="text-charcoal/50">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isNaN(n) ? 0 : n);
          }}
          className="w-full bg-transparent text-right tabular-nums outline-none"
        />
        {suffix && <span className="text-charcoal/50">{suffix}</span>}
      </span>
    </label>
  );
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 tabular-nums outline-none focus:border-accent"
      />
    </label>
  );
}

export function SelectField<T extends string>({
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
    <label className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm font-medium text-ink">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-none rounded-full transition-colors ${checked ? "bg-accent" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export function Row({ label, value, tone, strong }: { label: ReactNode; value: ReactNode; tone?: "gain" | "loss"; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-b-0 ${strong ? "font-semibold text-ink" : ""}`}>
      <span className={strong ? "" : "text-charcoal/70"}>{label}</span>
      <span className={`text-right tabular-nums font-medium ${tone === "gain" ? "text-ledger" : tone === "loss" ? "text-rust" : "text-ink"}`}>{value}</span>
    </div>
  );
}

export function Pill({ tone, children }: { tone: "ok" | "bad" | "warn" | "info"; children: ReactNode }) {
  const cls = {
    ok: "bg-green-100 text-green-800",
    bad: "bg-red-100 text-red-800",
    warn: "bg-amber-100 text-amber-900",
    info: "bg-violet-100 text-violet-800",
  }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

export function ActionButton({ children, onClick, primary }: { children: ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          : "rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent"
      }
    >
      {children}
    </button>
  );
}

export function Disclaimer() {
  return (
    <p className="text-xs text-charcoal/50">
      Estimates based on rules as of November 2026 and the inputs you give. Not legal, tax or payroll advice. Check the source notifications and
      your company policy, and get professional advice before acting on the results.
    </p>
  );
}
