"use client";

import { useMemo, useState } from "react";
import { rupees, rupeesExact, shortDate } from "@/lib/compliance/format";
import { DEFAULT_MONTHLY_DIVISOR, resolveRow, SKILL_LABELS, SKILL_ORDER, skillRange } from "@/lib/compliance/wages";
import type { SkillLevel, WageNotification } from "@/lib/compliance/types";

const MAX_ROWS = 300;

export default function MinimumWageExplorer({
  regionName,
  notifications,
}: {
  regionName: string;
  notifications: WageNotification[];
}) {
  const [noteId, setNoteId] = useState(notifications[0]?._id);
  const note = notifications.find((n) => n._id === noteId) ?? notifications[0];
  const divisor = note?.monthlyDivisor ?? DEFAULT_MONTHLY_DIVISOR;

  const [employment, setEmployment] = useState("all");
  const [zone, setZone] = useState("all");
  const [skill, setSkill] = useState<SkillLevel | "all">("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!note) return [];
    const q = query.trim().toLowerCase();
    return note.schedules.flatMap((s) =>
      (employment === "all" || s._id === employment ? s.rows ?? [] : [])
        .filter((r) => (zone === "all" || r.zone === zone) && (skill === "all" || r.skill === skill))
        .filter((r) => !q || r.category.toLowerCase().includes(q) || s.employment.toLowerCase().includes(q))
        .map((r) => ({ employment: s.employment, unit: s.unit, row: r, rate: resolveRow(s, r, divisor) }))
    );
  }, [note, employment, zone, skill, query, divisor]);

  const ranges = useMemo(() => (note ? skillRange(note.schedules, divisor) : {}), [note, divisor]);

  if (!note) return null;

  const downloadCsv = () => {
    const header = ["Employment", "Category", "Skill", "Zone", "Basic", "VDA", "Per day", "Per month", "Rates notified per"];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = rows.map(({ employment: e, unit, row, rate }) =>
      [e, row.category, SKILL_LABELS[row.skill], row.zone, rate.basic, rate.vda, rate.daily.toFixed(2), rate.monthly.toFixed(2), unit].map(esc).join(",")
    );
    const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minimum-wages-${regionName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${note.effectiveFrom}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presentSkills = SKILL_ORDER.filter((s) => ranges[s]);

  return (
    <div className="space-y-8">
      {notifications.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-charcoal/70">Rates effective from</span>
          {notifications.map((n, i) => (
            <button
              key={n._id}
              type="button"
              onClick={() => setNoteId(n._id)}
              aria-pressed={n._id === note._id}
              className={`rounded-md border px-3 py-1.5 ${
                n._id === note._id ? "border-accent bg-accentTint text-accent" : "border-slate-300 bg-white text-charcoal/70 hover:border-accent"
              }`}
            >
              {shortDate(n.effectiveFrom)}
              {i === 0 && " (current)"}
            </button>
          ))}
        </div>
      )}

      {presentSkills.length > 0 && (
        <section aria-labelledby="range-heading">
          <h2 id="range-heading" className="text-xl font-semibold text-ink mb-1">Monthly range by skill level</h2>
          <p className="text-sm text-charcoal/60 mb-4">
            Basic plus VDA, across every employment and zone in this notification. Daily rates are converted at {divisor} days a month.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <tbody>
                {presentSkills.map((s) => (
                  <tr key={s} className="border-t border-slate-100 first:border-t-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-ink">{SKILL_LABELS[s]}</th>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {ranges[s]!.min === ranges[s]!.max
                        ? rupees(ranges[s]!.min)
                        : `${rupees(ranges[s]!.min)} to ${rupees(ranges[s]!.max)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {note.zones.some((z) => z.areas) && (
        <section aria-labelledby="zones-heading">
          <h2 id="zones-heading" className="text-xl font-semibold text-ink mb-3">Which zone are you in?</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {note.zones.map((z) => (
              <div key={z.key} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <dt className="font-medium text-ink">{z.key}</dt>
                <dd className="text-sm text-charcoal/70 mt-0.5">{z.areas || "Areas not listed in the notification."}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-labelledby="rates-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <h2 id="rates-heading" className="text-xl font-semibold text-ink">Full rate table</h2>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="rounded-md border border-accent px-3 py-2 text-sm font-medium text-accent hover:bg-accentTint disabled:opacity-40"
          >
            Download {rows.length} rows (CSV)
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4 text-sm">
          <label className="flex flex-col gap-1 text-charcoal/70">
            Employment
            <select value={employment} onChange={(e) => setEmployment(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-ink">
              <option value="all">All ({note.schedules.length})</option>
              {note.schedules.map((s) => (
                <option key={s._id} value={s._id}>{s.employment}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-charcoal/70">
            Zone
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-ink">
              <option value="all">All zones</option>
              {note.zones.map((z) => (
                <option key={z.key} value={z.key}>{z.key}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-charcoal/70">
            Skill level
            <select value={skill} onChange={(e) => setSkill(e.target.value as SkillLevel | "all")} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-ink">
              <option value="all">All levels</option>
              {presentSkills.map((s) => (
                <option key={s} value={s}>{SKILL_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-charcoal/70">
            Search
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. security guard"
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-ink"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paperDark/60 text-left text-charcoal/70">
              <tr>
                {employment === "all" && <th scope="col" className="px-3 py-2.5 font-medium">Employment</th>}
                <th scope="col" className="px-3 py-2.5 font-medium">Category</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Skill</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Zone</th>
                <th scope="col" className="px-3 py-2.5 font-medium text-right">Basic</th>
                <th scope="col" className="px-3 py-2.5 font-medium text-right">VDA</th>
                <th scope="col" className="px-3 py-2.5 font-medium text-right">Per day</th>
                <th scope="col" className="px-3 py-2.5 font-medium text-right">Per month</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, MAX_ROWS).map(({ employment: e, unit, row, rate }, i) => (
                <tr key={`${e}-${row.category}-${row.zone}-${i}`} className="border-t border-slate-100">
                  {employment === "all" && <td className="px-3 py-2 text-charcoal/70">{e}</td>}
                  <td className="px-3 py-2 text-ink">{row.category}</td>
                  <td className="px-3 py-2 text-charcoal/70 whitespace-nowrap">{SKILL_LABELS[row.skill]}</td>
                  <td className="px-3 py-2 text-charcoal/70 whitespace-nowrap">{row.zone}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{rupeesExact(rate.basic)}<span className="text-charcoal/40">/{unit === "day" ? "d" : "m"}</span></td>
                  <td className="px-3 py-2 text-right tabular-nums">{rupeesExact(rate.vda)}</td>
                  <td className={`px-3 py-2 text-right tabular-nums ${unit === "day" ? "font-medium text-ink" : "text-charcoal/70"}`}>{rupeesExact(Number(rate.daily.toFixed(2)))}</td>
                  <td className={`px-3 py-2 text-right tabular-nums ${unit === "month" ? "font-medium text-ink" : "text-charcoal/70"}`}>{rupeesExact(Number(rate.monthly.toFixed(2)))}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-charcoal/60">
                    No rates match these filters. Clear the search or choose &quot;All&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-charcoal/60">
          The bold column is the rate as notified. The other is converted at {divisor} days a month, so it may differ
          slightly from figures printed in the notification.
          {rows.length > MAX_ROWS && ` Showing the first ${MAX_ROWS} of ${rows.length} rows. Narrow the filters or download the CSV for all.`}
        </p>
      </section>
    </div>
  );
}
