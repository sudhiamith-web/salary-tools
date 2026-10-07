// Formatting helpers for the retirement tools. Full amounts use the
// site-wide formatINR from salary.ts; this adds a short form for charts
// and big totals.

import { formatINR } from "@/lib/calculators/salary";

export { formatINR };

// ₹1.25 Cr, ₹48.6 L, or the full amount below ₹1 lakh.
export function rupeesShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  return formatINR(value);
}

export function years(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/, "")} yrs`;
}
