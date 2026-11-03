const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function rupees(v: number, prefix = "₹"): string {
  if (!Number.isFinite(v)) return "–";
  return `${v < 0 ? "-" : ""}${prefix}${inr.format(Math.round(Math.abs(v)))}`;
}

export function pct(v: number, digits = 1): string {
  return Number.isFinite(v) ? `${(v * 100).toFixed(digits)}%` : "–";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** ISO yyyy-mm-dd → "Tue, 3 Nov 2026" (no timezone drift). */
export function niceDate(iso: string): string {
  const d = parseIso(iso);
  if (!d) return "–";
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function parseIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export { MONTHS, DAYS };
