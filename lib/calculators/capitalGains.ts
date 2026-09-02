// Capital gains tax on LISTED EQUITY SHARES and EQUITY-ORIENTED MUTUAL
// FUNDS only (STT paid) — Sections 111A (STCG) and 112A (LTCG).
// Verified Aug 2026, confirmed unchanged through Budget 2026.
//
// Other asset classes (property, debt funds, gold, unlisted shares) have
// different rates, holding periods, and indexation rules — NOT covered
// by this calculator. See the Property Capital Gains tool (planned) for
// real estate specifically.
//
// LTCG (holding > 12 months): 12.5% + 4% cess, on gains above ₹1,25,000
// exempt per financial year. No indexation.
// STCG (holding ≤ 12 months): flat 20% + 4% cess, no exemption threshold.

export const LTCG_EXEMPTION = 125000;
export const LTCG_RATE = 0.125;
export const STCG_RATE = 0.2;
export const CESS_RATE = 0.04;

export interface CapitalGainsInput {
  saleValue: number;
  purchaseValue: number;
  expenses: number; // brokerage, STT, other transfer costs
}

export interface LTCGResult {
  gain: number;
  exemptAmount: number;
  taxableGain: number;
  taxBeforeCess: number;
  cess: number;
  totalTax: number;
  netProceeds: number;
}

export interface STCGResult {
  gain: number;
  taxBeforeCess: number;
  cess: number;
  totalTax: number;
  netProceeds: number;
}

function computeGain(input: CapitalGainsInput): number {
  return Math.max(0, input.saleValue - input.purchaseValue - input.expenses);
}

export function computeLTCG(input: CapitalGainsInput): LTCGResult {
  const gain = computeGain(input);
  const exemptAmount = Math.min(gain, LTCG_EXEMPTION);
  const taxableGain = Math.max(0, gain - LTCG_EXEMPTION);
  const taxBeforeCess = taxableGain * LTCG_RATE;
  const cess = taxBeforeCess * CESS_RATE;
  const totalTax = taxBeforeCess + cess;
  return {
    gain,
    exemptAmount,
    taxableGain,
    taxBeforeCess,
    cess,
    totalTax,
    netProceeds: input.saleValue - input.expenses - totalTax,
  };
}

export function computeSTCG(input: CapitalGainsInput): STCGResult {
  const gain = computeGain(input);
  const taxBeforeCess = gain * STCG_RATE;
  const cess = taxBeforeCess * CESS_RATE;
  const totalTax = taxBeforeCess + cess;
  return {
    gain,
    taxBeforeCess,
    cess,
    totalTax,
    netProceeds: input.saleValue - input.expenses - totalTax,
  };
}
