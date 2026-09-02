"use client";

import { useMemo, useState } from "react";
import { computeLTCG, LTCG_EXEMPTION } from "@/lib/calculators/capitalGains";
import { formatINR } from "@/lib/calculators/salary";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";

export default function LTCGCalculatorPage() {
  const [saleValue, setSaleValue] = useState(500000);
  const [purchaseValue, setPurchaseValue] = useState(300000);
  const [expenses, setExpenses] = useState(1000);

  const result = useMemo(
    () => computeLTCG({ saleValue, purchaseValue, expenses }),
    [saleValue, purchaseValue, expenses]
  );

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const gains = [100000, 200000, 300000, 500000, 800000, 1200000];
    return gains.map((g) => ({
      label: `₹${g / 100000}L gain`,
      value: computeLTCG({ saleValue: g + purchaseValue, purchaseValue, expenses: 0 }).totalTax,
    }));
  }, [purchaseValue]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">LTCG Calculator (Equity & Equity Mutual Funds)</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        Calculate long-term capital gains tax on listed shares and
        equity-oriented mutual funds held over 12 months.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        This covers listed equity and equity mutual funds only (Section
        112A). Property, debt funds, gold, and unlisted shares follow
        different rates and rules — not covered here.
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Sale value" value={saleValue} onChange={setSaleValue} suffix="₹" />
          <Field label="Purchase value" value={purchaseValue} onChange={setPurchaseValue} suffix="₹" />
          <Field label="Brokerage / STT / other expenses" value={expenses} onChange={setExpenses} suffix="₹" />
          <p className="text-xs text-charcoal/50 pt-2">
            Assumes the holding period is over 12 months. If it's 12 months
            or less, use the STCG Calculator instead — the rate and rules
            are completely different.
          </p>
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              LTCG tax payable
            </p>
            <h3 className="font-display text-3xl text-ink">{formatINR(result.totalTax)}</h3>
          </div>

          <div className="card px-6 py-5">
            <div className="ledger-row">
              <span className="label">Total gain</span>
              <span className="fill" />
              <span className="value">{formatINR(result.gain)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Exempt (up to {formatINR(LTCG_EXEMPTION)})</span>
              <span className="fill" />
              <span className="value text-ledger">{formatINR(result.exemptAmount)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Taxable gain</span>
              <span className="fill" />
              <span className="value">{formatINR(result.taxableGain)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Tax @ 12.5%</span>
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
          title="LTCG tax at different gain levels"
          data={projectionData}
          columnLabel="Total gain"
          valueLabel="Tax payable"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="How LTCG on equity actually works">
          <p>
            Long-term capital gains on listed shares and equity mutual funds
            get a yearly exemption before any tax applies:
          </p>
          <FormulaBox>
            LTCG tax = MAX(0, gain − ₹1,25,000) × 12.5% × 1.04 (cess)
          </FormulaBox>
          <p>
            The ₹1,25,000 exemption is an aggregate annual limit across all
            your equity LTCG for the year — not per transaction or per
            fund. If you sell multiple holdings, the exemption applies once
            to the combined total gain, not once per sale.
          </p>
          <p>
            Unlike the old LTCG rules, there's no indexation benefit here —
            the 12.5% rate applies to the raw gain (sale minus purchase
            minus expenses), not an inflation-adjusted cost.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Is the ₹1,25,000 exemption per stock or per year?",
              answer:
                "Per financial year, across all your equity LTCG combined — not per stock, per fund, or per transaction. If you have gains from multiple holdings, they're added together before the exemption is applied once.",
            },
            {
              question: "What counts as 'long-term' for equity?",
              answer:
                "Holding the shares or equity mutual fund units for more than 12 months from the date of purchase. 12 months or less is short-term (STCG), taxed very differently.",
            },
            {
              question: "Does this apply to debt mutual funds too?",
              answer:
                "No. Debt mutual funds purchased on or after 1 April 2023 don't get long-term capital gains treatment at all — they're always taxed at your income slab rate regardless of holding period.",
            },
            {
              question: "Can I offset LTCG with losses from other investments?",
              answer:
                "Long-term capital losses can only be set off against long-term capital gains, not short-term gains. Short-term losses, on the other hand, can be set off against both short-term and long-term gains. Unused losses can be carried forward for up to 8 assessment years if you file your return on time.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="ltcg-calculator" />
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
