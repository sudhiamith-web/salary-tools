"use client";

import { useMemo, useState } from "react";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function TDSCalculatorPage() {
  const [annualGrossSalary, setAnnualGrossSalary] = useState(1200000);
  const [monthsRemaining, setMonthsRemaining] = useState(12);

  const tax = useMemo(() => computeNewRegimeTax(annualGrossSalary), [annualGrossSalary]);
  const monthlyTDS = useMemo(
    () => (monthsRemaining > 0 ? tax.totalTax / monthsRemaining : 0),
    [tax, monthsRemaining]
  );

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const incomeLevels = [600000, 900000, 1200000, 1500000, 1800000, 2400000, 3000000];
    return incomeLevels.map((income) => ({
      label: `₹${income / 100000}L`,
      value: computeNewRegimeTax(income).totalTax / 12,
    }));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">TDS on Salary Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        Estimate the monthly tax your employer should be withholding from
        your salary, based on the new tax regime (the default regime unless
        you've told your employer otherwise).
      </p>
      <div className="stamp-note mb-10">
        Assumes even withholding across the remaining months. Employers
        often front-load or adjust TDS as the financial year progresses, so
        your actual payslip figure may differ from this estimate.
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field
            label="Annual gross salary"
            value={annualGrossSalary}
            onChange={setAnnualGrossSalary}
            suffix="₹ / year"
          />
          <Field
            label="Months remaining in the financial year"
            value={monthsRemaining}
            onChange={setMonthsRemaining}
            suffix="months"
            step={1}
          />
        </div>

        <div className="sticky top-6">
          <div className="receipt-edge-top" />
          <div className="bg-white px-6 py-6 shadow-sm">
            <div className="mb-2">
              <Badge>New regime</Badge>
            </div>
            <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
              Estimated monthly TDS
            </p>
            <h3 className="font-display text-3xl text-ink mb-6">
              {formatINR(monthlyTDS)}
            </h3>

            <div className="mb-4">
              <div className="ledger-row">
                <span className="label">Taxable income</span>
                <span className="fill" />
                <span className="value">{formatINR(tax.taxableIncome)}</span>
              </div>
              <div className="ledger-row">
                <span className="label">Rebate (Sec 87A)</span>
                <span className="fill" />
                <span className="value text-ledger">−{formatINR(tax.rebate)}</span>
              </div>
              <div className="ledger-row">
                <span className="label">Cess (4%)</span>
                <span className="fill" />
                <span className="value">{formatINR(tax.cess)}</span>
              </div>
            </div>

            <div className="border-t border-ink/10 pt-3">
              <div className="ledger-row">
                <span className="label font-medium text-ink">Total annual tax</span>
                <span className="fill" />
                <span className="value">{formatINR(tax.totalTax)}</span>
              </div>
            </div>
          </div>
          <div className="receipt-edge-bottom" />
        </div>
      </div>

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="Monthly TDS at different income levels"
          data={projectionData}
          columnLabel="Annual gross salary"
          valueLabel="Monthly TDS"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="How employers calculate TDS on salary">
          <p>
            Your employer doesn't wait until March to figure out your tax —
            they estimate your full-year tax liability upfront, then divide
            it across the remaining months of the financial year:
          </p>
          <FormulaBox>Monthly TDS = Estimated annual tax ÷ months remaining in FY</FormulaBox>
          <p>
            This estimate changes through the year as your employer gets
            more information — a mid-year raise, a declared investment under
            the old regime, or a bonus payout all cause your employer to
            recalculate and adjust future months' TDS, sometimes sharply.
            This is why your actual payslip TDS may not match a simple
            annual-tax-divided-by-12 estimate.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Why did my TDS suddenly increase mid-year?",
              answer:
                "Usually because your employer recalculated your estimated annual tax — often triggered by a bonus, salary revision, or the employer catching up on withholding after under-deducting earlier in the year.",
            },
            {
              question: "Can I reduce my monthly TDS?",
              answer:
                "Under the old regime, declaring investments (80C, 80D, HRA, home loan) to your employer via Form 12BB reduces your estimated taxable income and therefore your TDS. Under the new regime, there's very little room to reduce it since most deductions aren't allowed.",
            },
            {
              question: "What happens if too much TDS was deducted?",
              answer:
                "You claim the excess back as a refund when filing your income tax return (ITR) for that financial year.",
            },
            {
              question: "Does this calculator account for a bonus I already received?",
              answer:
                "Not directly — this estimates TDS based on your annual gross salary evenly across the months you specify. If you've already received a bonus, your actual year-to-date TDS may be higher than this month-by-month estimate suggests, since employers usually apply higher withholding in the bonus month itself.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="tds-calculator" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
  step = 1000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink block mb-1.5">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
