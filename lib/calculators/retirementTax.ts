// Income tax helper for the Retirement & Statutory Deductions Calculator.
//
// Scope: resident individual below 60, salary/pension income only.
// Slabs, standard deduction and rebate are for Tax Year 2026-27, which
// Budget 2026 left unchanged from FY 2025-26. Surcharge is applied
// without marginal relief, so tax on very large lump sums is a slight
// over-estimate. This is an estimate, not a filing-grade computation.

export type TaxRegime = "new" | "old";

interface Slab {
  upTo: number; // upper bound of the slab (inclusive)
  rate: number; // tax rate inside the slab
}

// New regime slabs (Tax Year 2026-27)
const NEW_SLABS: Slab[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

// Old regime slabs (individual below 60)
const OLD_SLABS: Slab[] = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

export const STANDARD_DEDUCTION: Record<TaxRegime, number> = {
  new: 75000,
  old: 50000,
};

// Taxable income up to which the full rebate wipes out tax.
const REBATE_LIMIT: Record<TaxRegime, number> = {
  new: 1200000,
  old: 500000,
};

const CESS_RATE = 0.04;

function slabTax(taxable: number, slabs: Slab[]): number {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (taxable <= lower) break;
    const amountInSlab = Math.min(taxable, slab.upTo) - lower;
    tax += amountInSlab * slab.rate;
    lower = slab.upTo;
  }
  return tax;
}

function surchargeRate(taxable: number, regime: TaxRegime): number {
  if (taxable > 50000000) return regime === "new" ? 0.25 : 0.37;
  if (taxable > 20000000) return 0.25;
  if (taxable > 10000000) return 0.15;
  if (taxable > 5000000) return 0.1;
  return 0;
}

export interface TaxInput {
  grossIncome: number; // annual salary or pension income
  regime: TaxRegime;
  deductionsBothRegimes?: number; // e.g. employer NPS under 80CCD(2)
  deductionsOldRegimeOnly?: number; // e.g. 80C, 80CCD(1B)
}

export function incomeTax(input: TaxInput): number {
  const { grossIncome, regime } = input;
  const both = input.deductionsBothRegimes ?? 0;
  const oldOnly = regime === "old" ? input.deductionsOldRegimeOnly ?? 0 : 0;

  const taxable = Math.max(
    0,
    grossIncome - STANDARD_DEDUCTION[regime] - both - oldOnly
  );

  let tax = slabTax(taxable, regime === "new" ? NEW_SLABS : OLD_SLABS);

  if (taxable <= REBATE_LIMIT[regime]) {
    tax = 0;
  } else if (regime === "new") {
    // Marginal relief: tax can't exceed the income above ₹12 lakh.
    tax = Math.min(tax, taxable - REBATE_LIMIT.new);
  }

  tax += tax * surchargeRate(taxable, regime);
  tax += tax * CESS_RATE;
  return Math.round(tax);
}

// Extra tax caused by adding `extra` on top of `base` income.
export function incrementalTax(
  base: number,
  extra: number,
  regime: TaxRegime
): number {
  if (extra <= 0) return 0;
  return (
    incomeTax({ grossIncome: base + extra, regime }) -
    incomeTax({ grossIncome: base, regime })
  );
}

// Effective rate on the next ₹10,000 of income (used for PF interest tax).
export function marginalRate(input: TaxInput): number {
  const step = 10000;
  const now = incomeTax(input);
  const next = incomeTax({ ...input, grossIncome: input.grossIncome + step });
  return Math.max(0, (next - now) / step);
}
