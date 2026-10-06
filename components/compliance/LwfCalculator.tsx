"use client";

import { useMemo, useState } from "react";
import { estimateLwf, FREQUENCY_LABEL } from "@/lib/compliance/lwf";
import { monthName, rupees, rupeesExact } from "@/lib/compliance/format";
import { getRegion } from "@/lib/compliance/states";
import type { LwfRule } from "@/lib/compliance/types";

const inputCls = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink tabular-nums";

export default function LwfCalculator({ rules, fixedState }: { rules: LwfRule[]; fixedState?: string }) {
  const sorted = useMemo(
    () => [...rules].sort((a, b) => (getRegion(a.state)?.name ?? "").localeCompare(getRegion(b.state)?.name ?? "")),
    [rules]
  );
  const [state, setState] = useState(fixedState ?? sorted.find((r) => r.applicable)?.state ?? sorted[0]?.state ?? "");
  const [headcount, setHeadcount] = useState(25);
  const [wage, setWage] = useState(25000);
  const rule = sorted.find((r) => r.state === state);
  const labels = Array.from(new Set((rule?.slabs ?? []).map((s) => s.label).filter((l): l is string => !!l)));
  const [slabLabel, setSlabLabel] = useState<string>("");
  const effectiveLabel = labels.includes(slabLabel) ? slabLabel : labels[0];

  const est = rule ? estimateLwf(rule, { monthlyWage: wage, headcount, slabLabel: effectiveLabel }) : null;

  if (sorted.length === 0) {
    return <p className="text-sm text-charcoal/70">LWF rates are being verified. Check back soon.</p>;
  }

  return (
    <div className="card px-5 py-6 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {!fixedState && (
            <div>
              <label htmlFor="lwf-state" className="block text-sm font-medium text-ink mb-1">State / UT</label>
              <select id="lwf-state" value={state} onChange={(e) => setState(e.target.value)} className={inputCls}>
                {sorted.map((r) => (
                  <option key={r.state} value={r.state}>
                    {getRegion(r.state)?.name ?? r.state}{r.applicable ? "" : " (no LWF)"}
                  </option>
                ))}
              </select>
            </div>
          )}
          {labels.length > 1 && (
            <div>
              <label htmlFor="lwf-slab" className="block text-sm font-medium text-ink mb-1">Establishment type</label>
              <select id="lwf-slab" value={effectiveLabel} onChange={(e) => setSlabLabel(e.target.value)} className={inputCls}>
                {labels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="lwf-head" className="block text-sm font-medium text-ink mb-1">Employees in this state</label>
            <input id="lwf-head" type="number" min={0} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="lwf-wage" className="block text-sm font-medium text-ink mb-1">Typical monthly wage (₹)</label>
            <input id="lwf-wage" type="number" min={0} value={wage} onChange={(e) => setWage(Number(e.target.value))} className={inputCls} />
            <p className="mt-1 text-xs text-charcoal/60">Matters only where the state uses wage bands, a % rate or a wage limit.</p>
          </div>
        </div>

        <div aria-live="polite">
          {est && rule && (
            !est.covered ? (
              <div>
                <p className="text-sm text-charcoal/60">Result</p>
                <p className="text-xl font-semibold text-ink mt-1">No LWF to pay</p>
                <p className="text-sm text-charcoal/70 mt-1">{est.reason}</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-charcoal/60">Employer cost a year</p>
                  <p className="text-3xl font-semibold text-ink mt-1 tabular-nums">{rupees(est.headcountYear.employer)}</p>
                  <p className="text-sm text-charcoal/70 mt-1">
                    Plus {rupees(est.headcountYear.employee)} deducted from employees. Total deposit {rupees(est.headcountYear.total)}.
                  </p>
                </div>
                <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <dt className="text-charcoal/70">Frequency</dt>
                    <dd className="text-ink">{rule.frequency ? FREQUENCY_LABEL[rule.frequency] : "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <dt className="text-charcoal/70">Per employee, each time</dt>
                    <dd className="tabular-nums text-ink">
                      {rupeesExact(est.perCycle.employee)} + {rupeesExact(est.perCycle.employer)} employer
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <dt className="text-charcoal/70">Per employee, a year</dt>
                    <dd className="tabular-nums text-ink">{rupeesExact(est.perEmployeeYear.total)}</dd>
                  </div>
                  {rule.deductionMonths && rule.deductionMonths.length > 0 && rule.frequency !== "monthly" && (
                    <div className="flex justify-between gap-4 px-4 py-2.5">
                      <dt className="text-charcoal/70">Deduct from salary of</dt>
                      <dd className="text-ink">{rule.deductionMonths.map((m) => monthName(m - 1, true)).join(" and ")}</dd>
                    </div>
                  )}
                </dl>
                {rule.dueDates && rule.dueDates.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-ink mb-1">Pay to the board by</p>
                    <ul className="text-sm text-charcoal/80 space-y-0.5">
                      {rule.dueDates.map((d) => (
                        <li key={d.period}>{d.period}: {d.due}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
