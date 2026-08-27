// HRA exemption under Section 10(13A) of the Income Tax Act.
// Applies ONLY under the OLD tax regime — the new regime does not allow
// this exemption at all (salary is taxed on gross, no HRA carve-out).
//
// Exemption = LEAST of:
//   1. Actual HRA received
//   2. Rent paid minus 10% of basic salary
//   3. 50% of basic salary (metro cities) or 40% of basic salary (non-metro)
//
// Metro cities for this purpose: Delhi, Mumbai, Kolkata, Chennai.
// All other cities/towns are treated as non-metro (40% limit).
// This metro/non-metro split and the 50%/40%/10% figures are fixed
// structural rules under Section 10(13A), not annual Budget figures —
// unlike income tax slabs, they don't need re-verification each FY.

export interface HRAInput {
  basicAnnual: number;
  hraReceivedAnnual: number;
  rentPaidAnnual: number;
  isMetro: boolean;
}

export interface HRAResult {
  basicAnnual: number;
  hraReceivedAnnual: number;
  rentPaidAnnual: number;
  isMetro: boolean;
  tenPercentOfBasic: number;
  rentMinusTenPercent: number;
  metroLimit: number; // 50% or 40% of basic, depending on city
  exemptAnnual: number; // least of the three conditions, floored at 0
  taxableHRAAnnual: number; // the portion NOT exempt — still taxed as salary
}

export function computeHRAExemption(input: HRAInput): HRAResult {
  const tenPercentOfBasic = input.basicAnnual * 0.1;
  const rentMinusTenPercent = Math.max(0, input.rentPaidAnnual - tenPercentOfBasic);
  const metroLimit = input.basicAnnual * (input.isMetro ? 0.5 : 0.4);

  const exemptAnnual = Math.max(
    0,
    Math.min(input.hraReceivedAnnual, rentMinusTenPercent, metroLimit)
  );
  const taxableHRAAnnual = Math.max(0, input.hraReceivedAnnual - exemptAnnual);

  return {
    basicAnnual: input.basicAnnual,
    hraReceivedAnnual: input.hraReceivedAnnual,
    rentPaidAnnual: input.rentPaidAnnual,
    isMetro: input.isMetro,
    tenPercentOfBasic,
    rentMinusTenPercent,
    metroLimit,
    exemptAnnual,
    taxableHRAAnnual,
  };
}
