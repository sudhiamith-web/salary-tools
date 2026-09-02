// Section 44ADA presumptive taxation for specified professionals.
// Verified Aug 2026, confirmed unchanged for FY 2026-27.
// Presumptive income = 50% of gross receipts (minimum; can declare more,
// not less, without losing the scheme's book-keeping/audit exemption).
// Eligibility: gross receipts up to ₹50 lakh, or ₹75 lakh if cash
// receipts are 5% or less of total receipts. No books of account or
// audit required within these limits. Taxed at normal slab rates (not a
// flat rate) — this tool uses the new regime engine on the presumptive
// income.

export const BASIC_LIMIT = 5000000;
export const ENHANCED_LIMIT = 7500000;
export const PRESUMPTIVE_RATE = 0.5;
export const CASH_RECEIPT_THRESHOLD = 0.05;

export interface Section44ADAInput {
  grossReceipts: number;
  cashReceiptsPercent: number; // 0-100
}

export interface Section44ADAResult {
  applicableLimit: number;
  eligible: boolean;
  presumptiveIncome: number;
}

export function computeSection44ADA(input: Section44ADAInput): Section44ADAResult {
  const isDigital = input.cashReceiptsPercent / 100 <= CASH_RECEIPT_THRESHOLD;
  const applicableLimit = isDigital ? ENHANCED_LIMIT : BASIC_LIMIT;
  const eligible = input.grossReceipts <= applicableLimit;
  const presumptiveIncome = eligible ? input.grossReceipts * PRESUMPTIVE_RATE : input.grossReceipts;

  return { applicableLimit, eligible, presumptiveIncome };
}
