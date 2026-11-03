// Salary increment planner. No statutory rules, except the cost knock-on:
// employer PF (12%, on the ₹25,000 ceiling or full wages) and gratuity
// provision (15/26 of a month's wages per year ≈ 4.81% of annual wages).

export const RATINGS = [5, 4, 3, 2, 1] as const;
export const RATING_LABEL: Record<number, string> = { 5: "5 – Outstanding", 4: "4 – Exceeds", 3: "3 – Meets", 2: "2 – Partly meets", 1: "1 – Below" };
export const BANDS = ["Below 0.9", "0.9–1.1", "Above 1.1"] as const;
export type Matrix = Record<number, [number, number, number]>; // rating → % per band

export const DEFAULT_MATRIX: Matrix = { 5: [14, 12, 9], 4: [11, 9, 7], 3: [8, 6, 4], 2: [3, 2, 0], 1: [0, 0, 0] };

export function bandOf(compa: number): 0 | 1 | 2 {
  if (compa < 0.9) return 0;
  if (compa <= 1.1) return 1;
  return 2;
}

export interface Employee {
  id: string;
  annualCtc: number;
  monthlyBasic: number; // wages (basic + DA + add-back)
  rating: number;
  compa: number;
}

export interface EmployeeResult extends Employee {
  pct: number;
  increase: number;
  newCtc: number;
  extraEmployerPf: number; // a year
  extraGratuity: number; // a year
}

const CEILING = 25000;

export function applyMatrix(e: Employee, m: Matrix, pfBasis: "ceiling" | "full"): EmployeeResult {
  const pct = (m[e.rating]?.[bandOf(e.compa)] ?? 0) / 100;
  const increase = e.annualCtc * pct;
  const newBasic = e.monthlyBasic * (1 + pct);
  const pfWage = (b: number) => (pfBasis === "ceiling" ? Math.min(b, CEILING) : b);
  return {
    ...e,
    pct,
    increase,
    newCtc: e.annualCtc + increase,
    extraEmployerPf: (pfWage(newBasic) - pfWage(e.monthlyBasic)) * 0.12 * 12,
    extraGratuity: ((newBasic - e.monthlyBasic) * 15) / 26,
  };
}

export function summarise(rows: EmployeeResult[], budgetPct: number) {
  const payroll = rows.reduce((s, r) => s + r.annualCtc, 0);
  const planned = rows.reduce((s, r) => s + r.increase, 0);
  const budget = (payroll * budgetPct) / 100;
  return {
    payroll,
    planned,
    budget,
    left: budget - planned,
    plannedPct: payroll > 0 ? planned / payroll : 0,
    extraPf: rows.reduce((s, r) => s + r.extraEmployerPf, 0),
    extraGratuity: rows.reduce((s, r) => s + r.extraGratuity, 0),
  };
}

export const BULK_HEADERS = ["employee_id", "annual_ctc", "monthly_basic", "rating", "compa_ratio"];
export const BULK_SAMPLE = [
  ["EMP-001", "1200000", "40000", "4", "0.88"],
  ["EMP-002", "1800000", "60000", "3", "1.02"],
  ["EMP-003", "960000", "32000", "5", "0.85"],
  ["EMP-004", "2400000", "80000", "3", "1.15"],
  ["EMP-005", "1500000", "50000", "2", "0.98"],
  ["EMP-006", "1080000", "36000", "4", "1.00"],
];
