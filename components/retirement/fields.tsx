"use client";

// Secondary inputs for the retirement and ESI tools, styled to match
// SliderField. Primary numeric fields on the pages use SliderField itself;
// these cover dates, years + months, toggles, button groups and plain
// number boxes where a slider adds nothing.

import { useId, type ReactNode } from "react";

const labelCls = "text-sm font-medium text-ink block mb-1.5";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";
const hintCls = "text-xs text-charcoal/50 mt-1";

export function NumberInput({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className={inputCls}
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            const lo = Math.max(min, n);
            onChange(max !== undefined ? Math.min(max, lo) : lo);
          }}
        />
        {suffix && <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>}
      </div>
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

export function DateInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input id={id} type="date" className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

// Years + months, stored as decimal years (3 years 6 months = 3.5).
export function YearsMonthsInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: ReactNode;
}) {
  const whole = Math.floor(value);
  const monthsPart = Math.round((value - whole) * 12);
  const set = (y: number, m: number) => onChange(Math.max(0, y) + Math.min(11, Math.max(0, m)) / 12);
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div className="flex items-center gap-2">
        <input
          aria-label={`${label}, years`}
          type="number"
          min={0}
          max={45}
          className={`${inputCls} w-20`}
          value={whole}
          onChange={(e) => set(Number(e.target.value) || 0, monthsPart)}
        />
        <span className="text-xs text-charcoal/50">years</span>
        <input
          aria-label={`${label}, months`}
          type="number"
          min={0}
          max={11}
          className={`${inputCls} w-20`}
          value={monthsPart}
          onChange={(e) => set(whole, Number(e.target.value) || 0)}
        />
        <span className="text-xs text-charcoal/50">months</span>
      </div>
      {hint && <p className={hintCls}>{hint}</p>}
    </fieldset>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-accent"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
      </div>
      {hint && <p className={`${hintCls} pl-7`}>{hint}</p>}
    </div>
  );
}

// Button group in the same style as the Gratuity Calculator's category picker.
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: ReactNode;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-2 rounded-md border text-sm ${
              value === o.value
                ? "bg-accentTint border-accent text-ink"
                : "bg-white text-charcoal/70 border-slate-300 hover:border-slate-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className={hintCls}>{hint}</p>}
    </fieldset>
  );
}

export function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <select id={id} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Groups inputs under a small heading inside the inputs column.
export function InputGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="text-lg">{title}</h2>
      {children}
    </section>
  );
}
