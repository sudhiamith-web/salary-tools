"use client";

import { useMemo, useState } from "react";
import { computeSection80C, SECTION_80C_LIMIT, SECTION_80CCD_1B_LIMIT } from "@/lib/calculators/section80c";
import { computeOldRegimeTax } from "@/lib/calculators/oldRegime";
import { formatINR } from "@/lib/calculators/salary";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";

export default function Section80CPlannerPage() {
  const [income, setIncome] = useState(1200000);
  const [investments, setInvestments] = useState(100000);
  const [npsContribution, setNpsContribution] = useState(0);

  const result = useMemo(
    () => computeSection80C({ investments, npsContribution }),
    [investments, npsContribution]
  );

  const taxSaved = useMemo(() => {
    const withNPS = computeOldRegimeTax({
      grossAnnualIncome: income,
      section80CDeduction: investments,
      section80DDeduction: 0,
      hraExemption: 0,
      otherDeductions: Math.min(npsContribution, SECTION_80CCD_1B_LIMIT),
    });
    const withoutDeduction = computeOldRegimeTax({
      grossAnnualIncome: income,
      section80CDeduction: 0,
      section80DDeduction: 0,
      hraExemption: 0,
      otherDeductions: 0,
    });
    return Math.max(0, withoutDeduction.totalTax - withNPS.totalTax);
  }, [income, investments, npsContribution]);

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const levels = [30000, 60000, 90000, 120000, 150000];
    return levels.map((amt) => {
      const withAmt = computeOldRegimeTax({
        grossAnnualIncome: income,
        section80CDeduction: amt,
        section80DDeduction: 0,
        hraExemption: 0,
        otherDeductions: 0,
      });
      const without = computeOldRegimeTax({
        grossAnnualIncome: income,
        section80CDeduction: 0,
        section80DDeduction: 0,
        hraExemption: 0,
        otherDeductions: 0,
      });
      return { label: `₹${amt / 1000}k`, value: Math.max(0, without.totalTax - withAmt.totalTax) };
    });
  }, [income]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Section 80C Tax Planner</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        See how much of your ₹1,50,000 Section 80C limit you've used, and
        estimate the actual tax you save — old tax regime only.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        The 80C limit is <strong>₹1,50,000</strong>, combined across PPF,
        ELSS, EPF, life insurance, and similar instruments — not
        ₹2,00,000. NPS under Section 80CCD(1B) is a separate additional
        ₹50,000 bucket, tracked below.
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Annual taxable income (before 80C, old regime)" value={income} onChange={setIncome} suffix="₹ / year" />
          <Field
            label={`80C investments (PPF, ELSS, EPF, insurance, etc. — max ${formatINR(SECTION_80C_LIMIT)})`}
            value={investments}
            onChange={setInvestments}
            suffix="₹ / year"
          />
          <Field
            label={`NPS contribution — Section 80CCD(1B) (separate ${formatINR(SECTION_80CCD_1B_LIMIT)} bucket)`}
            value={npsContribution}
            onChange={setNpsContribution}
            suffix="₹ / year"
          />
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              Estimated tax saved
            </p>
            <h3 className="font-display text-3xl text-ink">{formatINR(taxSaved)}</h3>
          </div>

          <div className="card px-6 py-5">
            <div className="ledger-row">
              <span className="label">80C used</span>
              <span className="fill" />
              <span className="value">{formatINR(result.eligible80C)} / {formatINR(SECTION_80C_LIMIT)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">80C headroom remaining</span>
              <span className="fill" />
              <span className="value text-ledger">{formatINR(result.unused80C)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">NPS (80CCD(1B)) used</span>
              <span className="fill" />
              <span className="value">{formatINR(result.eligibleNPS)} / {formatINR(SECTION_80CCD_1B_LIMIT)}</span>
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3">
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Total deduction claimed</span>
                <span className="fill" />
                <span className="value">{formatINR(result.totalDeduction)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="Tax saved at different 80C investment levels"
          data={projectionData}
          columnLabel="80C invested"
          valueLabel="Tax saved"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="How 80C actually reduces your tax">
          <p>
            Section 80C doesn't directly cut your tax bill — it reduces your
            taxable income, and the actual rupee savings depend on which
            tax slab that income falls in:
          </p>
          <FormulaBox>Tax saved = Tax(income) − Tax(income − 80C deduction)</FormulaBox>
          <p>
            This means the same ₹1,50,000 investment saves more for someone
            in the 30% slab than someone in the 5% slab — there's no flat
            "you save X%" answer, which is why this calculator computes the
            actual difference using the real old-regime slabs rather than
            a rule of thumb.
          </p>
          <p>
            Common instruments that count toward the ₹1,50,000 limit: EPF
            contributions, PPF, ELSS mutual funds, life insurance premiums,
            five-year tax-saver FDs, NSC, Sukanya Samriddhi, and home loan
            principal repayment. NPS under Section 80CCD(1B) is deliberately
            kept separate — it's the one way to get tax benefit beyond the
            ₹1,50,000 ceiling, up to an additional ₹50,000.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Does my EPF contribution count toward the 80C limit?",
              answer:
                "Yes — your own (employee) EPF contribution counts toward the ₹1,50,000 80C limit. Employer PF contributions do not count here; they're a separate, non-taxable component of your CTC.",
            },
            {
              question: "Can I claim 80C on the new tax regime?",
              answer:
                "No. Section 80C, along with almost all other Chapter VI-A deductions, is only available under the old tax regime.",
            },
            {
              question: "Is the NPS 80CCD(1B) benefit really separate from 80C?",
              answer:
                "Yes — it's an additional ₹50,000 deduction bucket specifically for NPS contributions, on top of the ₹1,50,000 80C limit. So the effective combined ceiling is ₹2,00,000, but only ₹50,000 of that can come from NPS specifically.",
            },
            {
              question: "What if I invest more than ₹1,50,000 in 80C instruments?",
              answer:
                "The excess simply doesn't get any additional deduction — the ₹1,50,000 cap is firm. It's often better to redirect anything beyond that into NPS (for the extra 80CCD(1B) benefit) or into non-80C investments instead of over-investing in the same bucket.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="section-80c-planner" />
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
