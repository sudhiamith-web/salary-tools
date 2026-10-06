import { parseDate, toIso } from "./format";
import type { Holiday, HolidayKind } from "./types";

export const KIND_LABEL: Record<HolidayKind, string> = {
  national: "National",
  general: "General (gazetted)",
  restricted: "Restricted / optional",
};

/** The three national holidays have fixed dates every year. */
export function nationalHolidays(year: number): Holiday[] {
  return [
    { name: "Republic Day", date: `${year}-01-26`, kind: "national" },
    { name: "Independence Day", date: `${year}-08-15`, kind: "national" },
    { name: "Gandhi Jayanti", date: `${year}-10-02`, kind: "national" },
  ];
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export interface Break {
  start: string;
  end: string;
  days: number;
  leaveDates: string[]; // empty = no leave needed
  holidays: string[]; // holiday names inside the break
}

/**
 * Finds long weekends (3+ consecutive days off with no leave) and
 * one-leave bridges (taking a single day off creates 4+ consecutive days off).
 */
export function findBreaks(
  holidays: Holiday[],
  year: number,
  opts: { saturdaysOff: boolean }
): Break[] {
  const holidayByDate = new Map<string, string[]>();
  for (const h of holidays) {
    if (!h.date.startsWith(String(year))) continue;
    holidayByDate.set(h.date, [...(holidayByDate.get(h.date) ?? []), h.name]);
  }

  const isOff = (d: Date) => {
    const dow = d.getDay();
    if (dow === 0) return true;
    if (dow === 6 && opts.saturdaysOff) return true;
    return holidayByDate.has(toIso(d));
  };

  const runAround = (seed: Date, extraOff?: string) => {
    const off = (d: Date) => isOff(d) || toIso(d) === extraOff;
    let s = new Date(seed);
    while (off(addDays(s, -1))) s = addDays(s, -1);
    let e = new Date(seed);
    while (off(addDays(e, 1))) e = addDays(e, 1);
    const names: string[] = [];
    for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
      names.push(...(holidayByDate.get(toIso(d)) ?? []));
    }
    const days = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
    return { start: toIso(s), end: toIso(e), days, names };
  };

  const seen = new Set<string>();
  const out: Break[] = [];

  // 1. Natural long weekends.
  for (const date of Array.from(holidayByDate.keys())) {
    const r = runAround(parseDate(date));
    const key = `${r.start}|${r.end}|`;
    if (r.days >= 3 && !seen.has(key)) {
      seen.add(key);
      out.push({ start: r.start, end: r.end, days: r.days, leaveDates: [], holidays: r.names });
    }
  }

  // 2. One-day bridges next to a holiday.
  for (const date of Array.from(holidayByDate.keys())) {
    const d = parseDate(date);
    for (const delta of [-1, 1, -2, 2]) {
      const candidate = addDays(d, delta);
      if (isOff(candidate) || candidate.getFullYear() !== year) continue;
      const iso = toIso(candidate);
      const r = runAround(candidate, iso);
      const key = `${r.start}|${r.end}|${iso}`;
      if (r.days >= 4 && !seen.has(key)) {
        seen.add(key);
        out.push({ start: r.start, end: r.end, days: r.days, leaveDates: [iso], holidays: r.names });
      }
    }
  }

  return out.sort((a, b) => a.start.localeCompare(b.start) || a.leaveDates.length - b.leaveDates.length);
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Builds an iCalendar file with one all-day event per holiday. */
export function buildIcs(holidays: Holiday[], calendarName: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//salary-tools.com//Holiday list//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${icsEscape(calendarName)}`,
  ];
  for (const h of holidays) {
    const start = h.date.replace(/-/g, "");
    const end = toIso(addDays(parseDate(h.date), 1)).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${start}-${h.name.replace(/[^a-z0-9]/gi, "").toLowerCase()}@salary-tools.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${icsEscape(h.name)}${h.tentative ? " (tentative)" : ""}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
