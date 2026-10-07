// Labour Welfare Fund (LWF) contribution logic.
//
// LWF is a state levy. Amounts and frequency differ by state and some
// states don't levy it at all. Until the verified state data from Sanity
// is wired in (see lib/data/stateDeductions.ts), the user enters the
// amounts shown on their payslip.

export type LwfFrequency = "monthly" | "half-yearly" | "yearly";

const PERIODS_PER_YEAR: Record<LwfFrequency, number> = {
  monthly: 12,
  "half-yearly": 2,
  yearly: 1,
};

export interface LwfResult {
  employeeAnnual: number;
  employerAnnual: number;
  totalAnnual: number;
  employeeMonthlyEquivalent: number;
}

export function computeLwf(params: {
  employeeAmount: number; // per deduction cycle
  employerAmount: number; // per deduction cycle
  frequency: LwfFrequency;
}): LwfResult {
  const periods = PERIODS_PER_YEAR[params.frequency];
  const employeeAnnual = Math.max(0, params.employeeAmount) * periods;
  const employerAnnual = Math.max(0, params.employerAmount) * periods;
  return {
    employeeAnnual,
    employerAnnual,
    totalAnnual: employeeAnnual + employerAnnual,
    employeeMonthlyEquivalent: employeeAnnual / 12,
  };
}
