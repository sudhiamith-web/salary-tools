// Types mirror the Sanity documents in sanity/schemaTypes/compliance/.
// If you add a field in Studio schema, add it here and in queries.ts.

export interface SourceDoc {
  title: string;
  issuedBy?: string;
  reference?: string; // notification no. / G.O. no.
  issuedOn?: string; // YYYY-MM-DD
  url?: string; // resolved file URL or external link
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface VerificationMeta {
  lastVerified?: string; // YYYY-MM-DD
  status?: "draft" | "verified";
  sources?: SourceDoc[];
  faqItems?: FaqItem[];
  editorNote?: string; // shown on the page, e.g. "Rates under challenge in HC"
}

/* ---------------- Holidays ---------------- */

export type HolidayKind = "national" | "general" | "restricted";

export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD
  kind: HolidayKind;
  tentative?: boolean; // lunar-calendar dates that may shift
}

export interface PrivateEmployerRules {
  actName?: string;
  minimumPaidHolidays?: number;
  mandatoryHolidays?: { name: string; date?: string }[];
  festivalHolidaysToChoose?: number;
  eligibility?: string;
  workingOnHolidayRule?: string;
  notes?: string;
}

export interface HolidayList extends VerificationMeta {
  state: string;
  year: number;
  holidays: Holiday[];
  privateEmployerRules?: PrivateEmployerRules;
}

/* ---------------- Minimum wages ---------------- */

export type SkillLevel =
  | "unskilled"
  | "semi-skilled"
  | "skilled"
  | "highly-skilled"
  | "not-specified";

export type RateUnit = "day" | "month";

export interface WageZone {
  key: string; // "Zone I"
  areas?: string; // districts / cities covered
}

export interface WageRow {
  category: string; // occupation / class of work
  skill: SkillLevel;
  zone: string; // must match a WageZone.key
  basic: number;
  vdaOverride?: number; // only if VDA differs from the schedule default
}

export interface WageSchedule {
  _id: string;
  employment: string; // scheduled employment / sector
  unit: RateUnit;
  vdaByZone?: { zone: string; vda: number }[];
  rows: WageRow[];
}

export interface WageNotification extends VerificationMeta {
  _id: string;
  state: string;
  effectiveFrom: string;
  framework: "legacy" | "code-on-wages";
  monthlyDivisor?: number; // default 26
  zones: WageZone[];
  nextRevisionNote?: string;
  schedules: WageSchedule[];
}

/* ---------------- LWF ---------------- */

export type LwfFrequency = "monthly" | "half-yearly" | "yearly";

export interface LwfSlab {
  label?: string; // e.g. "Shops & establishments" or "Wages up to ₹3,000"
  wageFrom?: number;
  wageTo?: number;
  mode: "fixed" | "percent";
  employee?: number;
  employer?: number;
  employeePercent?: number;
  employeeCap?: number;
  employerPercent?: number;
  employerCap?: number;
}

export interface LwfRule extends VerificationMeta {
  state: string;
  applicable: boolean;
  actName?: string;
  boardName?: string;
  portalUrl?: string;
  frequency?: LwfFrequency;
  deductionMonths?: number[]; // 1-12
  dueDates?: { period: string; due: string }[];
  minEmployees?: number;
  excludedAboveWage?: number;
  coverageNotes?: string;
  effectiveFrom?: string;
  slabs?: LwfSlab[];
}
