// EPF wage ceiling revision: ₹15,000 → ₹25,000 under Chapter III,
// Code on Social Security, 2020 — notified by Gazette S.O. 5109(E),
// 17 September 2026 (Ministry of Labour & Employment), which superseded
// the earlier S.O. 2702(E) dated 29 May 2026.
//
// IMPORTANT — what is and isn't officially confirmed:
// The Gazette notification sets the new ceiling and its effective date.
// It does NOT prescribe a contribution methodology for the broken
// September 2026 period, and no EPFO circular covering that mechanics
// was available at the time this tool was built. The two September
// modes below (pro-rated vs not pro-rated) are both presented as
// user-selectable approaches, not as an EPFO-mandated formula — see the
// on-page disclaimer. Everything outside the September split (the
// ceiling figures themselves, contribution rates, effective date) is
// drawn directly from the Gazette text and standard, unchanged EPF
// Scheme contribution rates.

export const OLD_EPF_WAGE_CEILING = 15000;
export const NEW_EPF_WAGE_CEILING = 25000;
export const CEILING_CHANGE_EFFECTIVE_DATE = "17 September 2026";
export const GAZETTE_REF = "S.O. 5109(E), dated 17 September 2026";

// Standard, unchanged EPF Scheme contribution rates.
const EMPLOYEE_PF_RATE = 0.12;
const EMPLOYER_TOTAL_RATE = 0.12;
const EMPLOYER_EPS_RATE = 0.0833;
const EMPLOYER_EDLI_RATE = 0.005; // illustrative; EDLI admin/inspection charges vary and are excluded

export type WageBasis = "capped" | "actual";

export interface ContributionBreakdown {
  contributionWage: number;
  pensionWage: number;
  employeePF: number;
  employerEPS: number;
  employerEPFResidual: number;
  employerEDLI: number;
  employerTotal: number;
  totalMonthlyFlow: number;
}

function round(n: number): number {
  return Math.round(n);
}

/**
 * One period's contribution, given the actual wage, the ceiling in
 * force, and whether PF / Pension are calculated on the capped ceiling
 * or on actual wages (the latter only valid where a higher-wage
 * arrangement, e.g. Para 26(6), or a valid higher-pension option was
 * already exercised).
 */
export function computeContribution(params: {
  actualWages: number;
  ceiling: number;
  pfBasis: WageBasis;
  pensionBasis: WageBasis;
}): ContributionBreakdown {
  const { actualWages, ceiling, pfBasis, pensionBasis } = params;
  const contributionWage =
    pfBasis === "actual" ? actualWages : Math.min(actualWages, ceiling);
  // Pension (EPS) stays capped at the ceiling by default even when the
  // PF wage basis is "actual" — this is the standard rule. It only runs
  // on actual wages for an employee with an already-exercised, valid
  // higher-pension option, which is uncommon.
  const pensionWage =
    pensionBasis === "actual" ? actualWages : Math.min(actualWages, ceiling);

  const employeePF = round(contributionWage * EMPLOYEE_PF_RATE);
  const employerTotal = round(contributionWage * EMPLOYER_TOTAL_RATE);
  const employerEPS = round(pensionWage * EMPLOYER_EPS_RATE);
  const employerEPFResidual = Math.max(0, employerTotal - employerEPS);
  const employerEDLI = round(pensionWage * EMPLOYER_EDLI_RATE);

  return {
    contributionWage,
    pensionWage,
    employeePF,
    employerEPS,
    employerEPFResidual,
    employerEDLI,
    employerTotal,
    totalMonthlyFlow: employeePF + employerEPS + employerEPFResidual,
  };
}

export interface SeptemberSplitInput {
  actualWages: number;
  daysBeforeChange: number; // 1–16 Sep, max 16
  daysAfterChange: number; // 17–30 Sep, max 14
  totalDaysInMonth: number; // 30
  prePfBasis: WageBasis;
  prePensionBasis: WageBasis;
  postPfBasis: WageBasis;
  postPensionBasis: WageBasis;
}

