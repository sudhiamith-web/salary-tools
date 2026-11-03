// Payroll compliance calendar. Dates researched on the web, November 2026.
// status "verified" = several independent sources agree; "verify" = sources
// disagree or only one was found — the page shows a "Verify" badge.
// Re-check every rule after each Budget and each state notification.
// When a due date falls on a holiday, the filing's own rule decides; the
// calendar shows the statutory date.

export type Status = "verified" | "verify";

export interface Source {
  label: string;
  url: string;
}

type Rule =
  | { kind: "monthly"; day: number; marchOverride?: { month: number; day: number } } // for the previous month's payroll
  | { kind: "fixed"; dates: { month: number; day: number }[] }; // month 1–12

export interface Obligation {
  id: string;
  title: string;
  detail: string;
  area: string; // "Central" or a state name
  type: "TDS" | "PF" | "ESI" | "PT" | "LWF" | "Bonus";
  rule: Rule;
  status: Status;
  note?: string;
  sources: Source[];
}

const S = {
  registerkaro: { label: "RegisterKaro compliance calendar FY 2026-27", url: "https://www.registerkaro.in/compliance-calendar" },
  patronCal: { label: "Patron Accounting payroll compliance calendar", url: "https://www.patronaccounting.com/tools/payroll-compliance-calendar" },
  keka: { label: "Keka statutory compliance calendar FY 2026-27", url: "https://www.keka.com/statutory-compliance-calendar" },
  patronChecklist: { label: "Patron Accounting monthly payroll checklist", url: "https://www.patronaccounting.com/blog/monthly-payroll-compliance-checklist-india-deadlines" },
  wisemonk: { label: "Wisemonk India payroll deadlines", url: "https://www.wisemonk.io/blogs/india-payroll-deadlines" },
  computax: { label: "Computax May 2026 compliance calendar", url: "https://computaxonline.com/blog/post/2026/05/25/may-2026-compliance-calendar-gst-tds-pf-esi-itr" },
  bonusSo: { label: "Factohr: bonus notifications S.O. 4710(E)/4711(E)", url: "https://factohr.com/?p=49064" },
  kaZoho: { label: "Zoho Payroll: Karnataka professional tax", url: "https://www.zoho.com/in/payroll/academy/payroll-laws/karnataka/professional-tax.html" },
  kaCalcguru: { label: "Calcguru: Karnataka professional tax 2026-27", url: "https://calcguru.in/professional-tax-karnataka/" },
  tally: { label: "Tally: professional tax return due dates", url: "https://tallysolutions.com/business-guides/professional-tax-return-due-date-business-compliance-guide/" },
  mhTaxguru: { label: "Taxguru: Maharashtra PT due dates moved to the 15th (Feb 2026)", url: "https://taxguru.in/?p=1031260" },
  mhPatron: { label: "Patron Accounting: PT returns, Pune", url: "https://www.patronaccounting.com/pt-returns/pune" },
  hrone: { label: "HROne: professional tax slab rates 2026-27", url: "https://content.hrone.cloud/?p=54337" },
  incorpx: { label: "InCorpX: professional tax state-wise guide", url: "https://www.incorpx.io/blog/professional-tax-registration-state-wise-guide" },
  petpooja: { label: "Petpooja: professional tax slab guide", url: "https://blog.petpooja.com/templates-checklist/professional-tax-slab-reference-guide/" },
  corpready: { label: "CorpReady: professional tax compliance", url: "https://corpready.in/resources/articles/228-professional-tax-compliance.html" },
  lwfSalarybox: { label: "SalaryBox: LWF state-wise due dates", url: "https://salarybox.in/blog/labour-welfare-fund-lwf-state-wise-rates-due-dates-employer-obligations/" },
  lwfCalcguruKa: { label: "Calcguru: Karnataka LWF", url: "https://calcguru.in/?p=9046" },
  lwfRazorpay: { label: "Razorpay: state-wise LWF rules", url: "https://razorpay.com/learn/?p=14817" },
  lwfMhFacto: { label: "Factohr: Maharashtra LWF", url: "https://factohr.com/labour-welfare-fund/maharashtra/" },
  lwfMhCalcguru: { label: "Calcguru: Maharashtra LWF 2026", url: "https://calcguru.in/?p=8383" },
  lwfDigiliance: { label: "Digiliance: LWF state-wise", url: "https://digiliance.in/labour-welfare-fund" },
  lwfMynd: { label: "Mynd: LWF state-wise", url: "https://www.myndsolution.com/labour-welfare-fund/" },
  lwfPatron: { label: "Patron Accounting: LWF rates and due dates", url: "https://www.patronaccounting.com/blog/labour-welfare-fund-india-contribution-rates-due-dates" },
  lwfZimyo: { label: "Zimyo: LWF glossary", url: "https://www.zimyo.com/hr-glossary/lwf" },
  lwfHyring: { label: "Hyring: LWF compliance checklist", url: "https://hyring.com/free-hr-toolkit/checklists/labor-welfare-fund-compliance-checklist" },
};

