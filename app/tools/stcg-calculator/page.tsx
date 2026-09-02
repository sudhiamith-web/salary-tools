"use client";

import { useMemo, useState } from "react";
import { computeSTCG } from "@/lib/calculators/capitalGains";
import { formatINR } from "@/lib/calculators/salary";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";

export default function STCGCalculatorPage() {
  const [saleValue, setSaleValue] = useState(200000);
  const [purchaseValue, setPurchaseValue] = useState(150000);
  const [expenses, setExpenses] = useState(500);

  const result = useMemo(
    () => computeSTCG({ saleValue, purchaseValue, expenses }),
    [saleValue, purchaseValue, expenses]
  );

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const gains = [20000, 50000, 100000, 200000, 400000, 800000];
    return gains.map((g) => ({
      label: `₹${g / 1000}k gain`,
      value: computeSTCG({ saleValue: g + purchaseValue, purchaseValue, expenses: 0 }).totalTax,
    }));
  }, [purchaseValue]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">STCG Calculator (Equity & Equity Mutual Funds)</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        Calculate short-term capital gains tax on listed shares and
        equity-oriented mutual funds held 12 months or less.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        Flat 20% tax, no exemption threshold — even a small short-term gain
        is fully taxable. This covers listed equity and equity mutual funds
        only (Section 111A).
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Sale value" value={saleValue} onChange={setSaleValue} suffix="₹" />
          <Field label="Purchase value" value={purchaseValue} onChange={setPurchaseValue} suffix="₹" />
          <Field label="Brokerage / STT / other expenses" value={expenses} onChange={setExpenses} suffix="₹" />
          <p className="text-xs text-charcoal/50 pt-2">
            Assumes the holding period is 12 months or less. If it's over
            12 months, use the LTCG Calculator instead — you'll likely owe
            significantly less tax.
          </p>
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              STCG tax payable
            </p>
            <h3 className="font-display text-3xl text-ink">{formatINR(result.totalTax)}</h3>
          </div>

          <div className="card px-6 py-5">
            <div className="ledger-row">
              <span className="label">Total gain (fully taxable)</span>
              <span className="fill" />
              <span className="value">{formatINR(result.gain)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Tax @ 20%</span>
              <span className="fill" />
              <span className="value">{formatINR(result.taxBeforeCess)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Cess @ 4%</span>
              <span className="fill" />
              <span className="value">{formatINR(result.cess)}</span>
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3">
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Net proceeds after tax</span>
                <span className="fill" />
                <span className="value text-ledger">{formatINR(result.netProceeds)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="STCG tax at different gain levels"
          data={projectionData}
          columnLabel="Total gain"
          valueLabel="Tax payable"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="Why STCG hits harder than LTCG on equity">
          <p>
            Short-term capital gains on listed equity get none of the
            treatment long-term gains get — no annual exemption, and a
            higher rate:
          </p>
          <FormulaBox>STCG tax = gain × 20% × 1.04 (cess)</FormulaBox>
          <p>
            Even a ₹1,000 short-term gain is taxable in full — there's no
            equivalent of LTCG's ₹1,25,000 buffer. This is one of the
            clearest reasons long-term holding is tax-favored for equity:
            the same gain taxed as LTCG instead would likely fall entirely
            within the exemption, or be taxed at a lower 12.5% rate on
            whatever exceeds it.
          </p>
          <p>
            The rate was raised from 15% to 20% by the Finance (No. 2) Act,
            2024, effective for transfers from 23 July 2024 onward — worth
            knowing if you're comparing against older articles or
            calculators that still quote 15%.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Is there any exemption on STCG like there is for LTCG?",
              answer:
                "No — STCG on listed equity has no exemption threshold at all. The entire gain is taxable at 20%, regardless of how small it is.",
            },
            {
              question: "Does STCG depend on my income tax slab?",
              answer:
                "No — the 20% rate is flat and applies regardless of your income slab, unlike most other income which is taxed progressively.",
            },
            {
              question: "What if I hold exactly 12 months?",
              answer:
                "Holding period is calculated precisely — generally, more than 12 months from the purchase date qualifies as long-term. If you're near the boundary, check the exact purchase and sale dates carefully, since a few days can shift you between STCG and LTCG treatment with very different tax outcomes.",
            },
            {
              question: "Can STCG losses offset my salary income?",
              answer:
                "No — capital losses (short or long-term) can only be set off against capital gains, not against salary, business, or other income heads.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="stcg-calculator" />
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
