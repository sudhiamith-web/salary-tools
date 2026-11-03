"use client";

import { useMemo, useState } from "react";
import InsightBanner from "@/components/InsightBanner";
import { toNumber } from "@/lib/hr/csv";
import { niceDate, parseIso, rupees } from "@/lib/hr/format";
import { BULK_HEADERS, BULK_SAMPLE, DEFAULT_FNF, calculateFnf, type FnfInputs, type FnfResult } from "@/lib/hr/fnf";
import BulkPanel from "./BulkPanel";
import { downloadPdf } from "./pdf";
import { ActionButton, Card, DateField, Disclaimer, HowToUse, NumberField, Pill, Row, Segmented, SelectField, Toggle } from "./ui";

interface BulkRow extends FnfResult {
  id: string;
}

export default function FnfCalculator() {
  const [mode, setMode] = useState<"one" | "bulk">("one");
  const [i, setI] = useState<FnfInputs>(DEFAULT_FNF);
  const [holidayText, setHolidayText] = useState("");
  const set = <K extends keyof FnfInputs>(k: K) => (v: FnfInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const holidays = holidayText
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => parseIso(s));
  const r = useMemo(() => calculateFnf({ ...i, holidays }), [i, holidayText]); // eslint-disable-line react-hooks/exhaustive-deps

  const serviceText = `${r.service.years} yr ${r.service.months} mo`;
  const lines: [string, number, ("gain" | "loss")?][] = [
    [`Salary for unpaid days (${i.unpaidDays})`, r.salary],
    [`Leave encashment (${i.leaveDays} days)`, r.leaveEncashment],
    [r.gratuityEligible ? `Gratuity (${r.service.countedYears} years counted)` : "Gratuity (not yet eligible)", r.gratuity],
    ["Other earnings", r.otherEarnings],
    [`Notice shortfall recovery (${r.noticeShortfallDays} days)`, -r.noticeRecovery, r.noticeRecovery > 0 ? "loss" : undefined],
    ["Other deductions", -r.otherDeductions, r.otherDeductions > 0 ? "loss" : undefined],
    ["TDS (estimate)", -r.tdsEstimate, r.tdsEstimate > 0 ? "loss" : undefined],
  ];

  const pdf = () =>
    downloadPdf({
      title: "Full and final settlement statement",
      subtitle: `Last working day ${niceDate(i.lwd)} | Pay by ${niceDate(r.dueDate)}`,
      summary: [
        ["Date of joining", niceDate(i.doj)],
        ["Last working day", niceDate(i.lwd)],
        ["Service", serviceText],
        ...lines.map(([l, v]) => [l, rupees(v)] as [string, string]),
        ["Net payable", rupees(r.netPayable)],
        ["Payment due by", niceDate(r.dueDate)],
      ],
      notes: [
        "Due date: within two working days of the last working day (Code on Wages, 2019, s.17(2)).",
        "Gratuity: 15 days' wages per year of service on a 26-day month; a final part-year over six months counts as a full year.",
        "TDS shown is a rough estimate at the slab you chose. Use your payroll's TDS computation for the actual deduction.",
      ],
      filename: "full-and-final-settlement.pdf",
    });

  return (
    <div>
      <HowToUse
        steps={[
          "Enter the joining date and the last working day.",
          "Add monthly gross, wages (from the Salary Structure Checker), leave balance and notice served.",
          "Set weekly offs and holidays, so the pay-by date is right.",
          "Check each line and the pay-by date, then download the F&F statement.",
        ]}
      />
      <div className="mb-6 print:hidden">
        <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "one", label: "One employee" }, { value: "bulk", label: "Bulk (CSV)" }]} />
      </div>

      {mode === "one" ? (
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="font-display text-xl text-ink">Exit details</h2>
            <DateField label="Date of joining" value={i.doj} onChange={set("doj")} />
            <DateField label="Last working day" value={i.lwd} onChange={set("lwd")} />
            <Toggle label="Fixed-term employee (gratuity after 1 year)" checked={i.fixedTerm} onChange={set("fixedTerm")} />
            <NumberField label="Monthly gross" prefix="₹" step={500} value={i.monthlyGross} onChange={set("monthlyGross")} />
            <NumberField label="Monthly wages" prefix="₹" step={500} value={i.wages} onChange={set("wages")} hint="Basic + DA + any add-back under the 50% rule" />
            <NumberField label="Unpaid days in the final month" value={i.unpaidDays} onChange={set("unpaidDays")} />
            <SelectField
              label="Day rate for salary"
              value={String(i.monthDays) as "30" | "31" | "28" | "26"}
              onChange={(v) => set("monthDays")(Number(v))}
              options={[
                { value: "30", label: "Gross ÷ 30" },
                { value: "31", label: "Gross ÷ 31" },
                { value: "28", label: "Gross ÷ 28" },
                { value: "26", label: "Gross ÷ 26" },
              ]}
            />
            <NumberField label="Leave days to encash" value={i.leaveDays} onChange={set("leaveDays")} />
            <SelectField
              label="Leave encashment on"
              value={`${i.leaveBasis}-${i.leaveDivisor}` as "wages-30" | "wages-26" | "gross-30" | "gross-26"}
              onChange={(v) => {
                const [b, d] = v.split("-");
                setI((p) => ({ ...p, leaveBasis: b as "wages" | "gross", leaveDivisor: Number(d) as 30 | 26 }));
              }}
              options={[
                { value: "wages-30", label: "Wages ÷ 30" },
                { value: "wages-26", label: "Wages ÷ 26" },
                { value: "gross-30", label: "Gross ÷ 30" },
                { value: "gross-26", label: "Gross ÷ 26" },
              ]}
            />
            <NumberField label="Notice period required" suffix="days" value={i.noticeRequired} onChange={set("noticeRequired")} />
            <NumberField label="Notice served" suffix="days" value={i.noticeServed} onChange={set("noticeServed")} />
            <Toggle label="Recover notice shortfall" checked={i.recoverNotice} onChange={set("recoverNotice")} />
            <NumberField label="Other earnings (bonus, reimbursements)" prefix="₹" step={500} value={i.otherEarnings} onChange={set("otherEarnings")} />
            <NumberField label="Other deductions (loans, assets)" prefix="₹" step={500} value={i.otherDeductions} onChange={set("otherDeductions")} />
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <SelectField
                label="Weekly off"
                value={i.weekOff}
                onChange={set("weekOff")}
                options={[
                  { value: "satSun", label: "Saturday and Sunday" },
                  { value: "sun", label: "Sunday only" },
                ]}
              />
              <label className="block text-sm font-medium text-ink">
                Holidays after the last working day
                <span className="block text-xs font-normal text-charcoal/50">yyyy-mm-dd, separated by commas</span>
                <input
                  value={holidayText}
                  onChange={(e) => setHolidayText(e.target.value)}
                  placeholder="2026-11-02"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <SelectField
                label="Employee’s tax slab (TDS estimate)"
                value={String(i.tdsRatePct) as "0"}
                onChange={(v) => set("tdsRatePct")(Number(v))}
                options={["0", "5", "10", "15", "20", "25", "30"].map((v) => ({ value: v as "0", label: `${v}%` }))}
              />
            </div>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              {r.error ? (
                <p className="text-sm text-rust">{r.error}</p>
              ) : (
                <>
                  <p className="text-sm text-charcoal/60">Net full and final payable</p>
                  <p className="mt-1 font-display text-4xl text-ink tabular-nums">{rupees(r.netPayable)}</p>
                  <p className="mb-4 mt-2 flex flex-wrap items-center gap-2">
                    <Pill tone="warn">Pay by {niceDate(r.dueDate)}</Pill>
                    <span className="text-xs text-charcoal/60">2 working days after the last working day</span>
                  </p>
                  <Row label="Service" value={serviceText} />
                  {lines.map(([l, v, tone]) => (
                    <Row key={l} label={l} value={v < 0 ? `−${rupees(-v)}` : rupees(v)} tone={tone} />
                  ))}
                  <Row label="Net payable" value={rupees(r.netPayable)} strong />
                </>
              )}
            </Card>
            {!r.error && !r.gratuityEligible && (
              <InsightBanner message={`Gratuity starts after ${i.fixedTerm ? "1 year" : "5 years"} of service. This employee has ${serviceText}.`} />
            )}
            <Card>
              <h3 className="mb-2 font-display text-lg text-ink">Tax treatment</h3>
              <Row label="Gratuity" value="Exempt up to ₹20 lakh" />
              <Row label="Leave encashment" value="Exempt up to ₹25 lakh (lifetime)" />
              <Row label="Salary and other earnings" value="Taxable" />
              <p className="mt-2 text-xs text-charcoal/50">The TDS line is a rough estimate. Use your payroll’s TDS computation for the actual deduction.</p>
            </Card>
            <ActionButton primary onClick={pdf}>
              Download F&amp;F statement (PDF)
            </ActionButton>
          </div>
        </div>
      ) : (
        <BulkPanel<FnfInputs, BulkRow>
          toolName="Full & Final Settlement"
          fileStem="full-and-final"
          headers={BULK_HEADERS}
          required={["employee_id", "date_of_joining", "last_working_day", "monthly_gross", "wages"]}
          sample={BULK_SAMPLE}
          needs="employee IDs, dates and pay figures"
          columnHelp={
            <>
              One row per leaver. Dates as yyyy-mm-dd. fixed_term is Y or N. Leave, notice and weekly-off settings from the one-employee screen (day rate,
              leave basis, weekly off) apply to every row.
            </>
          }
          parse={(row) => {
            const cols = ["monthly_gross", "wages", "unpaid_days", "leave_days", "notice_required_days", "notice_served_days"];
            const nums = cols.map((c) => toNumber(row[c] || "0"));
            const bad = nums.findIndex((x) => !Number.isFinite(x) || x < 0);
            if (bad >= 0) return `“${cols[bad]}” isn’t a valid number (“${row[cols[bad]]}”)`;
            if (!parseIso(row.date_of_joining) || !parseIso(row.last_working_day)) return "dates must be yyyy-mm-dd";
            return {
              ...i,
              holidays,
              doj: row.date_of_joining,
              lwd: row.last_working_day,
              monthlyGross: nums[0],
              wages: nums[1],
              unpaidDays: nums[2],
              leaveDays: nums[3],
              noticeRequired: nums[4],
              noticeServed: nums[5],
              fixedTerm: /^y/i.test(row.fixed_term || ""),
              otherEarnings: 0,
              otherDeductions: 0,
            };
          }}
          compute={(items) => items.map((it) => ({ id: it.id, ...calculateFnf(it.value) }))}
          columns={[
            { label: "Employee ID", value: (x) => x.id, align: "left" },
            { label: "Service", value: (x) => `${x.service.years}y ${x.service.months}m` },
            { label: "Salary", value: (x) => rupees(x.salary) },
            { label: "Leave enc.", value: (x) => rupees(x.leaveEncashment) },
            { label: "Gratuity", value: (x) => rupees(x.gratuity) },
            { label: "Notice recovery", value: (x) => rupees(x.noticeRecovery), tone: (x) => (x.noticeRecovery > 0 ? "loss" : undefined) },
            { label: "Net payable", value: (x) => rupees(x.netPayable) },
            { label: "Pay by", value: (x) => x.dueDate },
          ]}
          summary={(rows) => (
            <p className="text-sm text-charcoal/80">
              Total net payable: <strong>{rupees(rows.reduce((s, x) => s + x.netPayable, 0))}</strong> across {rows.length} leavers. Earliest pay-by date:{" "}
              <strong>{rows.length ? niceDate([...rows].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0].dueDate) : "–"}</strong>.
            </p>
          )}
          pdfSummary={(rows) => [["Total net payable", rupees(rows.reduce((s, x) => s + x.netPayable, 0))]]}
        />
      )}
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
