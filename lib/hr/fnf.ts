// Full and final settlement.
// - Payment deadline: Code on Wages, 2019, s.17(2) — within two working days of
//   removal, dismissal, retrenchment or resignation.
// - Gratuity: Code on Social Security, 2020 — 15 days' wages per completed year
//   (26-day month); 5 years' service, or 1 year for fixed-term employees.
//   A final part-year of more than six months counts as a full year.
// - Tax: gratuity and leave encashment are exempt up to statutory limits
//   (₹20 lakh and ₹25 lakh, non-government). The TDS figure is a rough estimate.
// Verified November 2026. Re-check limits after each Budget.

import { parseIso, toIso } from "./format";

export const GRATUITY_CAP = 2000000;
export const GRATUITY_TAX_FREE = 2000000;
export const LEAVE_ENCASH_TAX_FREE = 2500000;

export type WeekOff = "sun" | "satSun";

export interface FnfInputs {
  doj: string; // yyyy-mm-dd
  lwd: string;
  monthlyGross: number;
  wages: number; // monthly wages under the Labour Codes (for gratuity / leave)
  unpaidDays: number;
  monthDays: number; // divisor for unpaid salary (30 or actual days)
  leaveDays: number;
  leaveBasis: "wages" | "gross";
  leaveDivisor: 30 | 26;
  noticeRequired: number;
  noticeServed: number;
  recoverNotice: boolean;
  fixedTerm: boolean;
  otherEarnings: number;
  otherDeductions: number;
  weekOff: WeekOff;
  holidays: string[]; // yyyy-mm-dd
  tdsRatePct: number; // marginal slab, for the estimate only
}

export interface FnfResult {
  service: { years: number; months: number; days: number; countedYears: number };
  gratuityEligible: boolean;
  gratuity: number;
  salary: number;
  leaveEncashment: number;
  noticeShortfallDays: number;
  noticeRecovery: number;
  otherEarnings: number;
  otherDeductions: number;
  grossPayable: number;
  tdsEstimate: number;
  netPayable: number;
  dueDate: string;
  error?: string;
}

function serviceBetween(doj: Date, lwd: Date) {
  let y = lwd.getUTCFullYear() - doj.getUTCFullYear();
  let m = lwd.getUTCMonth() - doj.getUTCMonth();
  let d = lwd.getUTCDate() - doj.getUTCDate() + 1; // inclusive of the last day
  if (d < 0) {
    m -= 1;
    d += new Date(Date.UTC(lwd.getUTCFullYear(), lwd.getUTCMonth(), 0)).getUTCDate();
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  return { years: Math.max(0, y), months: Math.max(0, m), days: Math.max(0, d) };
}

export function addWorkingDays(fromIso: string, n: number, weekOff: WeekOff, holidays: string[]): string {
  const d = parseIso(fromIso);
  if (!d) return "";
  const hol = new Set(holidays);
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    const off = dow === 0 || (weekOff === "satSun" && dow === 6) || hol.has(toIso(d));
    if (!off) left--;
  }
  return toIso(d);
}

export function calculateFnf(i: FnfInputs): FnfResult {
  const doj = parseIso(i.doj);
  const lwd = parseIso(i.lwd);
  const blank: FnfResult = {
    service: { years: 0, months: 0, days: 0, countedYears: 0 },
    gratuityEligible: false,
    gratuity: 0,
    salary: 0,
    leaveEncashment: 0,
    noticeShortfallDays: 0,
    noticeRecovery: 0,
    otherEarnings: 0,
    otherDeductions: 0,
    grossPayable: 0,
    tdsEstimate: 0,
    netPayable: 0,
    dueDate: "",
  };
  if (!doj || !lwd) return { ...blank, error: "Enter both dates as yyyy-mm-dd" };
  if (lwd < doj) return { ...blank, error: "The last working day is before the joining date" };
  const n = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

  const s = serviceBetween(doj, lwd);
  const countedYears = s.years + (s.months >= 6 && (s.months > 6 || s.days > 0) ? 1 : 0);
  const gratuityEligible = i.fixedTerm ? s.years >= 1 : s.years >= 5;
  const gratuity = gratuityEligible ? Math.min(GRATUITY_CAP, (n(i.wages) * 15 * countedYears) / 26) : 0;

  const salary = (n(i.monthlyGross) / Math.max(1, n(i.monthDays))) * n(i.unpaidDays);
  const leaveBase = i.leaveBasis === "wages" ? n(i.wages) : n(i.monthlyGross);
  const leaveEncashment = (leaveBase / i.leaveDivisor) * n(i.leaveDays);
  const noticeShortfallDays = Math.max(0, n(i.noticeRequired) - n(i.noticeServed));
  const noticeRecovery = i.recoverNotice ? (n(i.monthlyGross) / 30) * noticeShortfallDays : 0;

  const grossPayable = salary + leaveEncashment + gratuity + n(i.otherEarnings);
  const taxable =
    salary + n(i.otherEarnings) + Math.max(0, leaveEncashment - LEAVE_ENCASH_TAX_FREE) + Math.max(0, gratuity - GRATUITY_TAX_FREE);
  const tdsEstimate = Math.max(0, taxable * (n(i.tdsRatePct) / 100) * 1.04);
  const netPayable = grossPayable - noticeRecovery - n(i.otherDeductions) - tdsEstimate;

  return {
    service: { ...s, countedYears },
    gratuityEligible,
    gratuity,
    salary,
    leaveEncashment,
    noticeShortfallDays,
    noticeRecovery,
    otherEarnings: n(i.otherEarnings),
    otherDeductions: n(i.otherDeductions),
    grossPayable,
    tdsEstimate,
    netPayable,
    dueDate: addWorkingDays(i.lwd, 2, i.weekOff, i.holidays),
  };
}

export const DEFAULT_FNF: FnfInputs = {
  doj: "2021-07-01",
  lwd: "2026-10-30",
  monthlyGross: 70000,
  wages: 35000,
  unpaidDays: 30,
  monthDays: 30,
  leaveDays: 18,
  leaveBasis: "wages",
  leaveDivisor: 30,
  noticeRequired: 60,
  noticeServed: 45,
  recoverNotice: true,
  fixedTerm: false,
  otherEarnings: 0,
  otherDeductions: 0,
  weekOff: "satSun",
  holidays: [],
  tdsRatePct: 0,
};

export const BULK_HEADERS = [
  "employee_id",
  "date_of_joining",
  "last_working_day",
  "monthly_gross",
  "wages",
  "unpaid_days",
  "leave_days",
  "notice_required_days",
  "notice_served_days",
  "fixed_term",
];
export const BULK_SAMPLE = [
  ["EMP-101", "2021-07-01", "2026-10-30", "70000", "35000", "30", "18", "60", "45", "N"],
  ["EMP-102", "2025-04-01", "2026-10-30", "42000", "24000", "30", "6", "30", "30", "Y"],
];
