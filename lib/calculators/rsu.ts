// RSU taxation for shares of a FOREIGN (typically US-listed) company.
// Verified Aug 2026. Foreign shares are NOT "listed" for Indian tax
// purposes (not on a recognized Indian exchange, no STT paid) — they
// always follow UNLISTED share rules for capital gains, regardless of
// being listed on NASDAQ/NYSE etc.
//
// Stage 1 — Vesting: full FMV of vested shares (no exercise price for
// RSUs) is a salary perquisite, taxed at slab rate. Converted to INR
// using the SBI TT Buying Rate (TTBR) — specifically the rate on the
// LAST DAY OF THE MONTH PRECEDING the vesting month (Rule 115/206), not
// the vesting date itself, not today's rate.
//
// Stage 2 — Sale: Capital gain = Sale proceeds (INR, TTBR on last day of
// month preceding sale month) − FMV at vesting (INR, already converted,
// becomes cost of acquisition). Unlisted-share holding rule: >24 months
// from vesting = LTCG 12.5% no indexation; ≤24 months = STCG at slab rate.
//
// Also required: Schedule FA disclosure (foreign asset holdings,
// calendar-year basis, separate from the April-March return period) and
// potentially a Foreign Tax Credit claim (Form 67) if US tax was
// withheld — NOT modeled here; genuinely complex, flagged as out of
// scope, recommend a CA for cross-border filing.

export interface RSUVestInput {
  shares: number;
  fmvPerShareUSD: number;
  usdInrRate: number; // SBI TTBR for the correct date — user-supplied
}

export interface RSUVestResult {
  fmvPerShareINR: number;
  totalPerquisiteINR: number;
}

export function computeRSUVest(input: RSUVestInput): RSUVestResult {
  const fmvPerShareINR = input.fmvPerShareUSD * input.usdInrRate;
  return {
    fmvPerShareINR,
    totalPerquisiteINR: fmvPerShareINR * input.shares,
  };
}

export interface RSUSaleInput {
  sharesSold: number;
  costBasisINRPerShare: number; // FMV at vesting, in INR
  salePriceUSD: number;
  usdInrRateAtSale: number;
  holdingMonthsFromVesting: number;
}

export interface RSUSaleResult {
  saleValueINR: number;
  gain: number;
  isLongTerm: boolean;
  taxRate: number | null; // null when taxed at slab (short-term)
  taxBeforeCess: number | null;
}

const UNLISTED_LT_THRESHOLD_MONTHS = 24;

export function computeRSUSale(input: RSUSaleInput): RSUSaleResult {
  const saleValueINR = input.salePriceUSD * input.usdInrRateAtSale * input.sharesSold;
  const costBasis = input.costBasisINRPerShare * input.sharesSold;
  const gain = Math.max(0, saleValueINR - costBasis);
  const isLongTerm = input.holdingMonthsFromVesting > UNLISTED_LT_THRESHOLD_MONTHS;

  if (isLongTerm) {
    return { saleValueINR, gain, isLongTerm, taxRate: 0.125, taxBeforeCess: gain * 0.125 };
  }
  return { saleValueINR, gain, isLongTerm, taxRate: null, taxBeforeCess: null };
}
