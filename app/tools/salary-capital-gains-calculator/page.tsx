"use client";

import { useMemo, useState } from "react";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import { computeLTCG, computeSTCG } from "@/lib/calculators/capitalGains";
import Badge from "@/components/Badge";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function SalaryCapitalGainsCalculatorPage() {
  const [salaryIncome, setSalaryIncome] = useState(1500000);
  const [ltcgGain, setLtcgGain] = useState(200000);
  const [stcgGain, setStcgGain] = useState(50000);

  const salaryTax = useMemo(() => computeNewRegimeTax(salaryIncome), [salaryIncome]);
  const ltcg = useMemo(
    () => computeLTCG({ saleValue: ltcgGain, purchaseValue: 0, expenses: 0 }),
    [ltcgGain]
  );
  const stcg = useMemo(
    () => computeSTCG({ saleValue: stcgGain, purchaseValue: 0, expenses: 0 }),
    [stcgGain]
  );

  const totalTax = salaryTax.totalTax + ltcg.totalTax + stcg.totalTax;
  const totalIncome = salaryIncome + ltcgGain + stcgGain;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Salary + Capital Gains Tax Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        See your combined tax liability when you have both salary income
        and capital gains from equity in the same year — each is taxed
        under its own rules, not blended together.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        This combines salary tax with equity LTCG/STCG specifically. If
        you also have business or professional income, you'd typically
        need ITR-3 rather than ITR-2 — check which form applies to your
        full income picture before filing.
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Annual salary income (gross)" value={salaryIncome} onChange={setSalaryIncome} suffix="₹ / year" />
          <Field label="Equity LTCG (long-term gain)" value={ltcgGain} onChange={setLtcgGain} suffix="₹ / year" />
          <Field label="Equity STCG (short-term gain)" value={stcgGain} onChange={setStcgGain} suffix="₹ / year" />
          <p className="text-xs text-charcoal/50 pt-2">
            Assumes the new tax regime for salary. Capital gains rates
            (12.5% LTCG, 20% STCG) are fixed regardless of regime choice.
          </p>
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              Total tax across all income
            </p>
            <h3 className="font-display text-3xl text-ink">{formatINR(totalTax)}</h3>
            <p className="text-xs text-charcoal/60 mt-1">
              {((totalTax / totalIncome) * 100).toFixed(1)}% effective rate on {formatINR(totalIncome)} total income
            </p>
          </div>

          <div className="card px-6 py-5">
            <div className="mb-1">
              <Badge>Salary (slab rates)</Badge>
            </div>
            <div className="ledger-row">
              <span className="label">Tax on salary</span>
              <span className="fill" />
              <span className="value">{formatINR(salaryTax.totalTax)}</span>
            </div>

            <div className="mt-3 mb-1">
              <Badge>LTCG (12.5% flat)</Badge>
            </div>
            <div className="ledger-row">
              <span className="label">Tax on LTCG</span>
              <span className="fill" />
              <span className="value">{formatINR(ltcg.totalTax)}</span>
            </div>

            <div className="mt-3 mb-1">
              <Badge>STCG (20% flat)</Badge>
            </div>
            <div className="ledger-row">
              <span className="label">Tax on STCG</span>
              <span className="fill" />
              <span className="value">{formatINR(stcg.totalTax)}</span>
            </div>

            <div className="border-t border-slate-200 mt-3 pt-3">
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Combined total tax</span>
                <span className="fill" />
                <span className="value">{formatINR(totalTax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-20">
        <ToolArticle title="Why capital gains don't push you into a higher salary tax bracket">
          <p>
            A common misconception is that capital gains get added to your
            total income and pushed through the same progressive slabs as
            salary. They don't — equity capital gains are taxed at their
            own fixed rates, entirely separate from your slab-based salary
            tax:
          </p>
          <FormulaBox>
            Total tax = Tax(salary alone, at slabs) + LTCG × 12.5% + STCG × 20%
          </FormulaBox>
          <p>
            This means a large capital gain doesn't retroactively increase
            the tax rate on your salary — the two income streams are
            computed independently and simply added together at the end.
            The main place they do interact: the LTCG exemption threshold
            (₹1,25,000) and the Section 87A rebate calculations use total
            income in specific ways, which is why it's worth running your
            actual numbers rather than assuming they're purely additive.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Which ITR form do I need with salary and capital gains?",
              answer:
                "Typically ITR-2, if you have salary and capital gains but no business or professional income. ITR-3 is for those who also have business or professional income (including presumptive income under 44AD/44ADA). Check your full income picture, not just this combination, before choosing.",
            },
            {
              question: "Do capital gains affect my Section 87A rebate eligibility?",
              answer:
                "The rebate calculation is based on total taxable income, and there are specific rules about which income types the rebate can apply against — equity capital gains under Section 111A/112A have restrictions on 87A rebate eligibility in some cases. This is a genuinely detailed area; verify your specific scenario with a tax professional or the latest ITR utility rather than assuming.",
            },
            {
              question: "Does the old vs new regime choice affect my capital gains tax?",
              answer:
                "No — the 12.5% LTCG and 20% STCG rates on equity are fixed regardless of which regime you choose for your salary income. The regime choice only affects how your salary portion is taxed.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="salary-capital-gains-calculator" />
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
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
