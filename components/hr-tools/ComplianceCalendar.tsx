"use client";

import { useMemo, useState } from "react";
import { csvToObjects, toCsv } from "@/lib/hr/csv";
import { MONTHS, niceDate } from "@/lib/hr/format";
import { STATE_NAMES, buildIcs, eventsForMonth, type CalendarEvent } from "@/lib/hr/complianceCalendar";
import { downloadFile, downloadCsv } from "./download";
import { ActionButton, Card, Disclaimer, HowToUse, Pill, Segmented } from "./ui";

const AREA_STYLE = (area: string) => (area === "Central" ? "bg-violet-100 text-violet-900" : "bg-amber-100 text-amber-900");
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function EventBadge({ e }: { e: CalendarEvent }) {
  return e.obligation.status === "verify" ? <Pill tone="warn">Verify</Pill> : null;
}

export default function ComplianceCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [states, setStates] = useState<string[]>(["Karnataka", "Maharashtra"]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [open, setOpen] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState("");

  const events = useMemo(() => eventsForMonth(year, month, states), [year, month, states]);
  const step = (d: number) => {
    const m = month + d;
    if (m < 1) {
      setMonth(12);
      setYear(year - 1);
    } else if (m > 12) {
      setMonth(1);
      setYear(year + 1);
    } else setMonth(m);
  };
  const toggleState = (s: string) => setStates((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, k) => k + 1)];
  while (cells.length % 7) cells.push(null);
  const byDay = (d: number) => events.filter((e) => Number(e.date.slice(8, 10)) === d);

  const onLocations = async (file: File | undefined) => {
    if (!file) return;
    const { headers, rows } = csvToObjects(await file.text());
    if (!headers.includes("state")) {
      setUploadNote("The file needs a column called “state”.");
      return;
    }
    const lower = Object.fromEntries(STATE_NAMES.map((s) => [s.toLowerCase(), s]));
    const found = new Set<string>();
    const unknown = new Set<string>();
    rows.forEach((r) => {
      const v = (r.state || "").trim();
      if (!v) return;
      const hit = lower[v.toLowerCase()];
      if (hit) found.add(hit);
      else unknown.add(v);
    });
    setStates(Array.from(found));
    setUploadNote(
      `${found.size} state${found.size === 1 ? "" : "s"} added.` +
        (unknown.size ? ` Not covered yet: ${Array.from(unknown).join(", ")} – their PT and LWF dates aren’t in the calendar.` : ""),
    );
  };

  const ics = () => downloadFile(`payroll-compliance-${year}-${String(month).padStart(2, "0")}.ics`, buildIcs(year, month, states), "text/calendar;charset=utf-8");
  const csv = () =>
    downloadCsv(
      `payroll-compliance-${year}-${String(month).padStart(2, "0")}.csv`,
      toCsv(
        ["date", "obligation", "area", "status", "detail"],
        events.map((e) => [e.date, e.obligation.title, e.obligation.area, e.obligation.status, e.obligation.detail]),
      ),
    );

  const Detail = ({ e }: { e: CalendarEvent }) => (
    <div className="mt-2 space-y-1 text-xs text-charcoal/70">
      <p>{e.obligation.detail}</p>
      {e.obligation.note && <p>{e.obligation.note}</p>}
      <p>
        Sources:{" "}
        {e.obligation.sources.map((s, k) => (
          <span key={s.url}>
            {k > 0 && " · "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              {s.label}
            </a>
          </span>
        ))}
      </p>
    </div>
  );

  return (
    <div>
      <HowToUse
        steps={[
          "Pick every state you have employees in.",
          "Browse the month in Calendar or List view. Click an item to see its sources.",
          "Click Add to calendar (.ics) to get 12 months of reminders in Google or Outlook.",
          "Many locations? Upload a CSV with a “state” column to build one combined calendar.",
        ]}
      />
      <Card className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous month" onClick={() => step(-1)} className="rounded-lg border border-slate-300 px-3 py-2 text-ink hover:border-accent">
              ‹
            </button>
            <strong className="min-w-[160px] text-center font-display text-xl text-ink">
              {MONTHS[month - 1]} {year}
            </strong>
            <button type="button" aria-label="Next month" onClick={() => step(1)} className="rounded-lg border border-slate-300 px-3 py-2 text-ink hover:border-accent">
              ›
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented label="View" value={view} onChange={setView} options={[{ value: "calendar", label: "Calendar" }, { value: "list", label: "List" }]} />
            <ActionButton primary onClick={ics}>
              Add to calendar (.ics)
            </ActionButton>
            <ActionButton onClick={csv}>Export month (CSV)</ActionButton>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-charcoal/60">Your states</p>
          <div className="flex flex-wrap gap-2">
            {STATE_NAMES.map((s) => {
              const on = states.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleState(s)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${on ? "border-accent bg-violet-50 text-violet-800" : "border-slate-300 bg-white text-charcoal/70"}`}
                >
                  {s}
                </button>
              );
            })}
            <label className="cursor-pointer rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm font-semibold text-accent hover:border-accent">
              Upload locations CSV
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onLocations(e.target.files?.[0])} />
            </label>
          </div>
          {uploadNote && <p className="mt-2 text-xs text-charcoal/70">{uploadNote}</p>}
          <p className="mt-2 text-xs text-charcoal/50">
            More states are being added. Each one is added only after its dates are checked against published sources.
          </p>
        </div>
      </Card>

      <Card>
        {view === "calendar" ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-2 py-1 text-xs font-semibold text-charcoal/60">
                  {d}
                </div>
              ))}
              {cells.map((d, k) => (
                <div key={k} className={`min-h-[112px] rounded-lg border p-2 ${d ? "border-slate-200 bg-white" : "border-transparent bg-slate-50"}`}>
                  {d && (
                    <>
                      <span className="text-sm font-bold text-ink">{d}</span>
                      <div className="mt-1 space-y-1">
                        {byDay(d).map((e) => (
                          <button
                            key={e.obligation.id + e.date}
                            type="button"
                            onClick={() => setOpen(open === e.obligation.id + e.date ? null : e.obligation.id + e.date)}
                            className={`block w-full rounded-md px-1.5 py-1 text-left text-xs leading-snug ${AREA_STYLE(e.obligation.area)}`}
                          >
                            {e.obligation.title}
                            {e.obligation.status === "verify" && " (verify)"}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            {open && events.find((e) => e.obligation.id + e.date === open) && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                {(() => {
                  const e = events.find((x) => x.obligation.id + x.date === open)!;
                  return (
                    <>
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                        {niceDate(e.date)} – {e.obligation.title} <EventBadge e={e} />
                      </p>
                      <Detail e={e} />
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <ul>
            {events.map((e) => (
              <li key={e.obligation.id + e.date} className="grid grid-cols-[64px_1fr] gap-4 border-b border-slate-100 py-3 last:border-b-0">
                <div className="text-center">
                  <div className="font-display text-2xl leading-none text-ink">{Number(e.date.slice(8, 10))}</div>
                  <div className="text-xs text-charcoal/60">{niceDate(e.date).slice(0, 3)}</div>
                </div>
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {e.obligation.title}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${AREA_STYLE(e.obligation.area)}`}>{e.obligation.area}</span>
                    <EventBadge e={e} />
                  </p>
                  <Detail e={e} />
                </div>
              </li>
            ))}
            {!events.length && <li className="py-3 text-sm text-charcoal/60">Nothing due this month for the states you picked.</li>}
          </ul>
        )}
        <p className="mt-4 text-xs text-charcoal/50">
          Dates are the statutory due dates. When one falls on a holiday, check that filing’s rule. “Verify” means published sources disagree or only one
          source was found.
        </p>
      </Card>
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
