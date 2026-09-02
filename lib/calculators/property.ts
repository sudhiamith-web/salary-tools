// Property (land/building) capital gains. Verified Aug 2026.
// Holding > 24 months = long-term.
// Property acquired ON/AFTER 23 July 2024: only 12.5% without indexation.
// Property acquired BEFORE 23 July 2024: choice of LOWER of
//   (a) 12.5% without indexation, or (b) 20% with indexation.
// STCG (≤24 months): taxed at slab rate, not modeled here — this tool
// covers LTCG only, since STCG on property just adds to regular income.
// Section 54 (reinvest in residential property, up to ₹10 crore) and
// Section 54EC (invest in specified bonds within 6 months, cap ₹50 lakh)
// exemptions are noted but not modeled as automatic deductions — the
// user enters any exemption claimed manually.

export const CII: Record<string, number> = {
  "2001-02": 100, "2002-03": 105, "2003-04": 109, "2004-05": 113,
  "2005-06": 117, "2006-07": 122, "2007-08": 129, "2008-09": 137,
  "2009-10": 148, "2010-11": 167, "2011-12": 184, "2012-13": 200,
  "2013-14": 220, "2014-15": 240, "2015-16": 254, "2016-17": 264,
  "2017-18": 272, "2018-19": 280, "2019-20": 289, "2020-21": 301,
  "2021-22": 317, "2022-23": 331, "2023-24": 348, "2024-25": 363,
  "2025-26": 376, "2026-27": 384,
};

export const CII_YEARS = Object.keys(CII);
export const GRANDFATHER_CUTOFF_YEAR = "2024-25"; // FY containing 23 July 2024

export interface PropertyInput {
  saleValue: number;
  purchaseValue: number;
  purchaseYear: string; // key into CII, e.g. "2015-16"
  saleYear: string;
  transferExpenses: number;
  section54Exemption: number;
  section54ECExemption: number;
  isPreJuly2024Purchase: boolean; // grandfathering eligibility
}

export interface PropertyResult {
  gain: number;
  indexedCost: number;
  indexedGain: number;
  taxWithoutIndexation: number;
  taxWithIndexation: number | null; // null if not eligible for grandfathering
  chosenTax: number;
  chosenMethod: "without-indexation" | "with-indexation";
  exemptionsClaimed: number;
  finalTaxableGain: number;
  finalTax: number;
  cess: number;
  totalTax: number;
}

export function computeProperty(input: PropertyInput): PropertyResult {
  const gain = Math.max(0, input.saleValue - input.purchaseValue - input.transferExpenses);

  const purchaseCII = CII[input.purchaseYear] ?? CII["2001-02"];
  const saleCII = CII[input.saleYear] ?? CII[CII_YEARS[CII_YEARS.length - 1]];
  const indexedCost = input.purchaseValue * (saleCII / purchaseCII);
  const indexedGain = Math.max(0, input.saleValue - indexedCost - input.transferExpenses);

  const taxWithoutIndexation = gain * 0.125;
  const taxWithIndexation = input.isPreJuly2024Purchase ? indexedGain * 0.2 : null;

  const chosenMethod: PropertyResult["chosenMethod"] =
    taxWithIndexation !== null && taxWithIndexation < taxWithoutIndexation
      ? "with-indexation"
      : "without-indexation";
  const chosenTax = chosenMethod === "with-indexation" ? (taxWithIndexation as number) : taxWithoutIndexation;

  const exemptionsClaimed = Math.min(
    chosenMethod === "with-indexation" ? indexedGain : gain,
    input.section54Exemption + input.section54ECExemption
  );

  const baseGainForFinalTax = chosenMethod === "with-indexation" ? indexedGain : gain;
  const finalTaxableGain = Math.max(0, baseGainForFinalTax - exemptionsClaimed);
  const rate = chosenMethod === "with-indexation" ? 0.2 : 0.125;
  const finalTax = finalTaxableGain * rate;
  const cess = finalTax * 0.04;

  return {
    gain,
    indexedCost,
    indexedGain,
    taxWithoutIndexation,
    taxWithIndexation,
    chosenTax,
    chosenMethod,
    exemptionsClaimed,
    finalTaxableGain,
    finalTax,
    cess,
    totalTax: finalTax + cess,
  };
}
