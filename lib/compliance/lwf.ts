import type { LwfFrequency, LwfRule, LwfSlab } from "./types";

export const FREQUENCY_LABEL: Record<LwfFrequency, string> = {
  monthly: "Monthly",
  "half-yearly": "Half-yearly",
  yearly: "Yearly",
};

export const CYCLES_PER_YEAR: Record<LwfFrequency, number> = {
  monthly: 12,
  "half-yearly": 2,
  yearly: 1,
};

/** Pick the slab that applies to a monthly wage (and optional slab label, e.g. establishment type). */
export function pickSlab(rule: LwfRule, monthlyWage?: number, slabLabel?: string): LwfSlab | undefined {
  const slabs = rule.slabs ?? [];
  if (slabs.length === 0) return undefined;
  let pool = slabs;
  if (slabLabel) {
    const byLabel = slabs.filter((s) => s.label === slabLabel);
    if (byLabel.length) pool = byLabel;
  }
  if (monthlyWage === undefined) return pool[0];
  return (
    pool.find(
      (s) =>
        (s.wageFrom === undefined || monthlyWage >= s.wageFrom) &&
        (s.wageTo === undefined || monthlyWage <= s.wageTo)
    ) ?? pool[0]
  );
}

export interface LwfAmount {
  employee: number;
  employer: number;
  total: number;
}

/** Contribution for ONE deduction cycle (one month / half-year / year). */
export function contributionPerCycle(slab: LwfSlab | undefined, monthlyWage = 0): LwfAmount {
  if (!slab) return { employee: 0, employer: 0, total: 0 };
  let employee = 0;
  let employer = 0;
  if (slab.mode === "fixed") {
    employee = slab.employee ?? 0;
    employer = slab.employer ?? 0;
  } else {
    employee = (monthlyWage * (slab.employeePercent ?? 0)) / 100;
    employer = (monthlyWage * (slab.employerPercent ?? 0)) / 100;
    if (slab.employeeCap !== undefined) employee = Math.min(employee, slab.employeeCap);
    if (slab.employerCap !== undefined) employer = Math.min(employer, slab.employerCap);
  }
  return { employee, employer, total: employee + employer };
}

export interface LwfEstimate {
  covered: boolean;
  reason?: string;
  slab?: LwfSlab;
  perCycle: LwfAmount;
  cyclesPerYear: number;
  perEmployeeYear: LwfAmount;
  headcountYear: LwfAmount;
}

export function estimateLwf(
  rule: LwfRule,
  opts: { monthlyWage: number; headcount: number; slabLabel?: string }
): LwfEstimate {
  const zero = { employee: 0, employer: 0, total: 0 };
  const cycles = rule.frequency ? CYCLES_PER_YEAR[rule.frequency] : 0;

  if (!rule.applicable) {
    return { covered: false, reason: "This state does not levy Labour Welfare Fund.", perCycle: zero, cyclesPerYear: 0, perEmployeeYear: zero, headcountYear: zero };
  }
  if (rule.minEmployees && opts.headcount < rule.minEmployees) {
    return {
      covered: false,
      reason: `LWF applies to establishments with ${rule.minEmployees} or more employees.`,
      perCycle: zero, cyclesPerYear: cycles, perEmployeeYear: zero, headcountYear: zero,
    };
  }
  if (rule.excludedAboveWage && opts.monthlyWage > rule.excludedAboveWage) {
    return {
      covered: false,
      reason: `Employees earning above ₹${rule.excludedAboveWage.toLocaleString("en-IN")} a month are not covered.`,
      perCycle: zero, cyclesPerYear: cycles, perEmployeeYear: zero, headcountYear: zero,
    };
  }

  const slab = pickSlab(rule, opts.monthlyWage, opts.slabLabel);
  const perCycle = contributionPerCycle(slab, opts.monthlyWage);
  const perEmployeeYear = {
    employee: perCycle.employee * cycles,
    employer: perCycle.employer * cycles,
    total: perCycle.total * cycles,
  };
  const n = Math.max(0, opts.headcount);
  return {
    covered: true,
    slab,
    perCycle,
    cyclesPerYear: cycles,
    perEmployeeYear,
    headcountYear: {
      employee: perEmployeeYear.employee * n,
      employer: perEmployeeYear.employer * n,
      total: perEmployeeYear.total * n,
    },
  };
}

/** Short human summary of a slab, e.g. "₹25 + ₹75" or "0.2% (max ₹35) + 0.4% (max ₹70)". */
export function slabSummary(slab: LwfSlab): { employee: string; employer: string } {
  const r = (n?: number) => (n === undefined ? "—" : `₹${n.toLocaleString("en-IN")}`);
  if (slab.mode === "fixed") return { employee: r(slab.employee), employer: r(slab.employer) };
  const p = (pct?: number, cap?: number) =>
    `${pct ?? 0}% of wages${cap !== undefined ? ` (max ${r(cap)})` : ""}`;
  return { employee: p(slab.employeePercent, slab.employeeCap), employer: p(slab.employerPercent, slab.employerCap) };
}
