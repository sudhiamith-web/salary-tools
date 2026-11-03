"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import InsightBanner from "@/components/InsightBanner";
import { toNumber } from "@/lib/hr/csv";
import { niceDate, rupees } from "@/lib/hr/format";
import {
  BONUS_MAX_RATE,
  BONUS_MIN_RATE,
  BULK_HEADERS,
  BULK_SAMPLE,
  DEFAULT_BONUS,
  bonusDeadline,
  calculateBonus,
  type BonusInputs,
  type BonusResult,
} from "@/lib/hr/bonus";
import BulkPanel from "./BulkPanel";
import { downloadPdf } from "./pdf";
import { ActionButton, Card, Disclaimer, HowToUse, NumberField, Pill, Row, Segmented, SelectField } from "./ui";

interface BulkRow extends BonusResult {
  id: string;
  wages: number;
}

const YEARS = ["2025-03-31", "2026-03-31", "2027-03-31"] as const;
type YearEnd = (typeof YEARS)[number];
const yearLabel = (end: string) => `Apr ${Number(end.slice(0, 4)) - 1} – Mar ${end.slice(0, 4)}`;

export default function BonusCalculator() {
  const [mode, setMode] = useState<"one" | "bulk">("one");
  const [i, setI] = useState<BonusInputs>(DEFAULT_BONUS);
  const [yearEnd, setYearEnd] = useState<YearEnd>("2026-03-31");
  const set = <K extends keyof BonusInputs>(k: K) => (v: BonusInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const r = useMemo(() => calculateBonus(i), [i]);
  const deadline = bonusDeadline(yearEnd);
  const rate = Math.min(BONUS_MAX_RATE, Math.max(BONUS_MIN_RATE, i.ratePct));

  const pdf = () =>
    downloadPdf({
      title: "Statutory bonus calculation",
      subtitle: `Accounting year ${yearLabel(yearEnd)}`,
      summary: [
        ["Monthly wages (Basic + DA)", rupees(i.monthlyWages)],
        ["Applicable minimum wage", i.minimumWage ? rupees(i.minimumWage) : "Not entered"],
        ["Days worked", `${i.daysWorked} of ${i.daysInYear}`],
        ["Eligible", r.eligible ? "Yes" : "No"],
        ["Calculation base a month", rupees(r.calcBase)],
        [`Bonus at ${rate}%`, rupees(r.bonus)],
        ["Minimum (8.33%) / maximum (20%)", `${rupees(r.minBonus)} / ${rupees(r.maxBonus)}`],
        ["Pay by", niceDate(deadline)],
      ],
      notes: [
        "Eligibility: wages up to Rs 21,000 a month (S.O. 4711(E), 25 Aug 2026) and at least 30 working days.",
        "Calculation ceiling: Rs 7,000 a month or the applicable minimum wage, whichever is higher (S.O. 4710(E), 25 Aug 2026).",
        "Rate: 8.33% to 20%, depending on allocable surplus; minimum bonus Rs 100.",
      ],
      filename: "statutory-bonus.pdf",
    });

  return (
    <div>
      <HowToUse
        steps={[
          "Choose the accounting year.",
          "Enter Basic + DA, the applicable minimum wage and days worked.",
          "Set the bonus rate (8.33% to 20%) your allocable surplus allows.",
          "See eligibility and the amount, then download the PDF or the bonus register.",
        ]}
      />
      <div className="mb-6 flex flex-wrap items-center gap-4 print:hidden">
        <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "one", label: "One employee" }, { value: "bulk", label: "Bulk (CSV)" }]} />
        <div className="w-full max-w-sm">
          <SelectField label="Accounting year" value={yearEnd} onChange={setYearEnd} options={YEARS.map((y) => ({ value: y, label: yearLabel(y) }))} />
        </div>
      </div>
      <div className="mb-6 max-w-xl">
        <label className="block text-sm font-medium text-ink">
          Bonus rate: <span className="tabular-nums">{rate.toFixed(2)}%</span>
          <input
            type="range"
            min={BONUS_MIN_RATE}
            max={BONUS_MAX_RATE}
            step={0.01}
            value={rate}
            onChange={(e) => set("ratePct")(Number(e.target.value))}
            className="mt-2 w-full accent-[#6D28D9]"
          />
          <span className="block text-xs font-normal text-charcoal/50">Minimum 8.33%, maximum 20%, depending on the allocable surplus. Applies to bulk mode too.</span>
        </label>
      </div>

      {mode === "one" ? (
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="font-display text-xl text-ink">Employee</h2>
            <NumberField label="Monthly wages (Basic + DA)" prefix="₹" step={500} value={i.monthlyWages} onChange={set("monthlyWages")} />
            <NumberField
              label="Applicable minimum wage a month"
              prefix="₹"
              step={100}
              value={i.minimumWage}
              onChange={set("minimumWage")}
              hint={
                <>
                  Find it with the{" "}
                  <Link href="/tools/minimum-wage-checker" className="text-accent hover:underline">
                    Minimum Wage Checker
                  </Link>
                </>
              }
            />
            <NumberField label="Days worked in the year" value={i.daysWorked} onChange={set("daysWorked")} />
            <NumberField label="Days in the year" value={i.daysInYear} onChange={set("daysInYear")} />
          </Card>
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              {r.eligible ? <Pill tone="ok">Eligible</Pill> : <Pill tone="bad">Not eligible</Pill>}
              <p className="mt-3 font-display text-4xl text-ink tabular-nums">{rupees(r.bonus)}</p>
              <p className="mb-4 text-sm text-charcoal/60">{r.reason}</p>
              <Row label="Eligibility ceiling" value="₹21,000 a month" />
              <Row label="Calculation base a month" value={rupees(r.calcBase)} />
              <Row label="Annual base (pro-rated)" value={rupees(r.annualBase)} />
              <Row label="Bonus at 8.33% (minimum)" value={rupees(r.minBonus)} />
              <Row label="Bonus at 20% (maximum)" value={rupees(r.maxBonus)} />
            </Card>
            <InsightBanner message={`Pay the bonus for ${yearLabel(yearEnd)} by ${niceDate(deadline)} – within 8 months of the year’s close.`} />
            {!i.minimumWage && r.eligible && (
              <p className="text-xs text-charcoal/60">No minimum wage entered, so the ₹7,000 ceiling is used. If the state minimum wage is higher, the bonus is higher.</p>
            )}
            <ActionButton primary onClick={pdf}>
              Download PDF
            </ActionButton>
          </div>
        </div>
      ) : (
        <BulkPanel<BonusInputs, BulkRow>
          toolName="Statutory Bonus"
          fileStem="bonus-register"
          headers={BULK_HEADERS}
          required={["employee_id", "monthly_wages"]}
          sample={BULK_SAMPLE}
          needs="employee IDs, wages and days worked"
          columnHelp={<>One row per employee: monthly wages (Basic + DA), the applicable minimum wage a month, and days worked in the year.</>}
          parse={(row) => {
            const w = toNumber(row.monthly_wages);
            const mw = toNumber(row.minimum_wage || "0");
            const d = toNumber(row.days_worked || String(i.daysInYear));
            if (!Number.isFinite(w) || w < 0) return `monthly_wages isn’t a valid number (“${row.monthly_wages}”)`;
            if (!Number.isFinite(mw) || !Number.isFinite(d)) return "minimum_wage or days_worked isn’t a valid number";
            return { monthlyWages: w, minimumWage: mw, daysWorked: d, daysInYear: i.daysInYear, ratePct: rate };
          }}
          compute={(items) => items.map((it) => ({ id: it.id, wages: it.value.monthlyWages, ...calculateBonus(it.value) }))}
          columns={[
            { label: "Employee ID", value: (x) => x.id, align: "left" },
            { label: "Wages / mo", value: (x) => rupees(x.wages) },
            { label: "Calc. base / mo", value: (x) => rupees(x.calcBase) },
            { label: "Annual base", value: (x) => rupees(x.annualBase) },
            { label: `Bonus at ${rate.toFixed(2)}%`, value: (x) => rupees(x.bonus) },
          ]}
          rowStatus={(x) => (x.eligible ? { tone: "ok", label: "Eligible" } : { tone: "bad", label: "Not eligible" })}
          summary={(rows) => (
            <p className="text-sm text-charcoal/80">
              <strong>{rows.filter((x) => x.eligible).length}</strong> of {rows.length} employees are eligible. Total bonus payable:{" "}
              <strong>{rupees(rows.reduce((s, x) => s + x.bonus, 0))}</strong>, by {niceDate(deadline)}.
            </p>
          )}
          pdfSummary={(rows) => [
            ["Accounting year", yearLabel(yearEnd)],
            ["Total bonus", rupees(rows.reduce((s, x) => s + x.bonus, 0))],
            ["Pay by", niceDate(deadline)],
          ]}
        />
      )}
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
