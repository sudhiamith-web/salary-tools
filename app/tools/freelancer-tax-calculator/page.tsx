"use client";

import { useMemo, useState } from "react";
import { computeSection44ADA } from "@/lib/calculators/section44ada";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";

export default function FreelancerTaxCalculatorPage() {
  const [grossReceipts, setGrossReceipts] = useState(3000000);
  const [cashPercent, setCashPercent] = useState(2);

  const result = useMemo(
    () => computeSection44ADA({ grossReceipts, cashReceiptsPercent: cashPercent }),
    [grossReceipts, cashPercent]
  );

  const tax = useMemo(() => computeNewRegimeTax(result.presumptiveIncome), [result.presumptiveIncome]);

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const levels = [1000000, 2000000, 3000000, 4000000, 5000000, 7500000];
    return levels.map((r) => {
      const res = computeSection44ADA({ grossReceipts: r, cashReceiptsPercent: cashPercent });
      return { label: `₹${r / 100000}L`, value: computeNewRegimeTax(res.presumptiveIncome).totalTax };
    });
  }, [cashPercent]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Freelancer Tax Calculator (Section 44ADA)</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        For specified professionals (consultants, doctors, lawyers,
        engineers, tech freelancers, etc.) — declare 50% of gross receipts
        as income, skip detailed bookkeeping and audit.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Gross annual receipts" value={grossReceipts} onChange={setGrossReceipts} suffix="₹ / year" />
          <Field
            label="Cash receipts (% of total)"
            value={cashPercent}
            onChange={setCashPercent}
            suffix="%"
            step={1}
          />
          <p className="text-xs text-charcoal/50 -mt-4">
            If 95%+ of your receipts come through banking/digital channels
            (cash ≤ 5%), your eligibility limit rises to ₹75 lakh instead
            of ₹50 lakh.
          </p>
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              {result.eligible ? "Presumptive income (50% of receipts)" : "Not eligible — full receipts taxable"}
            </p>
            <h3 className="font-display text-3xl text-ink">{formatINR(result.presumptiveIncome)}</h3>
          </div>

          <div className="card px-6 py-5">
            <div className="mb-2">
              <Badge variant={result.eligible ? "success" : "warn"}>
                Limit applicable: {formatINR(result.applicableLimit)}
              </Badge>
            </div>
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
            <div className="border-t border-slate-200 mt-3 pt-3">
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Total tax (new regime, incl. cess)</span>
                <span className="fill" />
                <span className="value">{formatINR(tax.totalTax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="Tax at different receipt levels"
          data={projectionData}
          columnLabel="Gross receipts"
          valueLabel="Tax payable"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="Why 44ADA is worth understanding before you incorporate anything">
          <p>
            Section 44ADA lets specified professionals skip the entire
            expense-tracking exercise most freelancers dread — instead of
            proving every deduction, you simply declare 50% of receipts as
            income:
          </p>
          <FormulaBox>Presumptive income = 50% × gross receipts (minimum — you can declare more)</FormulaBox>
          <p>
            This is genuinely advantageous if your real expenses are below
            50% of receipts — which is common for consulting, tech, and
            knowledge work with low overhead. If your actual costs run
            higher than 50% (e.g. a doctor with expensive equipment and
            staff), the regular books-of-account route might leave you
            paying tax on a smaller, more accurate profit figure instead.
          </p>
          <p>
            The eligibility limits are based on gross receipts, not profit
            — cross ₹50 lakh (or ₹75 lakh if your cash receipts stay at or
            below 5%) and you lose access to the scheme entirely for that
            year, not just on the excess.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Which professions qualify for Section 44ADA?",
              answer:
                "Specified professionals under Section 44AA — legal, medical, engineering, architectural, accountancy, technical consultancy, interior design, and similar fields, including many forms of tech and creative freelancing. If you're unsure whether your specific work qualifies, check the exact list or ask a CA before relying on this scheme.",
            },
            {
              question: "Can I declare less than 50% of receipts as income?",
              answer:
                "No — 50% is the minimum you must declare to stay within the presumptive scheme and its book-keeping exemption. You can voluntarily declare more (if your actual profit margin is higher), but declaring less would require maintaining full books and being subject to audit instead.",
            },
            {
              question: "What happens if I cross ₹50 lakh but I'm not sure I hit 95% digital receipts?",
              answer:
                "The 5% cash threshold is a strict cutoff, not a sliding scale — if your cash receipts exceed 5% of total receipts even slightly, you lose the enhanced ₹75 lakh limit and fall back to ₹50 lakh for the entire year, not just the amount above the threshold.",
            },
            {
              question: "Do I still need to pay advance tax under 44ADA?",
              answer:
                "Yes, but with a simpler schedule — the entire estimated tax liability must be paid as one installment by 15 March, rather than the four quarterly installments regular taxpayers follow. Use the Advance Tax Calculator to check what you owe.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="freelancer-tax-calculator" />
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
