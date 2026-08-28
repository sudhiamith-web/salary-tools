// Old tax regime logic — verified Aug 2026, stable across recent Budgets
// (last changed in Budget 2023, unchanged since; Budget 2026 made no
// change to old regime). These slabs apply to individuals below 60;
// senior/super-senior citizens have separate, higher-threshold slabs
// under the old regime, NOT modeled here — a known simplification.

export const OLD_REGIME_SLABS = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

export const OLD_REGIME_STANDARD_DEDUCTION = 50000;
export const OLD_REGIME_87A_INCOME_LIMIT = 500000;
export const OLD_REGIME_87A_REBATE_CAP = 12500;
export const OLD_REGIME_CESS_RATE = 0.04;

// Common old-regime deductions, kept as a simple flat total for now.
// Section 80C is capped at ₹1,50,000 (combined with 80CCC/80CCD(1)) —
// NOT ₹2,00,000, despite what some sites claim; verify independently if
// this figure is ever surfaced to users as a hard limit in copy.
export const SECTION_80C_LIMIT = 150000;

export interface OldRegimeInput {
  grossAnnualIncome: number;
  section80CDeduction: number; // capped at SECTION_80C_LIMIT by the caller/UI
  section80DDeduction: number;
  hraExemption: number;
  otherDeductions: number; // home loan interest (24b), 80E, etc., lumped
}

export interface OldRegimeResult {
  grossAnnualIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
}

function slabTax(taxableIncome: number): number {
  let tax = 0;
  let lastCap = 0;
  for (const slab of OLD_REGIME_SLABS) {
    if (taxableIncome <= lastCap) break;
    tax += (Math.min(taxableIncome, slab.upTo) - lastCap) * slab.rate;
    lastCap = slab.upTo;
  }
  return tax;
}

export function computeOldRegimeTax(input: OldRegimeInput): OldRegimeResult {
  const cappedSection80C = Math.min(input.section80CDeduction, SECTION_80C_LIMIT);
  const totalDeductions =
    OLD_REGIME_STANDARD_DEDUCTION +
    cappedSection80C +
    input.section80DDeduction +
    input.hraExemption +
    input.otherDeductions;

  const taxableIncome = Math.max(0, input.grossAnnualIncome - totalDeductions);
  const tax = slabTax(taxableIncome);
  const rebate =
    taxableIncome <= OLD_REGIME_87A_INCOME_LIMIT
      ? Math.min(tax, OLD_REGIME_87A_REBATE_CAP)
      : 0;
  const taxAfterRebate = Math.max(0, tax - rebate);
  const cess = taxAfterRebate * OLD_REGIME_CESS_RATE;

  return {
    grossAnnualIncome: input.grossAnnualIncome,
    totalDeductions,
    taxableIncome,
    slabTax: tax,
    rebate,
    taxAfterRebate,
    cess,
    totalTax: taxAfterRebate + cess,
  };
}
