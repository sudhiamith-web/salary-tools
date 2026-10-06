"use client";

import { useMemo, useState } from "react";
import { buildIcs, findBreaks, KIND_LABEL } from "@/lib/compliance/holidays";
import { monthName, parseDate, shortDate, toIso, weekday } from "@/lib/compliance/format";
import type { Holiday, HolidayKind, PrivateEmployerRules } from "@/lib/compliance/types";

const KIND_STYLE: Record<HolidayKind, string> = {
  national: "bg-accent text-white",
  general: "bg-accentTint text-accent ring-1 ring-inset ring-accent/40",
  restricted: "text-accent border border-dashed border-accent/60",
};

/* ---------- Year at a glance ---------- */

function MonthBlock({ year, month, byDate }: { year: number; month: number; byDate: Map<string, Holiday[]> }) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div>
      <p className="text-xs font-medium text-ink mb-1.5">{monthName(month, true)}</p>
      <div className="grid grid-cols-7 gap-[3px]">
        {cells.map((d, i) => {
          if (d === null) return <span key={`b${i}`} />;
          const iso = toIso(new Date(year, month, d));
          const hs = byDate.get(iso);
          const top = hs?.find((h) => h.kind === "national") ?? hs?.find((h) => h.kind === "general") ?? hs?.[0];
          const isWeekend = new Date(year, month, d).getDay() % 6 === 0;
          return (
            <span
              key={iso}
              title={hs ? `${shortDate(iso)}: ${hs.map((h) => h.name).join(", ")}` : undefined}
              className={`flex aspect-square items-center justify-center rounded-[3px] text-[10px] leading-none ${
                top ? KIND_STYLE[top.kind] : isWeekend ? "text-charcoal/35" : "text-charcoal/70"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function YearAtAGlance({ year, holidays }: { year: number; holidays: Holiday[] }) {
  const byDate = useMemo(() => {
    const m = new Map<string, Holiday[]>();
    for (const h of holidays) m.set(h.date, [...(m.get(h.date) ?? []), h]);
    return m;
  }, [holidays]);
  return (
    <div className="card px-5 py-5">
      <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, m) => (
          <MonthBlock key={m} year={year} month={m} byDate={byDate} />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-charcoal/70">
        {(Object.keys(KIND_LABEL) as HolidayKind[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-[3px] ${KIND_STYLE[k]}`} aria-hidden="true" />
            {KIND_LABEL[k]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Government list ---------- */

function GovernmentList({ year, regionName, holidays }: { year: number; regionName: string; holidays: Holiday[] }) {
  const [kinds, setKinds] = useState<Record<HolidayKind, boolean>>({ national: true, general: true, restricted: true });
  const [month, setMonth] = useState<number | "all">("all");
  const [saturdaysOff, setSaturdaysOff] = useState(true);

  const filtered = holidays.filter(
    (h) => kinds[h.kind] && (month === "all" || parseDate(h.date).getMonth() === month)
  );

  // Long weekends use national + general only: restricted holidays are optional for staff.
  const breaks = useMemo(
    () => findBreaks(holidays.filter((h) => h.kind !== "restricted"), year, { saturdaysOff }),
    [holidays, year, saturdaysOff]
  );

  const download = () => {
    const ics = buildIcs(filtered, `${regionName} holidays ${year}`);
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${regionName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-holidays-${year}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasTentative = holidays.some((h) => h.tentative);

  return (
    <div className="space-y-10">
      <section aria-labelledby="list-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <h2 id="list-heading" className="text-xl font-semibold text-ink">All holidays</h2>
          <button
            type="button"
            onClick={download}
            disabled={filtered.length === 0}
            className="rounded-md border border-accent px-3 py-2 text-sm font-medium text-accent hover:bg-accentTint disabled:opacity-40"
          >
            Add {filtered.length} to calendar (.ics)
          </button>
        </div>

        <fieldset className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <legend className="sr-only">Filter holidays</legend>
          {(Object.keys(KIND_LABEL) as HolidayKind[]).map((k) => (
            <label key={k} className="inline-flex items-center gap-2 text-charcoal/80">
              <input
                type="checkbox"
                checked={kinds[k]}
                onChange={(e) => setKinds({ ...kinds, [k]: e.target.checked })}
              />
              {KIND_LABEL[k]} ({holidays.filter((h) => h.kind === k).length})
            </label>
          ))}
          <label className="inline-flex items-center gap-2 text-charcoal/80">
            Month
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              {Array.from({ length: 12 }, (_, m) => (
                <option key={m} value={m}>{monthName(m, true)}</option>
              ))}
            </select>
          </label>
        </fieldset>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paperDark/60 text-left text-charcoal/70">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Holiday</th>
                <th scope="col" className="px-4 py-2.5 font-medium whitespace-nowrap">Date</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Day</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={`${h.date}-${h.name}`} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 text-ink">
                    {h.name}
                    {h.tentative && <span className="ml-1 text-charcoal/50" title="Date depends on moon sighting and may change">*</span>}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-ink">{shortDate(h.date)}</td>
                  <td className="px-4 py-2.5 text-charcoal/70">{weekday(h.date)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs ${KIND_STYLE[h.kind]}`}>{KIND_LABEL[h.kind]}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-charcoal/60">
                    No holidays match these filters. Turn a type back on or pick another month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasTentative && (
          <p className="mt-2 text-xs text-charcoal/60">* Date depends on moon sighting and may be changed by a later notification.</p>
        )}
      </section>

      <section aria-labelledby="breaks-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-1">
          <h2 id="breaks-heading" className="text-xl font-semibold text-ink">Long weekends in {year}</h2>
          <label className="inline-flex items-center gap-2 text-sm text-charcoal/80">
            <input type="checkbox" checked={saturdaysOff} onChange={(e) => setSaturdaysOff(e.target.checked)} />
            Saturdays are off
          </label>
        </div>
        <p className="text-sm text-charcoal/60 mb-4">Based on national and general holidays. Restricted holidays are left out because staff choose them.</p>
        {breaks.length === 0 ? (
          <p className="text-sm text-charcoal/70">No long weekends found with these settings.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {breaks.map((b) => (
              <li key={`${b.start}-${b.leaveDates.join()}`} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="font-medium text-ink">
                  {b.days} days off, {shortDate(b.start)} to {shortDate(b.end)}
                </p>
                <p className="text-sm text-charcoal/70 mt-0.5">
                  {b.leaveDates.length === 0
                    ? "No leave needed."
                    : `Take leave on ${weekday(b.leaveDates[0])}, ${shortDate(b.leaveDates[0])}.`}{" "}
                  {Array.from(new Set(b.holidays)).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------- Private employers ---------- */

function PrivateEmployers({ regionName, rules }: { regionName: string; rules?: PrivateEmployerRules }) {
  if (!rules || (!rules.actName && !rules.minimumPaidHolidays)) {
    return (
      <p className="text-sm text-charcoal/70 max-w-prose">
        The private-employer rules for {regionName} haven&apos;t been verified yet. Until then, check the state&apos;s
        National and Festival Holidays Act or Shops and Establishments Act.
      </p>
    );
  }
  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-charcoal/80 leading-relaxed">
        Private factories, shops and establishments don&apos;t have to follow the government list above. They must give
        the paid holidays set by {rules.actName ?? "the state's holidays law"}.
      </p>
      <dl className="grid gap-4 sm:grid-cols-2">
        {typeof rules.minimumPaidHolidays === "number" && (
          <div className="card px-5 py-4">
            <dt className="text-sm text-charcoal/60">Minimum paid holidays a year</dt>
            <dd className="text-3xl font-semibold text-ink mt-1">{rules.minimumPaidHolidays}</dd>
          </div>
        )}
        {typeof rules.festivalHolidaysToChoose === "number" && (
          <div className="card px-5 py-4">
            <dt className="text-sm text-charcoal/60">Festival holidays the employer picks</dt>
            <dd className="text-3xl font-semibold text-ink mt-1">{rules.festivalHolidaysToChoose}</dd>
          </div>
        )}
      </dl>
      {rules.mandatoryHolidays && rules.mandatoryHolidays.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink mb-2">Holidays every employer must give</h3>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {rules.mandatoryHolidays.map((m) => (
              <li key={m.name} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                <span className="text-ink">{m.name}</span>
                {m.date && <span className="text-charcoal/70 whitespace-nowrap">{shortDate(m.date)}, {weekday(m.date)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {rules.eligibility && (
        <div>
          <h3 className="font-semibold text-ink mb-1">Who gets paid for the holiday</h3>
          <p className="text-sm text-charcoal/80 leading-relaxed">{rules.eligibility}</p>
        </div>
      )}
      {rules.workingOnHolidayRule && (
        <div>
          <h3 className="font-semibold text-ink mb-1">If someone works on a holiday</h3>
          <p className="text-sm text-charcoal/80 leading-relaxed">{rules.workingOnHolidayRule}</p>
        </div>
      )}
      {rules.notes && <p className="text-sm text-charcoal/70 leading-relaxed">{rules.notes}</p>}
    </div>
  );
}

/* ---------- Main ---------- */

export default function HolidayExplorer({
  year,
  regionName,
  holidays,
  privateEmployerRules,
}: {
  year: number;
  regionName: string;
  holidays: Holiday[];
  privateEmployerRules?: PrivateEmployerRules;
}) {
  const [tab, setTab] = useState<"gov" | "private">("gov");
  const tabs = [
    { id: "gov" as const, label: "Government holiday list" },
    { id: "private" as const, label: "What private employers must give" },
  ];
  return (
    <div className="space-y-8">
      <YearAtAGlance year={year} holidays={holidays} />
      <div>
        <div role="tablist" aria-label="Holiday views" className="flex flex-wrap gap-1 border-b border-slate-200 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-md border-b-2 -mb-px ${
                tab === t.id ? "border-accent text-accent bg-accentTint" : "border-transparent text-charcoal/60 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {tab === "gov" ? (
            <GovernmentList year={year} regionName={regionName} holidays={holidays} />
          ) : (
            <PrivateEmployers regionName={regionName} rules={privateEmployerRules} />
          )}
        </div>
      </div>
    </div>
  );
}