export interface SeptemberSplitResult {
  proRated: ContributionBreakdown;
  notProRated: ContributionBreakdown;
  preBreakdown: ContributionBreakdown;
  postBreakdown: ContributionBreakdown;
}

/**
 * Two user-selectable approaches to the September 2026 broken-period
 * calculation. Neither is asserted here as the officially mandated
 * method — see the module-level note above and the on-page disclaimer.
 */
export function computeSeptemberSplit(
  input: SeptemberSplitInput
): SeptemberSplitResult {
  const {
    actualWages,
    daysBeforeChange,
    daysAfterChange,
    totalDaysInMonth,
    prePfBasis,
    prePensionBasis,
    postPfBasis,
    postPensionBasis,
  } = input;

  const preBreakdown = computeContribution({
    actualWages,
    ceiling: OLD_EPF_WAGE_CEILING,
    pfBasis: prePfBasis,
    pensionBasis: prePensionBasis,
  });
  const postBreakdown = computeContribution({
    actualWages,
    ceiling: NEW_EPF_WAGE_CEILING,
    pfBasis: postPfBasis,
    pensionBasis: postPensionBasis,
  });

  // Pro-rated: blend each period's contribution/pension wage by the
  // days it actually covers, then derive contributions on the blended
  // wage base (matches how most payroll systems pro-rate a mid-month
  // statutory change).
  const preWageShare =
    (preBreakdown.contributionWage / totalDaysInMonth) * daysBeforeChange;
  const postWageShare =
    (postBreakdown.contributionWage / totalDaysInMonth) * daysAfterChange;
  const prePensionShare =
    (preBreakdown.pensionWage / totalDaysInMonth) * daysBeforeChange;
  const postPensionShare =
    (postBreakdown.pensionWage / totalDaysInMonth) * daysAfterChange;

  const blendedContributionWage = round(preWageShare + postWageShare);
  const blendedPensionWage = round(prePensionShare + postPensionShare);
  const proRatedEmployeePF = round(blendedContributionWage * EMPLOYEE_PF_RATE);
  const proRatedEmployerTotal = round(
    blendedContributionWage * EMPLOYER_TOTAL_RATE
  );
  const proRatedEmployerEPS = round(blendedPensionWage * EMPLOYER_EPS_RATE);
  const proRatedEmployerEPFResidual = Math.max(
    0,
    proRatedEmployerTotal - proRatedEmployerEPS
  );
  const proRatedEmployerEDLI = round(blendedPensionWage * EMPLOYER_EDLI_RATE);

  const proRated: ContributionBreakdown = {
    contributionWage: blendedContributionWage,
    pensionWage: blendedPensionWage,
    employeePF: proRatedEmployeePF,
    employerEPS: proRatedEmployerEPS,
    employerEPFResidual: proRatedEmployerEPFResidual,
    employerEDLI: proRatedEmployerEDLI,
    employerTotal: proRatedEmployerTotal,
    totalMonthlyFlow:
      proRatedEmployeePF + proRatedEmployerEPS + proRatedEmployerEPFResidual,
  };

  // Not pro-rated: treat the whole of September as a single month under
  // one ceiling — the simplified approach some payroll teams use rather
  // than splitting, pending an EPFO circular. Uses the new ₹25,000
  // ceiling for the full month, on the post-change basis selections.
  const notProRated = computeContribution({
    actualWages,
    ceiling: NEW_EPF_WAGE_CEILING,
    pfBasis: postPfBasis,
    pensionBasis: postPensionBasis,
  });

  return { proRated, notProRated, preBreakdown, postBreakdown };
}

// --- Coverage checker -------------------------------------------------

export type CoverageOutcome =
  | "already-covered-no-change"
  | "existing-member-higher-base"
  | "existing-member-already-actual"
  | "not-member-newly-in-band"
  | "excluded-above-ceiling";

export interface CoverageResult {
  outcome: CoverageOutcome;
  headline: string;
  detail: string;
}

