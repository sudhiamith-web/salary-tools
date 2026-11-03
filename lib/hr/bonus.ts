// Statutory bonus under the Code on Wages, 2019 (bonus chapter).
// - Eligibility: wages (basic + DA) up to ₹21,000 a month — S.O. 4711(E), 25 Aug 2026,
//   effective 21 Nov 2025 — and at least 30 working days in the accounting year.
// - Calculation ceiling: ₹7,000 a month or the applicable minimum wage, whichever
//   is higher — S.O. 4710(E), 25 Aug 2026. Wages below the ceiling use actual wages.
// - Rate: minimum 8.33% (or ₹100, whichever is higher), maximum 20%.
// - Payment: within 8 months of the close of the accounting year.
// Verified November 2026.

export const BONUS_ELIGIBILITY_CEILING = 21000;
export const BONUS_CALC_FLOOR = 7000;
export const BONUS_MIN_RATE = 8.33;
export const BONUS_MAX_RATE = 20;
export const BONUS_MIN_AMOUNT = 100;
export const MIN_DAYS_WORKED = 30;

export interface BonusInputs {
  monthlyWages: number;
  minimumWage: number; // applicable minimum wage per month (0 if unknown)
  daysWorked: number;
  daysInYear: number;
  ratePct: number;
}

export interface BonusResult {
  eligible: boolean;
  reason: string;
  calcBase: number; // monthly base used
  annualBase: number;
  bonus: number;
  minBonus: number;
  maxBonus: number;
}

export function calculateBonus(i: BonusInputs): BonusResult {
  const n = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);
  const ceiling = Math.max(BONUS_CALC_FLOOR, n(i.minimumWage));
  const calcBase = Math.min(n(i.monthlyWages), ceiling);
  const share = Math.min(1, n(i.daysWorked) / Math.max(1, n(i.daysInYear)));
  const annualBase = calcBase * 12 * share;
  const rate = Math.min(BONUS_MAX_RATE, Math.max(BONUS_MIN_RATE, n(i.ratePct)));
  const at = (r: number) => Math.max(BONUS_MIN_AMOUNT, (annualBase * r) / 100);
  let eligible = true;
  let reason = `Wages of ₹${Math.round(n(i.monthlyWages)).toLocaleString("en-IN")} are within the ₹21,000 eligibility ceiling.`;
  if (n(i.monthlyWages) > BONUS_ELIGIBILITY_CEILING) {
    eligible = false;
    reason = "Wages are above the ₹21,000 a month eligibility ceiling.";
  } else if (n(i.daysWorked) < MIN_DAYS_WORKED) {
    eligible = false;
    reason = "Fewer than 30 working days in the accounting year.";
  }
  return {
    eligible,
    reason,
    calcBase,
    annualBase,
    bonus: eligible ? at(rate) : 0,
    minBonus: eligible ? at(BONUS_MIN_RATE) : 0,
    maxBonus: eligible ? at(BONUS_MAX_RATE) : 0,
  };
}

/** Accounting year end (yyyy-mm-dd) → payment deadline, 8 months later (month end). */
export function bonusDeadline(yearEndIso: string): string {
  const [y, m] = yearEndIso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + 8 + 1, 0));
  return d.toISOString().slice(0, 10);
}

export const DEFAULT_BONUS: BonusInputs = { monthlyWages: 18000, minimumWage: 0, daysWorked: 365, daysInYear: 365, ratePct: 8.33 };

export const BULK_HEADERS = ["employee_id", "monthly_wages", "minimum_wage", "days_worked"];
export const BULK_SAMPLE = [
  ["EMP-201", "18000", "14000", "365"],
  ["EMP-202", "24000", "14000", "365"],
  ["EMP-203", "12000", "14000", "120"],
];
