// Retirement & Statutory Deductions engine.
//
// Pure functions, no React. Projects month by month from today to the
// retirement date and returns everything the page needs: monthly
// contributions now, career totals, what comes back at retirement
// (pre-tax and post-tax), a yearly timeline, the retirement-gap check,
// job-switch impact and warnings.
//
// Rules used (verify against sources listed on the page):
// - EPF/EPS split and ceilings: reuses computeContribution() from
//   epfWageCeiling.ts so both tools stay consistent.
// - EPF interest: 8.25% default (FY 2025-26 rate, ratified 2026).
// - EPS: pension = pensionable salary x service / 70; +2 years weightage
//   at 20+ years; service capped at 35; 4% per year reduction for early
//   pension (from 50), 4% per year increase for deferral to 60; minimum
//   ₹1,000. Under 10 years: Table D withdrawal benefit (approximated by
//   interpolating the yearly factors; EPFO now applies it month-wise).
// - NPS (non-government): PFRDA exit amendment, Dec 2025. Normal exit
//   at 60: corpus up to ₹8L fully lump sum; ₹8L–₹12L: ₹6L lump sum;
//   above ₹12L: up to 80% lump sum. Premature exit: 20% lump sum, 80%
//   annuity (full lump sum if corpus ≤ ₹5L). Only 60% of corpus is
//   tax-exempt; the excess and all annuity income are taxable.
// - Gratuity: reuses computeGratuity() from gratuity.ts so this tool and
//   the Gratuity Calculator always agree (15/26 x wage x years, 6+ months
//   rounds up, 50% wage rule, 5 years / 1 year for fixed-term, exempt up
//   to ₹20 lakh).
// - LWF: uses the verified Sanity rule for the user's state through
//   estimateLwf() from lib/compliance/lwf.ts (same logic as the LWF
//   Calculator), or the user's payslip amounts if no verified rule.
// - Leave encashment at retirement: exempt up to ₹25 lakh (also limited
//   to 10 months' salary and 30 days per year of service).
// - EPF interest on employee contributions above ₹2.5 lakh a year is
//   taxable every year.

import {
  computeContribution,
  OLD_EPF_WAGE_CEILING,
  NEW_EPF_WAGE_CEILING,
  type WageBasis,
} from "@/lib/calculators/epfWageCeiling";
import {
  incomeTax,
  incrementalTax,
  marginalRate,
  type TaxRegime,
} from "@/lib/calculators/retirementTax";
import { computeEsi, esiWage, type EsiWageBasis } from "@/lib/calculators/esi";
import { computeGratuity, GRATUITY_EXEMPTION_CAP } from "@/lib/calculators/gratuity";
import { estimateLwf, CYCLES_PER_YEAR } from "@/lib/compliance/lwf";
import type { LwfFrequency, LwfRule } from "@/lib/compliance/types";

// ---------------------------------------------------------------- constants

export const DEFAULT_EPF_RATE = 8.25;
export const EPS_EXIT_AGE = 58;
export const EPS_MIN_PENSION = 1000;
export const EPS_MAX_SERVICE = 35;
export const LEAVE_ENCASHMENT_EXEMPT_CAP = 2500000;
export const PF_INTEREST_TAX_THRESHOLD = 250000;
export const EMPLOYER_CONTRIBUTION_PERQ_LIMIT = 750000;
export const NPS_EMPLOYER_LIMIT_PCT: Record<TaxRegime, number> = {
  new: 14,
  old: 10,
};

// EPS Table D factors for completed years 1–9 (multiplied by exit wage).
const TABLE_D = [0, 1.02, 1.99, 2.98, 3.99, 5.02, 6.07, 7.13, 8.22, 9.33];

// -------------------------------------------------------------------- types

export type SalaryMode = "simple" | "detailed";
export type PfWageOption = "old-ceiling" | "new-ceiling" | "actual";

export interface RetirementInputs {
  mode: SalaryMode;
  dob: string; // yyyy-mm-dd
  retirementAge: number;
  retirementDateOverride: string; // "" = use retirementAge

  monthlyCtc: number; // simple mode
  basic: number; // detailed mode, all monthly
  da: number;
  hra: number;
  special: number;
  otherAllowances: number;
  employerPfInCtc: boolean;

  yearsAtEmployer: number;
  totalCareerYears: number; // detailed mode; simple mode uses yearsAtEmployer
  isFixedTerm: boolean;

  pfWageOption: PfWageOption;
  epsMember: boolean;
  higherPension: boolean;
  applyWageRule: boolean;
  vpfPct: number;
  existingEpfBalance: number;
  exemptTrust: boolean;
  trustRatePct: number;

  npsEmployerPct: number;
  npsVoluntaryMonthly: number;
  existingNpsBalance: number;
  npsLumpSumPct: number;

