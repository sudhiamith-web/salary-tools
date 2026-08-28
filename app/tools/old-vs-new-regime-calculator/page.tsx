"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import { computeOldRegimeTax, SECTION_80C_LIMIT } from "@/lib/calculators/oldRegime";
import Badge from "@/components/Badge";
import RingChart from "@/components/RingChart";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function OldVsNewRegimePage() {
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [section80C, setSection80C] = useState(150000);
  const [section80D, setSection80D] = useState(25000);
  const [hraExemption, setHraExemption] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const newRegime = useMemo(() => computeNewRegimeTax(grossIncome), [grossIncome]);
  const oldRegime = useMemo(
    () =>
      computeOldRegimeTax({
        grossAnnualIncome: grossIncome,
        section80CDeduction: section80C,
        section80DDeduction: section80D,
        hraExemption,
        otherDeductions,
      }),
    [grossIncome, section80C, section80D, hraExemption, otherDeductions]
  );

  const betterRegime = oldRegime.totalTax < newRegime.totalTax ? "old" : "new";
  const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax);
  const takeHomePercent =
    ((grossIncome - Math.min(oldRegime.totalTax, newRegime.totalTax)) / grossIncome) * 100;

  const totalDeductions =
    section80C + section80D + hraExemption + otherDeductions;

  const comparisonChartData = useMemo(() => {
    const incomeLevels = [600000, 900000, 1200000, 1500000, 1800000, 2400000, 3000000];
    return incomeLevels.map((income) => ({
      label: `₹${income / 100000}L`,
      oldTax: computeOldRegimeTax({
        grossAnnualIncome: income,
        section80CDeduction: section80C,
        section80DDeduction: section80D,
        hraExemption,
        otherDeductions,
      }).totalTax,
      newTax: computeNewRegimeTax(income).totalTax,
    }));
  }, [section80C, section80D, hraExemption, otherDeductions]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Old vs New Tax Regime Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        See your exact tax liability under both regimes, side by side, based
        on your actual deductions — not a rule of thumb.
      </p>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Gross annual income" value={grossIncome} onChange={setGrossIncome} suffix="₹ / year" />
          <Field
            label={`Section 80C investments (max ${formatINR(SECTION_80C_LIMIT)})`}
            value={section80C}
            onChange={setSection80C}
            suffix="₹ / year"
          />
          <Field label="Section 80D health insurance premium" value={section80D} onChange={setSection80D} suffix="₹ / year" />
          <Field label="HRA exemption (from the HRA calculator)" value={hraExemption} onChange={setHraExemption} suffix="₹ / year" />
          <Field label="Other deductions (home loan interest, 80E, etc.)" value={otherDeductions} onChange={setOtherDeductions} suffix="₹ / year" />
          <p className="text-xs text-charcoal/50 pt-2">
            All deduction fields only affect the old regime — the new regime
            doesn't allow any of these except the standard deduction, which
            is already built into both calculations.
          </p>
        </div>

        <div className="sticky top-6 space-y-4">
          <div className="receipt-edge-top" />
          <div className="bg-white px-6 py-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <RingChart
                percent={takeHomePercent}
                color="#1F6F54"
                label={`${Math.round(takeHomePercent)}%`}
                sublabel="take-home"
              />
              <div>
                <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
                  Better choice for you
                </p>
                <Badge variant="filled">
                  {betterRegime === "old" ? "Old regime" : "New regime"}
                </Badge>
                <p className="text-sm text-ledger mt-2">
                  Saves {formatINR(savings)}/year
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge>Old regime</Badge>
              </div>
              <div className="ledger-row">
                <span className="label">Taxable income</span>
                <span className="fill" />
                <span className="value">{formatINR(oldRegime.taxableIncome)}</span>
              </div>
              <div className="ledger-row">
                <span className="label font-medium text-ink">Total tax</span>
                <span className="fill" />
                <span className="value">{formatINR(oldRegime.totalTax)}</span>
              </div>
            </div>

            <div className="border-t border-ink/10 pt-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge>New regime</Badge>
              </div>
              <div className="ledger-row">
                <span className="label">Taxable income</span>
                <span className="fill" />
                <span className="value">{formatINR(newRegime.taxableIncome)}</span>
              </div>
              <div className="ledger-row">
                <span className="label font-medium text-ink">Total tax</span>
                <span className="fill" />
                <span className="value">{formatINR(newRegime.totalTax)}</span>
              </div>
            </div>
          </div>
          <div className="receipt-edge-bottom" />
        </div>
      </div>

      <div className="max-w-2xl mb-20">
        <h3 className="text-xl mb-1">Tax under both regimes, across income levels</h3>
        <p className="text-sm text-charcoal/60 mb-4">
          Using your current deductions ({formatINR(totalDeductions)}/year total) held constant.
        </p>
        <div className="h-64 -ml-2 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16283A" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#1C2321", opacity: 0.6 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#1C2321", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                width={48}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatINR(value), name === "oldTax" ? "Old regime" : "New regime"]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(22,40,58,0.15)" }}
              />
              <Line type="monotone" dataKey="oldTax" stroke="#16283A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="newTax" stroke="#1F6F54" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 text-xs text-charcoal/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#16283A" }} />
            Old regime
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#1F6F54" }} />
            New regime
          </span>
        </div>
      </div>

      <div className="mb-20">
        <ToolArticle title="Why the 'better' regime depends on your deductions, not just your income">
          <p>
            The new regime offers lower tax rates but allows almost no
            deductions. The old regime has higher rates but lets you reduce
            taxable income through 80C, 80D, HRA, and home loan interest.
            Whether the old regime wins depends entirely on how large your
            total deductions are relative to your income:
          </p>
          <FormulaBox>
            Old regime wins when: total deductions are large enough that the
            tax saved exceeds what the new regime's lower rates already save you
          </FormulaBox>
          <p>
            As a rough pattern: someone with minimal deductions (no HRA, no
            80C investments, no home loan) almost always does better on the
            new regime. Someone with a home loan, full 80C utilization, and
            HRA exemption often breaks even around ₹15-20L income, sometimes
            favoring the old regime above that — but there's no universal
            number, which is exactly why calculating your specific numbers
            matters more than a rule of thumb.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Which regime is the default if I don't choose?",
              answer:
                "The new tax regime is the default regime for salaried individuals since FY 2023-24. If you want the old regime, you need to explicitly opt for it, typically by informing your employer at the start of the financial year.",
            },
            {
              question: "Can I switch between regimes every year?",
              answer:
                "Salaried individuals without business income can switch regimes each financial year when filing their return. If you have business or professional income, switching back to the old regime after opting for the new one has restrictions — check with a tax professional if this applies to you.",
            },
            {
              question: "Does the new regime allow any deductions at all?",
              answer:
                "Very few. The standard deduction (₹75,000) and employer NPS contributions under Section 80CCD(2) are among the exceptions still allowed under the new regime. Popular deductions like 80C, 80D, and HRA are not available.",
            },
            {
              question: "I don't have a home loan or HRA — does the old regime ever make sense?",
              answer:
                "It's less likely, but not impossible — it depends on how much you're investing under 80C and 80D. Run your actual numbers through this calculator rather than assuming; the crossover point shifts a lot based on your specific deduction total.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="old-vs-new-regime-calculator" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink block mb-1.5">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={1000}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
