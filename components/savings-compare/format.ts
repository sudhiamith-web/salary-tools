// Formatting and colours for the savings comparison tool.
// Route colours are data colours only. ledger/rust stay reserved for gain/loss.

import type { RouteKey } from "@/lib/calculators/savingsCompare";

export const ROUTE_COLORS: Record<RouteKey, string> = {
  epfEmp: "#334155",
  epfEr: "#64748B",
  vpf: "#2563EB",
  ppf: "#D97706",
  npsOwn: "#0E7490",
  npsEmp: "#06B6D4",
  mf: "#DB2777",
};

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function rupees(value: number, prefix = "₹"): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${prefix}${inr.format(Math.round(Math.abs(value)))}`;
}

// ₹1.25 Cr, ₹48.6 L
export function rupeesShort(value: number, prefix = "₹"): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}${prefix}${(abs / 1e7).toFixed(abs >= 1e9 ? 0 : 2)} Cr`;
  if (abs >= 1e5) return `${sign}${prefix}${(abs / 1e5).toFixed(1)} L`;
  return rupees(value, prefix);
}
