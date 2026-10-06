"use client";

import { useEffect, useMemo, useState } from "react";
import { getLatestWageNotificationBrowser } from "@/lib/compliance/queries";
import { rupees, rupeesExact, shortDate } from "@/lib/compliance/format";
import { checkMinimumWage, DEFAULT_MONTHLY_DIVISOR, resolveRow, SKILL_LABELS } from "@/lib/compliance/wages";
import type { WageNotification } from "@/lib/compliance/types";

function NumberInput({
  id, label, hint, value, onChange,
}: { id: string; label: string; hint?: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1">{label}</label>
      <div className="flex items-center rounded-md border border-slate-300 bg-white focus-within:border-accent">
        <span className="pl-3 text-charcoal/50" aria-hidden="true">₹</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md bg-transparent px-2 py-2 text-ink outline-none tabular-nums"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-charcoal/60">{hint}</p>}
    </div>
  );
}

const selectCls = "w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-ink";

export default function MinimumWageChecker({
  notification: initial,
  states,
}: {
  /** Pass on a state page: the checker uses this notification and hides the state picker. */
  notification?: WageNotification;
  /** Pass on the standalone tool page: states that have verified data. */
  states?: { slug: string; name: string }[];
}) {
  const [stateSlug, setStateSlug] = useState(initial?.state ?? states?.[0]?.slug ?? "");
  const [note, setNote] = useState<WageNotification | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial || !stateSlug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLatestWageNotificationBrowser(stateSlug)
      .then((n) => !cancelled && setNote(n))
      .catch(() => !cancelled && setError("Couldn't load rates for this state. Check your connection and try again."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [stateSlug, initial]);

  const [scheduleId, setScheduleId] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [zone, setZone] = useState("");
  const [payBasis, setPayBasis] = useState<"monthly" | "daily">("monthly");
  const [wage, setWage] = useState(15000);
  const [other, setOther] = useState(0);

  // Reset dependent selections when the data changes.
  useEffect(() => {
    setScheduleId(note?.schedules[0]?._id ?? "");
    setZone(note?.zones[0]?.key ?? "");
  }, [note]);

  const schedule = note?.schedules.find((s) => s._id === scheduleId);
  const categories = useMemo(() => {
    const m = new Map<string, { category: string; skill: string }>();
    for (const r of schedule?.rows ?? []) m.set(`${r.category}|${r.skill}`, { category: r.category, skill: r.skill });
    return Array.from(m.entries());
  }, [schedule]);

  useEffect(() => {
    setCategoryKey(categories[0]?.[0] ?? "");
  }, [categories]);

  const row = schedule?.rows.find((r) => `${r.category}|${r.skill}` === categoryKey && r.zone === zone);
  const zonesForCategory = schedule?.rows.filter((r) => `${r.category}|${r.skill}` === categoryKey).map((r) => r.zone) ?? [];
  const divisor = note?.monthlyDivisor ?? DEFAULT_MONTHLY_DIVISOR;
  const minimum = schedule && row ? resolveRow(schedule, row, divisor) : null;
  const result = minimum
    ? checkMinimumWage({ payBasis, wageComponents: wage, otherAllowances: other, minimum }, divisor)
    : null;

  const unitWord = payBasis === "monthly" ? "a month" : "a day";

  return (
    <div className="card px-5 py-6 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {!initial && states && (
            <div>
              <label htmlFor="mw-state" className="block text-sm font-medium text-ink mb-1">State / UT</label>
              <select id="mw-state" value={stateSlug} onChange={(e) => setStateSlug(e.target.value)} className={selectCls}>
                {states.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {loading && <p className="text-sm text-charcoal/60">Loading rates…</p>}
          {error && <p className="text-sm text-rust">{error}</p>}
          {!loading && !error && note === null && stateSlug && (
            <p className="text-sm text-charcoal/70">Rates for this state are still being verified.</p>
          )}

          {note && (
            <>
              <div>
                <label htmlFor="mw-emp" className="block text-sm font-medium text-ink mb-1">Employment</label>
                <select id="mw-emp" value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} className={selectCls}>
                  {note.schedules.map((s) => (
                    <option key={s._id} value={s._id}>{s.employment}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mw-cat" className="block text-sm font-medium text-ink mb-1">Category</label>
                <select id="mw-cat" value={categoryKey} onChange={(e) => setCategoryKey(e.target.value)} className={selectCls}>
                  {categories.map(([key, c]) => (
                    <option key={key} value={key}>
                      {c.category} ({SKILL_LABELS[c.skill as keyof typeof SKILL_LABELS] ?? c.skill})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mw-zone" className="block text-sm font-medium text-ink mb-1">Zone</label>
                <select id="mw-zone" value={zone} onChange={(e) => setZone(e.target.value)} className={selectCls}>
                  {note.zones.map((z) => (
                    <option key={z.key} value={z.key} disabled={!zonesForCategory.includes(z.key)}>
                      {z.key}{z.areas ? `: ${z.areas.slice(0, 60)}${z.areas.length > 60 ? "…" : ""}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-ink mb-1">How do you pay?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["monthly", "daily"] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={payBasis === b}
                      onClick={() => setPayBasis(b)}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        payBasis === b ? "border-accent bg-accentTint text-ink" : "border-slate-300 bg-white text-charcoal/70"
                      }`}
                    >
                      {b === "monthly" ? "Monthly salary" : "Daily wage"}
                    </button>
                  ))}
                </div>
              </fieldset>

              <NumberInput
                id="mw-wage"
                label={`Basic + DA + retaining allowance (${unitWord})`}
                hint="The Code on Wages counts these as wages."
                value={wage}
                onChange={setWage}
              />
              <NumberInput
                id="mw-other"
                label={`All other allowances (${unitWord})`}
                hint="HRA, conveyance, special allowance and similar. Used for the 50% rule. Leave 0 if unsure."
                value={other}
                onChange={setOther}
              />
            </>
          )}
        </div>

        <div aria-live="polite">
          {result && minimum && note ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-charcoal/60">Result</p>
                {result.compliant ? (
                  <p className="text-2xl font-semibold text-ledger mt-1">Meets the minimum wage</p>
                ) : (
                  <p className="text-2xl font-semibold text-rust mt-1">
                    Short by {rupeesExact(Number(result.shortfall.toFixed(2)))} {unitWord}
                  </p>
                )}
                {!result.compliant && (
                  <p className="text-sm text-charcoal/70 mt-1">That&apos;s about {rupees(result.annualShortfall)} a year per employee.</p>
                )}
              </div>

              <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-charcoal/70">Notified minimum</dt>
                  <dd className="tabular-nums text-ink">{rupeesExact(Number(result.required.toFixed(2)))} {unitWord}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-charcoal/70">Basic {rupeesExact(minimum.basic)} + VDA {rupeesExact(minimum.vda)}</dt>
                  <dd className="text-charcoal/60">per {schedule?.unit}</dd>
                </div>
                {result.addBack > 0 && (
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <dt className="text-charcoal/70">Added back under the 50% rule</dt>
                    <dd className="tabular-nums text-ink">+{rupeesExact(Number(result.addBack.toFixed(2)))}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="font-medium text-ink">Wages counted</dt>
                  <dd className="tabular-nums font-medium text-ink">{rupeesExact(Number(result.deemedWage.toFixed(2)))} {unitWord}</dd>
                </div>
              </dl>

              {result.addBack > 0 && (
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  Your other allowances are more than half of total pay, so the excess is treated as wages under the
                  Code on Wages, 2019.
                </p>
              )}
              <p className="text-xs text-charcoal/60 leading-relaxed">
                Rates effective {shortDate(note.effectiveFrom)}. Simplified check: it doesn&apos;t cover overtime,
                piece rates or deductions. Confirm against the notification before acting.
              </p>
            </div>
          ) : (
            note && <p className="text-sm text-charcoal/60">Choose a category and zone to see the result.</p>
          )}
        </div>
      </div>
    </div>
  );
}
