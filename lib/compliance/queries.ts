import { sanityQuery, sanityQuerySafe } from "./sanityFetch";
import type { HolidayList, LwfRule, WageNotification, WageSchedule } from "./types";

// Only documents marked "Verified" in Studio are ever shown on the site.
const VERIFIED = `status == "verified"`;

const META = `
  lastVerified,
  status,
  editorNote,
  faqItems[]{question, answer},
  sources[]{title, issuedBy, reference, issuedOn, "url": coalesce(file.asset->url, link)}
`;

/* ---------------- Holidays ---------------- */

export function getHolidayList(state: string, year: number) {
  return sanityQuerySafe<HolidayList | null>(
    `*[_type == "holidayList" && state == $state && year == $year && ${VERIFIED}][0]{
      state, year,
      holidays[]{name, date, kind, tentative} | order(date asc),
      privateEmployerRules{
        actName, minimumPaidHolidays, festivalHolidaysToChoose,
        eligibility, workingOnHolidayRule, notes,
        mandatoryHolidays[]{name, date}
      },
      ${META}
    }`,
    { state, year },
    null
  );
}

export interface HolidayHubRow {
  state: string;
  total: number;
  national: number;
  general: number;
  restricted: number;
  privateMinimum?: number;
}

export function getHolidayHub(year: number) {
  return sanityQuerySafe<HolidayHubRow[]>(
    `*[_type == "holidayList" && year == $year && ${VERIFIED}]{
      state,
      "total": count(holidays),
      "national": count(holidays[kind == "national"]),
      "general": count(holidays[kind == "general"]),
      "restricted": count(holidays[kind == "restricted"]),
      "privateMinimum": privateEmployerRules.minimumPaidHolidays
    }`,
    { year },
    []
  );
}

export async function getHolidayYears(): Promise<number[]> {
  const years = await sanityQuerySafe<number[]>(
    `array::unique(*[_type == "holidayList" && ${VERIFIED}].year)`,
    {},
    []
  );
  return years.sort((a, b) => a - b);
}

/* ---------------- Minimum wages ---------------- */

const SCHEDULES = `
  "schedules": *[_type == "minimumWageSchedule" && notification._ref == ^._id] | order(employment asc){
    _id, employment, unit,
    vdaByZone[]{zone, vda},
    rows[]{category, skill, zone, basic, vdaOverride}
  }
`;

export function getWageNotifications(state: string) {
  return sanityQuerySafe<WageNotification[]>(
    `*[_type == "minimumWageNotification" && state == $state && ${VERIFIED}] | order(effectiveFrom desc){
      _id, state, effectiveFrom, framework, monthlyDivisor, nextRevisionNote,
      zones[]{key, areas},
      ${SCHEDULES},
      ${META}
    }`,
    { state },
    []
  );
}

/** Browser-side fetch for the standalone checker tool (latest notification only). */
export function getLatestWageNotificationBrowser(state: string) {
  return sanityQuery<WageNotification | null>(
    `*[_type == "minimumWageNotification" && state == $state && ${VERIFIED}] | order(effectiveFrom desc)[0]{
      _id, state, effectiveFrom, framework, monthlyDivisor,
      zones[]{key, areas},
      ${SCHEDULES},
      sources[]{title, issuedBy, reference, issuedOn, "url": coalesce(file.asset->url, link)},
      lastVerified
    }`,
    { state },
    { browser: true }
  );
}

export interface WageHubRow {
  _id: string;
  state: string;
  effectiveFrom: string;
  monthlyDivisor?: number;
  schedules: Pick<WageSchedule, "unit" | "vdaByZone" | "rows">[];
}

/** Every verified notification (all states), newest first. Hub derives "latest per state". */
export function getWageHub() {
  return sanityQuerySafe<WageHubRow[]>(
    `*[_type == "minimumWageNotification" && ${VERIFIED}] | order(effectiveFrom desc){
      _id, state, effectiveFrom, monthlyDivisor,
      "schedules": *[_type == "minimumWageSchedule" && notification._ref == ^._id]{
        unit, vdaByZone[]{zone, vda}, rows[]{skill, zone, basic, vdaOverride}
      }
    }`,
    {},
    []
  );
}

/* ---------------- LWF ---------------- */

const LWF_FIELDS = `
  state, applicable, actName, boardName, portalUrl, frequency,
  deductionMonths, dueDates[]{period, due}, minEmployees, excludedAboveWage,
  coverageNotes, effectiveFrom,
  slabs[]{label, wageFrom, wageTo, mode, employee, employer,
          employeePercent, employeeCap, employerPercent, employerCap}
`;

export function getLwfRule(state: string) {
  return sanityQuerySafe<LwfRule | null>(
    `*[_type == "lwfRule" && state == $state && ${VERIFIED}][0]{ ${LWF_FIELDS}, ${META} }`,
    { state },
    null
  );
}

export function getAllLwfRules() {
  return sanityQuerySafe<LwfRule[]>(
    `*[_type == "lwfRule" && ${VERIFIED}]{ ${LWF_FIELDS}, lastVerified }`,
    {},
    []
  );
}

/* ---------------- Sitemap ---------------- */

export function getVerifiedForSitemap() {
  return sanityQuerySafe<{ type: string; state: string; year?: number; lastVerified?: string }[]>(
    `*[_type in ["holidayList", "minimumWageNotification", "lwfRule"] && ${VERIFIED}]{
      "type": _type, state, year, lastVerified
    }`,
    {},
    []
  );
}
