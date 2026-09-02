// ESOP (Employee Stock Option Plan) taxation, Indian company shares.
// Verified Aug 2026.
// Stage 1 — Exercise: Perquisite = (FMV at exercise − exercise price) ×
// shares. Taxed as SALARY income at slab rate, TDS by employer under
// Section 192. FMV for unlisted shares requires a Category I merchant
// banker valuation (not older than 180 days).
// Stage 2 — Sale: Capital gain = Sale price − FMV at exercise (which
// becomes the cost of acquisition, to avoid double taxation — Section
// 49(2AA)). Rate depends on listed/unlisted status and holding period
// FROM THE EXERCISE DATE (not the grant date):
//   Listed:   >12 months = LTCG 12.5% above ₹1.25L exemption; else STCG 20%
//   Unlisted: >24 months = LTCG 12.5% no indexation; else STCG at slab rate
// DPIIT-recognised eligible startups can defer the PAYMENT of perquisite
// TDS up to 48 months (or earlier sale/resignation) under Section
// 192(1C) — a deferral, not an exemption. Not modeled as a toggle here;
// noted as a known simplification.

export interface ESOPExerciseInput {
  shares: number;
  exercisePrice: number;
  fmvAtExercise: number;
}

export interface ESOPExerciseResult {
  perquisitePerShare: number;
  totalPerquisite: number;
}

export function computeESOPExercise(input: ESOPExerciseInput): ESOPExerciseResult {
  const perquisitePerShare = Math.max(0, input.fmvAtExercise - input.exercisePrice);
  return {
    perquisitePerShare,
    totalPerquisite: perquisitePerShare * input.shares,
  };
}

export interface ESOPSaleInput {
  sharesSold: number;
  fmvAtExercise: number; // cost of acquisition
  salePrice: number;
  isListed: boolean;
  holdingMonthsFromExercise: number;
}

export interface ESOPSaleResult {
  gainPerShare: number;
  totalGain: number;
  isLongTerm: boolean;
  exemptAmount: number; // only applies to listed LTCG
  taxableGain: number;
  taxRate: number | null; // null when taxed at slab rate (unlisted STCG)
  taxBeforeCess: number | null;
}

const LISTED_LT_THRESHOLD_MONTHS = 12;
const UNLISTED_LT_THRESHOLD_MONTHS = 24;
const LISTED_LTCG_EXEMPTION = 125000;

export function computeESOPSale(input: ESOPSaleInput): ESOPSaleResult {
  const gainPerShare = input.salePrice - input.fmvAtExercise;
  const totalGain = Math.max(0, gainPerShare * input.sharesSold);
  const threshold = input.isListed ? LISTED_LT_THRESHOLD_MONTHS : UNLISTED_LT_THRESHOLD_MONTHS;
  const isLongTerm = input.holdingMonthsFromExercise > threshold;

  if (input.isListed && isLongTerm) {
    const exemptAmount = Math.min(totalGain, LISTED_LTCG_EXEMPTION);
    const taxableGain = Math.max(0, totalGain - LISTED_LTCG_EXEMPTION);
    return { gainPerShare, totalGain, isLongTerm, exemptAmount, taxableGain, taxRate: 0.125, taxBeforeCess: taxableGain * 0.125 };
  }
  if (input.isListed && !isLongTerm) {
    return { gainPerShare, totalGain, isLongTerm, exemptAmount: 0, taxableGain: totalGain, taxRate: 0.2, taxBeforeCess: totalGain * 0.2 };
  }
  if (!input.isListed && isLongTerm) {
    return { gainPerShare, totalGain, isLongTerm, exemptAmount: 0, taxableGain: totalGain, taxRate: 0.125, taxBeforeCess: totalGain * 0.125 };
  }
  // Unlisted, short-term: taxed at slab rate — computed by the caller
  // using the income tax engine, not a flat rate here.
  return { gainPerShare, totalGain, isLongTerm, exemptAmount: 0, taxableGain: totalGain, taxRate: null, taxBeforeCess: null };
}
