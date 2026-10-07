"use client";

// Small, dependency-free input controls for the calculator.
// If your shared SliderField fits these props, you can swap it in.

import { useId, type ReactNode } from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
  slider?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  hint,
  slider = false,
}: NumberFieldProps) {
  const id = useId();
  const handle = (raw: string) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    const lo = Math.max(min, n);
    onChange(max !== undefined ? Math.min(max, lo) : lo);
  };
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handle(e.target.value)}
        />
        {suffix && <span className="whitespace-nowrap text-sm text-slate-500">{suffix}</span>}
      </div>
      {slider && max !== undefined && (
        <input
          type="range"
          aria-label={label}
          className="w-full accent-slate-700"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handle(e.target.value)}
        />
      )}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function DateField({
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
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type="date"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// Years + months entry stored as decimal years.
export function YearsMonthsField({
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
  const id = useId();
  const whole = Math.floor(value);
  const monthsPart = Math.round((value - whole) * 12);
  const set = (y: number, m: number) =>
    onChange(Math.max(0, y) + Math.min(11, Math.max(0, m)) / 12);
  return (
    <fieldset className="space-y-1">
      <legend className="block text-sm font-medium text-slate-800">{label}</legend>
      <div className="flex items-center gap-2">
        <input
          id={`${id}-y`}
          aria-label={`${label} — years`}
          type="number"
          min={0}
          max={45}
          className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          value={whole}
          onChange={(e) => set(Number(e.target.value) || 0, monthsPart)}
        />
        <span className="text-sm text-slate-500">years</span>
        <input
          id={`${id}-m`}
          aria-label={`${label} — months`}
          type="number"
          min={0}
          max={11}
          className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          value={monthsPart}
          onChange={(e) => set(whole, Number(e.target.value) || 0)}
        />
        <span className="text-sm text-slate-500">months</span>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
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
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-1 h-4 w-4 accent-slate-700"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={id} className="text-sm text-slate-800">
          {label}
        </label>
      </div>
      {hint && <p className="pl-7 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

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
    <fieldset className="space-y-1">
      <legend className="block text-sm font-medium text-slate-800">{label}</legend>
      <div className="inline-flex flex-wrap rounded-md border border-slate-300 p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
              value === o.value ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </fieldset>
  );
}

export function SelectField({
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
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
