"use client";

import { useMemo, useState } from "react";
import InsightBanner from "@/components/InsightBanner";
import { toNumber } from "@/lib/hr/csv";
import { pct, rupees } from "@/lib/hr/format";
import {
  BULK_HEADERS,
  BULK_SAMPLE,
  DEFAULT_COMPONENTS,
  KINDS,
  bulkRowToComponents,
  checkStructure,
  type ComponentKind,
  type PayComponent,
  type PfBasis,
  type StructureResult,
} from "@/lib/hr/wageStructure";
import BulkPanel from "./BulkPanel";
import { downloadPdf } from "./pdf";
import { ActionButton, Card, Disclaimer, HowToUse, NumberField, Pill, Row, Segmented, SelectField } from "./ui";

const KIND_OPTIONS = (Object.keys(KINDS) as ComponentKind[]).map((k) => ({ value: k, label: `${KINDS[k].label} – ${KINDS[k].clause}` }));

interface BulkRow extends StructureResult {
  id: string;
}

export default function SalaryStructureChecker() {
  const [mode, setMode] = useState<"one" | "bulk">("one");
  const [components, setComponents] = useState<PayComponent[]>(DEFAULT_COMPONENTS);
  const [pfBasis, setPfBasis] = useState<PfBasis>("ceiling");
  const [years, setYears] = useState(5);
  const r = useMemo(() => checkStructure(components, pfBasis), [components, pfBasis]);

  const update = (id: string, patch: Partial<PayComponent>) => setComponents((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const add = () => setComponents((cs) => [...cs, { id: `c${Date.now()}`, name: "New component", kind: "otherWage", amount: 0 }]);
  const remove = (id: string) => setComponents((cs) => cs.filter((c) => c.id !== id));

  const pdf = () =>
    downloadPdf({
      title: "Labour Code salary structure check",
      subtitle: r.compliant ? "Compliant" : "Not compliant",
      summary: [
        ["Total remuneration (monthly)", rupees(r.totalRemuneration)],
        ["Wages as structured", rupees(r.wagesStructured)],
        ["Wage share", pct(r.wageShare)],
        ["Exclusions in the 50% test", rupees(r.exclusionsInTest)],
        ["Added back to wages", rupees(r.addBack)],
        ["Wages for PF and gratuity", rupees(r.wagesForLaw)],
        [`Gratuity for ${years} years (now → compliant)`, `${rupees(r.gratuityPerYearNow * years)} → ${rupees(r.gratuityPerYearLaw * years)}`],
        ["Employee PF a month (now → compliant)", `${rupees(r.employeePfNow)} → ${rupees(r.employeePfLaw)}`],
      ],
      table: { columns: ["Component", "Treatment", "Monthly amount"], rows: components.map((c) => [c.name, `${KINDS[c.kind].label} (${KINDS[c.kind].clause})`, rupees(c.amount)]) },
      notes: [
        "Code on Wages, 2019, s.2(y): if payments under exclusions (a) to (i) exceed 50% of all remuneration, the excess is added to wages.",
        "Allowances not in the exclusion list (such as special allowance) are treated as wages. Re-tag any component if your legal advice differs.",
        `PF shown on ${pfBasis === "ceiling" ? "the ₹25,000 wage ceiling" : "full wages"}.`,
      ],
      filename: "salary-structure-check.pdf",
    });

  return (
    <div>
      <HowToUse
        steps={[
          "Enter each monthly pay component from the payslip or offer letter.",
          "Check how each line is treated – wages or an exclusion – and change it if your policy differs.",
          "Read the verdict and what changes for PF, gratuity and take-home pay.",
          "Apply the suggested structure or download the PDF. For many employees, switch to Bulk (CSV).",
        ]}
      />
      <div className="mb-6 print:hidden">
        <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "one", label: "One employee" }, { value: "bulk", label: "Bulk (CSV)" }]} />
      </div>

      {mode === "one" ? (
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="font-display text-xl text-ink">Monthly salary components</h2>
            {components.map((c) => (
              <div key={c.id} className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_auto]">
                <input
                  aria-label="Component name"
                  value={c.name}
                  onChange={(e) => update(c.id, { name: e.target.value })}
                  className="rounded-md border border-slate-200 px-2 py-1.5 text-sm font-medium text-ink outline-none focus:border-accent"
                />
                <input
                  aria-label={`${c.name} amount`}
                  type="number"
                  min={0}
                  value={c.amount}
                  onChange={(e) => update(c.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-right text-sm tabular-nums outline-none focus:border-accent sm:w-32"
                />
                <select
                  aria-label={`${c.name} treatment`}
                  value={c.kind}
                  onChange={(e) => update(c.id, { kind: e.target.value as ComponentKind })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-charcoal/80 outline-none focus:border-accent"
                >
                  {KIND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => remove(c.id)} className="text-left text-xs font-semibold text-rust hover:underline sm:text-right">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={add} className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-accent hover:border-accent">
              + Add component
            </button>
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <SelectField
                label="PF calculated on"
                value={pfBasis}
                onChange={setPfBasis}
                options={[
                  { value: "ceiling", label: "₹25,000 wage ceiling" },
                  { value: "full", label: "Full wages" },
                ]}
              />
              <NumberField label="Years of service (for gratuity)" value={years} onChange={(v) => setYears(Math.max(0, v))} />
            </div>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              {r.compliant ? <Pill tone="ok">Compliant</Pill> : <Pill tone="bad">Not compliant</Pill>}
              <p className="mt-3 font-display text-4xl text-ink tabular-nums">{pct(r.wageShare)}</p>
              <p className="mb-4 text-sm text-charcoal/60">of total pay is wages as structured. The minimum is 50%.</p>
              <Row label="Total remuneration" value={rupees(r.totalRemuneration)} />
              <Row label="Wages as structured" value={rupees(r.wagesStructured)} />
              <Row label="Exclusions in the 50% test" value={rupees(r.exclusionsInTest)} />
              <Row label="Exclusions allowed (50%)" value={rupees(r.allowedExclusions)} />
              <Row label="Added back to wages" value={r.addBack > 0 ? `+${rupees(r.addBack)}` : "₹0"} tone={r.addBack > 0 ? "loss" : undefined} />
              <Row label="Wages for PF and gratuity" value={rupees(r.wagesForLaw)} strong />
            </Card>
            <Card>
              <h3 className="mb-2 font-display text-lg text-ink">What changes</h3>
              <Row label={`Gratuity after ${years} years`} value={`${rupees(r.gratuityPerYearNow * years)} → ${rupees(r.gratuityPerYearLaw * years)}`} />
              <Row label="PF wage" value={`${rupees(r.pfWageNow)} → ${rupees(r.pfWageLaw)}`} />
              <Row label="Employee PF a month" value={`${rupees(r.employeePfNow)} → ${rupees(r.employeePfLaw)}`} />
              <Row label="Employer PF a month" value={`${rupees(r.employeePfNow)} → ${rupees(r.employeePfLaw)}`} />
              <Row label="Take-home a month" value={r.takeHomeChange < 0 ? rupees(r.takeHomeChange) : "No change"} tone={r.takeHomeChange < 0 ? "loss" : undefined} />
              {pfBasis === "ceiling" && r.pfWageNow === r.pfWageLaw && r.addBack > 0 && (
                <p className="mt-2 text-xs text-charcoal/60">PF is capped at the ₹25,000 ceiling here, so it doesn’t change. Switch to “Full wages” to see the impact.</p>
              )}
            </Card>
            {r.suggestion && (
              <div className="space-y-3">
                <InsightBanner
                  message={`Move ${rupees(r.suggestion.amount)} from ${r.suggestion.from} to basic pay. Wages become 50% of pay and gross salary stays ${rupees(r.totalRemuneration)}.`}
                />
                <div className="flex flex-wrap gap-2">
                  <ActionButton primary onClick={() => setComponents(r.suggestion!.components)}>
                    Apply suggested structure
                  </ActionButton>
                  <ActionButton onClick={pdf}>Download PDF</ActionButton>
                </div>
              </div>
            )}
            {!r.suggestion && <ActionButton onClick={pdf}>Download PDF</ActionButton>}
          </div>
        </div>
      ) : (
        <BulkPanel<PayComponent[], BulkRow>
          toolName="Salary Structure Checker"
          fileStem="salary-structure"
          headers={BULK_HEADERS}
          required={["employee_id", "basic_da"]}
          sample={BULK_SAMPLE}
          needs="employee IDs and monthly pay components"
          columnHelp={
            <>
              One row per employee, monthly amounts. Columns: employee ID, Basic + DA, other wage allowances (e.g. special), HRA, conveyance and travel
              (incl. LTA), employer PF/pension, statutory bonus, overtime, commission, other exclusions.
            </>
          }
          parse={(row) => bulkRowToComponents(row, toNumber)}
          compute={(items) => items.map((it) => ({ id: it.id, ...checkStructure(it.value, pfBasis) }))}
          columns={[
            { label: "Employee ID", value: (x) => x.id, align: "left" },
            { label: "Total pay", value: (x) => rupees(x.totalRemuneration) },
            { label: "Wages", value: (x) => rupees(x.wagesStructured) },
            { label: "Wage share", value: (x) => pct(x.wageShare) },
            { label: "Added back", value: (x) => rupees(x.addBack), tone: (x) => (x.addBack > 0 ? "loss" : undefined) },
            { label: "Gratuity / year Δ", value: (x) => rupees(x.gratuityPerYearLaw - x.gratuityPerYearNow) },
            { label: "Employee PF Δ / mo", value: (x) => rupees(x.employeePfLaw - x.employeePfNow) },
          ]}
          rowStatus={(x) => (x.compliant ? { tone: "ok", label: "Compliant" } : { tone: "bad", label: "Not compliant" })}
          summary={(rows) => {
            const bad = rows.filter((x) => !x.compliant);
            const grat = bad.reduce((s, x) => s + x.gratuityPerYearLaw - x.gratuityPerYearNow, 0);
            const pf = bad.reduce((s, x) => s + (x.employeePfLaw - x.employeePfNow) * 12, 0);
            return (
              <p className="text-sm text-charcoal/80">
                <strong>{bad.length}</strong> of {rows.length} employees need a structure change. Extra gratuity liability: <strong>{rupees(grat)}</strong> per
                year of service. Extra employer PF: <strong>{rupees(pf)}</strong> a year (PF on {pfBasis === "ceiling" ? "₹25,000 ceiling" : "full wages"}).
              </p>
            );
          }}
          pdfSummary={(rows) => [["Not compliant", String(rows.filter((x) => !x.compliant).length)]]}
        />
      )}
      {mode === "bulk" && (
        <div className="mt-4 max-w-sm">
          <SelectField
            label="PF calculated on"
            value={pfBasis}
            onChange={setPfBasis}
            options={[
              { value: "ceiling", label: "₹25,000 wage ceiling" },
              { value: "full", label: "Full wages" },
            ]}
          />
        </div>
      )}
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
