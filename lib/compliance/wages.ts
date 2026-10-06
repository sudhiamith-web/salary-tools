import type { RateUnit, SkillLevel, WageRow, WageSchedule } from "./types";

/**
 * The Code on Wages (Central) Rules, 2026 convert a daily rate to monthly by
 * multiplying by 26 (and hourly = daily ÷ 8). A state notification can use a
 * different divisor; set it on the notification in Studio when it does.
 */
export const DEFAULT_MONTHLY_DIVISOR = 26;

export const SKILL_LABELS: Record<SkillLevel, string> = {
  unskilled: "Unskilled",
  "semi-skilled": "Semi-skilled",
  skilled: "Skilled",
  "highly-skilled": "Highly skilled",
  "not-specified": "Not classified",
};

export const SKILL_ORDER: SkillLevel[] = [
  "unskilled",
  "semi-skilled",
  "skilled",
  "highly-skilled",
  "not-specified",
];

export interface ResolvedRate {
  basic: number;
  vda: number;
  total: number; // in the schedule's own unit
  daily: number;
  monthly: number;
  hourly: number;
}

export function vdaFor(schedule: Pick<WageSchedule, "vdaByZone">, row: Pick<WageRow, "zone" | "vdaOverride">): number {
  if (typeof row.vdaOverride === "number") return row.vdaOverride;
  const z = schedule.vdaByZone?.find((v) => v.zone === row.zone);
  return z?.vda ?? 0;
}

export function resolveRate(
  unit: RateUnit,
  basic: number,
  vda: number,
  divisor: number = DEFAULT_MONTHLY_DIVISOR
): ResolvedRate {
  const total = (basic || 0) + (vda || 0);
  const daily = unit === "day" ? total : total / divisor;
  const monthly = unit === "month" ? total : total * divisor;
  return { basic, vda, total, daily, monthly, hourly: daily / 8 };
}

export function resolveRow(
  schedule: Pick<WageSchedule, "unit" | "vdaByZone">,
  row: Pick<WageRow, "zone" | "basic" | "vdaOverride">,
  divisor?: number
): ResolvedRate {
  return resolveRate(schedule.unit, row.basic, vdaFor(schedule, row), divisor ?? DEFAULT_MONTHLY_DIVISOR);
}

/** Lowest and highest monthly rate per skill level across all schedules (for hub cards). */
export function skillRange(
  schedules: Pick<WageSchedule, "unit" | "vdaByZone" | "rows">[],
  divisor?: number
): Partial<Record<SkillLevel, { min: number; max: number }>> {
  const out: Partial<Record<SkillLevel, { min: number; max: number }>> = {};
  for (const s of schedules) {
    for (const r of s.rows ?? []) {
      const m = resolveRow(s, r, divisor).monthly;
      if (!m) continue;
      const cur = out[r.skill];
      out[r.skill] = cur ? { min: Math.min(cur.min, m), max: Math.max(cur.max, m) } : { min: m, max: m };
    }
  }
  return out;
}

/* ---------------- Compliance check ---------------- */

export interface CheckInput {
  payBasis: "monthly" | "daily";
  /** Basic + DA + retaining allowance (the Code's "wages"), per month or per day. */
  wageComponents: number;
  /** Everything else the employee is paid (HRA, conveyance, special allowance...). Optional. */
  otherAllowances?: number;
  minimum: ResolvedRate;
}

export interface CheckResult {
  deemedWage: number; // after the 50% add-back, in payBasis unit
  addBack: number; // amount added back under the 50% rule
  required: number; // minimum in payBasis unit
  shortfall: number; // 0 when compliant
  compliant: boolean;
  annualShortfall: number;
}

/**
 * Simplified check under the Code on Wages, 2019:
 * - "Wages" = basic + DA + retaining allowance.
 * - If excluded payments exceed 50% of total remuneration, the excess is
 *   added back to wages.
 * The deemed wage is compared to the notified minimum.
 */
export function checkMinimumWage(input: CheckInput, divisor = DEFAULT_MONTHLY_DIVISOR): CheckResult {
  const wages = Math.max(0, input.wageComponents || 0);
  const other = Math.max(0, input.otherAllowances || 0);
  const total = wages + other;
  const addBack = total > 0 ? Math.max(0, other - total / 2) : 0;
  const deemedWage = wages + addBack;
  const required = input.payBasis === "monthly" ? input.minimum.monthly : input.minimum.daily;
  const shortfall = Math.max(0, required - deemedWage);
  const perYear = input.payBasis === "monthly" ? 12 : divisor * 12;
  return {
    deemedWage,
    addBack,
    required,
    shortfall,
    compliant: shortfall < 0.005,
    annualShortfall: shortfall * perYear,
  };
}
