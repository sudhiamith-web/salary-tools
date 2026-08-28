"use client";

import { useMemo, useState } from "react";
import { computeGratuity, EmploymentCategory } from "@/lib/calculators/gratuity";
import { formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

const categoryLabels: Record<EmploymentCategory, string> = {
  permanent: "Permanent employee",
  fixedTerm: "Fixed-term contract",
  government: "Government employee",
};

export default function GratuityCalculatorPage() {
  const [category, setCategory] = useState<EmploymentCategory>("permanent");
  const [basicPlusDA, setBasicPlusDA] = useState(45000);
  const [totalRemuneration, setTotalRemuneration] = useState(0);
  const [years, setYears] = useState(7.5);

  const result = useMemo(
    () =>
      computeGratuity({
        basicPlusDA,
        totalMonthlyRemuneration: totalRemuneration,
        yearsOfService: years,
        employmentCategory: category,
      }),
    [basicPlusDA, totalRemuneration, years, category]
  );

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const points = [1, 2, 3, 5, 7, 10, 15, 20, 25];
    return points.map((y) => ({
      label: `${y} yr${y > 1 ? "s" : ""}`,
      value: computeGratuity({
        basicPlusDA,
        totalMonthlyRemuneration: totalRemuneration,
        yearsOfService: y,
        employmentCategory: category,
      }).gratuityAmount,
    }));
  }, [basicPlusDA, totalRemuneration, category]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Gratuity Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Calculate your gratuity under the Payment of Gratuity Act, 1972, as
        updated by the Labour Codes (effective 21 November 2025).
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">Employment category</span>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(categoryLabels) as EmploymentCategory[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-left px-4 py-2 rounded-md border text-sm ${
                    category === c
                      ? "bg-accentTint border-accent text-ink"
                      : "bg-white text-charcoal/70 border-slate-300"
                  }`}
                >
                  {categoryLabels[c]}
                  {c === "fixedTerm" && (
                    <span className="block text-xs opacity-70">Eligible after 1 year</span>
                  )}
                  {c === "government" && (
                    <span className="block text-xs opacity-70">Fully tax-exempt</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Field label="Basic + DA (monthly)" value={basicPlusDA} onChange={setBasicPlusDA} suffix="₹ / month" />
          <Field
            label="Total monthly remuneration (optional)"
            value={totalRemuneration}
            onChange={setTotalRemuneration}
            suffix="₹ / month"
          />
          <p className="text-xs text-charcoal/50 -mt-4">
            Fill this in if your Basic + DA is less than half your total pay
            — the 50% wage rule may raise your effective gratuity wage base.
          </p>

          <Field label="Years of service" value={years} onChange={setYears} suffix="years" step={0.1} />
        </div>

        <div className="sticky top-6">
          <div className="card px-6 py-5">
            {!result.eligibleForGratuity ? (
              <div>
                <Badge>Not yet eligible</Badge>
                <p className="text-sm text-charcoal/60 mt-3">
                  {categoryLabels[category]}s need {result.eligibilityThresholdYears}+
                  years of continuous service. At your current tenure,
                  gratuity isn't payable yet.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2">
                  <Badge variant="filled">{categoryLabels[category]}</Badge>
                </div>
                <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
                  Gratuity payable
                </p>
                <h3 className="font-display text-3xl text-ink mb-6">
                  {formatINR(result.gratuityAmount)}
                </h3>

                <div className="mb-4">
                  <div className="ledger-row">
                    <span className="label">Rounded years of service</span>
                    <span className="fill" />
                    <span className="value">{result.roundedYears}</span>
                  </div>
                  <div className="ledger-row">
                    <span className="label">Wage base used</span>
                    <span className="fill" />
                    <span className="value">{formatINR(result.effectiveWageBase)}</span>
                  </div>
                  {result.wageBaseAdjusted && (
                    <p className="text-xs text-gold mt-1">
                      Adjusted up by the 50% wage rule
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="ledger-row">
                    <span className="label font-medium text-ink">Exempt from tax</span>
                    <span className="fill" />
                    <span className="value text-ledger">{formatINR(result.exemptAmount)}</span>
                  </div>
                  <div className="ledger-row">
                    <span className="label">Taxable amount</span>
                    <span className="fill" />
                    <span className="value text-rust">{formatINR(result.taxableAmount)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="How your gratuity grows with tenure"
          data={projectionData}
          columnLabel="Years of service"
          valueLabel="Gratuity payable"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="How gratuity is calculated">
          <p>
            Gratuity is a lump-sum payment your employer owes you for
            long-term service, under the Payment of Gratuity Act, 1972. The
            formula itself hasn't changed under the new Labour Codes:
          </p>
          <FormulaBox>Gratuity = (15 / 26) × wage base × years of service</FormulaBox>
          <p>
            The "wage base" is your last drawn Basic salary plus Dearness
            Allowance — not your full CTC. Two things changed when the
            Labour Codes took effect on 21 November 2025:
          </p>
          <p>
            <strong>Fixed-term employees</strong> now qualify for gratuity
            after just 1 year of continuous service, on a pro-rata basis,
            instead of waiting for the standard 5-year threshold that still
            applies to permanent employees.
          </p>
          <p>
            <strong>The 50% wage rule:</strong> if your allowances (HRA,
            special allowance, and similar components) add up to more than
            half your total pay, the excess now gets added back into the
            wage base used for this calculation. In practice, this raises
            the gratuity entitlement for many private-sector employees whose
            salary structures lean heavily on allowances over basic pay.
          </p>
          <p>
            Up to ₹20,00,000 of gratuity is exempt from tax under Section
            10(10) for non-government employees; government employees get
            full tax exemption regardless of amount.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Do I need to complete exactly 5 years to get gratuity?",
              answer:
                "For permanent employees, yes — 5 years of continuous service is the standard threshold. Fixed-term contract employees now qualify after just 1 year, on a pro-rata basis, following the Labour Codes that took effect on 21 November 2025.",
            },
            {
              question: "What counts as 'wages' for the gratuity calculation?",
              answer:
                "Your last drawn Basic salary plus Dearness Allowance (DA). Under the 50% wage rule introduced by the Labour Codes, if your allowances exceed half your total pay, the excess is added back into this wage base — so your effective gratuity wage may be higher than your payslip's Basic + DA line alone.",
            },
            {
              question: "Is gratuity part of my CTC?",
              answer:
                "Often yes — many employers include an estimated gratuity contribution as a CTC component, even though you don't receive it until you actually leave after becoming eligible. Check your offer letter's CTC breakup to see if it's listed separately.",
            },
            {
              question: "Is gratuity taxable?",
              answer:
                "Up to ₹20,00,000 is exempt from tax for non-government employees under Section 10(10) of the Income Tax Act. Anything above that cap is taxable as salary income. Government employees are fully exempt regardless of amount.",
            },
            {
              question: "What if I resign just before completing 5 years?",
              answer:
                "Some High Court rulings have held that 4 years and 240 days in the final year can satisfy the 5-year requirement under Section 2A of the Act, but this isn't a settled, universally applied rule — it depends on your specific employer, state, and whether the matter has been tested in your jurisdiction. Don't rely on it without checking with an HR or legal professional first.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="gratuity-calculator" />
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
