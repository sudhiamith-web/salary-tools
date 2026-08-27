// Core salary & tax calculation logic, shared across calculators.
// New-regime slabs verified for FY 2026-27 (AY 2027-28) — unchanged from
// FY 2025-26 per Union Budget 2026 (no slab changes announced).
// Source-checked Aug 2026. Re-verify at the start of each new financial
// year (Budget is usually presented early February).

export const NEW_REGIME_SLABS_FY2026_27 = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.1 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.2 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

export const STANDARD_DEDUCTION_SALARIED = 75000;
export const SECTION_87A_REBATE_CAP = 60000;
export const SECTION_87A_INCOME_LIMIT = 1200000; // taxable income, post standard deduction
export const CESS_RATE = 0.04;

/** Slab-wise tax on taxable income, before cess and before 87A rebate. */
export function computeSlabTax(taxableIncome: number): number {
  let tax = 0;
  let lastCap = 0;
  for (const slab of NEW_REGIME_SLABS_FY2026_27) {
    if (taxableIncome <= lastCap) break;
    const taxableInSlab = Math.min(taxableIncome, slab.upTo) - lastCap;
    tax += taxableInSlab * slab.rate;
    lastCap = slab.upTo;
  }
  return tax;
}

/**
 * New-regime annual tax liability for a salaried individual.
 * Does NOT yet implement surcharge (income > ₹50L) or marginal relief
 * near the ₹12L rebate threshold — flagged as a known simplification.
 */
export function computeNewRegimeTax(grossAnnualIncome: number): {
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
} {
  const taxableIncome = Math.max(0, grossAnnualIncome - STANDARD_DEDUCTION_SALARIED);
  const slabTax = computeSlabTax(taxableIncome);
  const rebate =
    taxableIncome <= SECTION_87A_INCOME_LIMIT
      ? Math.min(slabTax, SECTION_87A_REBATE_CAP)
      : 0;
  const taxAfterRebate = Math.max(0, slabTax - rebate);
  const cess = taxAfterRebate * CESS_RATE;
  const totalTax = taxAfterRebate + cess;
  return { taxableIncome, slabTax, rebate, taxAfterRebate, cess, totalTax };
}

export interface InHandSalaryInput {
  annualCTC: number;
  basicPercentOfCTC: number; // typically 40-50%
  employerPFRate: number; // typically 12% of basic, capped in practice — kept simple here
  professionalTaxAnnual: number; // state-dependent; user-editable, default is an approximation
}

export interface InHandSalaryResult {
  annualCTC: number;
  basicAnnual: number;
  employerPFAnnual: number;
  employeePFAnnual: number;
  grossAnnualIncome: number; // CTC minus employer PF (employer PF is a CTC component, not paid to employee)
  incomeTax: ReturnType<typeof computeNewRegimeTax>;
  professionalTaxAnnual: number;
  netAnnualInHand: number;
  netMonthlyInHand: number;
}

export function computeInHandSalary(input: InHandSalaryInput): InHandSalaryResult {
  const basicAnnual = input.annualCTC * (input.basicPercentOfCTC / 100);
  const employerPFAnnual = basicAnnual * (input.employerPFRate / 100);
  const employeePFAnnual = employerPFAnnual; // standard symmetric employee contribution

  // Employer PF is part of CTC but never reaches the employee's account.
  const grossAnnualIncome = input.annualCTC - employerPFAnnual;

  const incomeTax = computeNewRegimeTax(grossAnnualIncome);

  const netAnnualInHand =
    grossAnnualIncome - employeePFAnnual - incomeTax.totalTax - input.professionalTaxAnnual;

  return {
    annualCTC: input.annualCTC,
    basicAnnual,
    employerPFAnnual,
    employeePFAnnual,
    grossAnnualIncome,
    incomeTax,
    professionalTaxAnnual: input.professionalTaxAnnual,
    netAnnualInHand,
    netMonthlyInHand: netAnnualInHand / 12,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
