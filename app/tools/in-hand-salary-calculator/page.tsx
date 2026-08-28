"use client";

import { useMemo, useState } from "react";
import { computeInHandSalary } from "@/lib/calculators/salary";
import PayslipCard from "@/components/PayslipCard";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function InHandSalaryCalculatorPage() {
  const [ctc, setCtc] = useState(1200000);
  const [basicPercent, setBasicPercent] = useState(40);
  const [pfRate, setPfRate] = useState(12);
  const [proTax, setProTax] = useState(2400);

  const result = useMemo(
    () =>
      computeInHandSalary({
        annualCTC: ctc,
        basicPercentOfCTC: basicPercent,
        employerPFRate: pfRate,
        professionalTaxAnnual: proTax,
      }),
    [ctc, basicPercent, pfRate, proTax]
  );

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const ctcLevels = [600000, 900000, 1200000, 1500000, 1800000, 2400000, 3000000];
    return ctcLevels.map((c) => ({
      label: `₹${c / 100000}L`,
      value:
        computeInHandSalary({
          annualCTC: c,
          basicPercentOfCTC: basicPercent,
          employerPFRate: pfRate,
          professionalTaxAnnual: proTax,
        }).netMonthlyInHand,
    }));
  }, [basicPercent, pfRate, proTax]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">In-Hand Salary Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Estimate your monthly take-home from your annual CTC, using the new
        tax regime slabs for FY 2026-27. Adjust the assumptions below to
        match your own offer letter.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Annual CTC" value={ctc} onChange={setCtc} suffix="₹ / year" />
          <Field
            label="Basic salary (% of CTC)"
            value={basicPercent}
            onChange={setBasicPercent}
            suffix="%"
            step={1}
          />
          <Field
            label="Employer PF contribution (% of basic)"
            value={pfRate}
            onChange={setPfRate}
            suffix="%"
            step={1}
          />
          <Field
            label="Professional tax (annual)"
            value={proTax}
            onChange={setProTax}
            suffix="₹ / year"
          />
          <p className="text-xs text-charcoal/50 pt-2">
            Professional tax varies by state and is capped by law (typically
            ₹2,400/year max). The default shown is an approximation — check
            your state's actual slab.
          </p>
        </div>

        <PayslipCard result={result} />
      </div>

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="How take-home changes as CTC grows"
          data={projectionData}
          columnLabel="Annual CTC"
          valueLabel="Monthly take-home"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="Why your take-home is less than CTC ÷ 12">
          <p>
            CTC (Cost to Company) is what your employer spends on you
            annually — it isn't what lands in your bank account each month.
            Three things typically sit between the two:
          </p>
          <FormulaBox>
            Take-home = CTC − Employer PF − Employee PF − Income tax − Professional tax
          </FormulaBox>
          <p>
            Employer PF is a real cost to your employer, but it goes
            directly into your provident fund account, not your salary
            account — so while it's part of your CTC, it never appears as
            take-home pay. Employee PF is deducted from what would
            otherwise be your gross pay, for the same destination. Income
            tax and professional tax are withheld and paid to the
            government on your behalf.
          </p>
          <p>
            The proportion of your CTC that's Basic salary matters more than
            people expect — a higher Basic percentage means higher PF
            contributions (which reduce take-home now but build retirement
            savings) and can also change your HRA exemption eligibility if
            you're on the old tax regime.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Why is my in-hand salary so much less than my CTC?",
              answer:
                "CTC includes employer contributions (like employer PF and sometimes gratuity accrual) that never reach your bank account, plus deductions like employee PF, income tax, and professional tax. Take-home is what's left after all of that.",
            },
            {
              question: "Does this calculator use the old or new tax regime?",
              answer:
                "This calculator uses the new tax regime, since it's the default regime for most salaried employees unless they specifically opt for the old regime. Use the Old vs New Tax Regime Calculator to compare both and see which is better for your situation.",
            },
            {
              question: "What's a typical Basic salary percentage of CTC?",
              answer:
                "Most companies structure Basic salary between 35% and 50% of CTC. A higher Basic increases your PF contribution (both employee and employer sides) and, under the old regime, can also increase your HRA exemption ceiling.",
            },
            {
              question: "Is professional tax the same across India?",
              answer:
                "No — professional tax is levied by state governments and varies by state, with some states (like Delhi) not levying it at all. Most states that do levy it cap it around ₹2,400/year, which is why that's used as the default here, but check your specific state's slab for accuracy.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="in-hand-salary-calculator" />
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
