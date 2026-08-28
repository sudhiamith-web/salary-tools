// Gratuity calculation under the Payment of Gratuity Act, 1972, as
// amended in practice by the four Labour Codes, which took legal effect
// on 21 November 2025 (Ministry of Labour & Employment notification).
// Verified Aug 2026. Central Rules are still being finalized state by
// state through 2026, but the Codes themselves — including the two
// provisions below — are already legally binding, not pending.
//
// Formula (unchanged by the Codes):
//   Gratuity = (15 / 26) × wage base × completed years of service
//
// Two real changes from the Labour Codes used here:
//   1. Fixed-term employees qualify after 1 year of continuous service
//      (pro-rata), vs 5 years for permanent employees. Government
//      employees receive gratuity fully tax-exempt regardless of amount.
//   2. The "50% wage rule": if allowances (HRA, special allowance, etc.)
//      exceed 50% of total monthly remuneration, the excess is added
//      back into the wage base used for gratuity — the wage base cannot
//      be structured below 50% of total pay.
//
// Tax exemption under Section 10(10) is unchanged by the Codes: for
// non-government employees, the exempt amount is the LEAST of actual
// gratuity received, ₹20,00,000 (statutory cap since 2019), or the
// formula amount.

export const GRATUITY_EXEMPTION_CAP = 2000000;

export type EmploymentCategory = "permanent" | "fixedTerm" | "government";

export interface GratuityInput {
  basicPlusDA: number;
  totalMonthlyRemuneration: number;
  yearsOfService: number;
  employmentCategory: EmploymentCategory;
}

export interface GratuityResult {
  effectiveWageBase: number;
  wageBaseAdjusted: boolean;
  roundedYears: number;
  eligibilityThresholdYears: number;
  eligibleForGratuity: boolean;
  gratuityAmount: number;
  exemptAmount: number;
  taxableAmount: number;
}

export function computeGratuity(input: GratuityInput): GratuityResult {
  let effectiveWageBase = input.basicPlusDA;
  let wageBaseAdjusted = false;
  if (input.totalMonthlyRemuneration > 0) {
    const minRequiredWageBase = input.totalMonthlyRemuneration * 0.5;
    if (effectiveWageBase < minRequiredWageBase) {
      effectiveWageBase = minRequiredWageBase;
      wageBaseAdjusted = true;
    }
  }

  const wholeYears = Math.floor(input.yearsOfService);
  const monthsRemainder = (input.yearsOfService - wholeYears) * 12;
  const roundedYears = monthsRemainder >= 6 ? wholeYears + 1 : wholeYears;

  const eligibilityThresholdYears = input.employmentCategory === "fixedTerm" ? 1 : 5;
  const eligibleForGratuity = input.yearsOfService >= eligibilityThresholdYears;

  const gratuityAmount = eligibleForGratuity
    ? (15 / 26) * effectiveWageBase * roundedYears
    : 0;

  const isGovernment = input.employmentCategory === "government";
  const exemptAmount = isGovernment
    ? gratuityAmount
    : Math.min(gratuityAmount, GRATUITY_EXEMPTION_CAP);
  const taxableAmount = Math.max(0, gratuityAmount - exemptAmount);

  return {
    effectiveWageBase,
    wageBaseAdjusted,
    roundedYears,
    eligibilityThresholdYears,
    eligibleForGratuity,
    gratuityAmount,
    exemptAmount,
    taxableAmount,
  };
}
