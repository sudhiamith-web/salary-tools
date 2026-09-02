// Section 80D health insurance deduction logic. Verified Aug 2026.
// Two independent brackets: self/family, and parents. Each bracket's
// limit depends on whether ANY insured person in that bracket is a
// senior citizen (60+): ₹25,000 normally, ₹50,000 if senior.
// The ₹5,000 preventive health checkup deduction is a SUB-LIMIT within
// each bracket, not an additional amount on top.
// Available only under the old tax regime.

export const SELF_FAMILY_LIMIT_REGULAR = 25000;
export const SELF_FAMILY_LIMIT_SENIOR = 50000;
export const PARENTS_LIMIT_REGULAR = 25000;
export const PARENTS_LIMIT_SENIOR = 50000;
export const PREVENTIVE_CHECKUP_SUBLIMIT = 5000;

export interface Section80DInput {
  selfFamilyPremium: number;
  selfFamilySenior: boolean; // true if self, spouse, or any covered child is 60+
  parentsPremium: number;
  parentsSenior: boolean;
  preventiveCheckup: number; // counted within whichever bracket has room
}

export interface Section80DResult {
  selfFamilyLimit: number;
  selfFamilyEligible: number;
  parentsLimit: number;
  parentsEligible: number;
  totalDeduction: number;
}

export function computeSection80D(input: Section80DInput): Section80DResult {
  const selfFamilyLimit = input.selfFamilySenior ? SELF_FAMILY_LIMIT_SENIOR : SELF_FAMILY_LIMIT_REGULAR;
  const parentsLimit = input.parentsSenior ? PARENTS_LIMIT_SENIOR : PARENTS_LIMIT_REGULAR;

  // Preventive checkup is added to the self/family premium first (common
  // practice), capped at the sub-limit, then the whole bracket capped at
  // its overall limit.
  const cappedCheckup = Math.min(input.preventiveCheckup, PREVENTIVE_CHECKUP_SUBLIMIT);
  const selfFamilyEligible = Math.min(input.selfFamilyPremium + cappedCheckup, selfFamilyLimit);
  const parentsEligible = Math.min(input.parentsPremium, parentsLimit);

  return {
    selfFamilyLimit,
    selfFamilyEligible,
    parentsLimit,
    parentsEligible,
    totalDeduction: selfFamilyEligible + parentsEligible,
  };
}