  leaveDaysAtRetirement: number;

  stateSlug: string; // matches lib/compliance/states.ts
  ptMonthly: number;
  lwfSource: "verified" | "manual";
  lwfEmployee: number;
  lwfEmployer: number;
  lwfFrequency: LwfFrequency;
  esiWageBasis: EsiWageBasis;
  isPwd: boolean;

  regime: TaxRegime;

  salaryHikePct: number;
  epfRatePct: number;
  npsReturnPct: number;
  annuityRatePct: number;
  inflationPct: number;
  postRetReturnPct: number;
  epsStartAge: number;
  lifeExpectancy: number;
  monthlyExpensesToday: number;
  jobSwitchEveryYears: number; // 0 = stay with current employer
}

export const DEFAULT_INPUTS: RetirementInputs = {
  mode: "simple",
  dob: "1990-01-01",
  retirementAge: 60,
  retirementDateOverride: "",
  monthlyCtc: 100000,
  basic: 50000,
  da: 0,
  hra: 20000,
  special: 24000,
  otherAllowances: 0,
  employerPfInCtc: true,
  yearsAtEmployer: 3,
  totalCareerYears: 8,
  isFixedTerm: false,
  pfWageOption: "new-ceiling",
  epsMember: true,
  higherPension: false,
  applyWageRule: true,
  vpfPct: 0,
  existingEpfBalance: 0,
  exemptTrust: false,
  trustRatePct: DEFAULT_EPF_RATE,
  npsEmployerPct: 0,
  npsVoluntaryMonthly: 0,
  existingNpsBalance: 0,
  npsLumpSumPct: 60,
  leaveDaysAtRetirement: 0,
  stateSlug: "karnataka",
  ptMonthly: 200,
  lwfSource: "verified",
  lwfEmployee: 0,
  lwfEmployer: 0,
  lwfFrequency: "yearly",
  esiWageBasis: "code",
  isPwd: false,
  regime: "new",
  salaryHikePct: 7,
  epfRatePct: DEFAULT_EPF_RATE,
  npsReturnPct: 10,
  annuityRatePct: 6.5,
  inflationPct: 6,
  postRetReturnPct: 7,
  epsStartAge: 58,
  lifeExpectancy: 85,
  monthlyExpensesToday: 50000,
  jobSwitchEveryYears: 0,
};

export interface MonthlyContributions {
  employeePF: number;
  vpf: number;
  employerEPF: number;
  employerEPS: number;
  npsEmployer: number;
  npsEmployee: number;
  esiEmployee: number;
  esiEmployer: number;
  pt: number;
  lwfEmployee: number; // monthly equivalent
  lwfEmployer: number; // monthly equivalent
}

export interface TimelinePoint {
  age: number;
  epf: number;
  nps: number;
  gratuity: number;
}

export interface RetirementResult {
  meta: {
    currentAge: number;
    retirementAge: number;
    retirementDate: string;
    monthsToRetirement: number;
    yearsToRetirement: number;
    deflator: number; // divide a future amount by this for today's value
  };
  salaryNow: {
    gross: number;
    basicDA: number;
    statutoryWage: number;
    ctc: number;
  };
  monthlyNow: MonthlyContributions;
  careerTotals: MonthlyContributions;
  epf: {
    corpus: number;
    employeeShare: number;
    employerShare: number;
    interest: number;
    taxFree: boolean;
    interestTaxPaidDuringWork: number;
  };
  eps: {
    kind: "pension" | "withdrawal" | "none";
    serviceYears: number;
    pensionableSalary: number;
    monthlyPension: number;
    startAge: number;
    withdrawalAmount: number;
    postTaxMonthly: number;
  };
  nps: {
    corpus: number;
    exit: "normal" | "premature" | "none";
    lumpSum: number;
    annuityCorpus: number;
    monthlyAnnuity: number;
    lumpSumTaxable: number;
    postTaxMonthly: number;
  };
  gratuity: {
    eligible: boolean;
    years: number;
    lastWage: number;
    amount: number;
    exempt: number;
    taxable: number;
  };
  leave: {
    days: number;
    amount: number;
    exempt: number;
    taxable: number;
  };
  totals: {
    lumpSumPreTax: number;
    taxOnLumpSums: number;
    lumpSumPostTax: number;
    monthlyIncomePreTax: number;
    monthlyIncomePostTax: number;
  };
  gap: {
    annualExpenseAtRetirement: number;
    yearsInRetirement: number;
    requiredCorpus: number;
    availableCorpus: number;
    shortfall: number; // negative = surplus
  };
  jobSwitch: {
    enabled: boolean;
    stints: { years: number; amount: number }[];
    total: number;
    differenceVsStaying: number;
  };
  esi: {
    coveredNow: boolean;
    wageNow: number;
    ceiling: number;
    monthsCovered: number;
    exitAge: number | null;
  };
  lwf: {
    source: "verified" | "manual";
    covered: boolean;
    reason?: string;
    employeeAnnual: number; // this year
    employerAnnual: number;
  };
  timeline: TimelinePoint[];
  warnings: string[];
}

