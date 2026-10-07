// State list for PT and LWF inputs.
//
// Amounts are deliberately NOT hard-coded here: PT slabs and LWF rates
// change by state notification, and the verified values will come from
// the Sanity LWF / PT data being built for /lwf-rates. Until then the
// calculator asks for the payslip amount and links to the state page.
//
// TODO (once the Sanity schema is final): add a fetch in the page
// component and pass verified rates down as props, replacing the manual
// inputs as the default.

import type { LwfFrequency } from "@/lib/calculators/lwf";

export interface StateOption {
  code: string;
  name: string;
}

export const STATES: StateOption[] = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

// Shape the Sanity data should map into once wired.
export interface StateLwfRate {
  stateCode: string;
  employeeAmount: number;
  employerAmount: number;
  frequency: LwfFrequency;
  verifiedOn: string; // ISO date
  sourceUrl: string;
}

export function stateName(code: string): string {
  return STATES.find((s) => s.code === code)?.name ?? code;
}
