"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { computeAdvanceTax, TaxpayerCategory } from "@/lib/calculators/advanceTax";
import { formatINR } from "@/lib/calculators/salary";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

const categoryLabels: Record<TaxpayerCategory, { title: string; sub: string }> = {
  regular: { title: "Individual / Salaried / Business", sub: "Standard quarterly schedule" },
  presumptive: { title: "Presumptive (Sec 44AD / 44ADA)", sub: "Single payment by 15 March" },
};

export default function AdvanceTaxCalculatorPage() {
  const [category, setCategory] = useState<TaxpayerCategory>("regular");
  const [totalTaxLiability, setTotalTaxLiability] = useState(200000);
  const [tds, setTds] = useState(50000);
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);
  const [q4, setQ4] = useState(0);
  const [monthsFor234B, setMonthsFor234B] = useState(4);

  const result = useMemo(
    () =>
      computeAdvanceTax({
        taxpayerCategory: category,
        totalTaxLiability,
        tdsAlreadyDeducted: tds,
        quarterlyPaid: [q1, q2, q3, q4],
        monthsFor234B,
      }),
    [category, totalTaxLiability, tds, q1, q2, q3, q4, monthsFor234B]
  );

  const chartData = result.quarters.map((q) => ({
    quarter: q.quarter,
    "Cumulative target": Math.round(q.requiredCumulativeAmount),
    "Cumulative paid": Math.round(q.cumulativePaid),
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Advance Tax Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Check whether you're on track with your quarterly advance tax
        installments, and estimate Section 234B and 234C penal interest if
        you're behind.
      </p>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 mb-14">
        <div className="space-y-6 max-w-md">
          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">Taxpayer category</span>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(categoryLabels) as TaxpayerCategory[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ${
                    category === c
                      ? "bg-accentTint border-accent text-ink"
                      : "bg-white border-ink/10 text-charcoal/70"
                  }`}
                >
                  <span className="font-medium block">{categoryLabels[c].title}</span>
                  <span className="text-xs opacity-70">{categoryLabels[c].sub}</span>
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Total estimated tax liability (annual)"
            value={totalTaxLiability}
            onChange={setTotalTaxLiability}
            suffix="₹ / year"
          />
          <p className="text-xs text-charcoal/50 -mt-4">
            Bring this figure from the New Regime or Old vs New Tax Regime
            calculator — this tool focuses on the advance tax schedule and
            penalties, not recomputing your income tax from scratch.
          </p>
          <Field label="TDS / TCS already deducted" value={tds} onChange={setTds} suffix="₹ / year" />

          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">Advance tax paid so far</span>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Q1 (Jun 15)" value={q1} onChange={setQ1} suffix="₹" compact />
              <Field label="Q2 (Sep 15)" value={q2} onChange={setQ2} suffix="₹" compact />
              <Field label="Q3 (Dec 15)" value={q3} onChange={setQ3} suffix="₹" compact />
              <Field label="Q4 (Mar 15)" value={q4} onChange={setQ4} suffix="₹" compact />
            </div>
          </div>

          <Field
            label="Months of delay assumed for Sec 234B (until you expect to pay/file)"
            value={monthsFor234B}
            onChange={setMonthsFor234B}
            suffix="months"
            step={1}
          />
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-medium mb-1">
              {result.advanceTaxApplicable ? "Advance tax mandatory (net tax ≥ ₹10,000)" : "Advance tax not required"}
            </p>
            <h3 className="font-display text-3xl text-ink">
              {formatINR(result.balanceTaxToPay)}
            </h3>
            <p className="text-xs text-charcoal/60 mt-1">Balance tax still to pay</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-ink/10 rounded-lg px-4 py-3">
              <p className="text-xs text-charcoal/50 mb-1">Net advance tax payable</p>
              <p className="font-mono text-ink text-lg">{formatINR(result.netAdvanceTaxPayable)}</p>
            </div>
            <div className="bg-white border border-ink/10 rounded-lg px-4 py-3">
              <p className="text-xs text-charcoal/50 mb-1">Paid so far</p>
              <p className="font-mono text-ledger text-lg">{formatINR(result.totalPaidSoFar)}</p>
            </div>
            <div className="bg-white border border-ink/10 rounded-lg px-4 py-3">
              <p className="text-xs text-charcoal/50 mb-1">Sec 234C interest</p>
              <p className="font-mono text-rust text-lg">{formatINR(result.total234CInterest)}</p>
            </div>
            <div className="bg-white border border-ink/10 rounded-lg px-4 py-3">
              <p className="text-xs text-charcoal/50 mb-1">Sec 234B interest</p>
              <p className="font-mono text-rust text-lg">{formatINR(result.total234BInterest)}</p>
            </div>
          </div>

          {result.totalPenalInterest > 0 && (
            <div className="callout-insight">
              <p className="text-xs uppercase tracking-widest text-insight font-medium mb-1">
                ✦ Advance tax insight
              </p>
              <p className="text-sm text-charcoal/80">
                You've accrued {formatINR(result.totalPenalInterest)} in penal
                interest under Sections 234B and 234C due to shortfalls
                against the required schedule. Paying the balance now stops
                further 234B interest from accruing.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mb-20">
        <h3 className="text-xl mb-4">Quarterly installment schedule</h3>
        <div className="border border-ink/10 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paperDark/60 text-left">
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase">Quarter</th>
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase">Due date</th>
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase text-right">Cumulative target</th>
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase text-right">Paid</th>
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase text-right">Shortfall</th>
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase text-right">Interest</th>
              </tr>
            </thead>
            <tbody>
              {result.quarters.map((q, i) => (
                <tr key={i} className="border-t border-ink/5">
                  <td className="px-4 py-2 text-ink font-medium">{q.quarter}</td>
                  <td className="px-4 py-2 text-charcoal/60">{q.dueDate}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatINR(q.requiredCumulativeAmount)}</td>
                  <td className="px-4 py-2 text-right font-mono text-ledger">{formatINR(q.cumulativePaid)}</td>
                  <td className="px-4 py-2 text-right font-mono text-accent">{formatINR(q.shortfall)}</td>
                  <td className="px-4 py-2 text-right font-mono text-rust">{formatINR(q.interest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16283A" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#1C2321", opacity: 0.6 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#1C2321", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                width={48}
              />
              <Tooltip formatter={(value: number) => formatINR(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Cumulative target" fill="#2E5EFF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cumulative paid" fill="#1F6F54" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="callout-info mb-20 max-w-3xl">
        <h3 className="font-medium text-ink mb-3">Advance tax rules, safe harbour & penalties</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-ink mb-1">Section 234C thresholds</p>
            <p className="text-sm text-charcoal/70">
              Interest is triggered if cumulative advance tax paid is below
              12% by 15 June or 36% by 15 September — not the 15%/45%
              payment-schedule figures themselves. This built-in gap is
              sometimes called a safe harbour.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Section 234B — 90% minimum rule</p>
            <p className="text-sm text-charcoal/70">
              If total advance tax paid by 31 March falls below 90% of your
              net tax payable, Section 234B charges 1% per month on the
              entire remaining balance, starting from 1 April, until you
              actually pay it.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-20">
        <ToolArticle title="How the quarterly targets and penalties work">
          <p>
            Advance tax lets you pay your annual tax liability in
            installments through the year rather than in one lump sum at
            filing time — but missing the quarterly targets triggers
            interest, calculated separately from whether you eventually pay
            in full:
          </p>
          <FormulaBox>
            Sec 234C interest = shortfall × 1% × months (3 for Q1-Q3, 1 for Q4)
          </FormulaBox>
          <p>
            Note the required cumulative thresholds for 234C — 12%, 36%,
            75%, 100% — are slightly lower than the commonly quoted 15%,
            45%, 75%, 100% payment schedule. That gap exists specifically so
            minor shortfalls in the first two quarters don't trigger
            interest, as long as you're within a few percentage points.
          </p>
          <p>
            Section 234B is a separate, often larger risk: if your total
            advance tax across all four quarters comes in under 90% of your
            actual liability, interest accrues at 1% per month on the full
            remaining balance — and this keeps accruing every month until
            you actually pay it, well past the financial year's end, unlike
            234C which is fixed once each quarter closes.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Who needs to pay advance tax?",
              answer:
                "Anyone whose net tax liability (after TDS/TCS) is ₹10,000 or more in a financial year. This includes salaried individuals with significant income outside salary — capital gains, freelance income, rental income — where TDS alone doesn't cover the full liability.",
            },
            {
              question: "Do salaried employees need to pay advance tax if TDS is already deducted?",
              answer:
                "Usually not, if your employer's TDS covers your full tax liability. But if you have other income — capital gains, freelance work, high interest income — that pushes your net tax payable above ₹10,000 after TDS, you do need to pay advance tax on that shortfall.",
            },
            {
              question: "What if I miss a quarterly deadline entirely?",
              answer:
                "You still owe the full amount, plus 234C interest on the shortfall for that quarter (calculated for 3 months for Q1-Q3, 1 month for Q4). Paying late in a later quarter still accrues that quarter's own interest — it doesn't erase what you already owe for the missed one.",
            },
            {
              question: "Does this apply if I earn only salary income?",
              answer:
                "If your employer's TDS fully covers your tax liability, you typically don't owe additional advance tax. This calculator is most relevant if you have income beyond salary that isn't already covered by TDS.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="advance-tax-calculator" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
  step = 1000,
  compact = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  step?: number;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span className={`font-medium text-ink block mb-1.5 ${compact ? "text-xs" : "text-sm"}`}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent text-sm"
        />
        {!compact && <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}
