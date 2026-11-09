// Formatting helpers for the car lease tool.

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function rupees(value: number): string {
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${inr.format(Math.round(Math.abs(value)))}`;
}

// ₹1.25 Cr, ₹14.2 L
export function rupeesShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  return rupees(value);
}