export function checkCoverage(params: {
  monthlyWages: number;
  wasEpfMemberBefore: boolean;
  contributionWasOnActualWages: boolean;
}): CoverageResult {
  const { monthlyWages, wasEpfMemberBefore, contributionWasOnActualWages } =
    params;

  if (monthlyWages > NEW_EPF_WAGE_CEILING) {
    return {
      outcome: "excluded-above-ceiling",
      headline: "Still above the new ceiling",
      detail:
        "Wages above ₹25,000 remain outside the mandatory-coverage band. An employee who was never a PF member stays an excluded employee unless voluntarily brought into the scheme with employer consent (Para 26(6)). This does not change on 17 September 2026.",
    };
  }

  if (monthlyWages <= OLD_EPF_WAGE_CEILING) {
    return {
      outcome: "already-covered-no-change",
      headline: "No change for this employee",
      detail:
        "Wages at or below ₹15,000 were already within the mandatory-coverage band before the revision, and remain so after it.",
    };
  }

  // 15,001 – 25,000 band
  if (!wasEpfMemberBefore) {
    return {
      outcome: "not-member-newly-in-band",
      headline: "Now within the mandatory-coverage band",
      detail:
        "Wages in the ₹15,001–₹25,000 band now fall within mandatory EPF coverage from 17 September 2026. Whether a specific employee who was never enrolled needs to be newly enrolled from this date, versus remaining an excluded employee because their wages exceeded the ceiling at the time they joined, is a case-specific compliance question — confirm the applicable treatment with EPFO guidance or a compliance professional before acting.",
    };
  }

  if (contributionWasOnActualWages) {
    return {
      outcome: "existing-member-already-actual",
      headline: "No change in total PF outgo",
      detail:
        "This employee was already contributing on actual wages (e.g. under an existing Para 26(6) arrangement), so the total contribution doesn't change. What does change is the employer split — a larger share now goes to EPS (pension) up to the new ceiling, with a correspondingly smaller residual to EPF, and EDLI moves marginally with it.",
    };
  }

  return {
    outcome: "existing-member-higher-base",
    headline: "Contribution base moves up",
    detail:
      "This employee was an existing member with contributions restricted to the ₹15,000 ceiling. From 17 September 2026, the statutory contribution base rises to actual wages up to the new ₹25,000 ceiling (pro-rated for the September transition — see the Calculator tab).",
  };
}

// --- Bulk cost impact ---------------------------------------------------

export interface BulkImpactInput {
  employeeCount: number;
  averageMonthlyWage: number; // assumed uniform across the band for this estimate
}

export interface BulkImpactResult {
  perEmployeeOldEmployerCost: number;
  perEmployeeNewEmployerCost: number;
  perEmployeeDelta: number;
  totalMonthlyEmployerDelta: number;
  totalAnnualEmployerDelta: number;
}

/**
 * Simple aggregate estimate: employer's monthly PF+EPS outgo (excludes
 * EDLI/admin charges) per employee, old vs new ceiling, on the capped
 * (statutory-minimum) basis, times headcount. This is a planning
 * estimate for a group assumed to be at or above both ceilings — actual
 * bulk impact will vary with each employee's real wage distribution.
 */
export function computeBulkImpact(input: BulkImpactInput): BulkImpactResult {
  const { employeeCount, averageMonthlyWage } = input;

  const oldBreakdown = computeContribution({
    actualWages: averageMonthlyWage,
    ceiling: OLD_EPF_WAGE_CEILING,
    pfBasis: "capped",
    pensionBasis: "capped",
  });
  const newBreakdown = computeContribution({
    actualWages: averageMonthlyWage,
    ceiling: NEW_EPF_WAGE_CEILING,
    pfBasis: "capped",
    pensionBasis: "capped",
  });

  const perEmployeeOldEmployerCost = oldBreakdown.employerTotal;
  const perEmployeeNewEmployerCost = newBreakdown.employerTotal;
  const perEmployeeDelta =
    perEmployeeNewEmployerCost - perEmployeeOldEmployerCost;
  const totalMonthlyEmployerDelta = perEmployeeDelta * employeeCount;

  return {
    perEmployeeOldEmployerCost,
    perEmployeeNewEmployerCost,
    perEmployeeDelta,
    totalMonthlyEmployerDelta,
    totalAnnualEmployerDelta: totalMonthlyEmployerDelta * 12,
  };
}
