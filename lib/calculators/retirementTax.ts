// Income tax helper for the Retirement & Statutory Deductions Calculator.
//
// Slabs, standard deduction, rebate limit and cess are imported from
// salary.ts (new regime) and oldRegime.ts (old regime), so a Budget
// change is made once and flows here too.
//
// Two things this helper adds on top of those files, because retirement
// lump sums can be large:
//   1. New-regime marginal relief just above the ₹12 lakh rebate limit:
//      tax can't exceed the income above ₹12 lakh.
//   2. Surcharge (10% above ₹50L, 15% above ₹1Cr, 25% above ₹2Cr; above
//      ₹5Cr 37% old regime, capped at 25% new regime). Applied without
//      surcharge marginal relief, so very large amounts are slightly
//      over-taxed.
// Scope: resident individual below 60, salary or pension income.
// Verified Oct 2026: Budget 2026 left slabs, standard deduction and
// rebate unchanged for Tax Year 2026-27.

import {
  NEW_REGIME_SLABS_FY2026_27,
  STANDARD_DEDUCTION_SALARIED,
  SECTION_87A_INCOME_LIMIT,
  CESS_RATE,
} from "@/lib/calculators/salary";
import {
  OLD_REGIME_SLABS,
  OLD_REGIME_STANDARD_DEDUCTION,
  OLD_REGIME_87A_INCOME_LIMIT,
} from "@/lib/calculators/oldRegime";

export type TaxRegime = "new" | "old";

interface Slab {
  upTo: number;
  rate: number;
}

const SLABS: Record<TaxRegime, Slab[]> = {
  new: NEW_REGIME_SLABS_FY2026_27,
  old: OLD_REGIME_SLABS,
};

const STANDARD_DEDUCTION: Record<TaxRegime, number> = {
  new: STANDARD_DEDUCTION_SALARIED,
  old: OLD_REGIME_STANDARD_DEDUCTION,
};

const REBATE_LIMIT: Record<TaxRegime, number> = {
  new: SECTION_87A_INCOME_LIMIT,
  old: OLD_REGIME_87A_INCOME_LIMIT,
};

function slabTax(taxable: number, slabs: Slab[]): number {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (taxable <= lower) break;
    tax += (Math.min(taxable, slab.upTo) - lower) * slab.rate;
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
  const taxable = Math.max(0, grossIncome - STANDARD_DEDUCTION[regime] - both - oldOnly);

  let tax = slabTax(taxable, SLABS[regime]);
  if (taxable <= REBATE_LIMIT[regime]) {
    tax = 0;
  } else if (regime === "new") {
    tax = Math.min(tax, taxable - REBATE_LIMIT.new);
  }

  tax += tax * surchargeRate(taxable, regime);
  tax += tax * CESS_RATE;
  return Math.round(tax);
}

// Extra tax caused by adding `extra` on top of `base` income.
export function incrementalTax(base: number, extra: number, regime: TaxRegime): number {
  if (extra <= 0) return 0;
  return incomeTax({ grossIncome: base + extra, regime }) - incomeTax({ grossIncome: base, regime });
}

// Effective rate on the next ₹10,000 of income (used for PF interest tax).
export function marginalRate(input: TaxInput): number {
  const step = 10000;
  const now = incomeTax(input);
  const next = incomeTax({ ...input, grossIncome: input.grossIncome + step });
  return Math.max(0, (next - now) / step);
}