// ------------------------------------------------------------------ helpers

function parseDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addYears(d: Date, years: number): Date {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + years);
  return r;
}

function monthsBetween(from: Date, to: Date): number {
  const m =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) -
    (to.getDate() < from.getDate() ? 1 : 0);
  return Math.max(0, m);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function tableDFactor(serviceYears: number): number {
  if (serviceYears <= 0) return 0;
  if (serviceYears >= 9) return TABLE_D[9];
  const lower = Math.floor(serviceYears);
  const frac = serviceYears - lower;
  return TABLE_D[lower] + (TABLE_D[lower + 1] - TABLE_D[lower]) * frac;
}

// Present value of a payment stream that grows at g, discounted at r,
// paid at the end of each year for n years.
function pvGrowingAnnuity(first: number, r: number, g: number, n: number): number {
  if (n <= 0 || first <= 0) return 0;
  if (Math.abs(r - g) < 1e-9) return (first * n) / (1 + r);
  return (first * (1 - Math.pow((1 + g) / (1 + r), n))) / (r - g);
}

function emptyContributions(): MonthlyContributions {
  return {
    employeePF: 0,
    vpf: 0,
    employerEPF: 0,
    employerEPS: 0,
    npsEmployer: 0,
    npsEmployee: 0,
    esiEmployee: 0,
    esiEmployer: 0,
    pt: 0,
    lwfEmployee: 0,
    lwfEmployer: 0,
  };
}

// ----------------------------------------------------------- salary basics

interface SalaryBase {
  gross: number;
  basicDA: number;
  statutoryWage: number;
  ctc: number;
}

function pfParams(inputs: RetirementInputs): {
  ceiling: number;
  pfBasis: WageBasis;
  pensionBasis: WageBasis;
} {
  return {
    ceiling:
      inputs.pfWageOption === "old-ceiling"
        ? OLD_EPF_WAGE_CEILING
        : NEW_EPF_WAGE_CEILING,
    pfBasis: inputs.pfWageOption === "actual" ? "actual" : "capped",
    pensionBasis: inputs.higherPension ? "actual" : "capped",
  };
}

function statutoryWageOf(basicDA: number, gross: number, rule: boolean): number {
  return rule ? Math.max(basicDA, gross * 0.5) : basicDA;
}

export function deriveSalary(inputs: RetirementInputs): SalaryBase {
  const { ceiling, pfBasis, pensionBasis } = pfParams(inputs);

  if (inputs.mode === "simple") {
    // Assumption: Basic + DA = 50% of CTC, employer PF and employer NPS
    // sit inside CTC. Shown to the user on the page.
    const ctc = Math.max(0, inputs.monthlyCtc);
    const basicDA = Math.round(ctc * 0.5);
    const pf = computeContribution({ actualWages: basicDA, ceiling, pfBasis, pensionBasis });
    const npsEmployer = Math.round((basicDA * inputs.npsEmployerPct) / 100);
    const employerPf = inputs.employerPfInCtc ? pf.employerTotal : 0;
    const gross = Math.max(0, ctc - employerPf - npsEmployer);
    return {
      gross,
      basicDA,
      statutoryWage: statutoryWageOf(basicDA, gross, inputs.applyWageRule),
      ctc,
    };
  }

  const basicDA = Math.max(0, inputs.basic) + Math.max(0, inputs.da);
  const gross =
    basicDA +
    Math.max(0, inputs.hra) +
    Math.max(0, inputs.special) +
    Math.max(0, inputs.otherAllowances);
  const statutoryWage = statutoryWageOf(basicDA, gross, inputs.applyWageRule);
  const pf = computeContribution({ actualWages: statutoryWage, ceiling, pfBasis, pensionBasis });
  const npsEmployer = Math.round((basicDA * inputs.npsEmployerPct) / 100);
  const ctc = gross + (inputs.employerPfInCtc ? pf.employerTotal : 0) + npsEmployer;
  return { gross, basicDA, statutoryWage, ctc };
}

// ------------------------------------------------------------------- engine

export interface CalculateOptions {
  asOf?: Date; // defaults to today; tests pass a fixed date
  lwfRule?: LwfRule | null; // verified Sanity rule for inputs.stateSlug
}

