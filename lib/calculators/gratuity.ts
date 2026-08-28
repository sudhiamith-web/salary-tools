// Gratuity calculation under the Payment of Gratuity Act, 1972.
// Formula for employees covered under the Act:
//   Gratuity = (15 / 26) × last drawn (basic + DA) × completed years of service
// Years of service: a period of 6+ months beyond a completed year counts
// as one additional full year (standard rounding rule under the Act).
//
// Tax exemption under Section 10(10): for non-government employees, the
// exempt amount is the LEAST of:
//   1. Actual gratuity received
//   2. ₹20,00,000 (current statutory cap, in force since 2019, unchanged
//      through Budget 2026 — verify if this figure is ever surfaced as a
//      hard limit, since Budget changes could raise it in future years)
//   3. (15/26) × last drawn salary × years of service (the formula amount)
// Government employees: gratuity is fully exempt regardless of amount —
// not modeled as a separate toggle here yet.

export const GRATUITY_EXEMPTION_CAP = 2000000;

export interface GratuityInput {
  lastDrawnMonthlySalary: number; // basic + DA
  yearsOfService: number; // can be fractional, e.g. 7.6
}

export interface GratuityResult {
  roundedYears: number;
  gratuityAmount: number;
  exemptAmount: number;
  taxableAmount: number;
  eligibleForGratuity: boolean; // Act requires 5+ years, with some exceptions (death/disability)
}

export function computeGratuity(input: GratuityInput): GratuityResult {
  const wholeYears = Math.floor(input.yearsOfService);
  const monthsRemainder = (input.yearsOfService - wholeYears) * 12;
  const roundedYears = monthsRemainder >= 6 ? wholeYears + 1 : wholeYears;

  const eligibleForGratuity = input.yearsOfService >= 5;

  const gratuityAmount = eligibleForGratuity
    ? (15 / 26) * input.lastDrawnMonthlySalary * roundedYears
    : 0;

  const exemptAmount = Math.min(gratuityAmount, GRATUITY_EXEMPTION_CAP);
  const taxableAmount = Math.max(0, gratuityAmount - exemptAmount);

  return {
    roundedYears,
    gratuityAmount,
    exemptAmount,
    taxableAmount,
    eligibleForGratuity,
  };
}
