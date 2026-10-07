// Number formatting for the retirement and statutory tools.

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function rupees(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}₹${inr.format(Math.round(Math.abs(value)))}`;
}

// Short form for large amounts: ₹1.25 Cr, ₹48.6 L.
export function rupeesShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  return rupees(value);
}

export function years(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/, "")} yrs`;
}
