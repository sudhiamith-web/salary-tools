"use client";

import { useMemo, useState } from "react";
import { computeSection80D } from "@/lib/calculators/section80d";
import { computeOldRegimeTax } from "@/lib/calculators/oldRegime";
import { formatINR } from "@/lib/calculators/salary";
import { FormulaBox } from "@/components/ToolArticle";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Badge from "@/components/Badge";
import Breadcrumb from "@/components/Breadcrumb";
import SliderField from "@/components/SliderField";
import InsightBanner from "@/components/InsightBanner";

export default function Section80DCalculatorPage() {
  const [income, setIncome] = useState(1200000);
  const [selfFamilyPremium, setSelfFamilyPremium] = useState(18000);
  const [selfFamilySenior, setSelfFamilySenior] = useState(false);
  const [parentsPremium, setParentsPremium] = useState(30000);
  const [parentsSenior, setParentsSenior] = useState(true);
  const [preventiveCheckup, setPreventiveCheckup] = useState(3000);

  const result = useMemo(
    () =>
      computeSection80D({
        selfFamilyPremium,
        selfFamilySenior,
        parentsPremium,
        parentsSenior,
        preventiveCheckup,
      }),
    [selfFamilyPremium, selfFamilySenior, parentsPremium, parentsSenior, preventiveCheckup]
  );

  const taxSaved = useMemo(() => {
    const withDeduction = computeOldRegimeTax({
      grossAnnualIncome: income,
      section80CDeduction: 0,
      section80DDeduction: result.totalDeduction,
      hraExemption: 0,
      otherDeductions: 0,
    });
    const withoutDeduction = computeOldRegimeTax({
      grossAnnualIncome: income,
      section80CDeduction: 0,
      section80DDeduction: 0,
      hraExemption: 0,
      otherDeductions: 0,
    });
    return Math.max(0, withoutDeduction.totalTax - withDeduction.totalTax);
  }, [income, result.totalDeduction]);

  const insight = useMemo(() => {
    if (preventiveCheckup >= 5000) return null;
    const bumped = computeSection80D({
      selfFamilyPremium,
      selfFamilySenior,
      parentsPremium,
      parentsSenior,
      preventiveCheckup: 5000,
    });
    const deductionDelta = bumped.totalDeduction - result.totalDeduction;
    if (deductionDelta <= 0) return null;
    const withBumped = computeOldRegimeTax({
      grossAnnualIncome: income,
      section80CDeduction: 0,
      section80DDeduction: bumped.totalDeduction,
      hraExemption: 0,
      otherDeductions: 0,
    });
    const withCurrent = computeOldRegimeTax({
      grossAnnualIncome: income,
      section80CDeduction: 0,
      section80DDeduction: result.totalDeduction,
      hraExemption: 0,
      otherDeductions: 0,
    });
    const delta = withCurrent.totalTax - withBumped.totalTax;
    return delta > 0 ? { delta } : null;
  }, [preventiveCheckup, selfFamilyPremium, selfFamilySenior, parentsPremium, parentsSenior, result.totalDeduction, income]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/" }, { label: "Section 80D Health Insurance Calculator" }]} />
      <h1 className="text-3xl mb-2">Section 80D Health Insurance Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Work out your health insurance deduction across two independent
        brackets — self/family and parents — each with its own senior
        citizen limit. Old tax regime only.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <SliderField
            label="Annual taxable income (before deductions, old regime)"
            value={income}
            onChange={setIncome}
            suffix="₹ / year"
            min={300000}
            max={5000000}
            step={50000}
          />

          <div>
            <SliderField
              label="Self & family premium"
              value={selfFamilyPremium}
              onChange={setSelfFamilyPremium}
              suffix="₹ / year"
              min={0}
              max={100000}
              step={1000}
            />
            <label className="flex items-center gap-2 text-xs text-charcoal/60 mt-2">
              <input type="checkbox" checked={selfFamilySenior} onChange={(e) => setSelfFamilySenior(e.target.checked)} />
              Self, spouse, or a covered child is 60+ (raises limit to ₹50,000)
            </label>
          </div>

          <div>
            <SliderField
              label="Parents' premium"
              value={parentsPremium}
              onChange={setParentsPremium}
              suffix="₹ / year"
              min={0}
              max={100000}
              step={1000}
            />
            <label className="flex items-center gap-2 text-xs text-charcoal/60 mt-2">
              <input type="checkbox" checked={parentsSenior} onChange={(e) => setParentsSenior(e.target.checked)} />
              Either parent is 60+ (raises limit to ₹50,000)
            </label>
          </div>

          <SliderField
            label="Preventive health checkup (sub-limit ₹5,000)"
            value={preventiveCheckup}
            onChange={setPreventiveCheckup}
            suffix="₹ / year"
            min={0}
            max={5000}
            step={500}
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
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={selfFamilySenior ? "success" : "outline"}>
                Self/family limit: {formatINR(result.selfFamilyLimit)}
              </Badge>
            </div>
            <div className="ledger-row">
              <span className="label">Self/family eligible</span>
              <span className="fill" />
              <span className="value">{formatINR(result.selfFamilyEligible)}</span>
            </div>

            <div className="flex items-center gap-2 mt-4 mb-2">
              <Badge variant={parentsSenior ? "success" : "outline"}>
                Parents limit: {formatINR(result.parentsLimit)}
              </Badge>
            </div>
            <div className="ledger-row">
              <span className="label">Parents eligible</span>
              <span className="fill" />
              <span className="value">{formatINR(result.parentsEligible)}</span>
            </div>

            <div className="border-t border-slate-200 mt-4 pt-3">
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Total 80D deduction</span>
                <span className="fill" />
                <span className="value text-ledger">{formatINR(result.totalDeduction)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {insight && (
        <div className="mb-10 max-w-2xl">
          <InsightBanner
            message={`Using the full ₹5,000 preventive checkup sub-limit would save you an extra ₹${Math.round(insight.delta).toLocaleString("en-IN")}`}
          />
        </div>
      )}

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "two-brackets",
              label: "Why there are two brackets",
              content: (
                <>
                  <p>
                    Section 80D treats your own family and your parents as
                    two independent deduction buckets — each with its own
                    limit based on whether anyone covered in that bracket
                    is a senior citizen:
                  </p>
                  <FormulaBox>
                    Total 80D = Self/family bracket (₹25k or ₹50k) + Parents bracket (₹25k or ₹50k)
                  </FormulaBox>
                  <p>
                    This is why someone with young parents can still claim
                    up to ₹75,000 combined if they themselves are a senior
                    citizen, or up to ₹1,00,000 if both they and their
                    parents are 60+ — the two brackets are genuinely
                    independent, not a single shared limit.
                  </p>
                </>
              ),
            },
            {
              id: "preventive-checkup",
              label: "The preventive checkup sub-limit",
              content: (
                <p>
                  The ₹5,000 preventive checkup deduction isn&apos;t extra
                  money on top — it&apos;s counted within whichever
                  bracket has room, so it only helps if you haven&apos;t
                  already maxed out that bracket&apos;s premium-based
                  limit.
                </p>
              ),
            },
          ]}
        />
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Can I claim 80D for my in-laws?",
              answer:
                "No — the 'parents' bracket under Section 80D covers only your biological or adoptive parents, not your spouse's parents. In-laws' premiums aren't eligible under this section.",
            },
            {
              question: "What if my parents don't have health insurance?",
              answer:
                "If a parent is a senior citizen (60+) without any health insurance policy, you can claim actual medical expenditure incurred on their treatment, up to the same ₹50,000 senior citizen limit, in place of a premium.",
            },
            {
              question: "Is 80D available on the new tax regime?",
              answer:
                "No — like most Chapter VI-A deductions, Section 80D is only available if you've opted for the old tax regime.",
            },
            {
              question: "Do I need to pay premiums by a specific method?",
              answer:
                "Yes — premiums must be paid via non-cash methods (net banking, cheque, card, UPI) to be eligible. The preventive health checkup is the one exception that can be paid in cash.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="section-80d-calculator" />
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
          step={500}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
