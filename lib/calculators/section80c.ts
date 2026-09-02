// Section 80C tax planning logic. Verified Aug 2026.
// The combined 80C + 80CCC + 80CCD(1) limit is ₹1,50,000 — NOT ₹2,00,000
// as some competitor sites incorrectly state.
// Section 80CCD(1B) is a SEPARATE additional ₹50,000 bucket, exclusively
// for NPS contributions, on top of the ₹1,50,000 80C limit — so the true
// combined ceiling across both is ₹2,00,000, but only if ₹50,000 of that
// is specifically in NPS.
// Both deductions are available ONLY under the old tax regime.

export const SECTION_80C_LIMIT = 150000;
export const SECTION_80CCD_1B_LIMIT = 50000;

export interface Section80CInput {
  investments: number; // total across PPF, ELSS, EPF, life insurance, etc.
  npsContribution: number; // Section 80CCD(1B) bucket, separate from 80C
}

export interface Section80CResult {
  eligible80C: number; // capped at SECTION_80C_LIMIT
  unused80C: number;
  eligibleNPS: number; // capped at SECTION_80CCD_1B_LIMIT
  totalDeduction: number;
}

export function computeSection80C(input: Section80CInput): Section80CResult {
  const eligible80C = Math.min(input.investments, SECTION_80C_LIMIT);
  const eligibleNPS = Math.min(input.npsContribution, SECTION_80CCD_1B_LIMIT);
  return {
    eligible80C,
    unused80C: Math.max(0, SECTION_80C_LIMIT - eligible80C),
    eligibleNPS,
    totalDeduction: eligible80C + eligibleNPS,
  };
}