const HALF_YEAR = [
  { month: 1, day: 15 },
  { month: 7, day: 15 },
];

export const CENTRAL: Obligation[] = [
  {
    id: "tds",
    title: "TDS deposit on salaries",
    detail: "Tax deducted from last month’s salaries. March deductions are due by 30 April.",
    area: "Central",
    type: "TDS",
    rule: { kind: "monthly", day: 7, marchOverride: { month: 4, day: 30 } },
    status: "verified",
    sources: [S.registerkaro, S.patronCal, S.keka],
  },
  {
    id: "pf",
    title: "PF ECR and payment",
    detail: "EPF contributions for last month’s wages.",
    area: "Central",
    type: "PF",
    rule: { kind: "monthly", day: 15 },
    status: "verified",
    sources: [S.registerkaro, S.patronChecklist, S.patronCal],
  },
  {
    id: "esi",
    title: "ESI contribution",
    detail: "ESI for last month, for covered employees.",
    area: "Central",
    type: "ESI",
    rule: { kind: "monthly", day: 15 },
    status: "verified",
    note: "A few older guides still say the 21st.",
    sources: [S.registerkaro, S.patronCal, S.wisemonk],
  },
  {
    id: "tds-return",
    title: "Quarterly TDS return on salaries",
    detail: "Form 24Q, or its replacement form under the Income-tax Act, 2025.",
    area: "Central",
    type: "TDS",
    rule: { kind: "fixed", dates: [{ month: 1, day: 31 }, { month: 5, day: 31 }, { month: 7, day: 31 }, { month: 10, day: 31 }] },
    status: "verify",
    note: "Sources differ on the day (30th or 31st, and 15 or 31 May) and on the new form number.",
    sources: [S.patronChecklist, S.wisemonk, S.registerkaro, S.computax],
  },
  {
    id: "form16",
    title: "Salary TDS certificates to employees",
    detail: "Form 16, or its replacement under the Income-tax Act, 2025.",
    area: "Central",
    type: "TDS",
    rule: { kind: "fixed", dates: [{ month: 6, day: 15 }] },
    status: "verify",
    note: "Confirm the form name and date under the new Act.",
    sources: [S.wisemonk],
  },
  {
    id: "bonus",
    title: "Statutory bonus payment deadline",
    detail: "Within 8 months of the accounting year’s close (shown for an April–March year).",
    area: "Central",
    type: "Bonus",
    rule: { kind: "fixed", dates: [{ month: 11, day: 30 }] },
    status: "verified",
    sources: [S.bonusSo],
  },
];

