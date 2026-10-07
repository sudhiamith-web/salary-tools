// ESI (Employees' State Insurance) contribution logic.
//
// Sources: ESIC contribution rates (unchanged since 1 July 2019) and the
// ESIC clarification of 4 June 2026 confirming that (a) the Code on Social
// Security, 2020 definition of "wages" (Section 2(88)) applies from
// 21 Nov 2025, and (b) the coverage ceiling stays at ₹21,000 per month
// (₹25,000 for persons with disability).

export const ESI_WAGE_CEILING = 21000;
export const ESI_WAGE_CEILING_PWD = 25000;
export const ESI_EMPLOYEE_RATE = 0.0075;
export const ESI_EMPLOYER_RATE = 0.0325;

export type EsiWageBasis = "code" | "gross";

/**
 * Wage on which ESI coverage is tested.
 * "code": Code on Social Security wage — Basic + DA, with any excess of
 *         exclusions over 50% of total remuneration added back. This
 *         works out to the larger of Basic + DA and half of gross.
 * "gross": the pre-Code practice of testing on total gross wages.
 */
export function esiWage(
  basicDA: number,
  gross: number,
  basis: EsiWageBasis
): number {
  if (basis === "gross") return gross;
  return Math.max(basicDA, gross * 0.5);
}

export interface EsiResult {
  wage: number;
  ceiling: number;
  covered: boolean;
  employee: number;
  employer: number;
  total: number;
}

export function computeEsi(params: {
  wage: number;
  isPwd: boolean;
}): EsiResult {
  const { wage, isPwd } = params;
  const ceiling = isPwd ? ESI_WAGE_CEILING_PWD : ESI_WAGE_CEILING;
  const covered = wage > 0 && wage <= ceiling;
  // ESIC rounds each contribution up to the next rupee.
  const employee = covered ? Math.ceil(wage * ESI_EMPLOYEE_RATE) : 0;
  const employer = covered ? Math.ceil(wage * ESI_EMPLOYER_RATE) : 0;
  return { wage, ceiling, covered, employee, employer, total: employee + employer };
}
