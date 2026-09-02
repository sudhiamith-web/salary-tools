"use client";

import { useMemo, useState } from "react";
import { computeInHandSalary, formatINR, computeNewRegimeTax } from "@/lib/calculators/salary";
import { computeSection44ADA } from "@/lib/calculators/section44ada";
import Badge from "@/components/Badge";
import RingChart from "@/components/RingChart";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function SalaryVsFreelanceCalculatorPage() {
  const [annualAmount, setAnnualAmount] = useState(1800000);
  const [cashPercent, setCashPercent] = useState(2);

  const salarySide = useMemo(
    () =>
      computeInHandSalary({
        annualCTC: annualAmount,
        basicPercentOfCTC: 40,
        employerPFRate: 12,
        professionalTaxAnnual: 2400,
      }),
    [annualAmount]
  );

  const freelanceSide = useMemo(() => {
    const presumptive = computeSection44ADA({ grossReceipts: annualAmount, cashReceiptsPercent: cashPercent });
    const tax = computeNewRegimeTax(presumptive.presumptiveIncome);
    return { presumptive, tax, netIncome: annualAmount - tax.totalTax };
  }, [annualAmount, cashPercent]);

  const salaryTakeHomePercent = (salarySide.netAnnualInHand / annualAmount) * 100;
  const freelanceTakeHomePercent = (freelanceSide.netIncome / annualAmount) * 100;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Salary vs Freelance Tax Comparison</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        For the same annual amount, compare take-home as a salaried
        employee (CTC) versus a freelancer under Section 44ADA presumptive
        taxation.
      </p>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Annual amount (CTC or gross receipts)" value={annualAmount} onChange={setAnnualAmount} suffix="₹ / year" />
          <Field label="Freelance cash receipts (% of total)" value={cashPercent} onChange={setCashPercent} suffix="%" step={1} />
          <p className="text-xs text-charcoal/50 -mt-4">
            Salary side assumes a typical 40% Basic, 12% PF structure.
            Freelance side assumes you qualify for Section 44ADA. Neither
            models the value of employer-provided benefits (health
            insurance, gratuity accrual, PF employer match) that salary
            includes but freelance income doesn't.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card px-5 py-5 text-center">
              <RingChart
                percent={salaryTakeHomePercent}
                color="#0E9F6E"
                label={`${Math.round(salaryTakeHomePercent)}%`}
                sublabel="take-home"
                size={90}
              />
              <p className="text-xs uppercase tracking-widest text-charcoal/50 font-medium mt-3 mb-1">Salaried</p>
              <p className="font-mono text-sm text-ink">{formatINR(salarySide.netAnnualInHand)}</p>
            </div>
            <div className="card px-5 py-5 text-center">
              <RingChart
                percent={freelanceTakeHomePercent}
                color="#2E5EFF"
                label={`${Math.round(freelanceTakeHomePercent)}%`}
                sublabel="take-home"
                size={90}
              />
              <p className="text-xs uppercase tracking-widest text-charcoal/50 font-medium mt-3 mb-1">Freelance</p>
              <p className="font-mono text-sm text-ink">{formatINR(freelanceSide.netIncome)}</p>
            </div>
          </div>

          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              {freelanceSide.netIncome > salarySide.netAnnualInHand ? "Freelance nets more" : "Salary nets more"}
            </p>
            <h3 className="font-display text-2xl text-ink">
              {formatINR(Math.abs(freelanceSide.netIncome - salarySide.netAnnualInHand))} difference
            </h3>
          </div>
        </div>
      </div>

      <div className="mb-20">
        <ToolArticle title="Why freelance often nets more — and what that comparison misses">
          <p>
            For the same headline amount, freelancing under 44ADA often
            shows higher take-home, mainly because only 50% of receipts get
            taxed as income at all:
          </p>
          <FormulaBox>
            Freelance taxable income = 50% × receipts, vs Salary taxable income ≈ full CTC minus PF
          </FormulaBox>
          <p>
            But this comparison is incomplete on purpose — it's only
            showing the tax mechanics, not the full financial picture.
            Salaried CTC typically includes employer PF contributions
            (building retirement savings, not spendable now but real
            value), gratuity accrual, and often health insurance —
            benefits a freelance rate has to informally price in and
            self-fund. A freelancer also carries income volatility, no paid
            leave, and full responsibility for their own retirement
            savings and health cover that a salaried structure partly
            handles automatically.
          </p>
          <p>
            Use this tool for the tax-mechanics comparison specifically —
            not as the full "which is better" answer, which depends on
            job security preferences, benefits value, and income stability
            too.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Is freelance income really taxed less than salary?",
              answer:
                "For the same gross amount, yes, often — because only 50% of freelance receipts become taxable income under 44ADA, versus the near-full CTC (minus PF) for salary. But this doesn't account for the value of employer benefits salaried employees get for free.",
            },
            {
              question: "Do freelancers get a standard deduction like salaried employees?",
              answer:
                "No — the ₹75,000 standard deduction under the new regime applies only to salary income, not to presumptive professional income under 44ADA.",
            },
            {
              question: "Can I switch between employee and freelance status for the same client relationship?",
              answer:
                "This is a genuine legal and tax question, not just a preference — misclassifying an employment relationship as freelance/contract can create compliance issues for both you and the paying company. Get this specifically reviewed rather than deciding based on tax optics alone.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="salary-vs-freelance-calculator" />
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
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
