"use client";

import { useMemo, useState } from "react";
import InsightBanner from "@/components/InsightBanner";
import { toNumber } from "@/lib/hr/csv";
import { pct, rupees } from "@/lib/hr/format";
import {
  BANDS,
  BULK_HEADERS,
  BULK_SAMPLE,
  DEFAULT_MATRIX,
  RATINGS,
  RATING_LABEL,
  applyMatrix,
  bandOf,
  summarise,
  type Employee,
  type EmployeeResult,
  type Matrix,
} from "@/lib/hr/increment";
import BulkPanel from "./BulkPanel";
import { downloadPdf } from "./pdf";
import { ActionButton, Card, Disclaimer, HowToUse, NumberField, Row, Segmented, SelectField } from "./ui";

export default function IncrementPlanner() {
  const [mode, setMode] = useState<"one" | "bulk">("bulk");
  const [matrix, setMatrix] = useState<Matrix>(DEFAULT_MATRIX);
  const [budgetPct, setBudgetPct] = useState(8);
  const [pfBasis, setPfBasis] = useState<"ceiling" | "full">("ceiling");
  const [emp, setEmp] = useState<Employee>({ id: "EMP-001", annualCtc: 1200000, monthlyBasic: 40000, rating: 4, compa: 0.88 });
  const one = useMemo(() => applyMatrix(emp, matrix, pfBasis), [emp, matrix, pfBasis]);

  const setCell = (rating: number, band: number, v: number) =>
    setMatrix((m) => {
      const row = [...m[rating]] as [number, number, number];
      row[band] = Math.max(0, v);
      return { ...m, [rating]: row };
    });

  const matrixNotes = RATINGS.map((r) => `${RATING_LABEL[r]}: ${matrix[r].map((v, b) => `${BANDS[b]} ${v}%`).join(", ")}`);

  return (
    <div>
      <HowToUse
        steps={[
          "Set the increment % for each rating and pay-range band (compa-ratio).",
          "Enter the total increment budget as a % of payroll.",
          "Upload your team CSV with employee ID, CTC, basic, rating and compa-ratio.",
          "Compare planned vs budget, adjust the matrix, then export to Excel.",
        ]}
      />
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-display text-xl text-ink">Merit matrix</h2>
          <p className="mb-4 text-sm text-charcoal/60">Increment % by performance rating and position in the pay range.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-charcoal/60">
                  <th className="px-2 py-2 font-semibold">Rating</th>
                  {BANDS.map((b) => (
                    <th key={b} className="px-2 py-2 text-right font-semibold">
                      {b}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RATINGS.map((r) => (
                  <tr key={r} className="border-b border-slate-100">
                    <td className="px-2 py-2 text-ink">{RATING_LABEL[r]}</td>
                    {matrix[r].map((v, b) => (
                      <td key={b} className="px-2 py-2 text-right">
                        <input
                          aria-label={`${RATING_LABEL[r]}, ${BANDS[b]}`}
                          type="number"
                          min={0}
                          step={0.5}
                          value={v}
                          onChange={(e) => setCell(r, b, Number(e.target.value) || 0)}
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right tabular-nums outline-none focus:border-accent"
                        />
                        <span className="ml-1 text-charcoal/50">%</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
            <NumberField label="Increment budget" suffix="% of payroll" step={0.5} value={budgetPct} onChange={setBudgetPct} />
            <SelectField
              label="Employer PF on"
              value={pfBasis}
              onChange={setPfBasis}
              options={[
                { value: "ceiling", label: "₹25,000 wage ceiling" },
                { value: "full", label: "Full wages" },
              ]}
            />
            <ActionButton onClick={() => setMatrix(DEFAULT_MATRIX)}>Reset matrix</ActionButton>
          </div>
        </Card>

        <div>
          <div className="mb-4 print:hidden">
            <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "bulk", label: "Team (CSV)" }, { value: "one", label: "One employee" }]} />
          </div>
          {mode === "one" && (
            <Card className="space-y-3">
              <NumberField label="Annual CTC" prefix="₹" step={10000} value={emp.annualCtc} onChange={(v) => setEmp({ ...emp, annualCtc: v })} />
              <NumberField label="Monthly wages (Basic + DA)" prefix="₹" step={500} value={emp.monthlyBasic} onChange={(v) => setEmp({ ...emp, monthlyBasic: v })} />
              <SelectField
                label="Rating"
                value={String(emp.rating) as "3"}
                onChange={(v) => setEmp({ ...emp, rating: Number(v) })}
                options={RATINGS.map((r) => ({ value: String(r) as "3", label: RATING_LABEL[r] }))}
              />
              <NumberField label="Compa-ratio" step={0.01} value={emp.compa} onChange={(v) => setEmp({ ...emp, compa: v })} hint="Salary ÷ midpoint of the pay range" />
              <div className="border-t border-slate-200 pt-3">
                <Row label={`Band: ${BANDS[bandOf(emp.compa)]}`} value={pct(one.pct)} />
                <Row label="Increase a year" value={rupees(one.increase)} />
                <Row label="New CTC" value={rupees(one.newCtc)} strong />
                <Row label="Extra employer PF a year" value={rupees(one.extraEmployerPf)} />
                <Row label="Extra gratuity provision a year" value={rupees(one.extraGratuity)} />
              </div>
              <ActionButton
                onClick={() =>
                  downloadPdf({
                    title: "Salary increment",
                    subtitle: emp.id,
                    summary: [
                      ["Rating", RATING_LABEL[emp.rating]],
                      ["Compa-ratio", emp.compa.toFixed(2)],
                      ["Increment", pct(one.pct)],
                      ["Current CTC", rupees(emp.annualCtc)],
                      ["New CTC", rupees(one.newCtc)],
                      ["Extra employer PF a year", rupees(one.extraEmployerPf)],
                      ["Extra gratuity provision a year", rupees(one.extraGratuity)],
                    ],
                    notes: matrixNotes,
                    filename: "salary-increment.pdf",
                  })
                }
              >
                Download PDF
              </ActionButton>
            </Card>
          )}
          {mode === "bulk" && (
            <InsightBanner message="Upload your team file below. Changes to the matrix, budget or PF basis update the results straight away." />
          )}
        </div>
      </div>

      {mode === "bulk" && (
        <div className="mt-8">
          <BulkPanel<Employee, EmployeeResult>
            toolName="Increment Planner"
            fileStem="increment-plan"
            headers={BULK_HEADERS}
            required={BULK_HEADERS}
            sample={BULK_SAMPLE}
            needs="employee IDs, ratings and salary figures"
            columnHelp={<>One row per employee: annual CTC, monthly wages (Basic + DA), rating 1–5 and compa-ratio (salary ÷ range midpoint).</>}
            parse={(row) => {
              const ctc = toNumber(row.annual_ctc);
              const basic = toNumber(row.monthly_basic);
              const rating = toNumber(row.rating);
              const compa = toNumber(row.compa_ratio);
              if (![ctc, basic, compa].every((x) => Number.isFinite(x) && x >= 0)) return "annual_ctc, monthly_basic or compa_ratio isn’t a valid number";
              if (![1, 2, 3, 4, 5].includes(rating)) return `rating must be 1 to 5 (got “${row.rating}”)`;
              return { id: row.employee_id, annualCtc: ctc, monthlyBasic: basic, rating, compa };
            }}
            compute={(items) => items.map((it) => applyMatrix(it.value, matrix, pfBasis))}
            columns={[
              { label: "Employee ID", value: (x) => x.id, align: "left" },
              { label: "Current CTC", value: (x) => rupees(x.annualCtc) },
              { label: "Rating", value: (x) => String(x.rating) },
              { label: "Compa", value: (x) => x.compa.toFixed(2) },
              { label: "Increment", value: (x) => pct(x.pct) },
              { label: "New CTC", value: (x) => rupees(x.newCtc) },
              { label: "Extra PF / yr", value: (x) => rupees(x.extraEmployerPf) },
              { label: "Extra gratuity / yr", value: (x) => rupees(x.extraGratuity) },
            ]}
            summary={(rows) => {
              const s = summarise(rows, budgetPct);
              return (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-charcoal/60">Budget ({budgetPct}%)</p>
                    <p className="font-display text-2xl text-ink tabular-nums">{rupees(s.budget)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-charcoal/60">Planned increase</p>
                    <p className="font-display text-2xl text-ink tabular-nums">{rupees(s.planned)}</p>
                    <p className="text-xs text-charcoal/60">{pct(s.plannedPct, 2)} of payroll</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-charcoal/60">{s.left >= 0 ? "Left in budget" : "Over budget"}</p>
                    <p className={`font-display text-2xl tabular-nums ${s.left >= 0 ? "text-ledger" : "text-rust"}`}>{rupees(Math.abs(s.left))}</p>
                  </div>
                  <p className="text-sm text-charcoal/80 sm:col-span-3">
                    Extra employer cost on top of CTC increases: employer PF <strong>{rupees(s.extraPf)}</strong> a year and gratuity provision{" "}
                    <strong>{rupees(s.extraGratuity)}</strong> a year.
                  </p>
                </div>
              );
            }}
            pdfSummary={(rows) => {
              const s = summarise(rows, budgetPct);
              return [
                ["Payroll", rupees(s.payroll)],
                [`Budget (${budgetPct}%)`, rupees(s.budget)],
                ["Planned increase", `${rupees(s.planned)} (${pct(s.plannedPct, 2)})`],
                [s.left >= 0 ? "Left in budget" : "Over budget", rupees(Math.abs(s.left))],
                ["Extra employer PF a year", rupees(s.extraPf)],
                ["Extra gratuity provision a year", rupees(s.extraGratuity)],
              ];
            }}
          />
        </div>
      )}
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