export const STATES: Record<string, Obligation[]> = {
  Karnataka: [
    { id: "ka-pt", title: "Professional Tax – Karnataka", detail: "Payment and monthly return for last month.", area: "Karnataka", type: "PT", rule: { kind: "monthly", day: 20 }, status: "verified", sources: [S.kaZoho, S.kaCalcguru, S.tally] },
    { id: "ka-lwf", title: "Labour Welfare Fund – Karnataka", detail: "Annual contribution for the calendar year.", area: "Karnataka", type: "LWF", rule: { kind: "fixed", dates: [{ month: 1, day: 15 }] }, status: "verified", sources: [S.lwfCalcguruKa, S.lwfSalarybox, S.lwfRazorpay] },
  ],
  Maharashtra: [
    {
      id: "mh-pt",
      title: "Professional Tax – Maharashtra",
      detail: "Monthly return and payment for last month (monthly filers).",
      area: "Maharashtra",
      type: "PT",
      rule: { kind: "monthly", day: 15 },
      status: "verified",
      note: "Moved to the 15th by the Feb 2026 Rule 11(3) amendment. Sources differ on the liability limit for monthly filing; smaller employers file annually.",
      sources: [S.mhTaxguru, S.mhPatron, S.tally],
    },
    { id: "mh-lwf", title: "Labour Welfare Fund – Maharashtra", detail: "Half-yearly contribution (Jan–Jun by 15 Jul, Jul–Dec by 15 Jan).", area: "Maharashtra", type: "LWF", rule: { kind: "fixed", dates: HALF_YEAR }, status: "verified", sources: [S.lwfMhFacto, S.lwfMhCalcguru, S.lwfSalarybox] },
  ],
  "West Bengal": [
    { id: "wb-pt", title: "Professional Tax – West Bengal", detail: "Monthly payment for last month.", area: "West Bengal", type: "PT", rule: { kind: "monthly", day: 21 }, status: "verified", sources: [S.tally, S.hrone, S.incorpx] },
    { id: "wb-lwf", title: "Labour Welfare Fund – West Bengal", detail: "Half-yearly contribution.", area: "West Bengal", type: "LWF", rule: { kind: "fixed", dates: HALF_YEAR }, status: "verified", sources: [S.lwfRazorpay, S.lwfPatron] },
  ],
  Gujarat: [
    { id: "gj-pt", title: "Professional Tax – Gujarat", detail: "Monthly payment for last month.", area: "Gujarat", type: "PT", rule: { kind: "monthly", day: 15 }, status: "verified", sources: [S.hrone, S.petpooja] },
    { id: "gj-lwf", title: "Labour Welfare Fund – Gujarat", detail: "Half-yearly contribution.", area: "Gujarat", type: "LWF", rule: { kind: "fixed", dates: HALF_YEAR }, status: "verify", note: "Sources differ: 15 or 31 July / January.", sources: [S.lwfPatron, S.lwfMynd] },
  ],
  Telangana: [
    { id: "tg-pt", title: "Professional Tax – Telangana", detail: "Monthly payment for last month.", area: "Telangana", type: "PT", rule: { kind: "monthly", day: 10 }, status: "verify", note: "Only one source found.", sources: [S.hrone] },
    { id: "tg-lwf", title: "Labour Welfare Fund – Telangana", detail: "Annual contribution.", area: "Telangana", type: "LWF", rule: { kind: "fixed", dates: [{ month: 1, day: 31 }] }, status: "verify", note: "Only one source found.", sources: [S.lwfSalarybox] },
  ],
  "Andhra Pradesh": [
    { id: "ap-lwf", title: "Labour Welfare Fund – Andhra Pradesh", detail: "Annual contribution.", area: "Andhra Pradesh", type: "LWF", rule: { kind: "fixed", dates: [{ month: 1, day: 31 }] }, status: "verified", sources: [S.lwfPatron, S.lwfSalarybox] },
  ],
  "Tamil Nadu": [
    { id: "tn-pt", title: "Professional Tax – Tamil Nadu", detail: "Half-yearly, paid to the local body.", area: "Tamil Nadu", type: "PT", rule: { kind: "fixed", dates: [{ month: 3, day: 31 }, { month: 9, day: 30 }] }, status: "verify", note: "Sources differ: 30 Sep / 31 Mar or 15 Apr / 15 Oct.", sources: [S.hrone, S.corpready] },
    { id: "tn-lwf", title: "Labour Welfare Fund – Tamil Nadu", detail: "Annual contribution.", area: "Tamil Nadu", type: "LWF", rule: { kind: "fixed", dates: [{ month: 1, day: 31 }] }, status: "verify", note: "Sources differ on annual vs half-yearly.", sources: [S.lwfZimyo, S.lwfSalarybox, S.lwfHyring] },
  ],
  Delhi: [
    { id: "dl-lwf", title: "Labour Welfare Fund – Delhi", detail: "Half-yearly contribution. Delhi has no professional tax.", area: "Delhi", type: "LWF", rule: { kind: "fixed", dates: HALF_YEAR }, status: "verified", sources: [S.lwfMynd, S.lwfRazorpay, S.lwfDigiliance] },
  ],
};

export const STATE_NAMES = Object.keys(STATES);

export interface CalendarEvent {
  date: string; // yyyy-mm-dd
  obligation: Obligation;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Events falling in a given month (month 1–12). */
export function eventsForMonth(year: number, month: number, states: string[]): CalendarEvent[] {
  const list = [...CENTRAL, ...states.flatMap((s) => STATES[s] ?? [])];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const out: CalendarEvent[] = [];
  for (const o of list) {
    if (o.rule.kind === "monthly") {
      const ov = o.rule.marchOverride;
      // The 7 April TDS deposit doesn't exist: March deductions go to 30 April.
      if (ov && month === ov.month) out.push({ date: `${year}-${pad(month)}-${pad(ov.day)}`, obligation: o });
      else out.push({ date: `${year}-${pad(month)}-${pad(Math.min(o.rule.day, daysInMonth))}`, obligation: o });
    } else {
      for (const d of o.rule.dates) if (d.month === month) out.push({ date: `${year}-${pad(month)}-${pad(d.day)}`, obligation: o });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.obligation.area.localeCompare(b.obligation.area));
}

/** All-day events for 12 months starting at (year, month), as an .ics file. */
export function buildIcs(year: number, month: number, states: string[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Salary-Tools//Payroll Compliance Calendar//EN", "CALSCALE:GREGORIAN"];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  for (let k = 0; k < 12; k++) {
    const m = ((month - 1 + k) % 12) + 1;
    const y = year + Math.floor((month - 1 + k) / 12);
    for (const e of eventsForMonth(y, m, states)) {
      const d = e.date.replace(/-/g, "");
      const next = new Date(Date.UTC(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1, +e.date.slice(8, 10) + 1)).toISOString().slice(0, 10).replace(/-/g, "");
      const desc = `${e.obligation.detail}${e.obligation.status === "verify" ? " (Date to verify.)" : ""} From salary-tools.com`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${e.obligation.id}-${d}@salary-tools.com`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${next}`,
        `SUMMARY:${e.obligation.title.replace(/[,;]/g, "\\$&")}`,
        `DESCRIPTION:${desc.replace(/[,;]/g, "\\$&")}`,
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
