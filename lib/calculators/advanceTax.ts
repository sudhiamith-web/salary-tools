// Advance tax and Section 234B / 234C interest calculations.
// Verified Aug 2026 against multiple current sources.
//
// Advance tax is mandatory if net tax payable (after TDS/TCS) is
// ₹10,000 or more.
//
// Section 234C (deferment of individual installments) — for regular
// taxpayers (not on presumptive schemes), interest is triggered if
// CUMULATIVE advance tax paid falls short of these thresholds — note
// these are NOT the same as the payment schedule percentages (15/45/75/100):
//   By 15 June:      < 12% of net tax payable  → interest for 3 months
//   By 15 September: < 36% of net tax payable  → interest for 3 months
//   By 15 December:  < 75% of net tax payable  → interest for 3 months
//   By 15 March:     < 100% of net tax payable → interest for 1 month
// Presumptive taxpayers (Sec 44AD/44ADA) only need 100% by 15 March;
// shortfall there draws 1 month's interest.
// Interest rate: 1% per month (simple) on the shortfall amount.
//
// Section 234B (shortfall in total advance tax) is separate: if total
// advance tax paid is less than 90% of net tax payable, interest is 1%
// per month (simple) on the balance, from 1 April of the assessment
// year until the tax is actually paid / return processed — this can run
// well past 31 March, unlike 234C which is capped within the 234C
// mechanism itself.
//
// Known simplification: doesn't model the exemption for shortfalls
// caused by unanticipated capital gains or lottery/casual income, which
// the Act treats specially (no 234C interest if the tax on that income
// is paid in the next installment after it arises).

export type TaxpayerCategory = "regular" | "presumptive";

export interface AdvanceTaxInput {
  taxpayerCategory: TaxpayerCategory;
  totalTaxLiability: number;
  tdsAlreadyDeducted: number;
  quarterlyPaid: [number, number, number, number];
  monthsFor234B: number;
}

export interface QuarterResult {
  quarter: string;
  dueDate: string;
  requiredCumulativePercent: number;
  requiredCumulativeAmount: number;
  cumulativePaid: number;
  shortfall: number;
  interestMonths: number;
  interest: number;
}

export interface AdvanceTaxResult {
  netAdvanceTaxPayable: number;
  advanceTaxApplicable: boolean;
  quarters: QuarterResult[];
  total234CInterest: number;
  total234BInterest: number;
  totalPenalInterest: number;
  totalPaidSoFar: number;
  balanceTaxToPay: number;
}

export function computeAdvanceTax(input: AdvanceTaxInput): AdvanceTaxResult {
  const netAdvanceTaxPayable = Math.max(0, input.totalTaxLiability - input.tdsAlreadyDeducted);
  const advanceTaxApplicable = netAdvanceTaxPayable >= 10000;

  const schedule =
    input.taxpayerCategory === "presumptive"
      ? [
          { quarter: "Q1", dueDate: "15 June", requiredCumulativePercent: 0, interestMonths: 0 },
          { quarter: "Q2", dueDate: "15 September", requiredCumulativePercent: 0, interestMonths: 0 },
          { quarter: "Q3", dueDate: "15 December", requiredCumulativePercent: 0, interestMonths: 0 },
          { quarter: "Q4", dueDate: "15 March", requiredCumulativePercent: 100, interestMonths: 1 },
        ]
      : [
          { quarter: "Q1", dueDate: "15 June", requiredCumulativePercent: 12, interestMonths: 3 },
          { quarter: "Q2", dueDate: "15 September", requiredCumulativePercent: 36, interestMonths: 3 },
          { quarter: "Q3", dueDate: "15 December", requiredCumulativePercent: 75, interestMonths: 3 },
          { quarter: "Q4", dueDate: "15 March", requiredCumulativePercent: 100, interestMonths: 1 },
        ];

  let cumulativePaid = 0;
  let total234CInterest = 0;
  const quarters: QuarterResult[] = schedule.map((s, i) => {
    cumulativePaid += input.quarterlyPaid[i];
    const requiredCumulativeAmount = netAdvanceTaxPayable * (s.requiredCumulativePercent / 100);
    const shortfall = advanceTaxApplicable ? Math.max(0, requiredCumulativeAmount - cumulativePaid) : 0;
    const interest = shortfall * 0.01 * s.interestMonths;
    total234CInterest += interest;
    return { ...s, requiredCumulativeAmount, cumulativePaid, shortfall, interest };
  });

  const totalPaidSoFar = cumulativePaid;
  const ninetyPercentThreshold = netAdvanceTaxPayable * 0.9;
  const total234BInterest =
    advanceTaxApplicable && totalPaidSoFar < ninetyPercentThreshold
      ? (netAdvanceTaxPayable - totalPaidSoFar) * 0.01 * input.monthsFor234B
      : 0;

  return {
    netAdvanceTaxPayable,
    advanceTaxApplicable,
    quarters,
    total234CInterest,
    total234BInterest,
    totalPenalInterest: total234CInterest + total234BInterest,
    totalPaidSoFar,
    balanceTaxToPay: Math.max(0, netAdvanceTaxPayable - totalPaidSoFar),
  };
}