export function calculateRetirement(
  inputs: RetirementInputs,
  options: CalculateOptions = {}
): RetirementResult {
  const asOf = options.asOf ?? new Date();
  const lwfRule = options.lwfRule ?? null;
  const warnings: string[] = [];
  const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());

  // --- dates and ages
  const dob = parseDate(inputs.dob) ?? addYears(today, -30);
  const override = parseDate(inputs.retirementDateOverride);
  const retirementDate = override ?? addYears(dob, inputs.retirementAge);
  const months = monthsBetween(today, retirementDate);
  const currentAge = monthsBetween(dob, today) / 12;
  const retirementAge = monthsBetween(dob, retirementDate) / 12;
  const yearsToRet = months / 12;

  // --- salary today
  const base = deriveSalary(inputs);
  const hike = inputs.salaryHikePct / 100;
  const growth = (m: number) => Math.pow(1 + hike, Math.floor(m / 12));
  const grossAt = (m: number) => base.gross * growth(m);
  const basicDAAt = (m: number) => base.basicDA * growth(m);
  const wageAt = (m: number) => base.statutoryWage * growth(m);
  const { ceiling, pfBasis, pensionBasis } = pfParams(inputs);

  // --- rates
  const epfRate =
    (inputs.exemptTrust
      ? Math.max(inputs.trustRatePct, inputs.epfRatePct)
      : inputs.epfRatePct) / 100;
  const npsMonthlyRate = Math.pow(1 + inputs.npsReturnPct / 100, 1 / 12) - 1;
  // LWF for one year at a given monthly gross. Verified rule if we have
  // one; otherwise the payslip amounts the user entered.
  const useVerifiedLwf = inputs.lwfSource === "verified" && lwfRule !== null;
  const lwfYear = (monthlyGross: number) => {
    if (useVerifiedLwf && lwfRule) {
      // An individual can't know their employer's headcount, so assume the
      // establishment meets any minimum-headcount rule.
      const est = estimateLwf(lwfRule, {
        monthlyWage: monthlyGross,
        headcount: Math.max(1, lwfRule.minEmployees ?? 1),
      });
      return {
        covered: est.covered,
        reason: est.reason,
        employee: est.perEmployeeYear.employee,
        employer: est.perEmployeeYear.employer,
      };
    }
    const cycles = CYCLES_PER_YEAR[inputs.lwfFrequency];
    const employee = Math.max(0, inputs.lwfEmployee) * cycles;
    const employer = Math.max(0, inputs.lwfEmployer) * cycles;
    return { covered: employee + employer > 0, reason: undefined as string | undefined, employee, employer };
  };
  const lwfNow = lwfYear(base.gross);

  const gratuityCategory = inputs.isFixedTerm ? "fixedTerm" : "permanent";
  const gratuityAt = (m: number, years: number) =>
    computeGratuity({
      basicPlusDA: basicDAAt(m),
      totalMonthlyRemuneration: inputs.applyWageRule ? grossAt(m) : 0,
      yearsOfService: years,
      employmentCategory: gratuityCategory,
    });

  // --- running state
  let epfBalance = Math.max(0, inputs.existingEpfBalance);
  let epfAccrued = 0; // interest accrued in the current financial year
  let epfEmployeeIn = 0;
  let epfEmployerIn = 0;
  let epfInterest = 0;
  let taxableSubBalance = 0; // contributions above ₹2.5L a year, plus their interest
  let taxableAccrued = 0;
  let fyEmployeeContribution = 0;
  let pfInterestTax = 0;

  let npsBalance = Math.max(0, inputs.existingNpsBalance);

  const totals = emptyContributions();
  let monthlyNow = emptyContributions();
  const epsPensionWages: number[] = [];
  let epsMonths = 0;
  let esiMonths = 0;
  let esiExitAge: number | null = null;
  let wasEsiCovered = false;
  const timeline: TimelinePoint[] = [];

  const careerYearsBefore =
    inputs.mode === "simple" ? inputs.yearsAtEmployer : inputs.totalCareerYears;

  const gratuityAccruedAt = (m: number): number =>
    Math.round(gratuityAt(m, inputs.yearsAtEmployer + m / 12).gratuityAmount);

  const pushTimeline = (m: number) => {
    timeline.push({
      age: Math.round((currentAge + m / 12) * 10) / 10,
      epf: Math.round(epfBalance + epfAccrued),
      nps: Math.round(npsBalance),
      gratuity: inputs.jobSwitchEveryYears > 0 ? 0 : gratuityAccruedAt(m),
    });
  };

  pushTimeline(0);

  for (let m = 0; m < months; m++) {
    const ageNow = currentAge + m / 12;
    const calMonth = (today.getMonth() + m) % 12; // 0 = Jan
    const gross = grossAt(m);
    const basicDA = basicDAAt(m);
    const wage = wageAt(m);

    // New financial year starts in April.
    if (calMonth === 3) fyEmployeeContribution = 0;

    // PF / EPS
    const pf = computeContribution({ actualWages: wage, ceiling, pfBasis, pensionBasis });
    const inEps = inputs.epsMember && ageNow < EPS_EXIT_AGE;
    const employerEPS = inEps ? pf.employerEPS : 0;
    const employerEPF = pf.employerTotal - employerEPS;
    const vpf = Math.round((wage * inputs.vpfPct) / 100);
    const employeeTotal = pf.employeePF + vpf;

    // Interest accrues on the balance before this month's credit.
    epfAccrued += (epfBalance * epfRate) / 12;
    taxableAccrued += (taxableSubBalance * epfRate) / 12;

    // Employee contribution above ₹2.5L in a financial year earns
    // taxable interest from then on.
    const roomLeft = Math.max(0, PF_INTEREST_TAX_THRESHOLD - fyEmployeeContribution);
    const taxablePart = Math.max(0, employeeTotal - roomLeft);
    fyEmployeeContribution += employeeTotal;
    taxableSubBalance += taxablePart;

    epfBalance += employeeTotal + employerEPF;
    epfEmployeeIn += employeeTotal;
    epfEmployerIn += employerEPF;

    if (inEps) {
      epsPensionWages.push(pf.pensionWage);
      epsMonths += 1;
    }

    // NPS
    const npsEmployer = Math.round((basicDA * inputs.npsEmployerPct) / 100);
    const npsEmployee = Math.max(0, inputs.npsVoluntaryMonthly);
    npsBalance = npsBalance * (1 + npsMonthlyRate) + npsEmployer + npsEmployee;

    // LWF (wage bands can change as salary grows)
    const lwf = lwfYear(gross);

    // ESI
    const esi = computeEsi({
      wage: esiWage(basicDA, gross, inputs.esiWageBasis),
      isPwd: inputs.isPwd,
    });
    if (esi.covered) {
      esiMonths += 1;
      wasEsiCovered = true;
    } else if (wasEsiCovered && esiExitAge === null) {
      esiExitAge = Math.round(ageNow * 10) / 10;
    }

    const row: MonthlyContributions = {
      employeePF: pf.employeePF,
      vpf,
      employerEPF,
      employerEPS,
      npsEmployer,
      npsEmployee,
      esiEmployee: esi.employee,
      esiEmployer: esi.employer,
      pt: Math.max(0, inputs.ptMonthly),
      lwfEmployee: lwf.employee / 12,
      lwfEmployer: lwf.employer / 12,
    };
    if (m === 0) monthlyNow = { ...row };
    (Object.keys(totals) as (keyof MonthlyContributions)[]).forEach((k) => {
      totals[k] += row[k];
    });

    // Credit interest at the end of March, or in the final month.
    const lastMonth = m === months - 1;
    if (calMonth === 2 || lastMonth) {
      const credited = epfAccrued;
      epfBalance += credited;
      epfInterest += credited;
      taxableSubBalance += taxableAccrued;
      if (taxableAccrued > 0) {
        const rate = marginalRate({ grossIncome: gross * 12, regime: inputs.regime });
        pfInterestTax += taxableAccrued * rate;
      }
      epfAccrued = 0;
      taxableAccrued = 0;
    }

    if ((m + 1) % 12 === 0 || lastMonth) pushTimeline(m + 1);
  }

  // If already at or past retirement, still show today's contributions.
  if (months === 0) {
    const pf = computeContribution({ actualWages: base.statutoryWage, ceiling, pfBasis, pensionBasis });
    const esi = computeEsi({
      wage: esiWage(base.basicDA, base.gross, inputs.esiWageBasis),
      isPwd: inputs.isPwd,
    });
    const employerEPS = inputs.epsMember && currentAge < EPS_EXIT_AGE ? pf.employerEPS : 0;
    monthlyNow = {
      employeePF: pf.employeePF,
      vpf: Math.round((base.statutoryWage * inputs.vpfPct) / 100),
      employerEPF: pf.employerTotal - employerEPS,
      employerEPS,
      npsEmployer: Math.round((base.basicDA * inputs.npsEmployerPct) / 100),
      npsEmployee: Math.max(0, inputs.npsVoluntaryMonthly),
      esiEmployee: esi.employee,
      esiEmployer: esi.employer,
      pt: Math.max(0, inputs.ptMonthly),
      lwfEmployee: lwfNow.employee / 12,
      lwfEmployer: lwfNow.employer / 12,
    };
    warnings.push("Your retirement date is today or already past, so no projection was run.");
  }

  const lastM = Math.max(0, months - 1);
  const finalAnnualGross = grossAt(lastM) * 12;
  const retirementDateIso = toIsoDate(retirementDate);

  // ------------------------------------------------------------- EPF
  const totalServiceYears = careerYearsBefore + yearsToRet;
  const epfTaxFree = totalServiceYears >= 5;
  if (!epfTaxFree) {
    warnings.push(
      "Your total PF service will be under 5 years, so the PF withdrawal is taxable and TDS applies. Transferring PF across jobs keeps service continuous."
    );
  }
  if (taxableSubBalance > 0) {
    warnings.push(
      "Your own PF + VPF contribution crosses ₹2.5 lakh in a year, so interest on the excess is taxable every year. The tax is estimated separately."
    );
  }

  // ------------------------------------------------------------- EPS
  const epsServiceRaw = inputs.epsMember ? careerYearsBefore + epsMonths / 12 : 0;
  const lastPensionWage =
    epsPensionWages.length > 0
      ? epsPensionWages[epsPensionWages.length - 1]
      : computeContribution({ actualWages: base.statutoryWage, ceiling, pfBasis, pensionBasis })
          .pensionWage;
  const last60 = epsPensionWages.slice(-60);
  while (last60.length < 60) last60.unshift(last60[0] ?? lastPensionWage);
  const pensionableSalary = Math.round(last60.reduce((a, b) => a + b, 0) / 60);

  const exitAge = Math.min(retirementAge, EPS_EXIT_AGE);
  const minStart = clamp(Math.ceil(exitAge), 50, EPS_EXIT_AGE);
  const startAge = clamp(Math.round(inputs.epsStartAge), minStart, 60);

  let epsKind: RetirementResult["eps"]["kind"] = "none";
  let monthlyPension = 0;
  let withdrawalAmount = 0;
  let epsServiceCounted = 0;

  if (inputs.epsMember && epsServiceRaw > 0) {
    if (epsServiceRaw >= 10) {
      epsKind = "pension";
      epsServiceCounted = Math.min(
        EPS_MAX_SERVICE,
        Math.floor(epsServiceRaw) + (epsServiceRaw >= 20 ? 2 : 0)
      );
      let pension = (pensionableSalary * epsServiceCounted) / 70;
      if (startAge < EPS_EXIT_AGE) pension *= 1 - 0.04 * (EPS_EXIT_AGE - startAge);
      if (startAge > EPS_EXIT_AGE) pension *= 1 + 0.04 * (startAge - EPS_EXIT_AGE);
      monthlyPension = Math.max(EPS_MIN_PENSION, Math.round(pension));
    } else {
      epsKind = "withdrawal";
      epsServiceCounted = epsServiceRaw;
      withdrawalAmount = Math.round(tableDFactor(epsServiceRaw) * lastPensionWage);
      warnings.push(
        "Your EPS service will be under 10 years, so you get a one-time withdrawal benefit instead of a pension. Taking a scheme certificate keeps that service for a future pension."
      );
    }
  }
  if (!inputs.epsMember) {
    warnings.push(
      "You're marked as not an EPS member, so the employer's full 12% goes to EPF and there's no EPS pension."
    );
  }
  if (inputs.higherPension) {
    warnings.push(
      "Higher pension on actual wages applies only if you have a valid, accepted higher-pension option. Check your EPFO status before relying on this figure."
    );
  }

  // ------------------------------------------------------------- NPS
  const npsCorpus = Math.round(npsBalance);
  let npsExit: RetirementResult["nps"]["exit"] = "none";
  let npsLump = 0;
  let npsAnnuityCorpus = 0;
  let npsLumpTaxable = 0;

  if (npsCorpus > 0) {
    if (retirementAge >= 60) {
      npsExit = "normal";
      if (npsCorpus <= 800000) npsLump = npsCorpus;
      else if (npsCorpus <= 1200000) npsLump = 600000;
      else npsLump = Math.round((npsCorpus * clamp(inputs.npsLumpSumPct, 0, 80)) / 100);
      npsLumpTaxable = Math.max(0, npsLump - Math.round(npsCorpus * 0.6));
    } else {
      npsExit = "premature";
      npsLump = npsCorpus <= 500000 ? npsCorpus : Math.round(npsCorpus * 0.2);
      npsLumpTaxable = npsLump;
      warnings.push(
        "You retire before 60, so NPS counts as a premature exit: 80% must buy an annuity. You can usually stay invested until 60 to get normal-exit rules."
      );
    }
    npsAnnuityCorpus = npsCorpus - npsLump;
  }
  const npsMonthlyAnnuity = Math.round((npsAnnuityCorpus * inputs.annuityRatePct) / 100 / 12);

  const npsLimit = NPS_EMPLOYER_LIMIT_PCT[inputs.regime];
  if (inputs.npsEmployerPct > npsLimit) {
    warnings.push(
      `Employer NPS above ${npsLimit}% of Basic + DA isn't deductible under the ${inputs.regime} regime; the excess is taxed as salary.`
    );
  }
  const employerRetirementYear1 = (monthlyNow.employerEPF + monthlyNow.employerEPS + monthlyNow.npsEmployer) * 12;
  if (employerRetirementYear1 > EMPLOYER_CONTRIBUTION_PERQ_LIMIT) {
    warnings.push(
      "Employer contributions to PF, NPS and superannuation together exceed ₹7.5 lakh a year; the excess (and its returns) is taxable as a perquisite."
    );
  }

  // -------------------------------------------------------- gratuity
  const stayYears = inputs.yearsAtEmployer + yearsToRet;
  const minGratuityYears = inputs.isFixedTerm ? 1 : 5;
  const stay = gratuityAt(lastM, stayYears);
  const stayGratuity = Math.round(stay.gratuityAmount);

  // Job-switch mode: switch every N years from today. The first stint
  // includes time already served with the current employer.
  const jobSwitchEnabled = inputs.jobSwitchEveryYears > 0;
  const stints: { years: number; amount: number }[] = [];
  if (jobSwitchEnabled) {
    const stepMonths = Math.round(inputs.jobSwitchEveryYears * 12);
    let startM = 0;
    let firstStint = true;
    while (startM < months) {
      const endM = Math.min(months, startM + stepMonths);
      const len = (endM - startM) / 12 + (firstStint ? inputs.yearsAtEmployer : 0);
      const g = gratuityAt(Math.max(0, endM - 1), len);
      stints.push({ years: Math.round(len * 10) / 10, amount: Math.round(g.gratuityAmount) });
      startM = endM;
      firstStint = false;
    }
  }
  const switchTotal = stints.reduce((a, s) => a + s.amount, 0);
  const lastStint = stints[stints.length - 1];

  const finalGratuity = jobSwitchEnabled
    ? gratuityAt(lastM, lastStint ? lastStint.years : 0)
    : stay;
  const gratuityPaid = Math.round(finalGratuity.gratuityAmount);
  const gratuityExempt = Math.min(gratuityPaid, GRATUITY_EXEMPTION_CAP);
  const gratuityTaxable = gratuityPaid - gratuityExempt;
  const lastWage = Math.round(finalGratuity.effectiveWageBase);

  if (!jobSwitchEnabled && !stay.eligibleForGratuity) {
    warnings.push(
      `You'll have ${stayYears.toFixed(1)} years with this employer at retirement, below the ${minGratuityYears}-year minimum, so no gratuity is payable.`
    );
  }
  if (jobSwitchEnabled && stints.some((st) => st.amount === 0)) {
    warnings.push(
      "Some job stints in your switch pattern are too short for gratuity. Each switch before 5 years resets the gratuity clock."
    );
  }

  // --------------------------------------------------- leave encashment
  const finalBasicDA = basicDAAt(lastM);
  const leaveDays = Math.max(0, inputs.leaveDaysAtRetirement);
  const leaveAmount = Math.round((finalBasicDA / 30) * leaveDays);
  const completedYearsWithEmployer = Math.floor(
    jobSwitchEnabled ? lastStint?.years ?? 0 : stayYears
  );
  const leaveDaysAllowed = Math.min(leaveDays, 30 * completedYearsWithEmployer);
  const leaveExempt = Math.min(
    leaveAmount,
    LEAVE_ENCASHMENT_EXEMPT_CAP,
    Math.round(finalBasicDA * 10),
    Math.round((finalBasicDA / 30) * leaveDaysAllowed)
  );
  const leaveTaxable = leaveAmount - leaveExempt;

  // ----------------------------------------------------- tax at retirement
  const taxableLumps = npsLumpTaxable + gratuityTaxable + leaveTaxable;
  const taxOnLumpSums = incrementalTax(finalAnnualGross, taxableLumps, inputs.regime);
  const epfCorpus = Math.round(epfBalance);

  const lumpSumPreTax = epfCorpus + withdrawalAmount + npsLump + gratuityPaid + leaveAmount;
  const lumpSumPostTax = lumpSumPreTax - taxOnLumpSums;

  // Pension and annuity are taxed as income (standard deduction applies).
  const pensionIncomeAnnual = (monthlyPension + npsMonthlyAnnuity) * 12;
  const pensionTax = incomeTax({ grossIncome: pensionIncomeAnnual, regime: inputs.regime });
  const postTaxShare = pensionIncomeAnnual > 0 ? 1 - pensionTax / pensionIncomeAnnual : 1;
  const epsPostTax = Math.round(monthlyPension * postTaxShare);
  const npsPostTax = Math.round(npsMonthlyAnnuity * postTaxShare);

  // ----------------------------------------------------- retirement gap
  const inflation = inputs.inflationPct / 100;
  const postRet = inputs.postRetReturnPct / 100;
  const deflator = Math.pow(1 + inflation, yearsToRet);
  const yearsInRetirement = Math.max(0, inputs.lifeExpectancy - retirementAge);
  const annualExpenseAtRetirement = Math.round(inputs.monthlyExpensesToday * 12 * deflator);
  // Expenses are paid at the start of each retirement year (annuity due).
  const requiredCorpus = Math.round(
    pvGrowingAnnuity(annualExpenseAtRetirement, postRet, inflation, yearsInRetirement) * (1 + postRet)
  );
  const epsYears = Math.max(0, inputs.lifeExpectancy - Math.max(startAge, retirementAge));
  const epsDelay = Math.max(0, startAge - retirementAge);
  const pvEps =
    pvGrowingAnnuity(epsPostTax * 12, postRet, 0, epsYears) / Math.pow(1 + postRet, epsDelay);
  const pvNps = pvGrowingAnnuity(npsPostTax * 12, postRet, 0, yearsInRetirement);
  const availableCorpus = Math.round(lumpSumPostTax + pvEps + pvNps);

  // ------------------------------------------------------------- ESI
  const esiNow = computeEsi({
    wage: esiWage(base.basicDA, base.gross, inputs.esiWageBasis),
    isPwd: inputs.isPwd,
  });

  return {
    meta: {
      currentAge: Math.round(currentAge * 10) / 10,
      retirementAge: Math.round(retirementAge * 10) / 10,
      retirementDate: retirementDateIso,
      monthsToRetirement: months,
      yearsToRetirement: Math.round(yearsToRet * 10) / 10,
      deflator,
    },
    salaryNow: {
      gross: Math.round(base.gross),
      basicDA: Math.round(base.basicDA),
      statutoryWage: Math.round(base.statutoryWage),
      ctc: Math.round(base.ctc),
    },
    monthlyNow,
    careerTotals: Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [k, Math.round(v)])
    ) as unknown as MonthlyContributions,
    epf: {
      corpus: epfCorpus,
      employeeShare: Math.round(epfEmployeeIn),
      employerShare: Math.round(epfEmployerIn),
      interest: Math.round(epfInterest),
      taxFree: epfTaxFree,
      interestTaxPaidDuringWork: Math.round(pfInterestTax),
    },
    eps: {
      kind: epsKind,
      serviceYears: Math.round(epsServiceCounted * 10) / 10,
      pensionableSalary,
      monthlyPension,
      startAge,
      withdrawalAmount,
      postTaxMonthly: epsPostTax,
    },
    nps: {
      corpus: npsCorpus,
      exit: npsExit,
      lumpSum: npsLump,
      annuityCorpus: npsAnnuityCorpus,
      monthlyAnnuity: npsMonthlyAnnuity,
      lumpSumTaxable: npsLumpTaxable,
      postTaxMonthly: npsPostTax,
    },
    gratuity: {
      eligible: finalGratuity.eligibleForGratuity,
      years: finalGratuity.roundedYears,
      lastWage,
      amount: gratuityPaid,
      exempt: gratuityExempt,
      taxable: gratuityTaxable,
    },
    leave: {
      days: leaveDays,
      amount: leaveAmount,
      exempt: leaveExempt,
      taxable: leaveTaxable,
    },
    totals: {
      lumpSumPreTax,
      taxOnLumpSums,
      lumpSumPostTax,
      monthlyIncomePreTax: monthlyPension + npsMonthlyAnnuity,
      monthlyIncomePostTax: epsPostTax + npsPostTax,
    },
    gap: {
      annualExpenseAtRetirement,
      yearsInRetirement: Math.round(yearsInRetirement * 10) / 10,
      requiredCorpus,
      availableCorpus,
      shortfall: requiredCorpus - availableCorpus,
    },
    jobSwitch: {
      enabled: jobSwitchEnabled,
      stints,
      total: switchTotal,
      differenceVsStaying: switchTotal - stayGratuity,
    },
    esi: {
      coveredNow: esiNow.covered,
      wageNow: Math.round(esiNow.wage),
      ceiling: esiNow.ceiling,
      monthsCovered: esiMonths,
      exitAge: esiExitAge,
    },
    lwf: {
      source: useVerifiedLwf ? "verified" : "manual",
      covered: lwfNow.covered,
      reason: lwfNow.reason,
      employeeAnnual: Math.round(lwfNow.employee),
      employerAnnual: Math.round(lwfNow.employer),
    },
    timeline,
    warnings,
  };
}
