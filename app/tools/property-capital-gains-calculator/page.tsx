"use client";

import { useMemo, useState } from "react";
import { computeProperty, CII_YEARS, GRANDFATHER_CUTOFF_YEAR } from "@/lib/calculators/property";
import { formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function PropertyCapitalGainsCalculatorPage() {
  const [saleValue, setSaleValue] = useState(9000000);
  const [purchaseValue, setPurchaseValue] = useState(3000000);
  const [purchaseYear, setPurchaseYear] = useState("2012-13");
  const [saleYear, setSaleYear] = useState("2026-27");
  const [transferExpenses, setTransferExpenses] = useState(50000);
  const [section54, setSection54] = useState(0);
  const [section54EC, setSection54EC] = useState(0);

  const isPreCutoff = purchaseYear < GRANDFATHER_CUTOFF_YEAR;

  const result = useMemo(
    () =>
      computeProperty({
        saleValue,
        purchaseValue,
        purchaseYear,
        saleYear,
        transferExpenses,
        section54Exemption: section54,
        section54ECExemption: section54EC,
        isPreJuly2024Purchase: isPreCutoff,
      }),
    [saleValue, purchaseValue, purchaseYear, saleYear, transferExpenses, section54, section54EC, isPreCutoff]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Property Capital Gains Tax Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        For land and buildings held over 24 months. Automatically compares
        the grandfathering choice (12.5% without indexation vs 20% with
        indexation) if you bought before 23 July 2024.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        This covers long-term gains (holding &gt;24 months) only. Property
        held 24 months or less is short-term and taxed at your income
        slab rate instead — not covered here.
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <Field label="Sale value" value={saleValue} onChange={setSaleValue} suffix="₹" />
          <Field label="Purchase value" value={purchaseValue} onChange={setPurchaseValue} suffix="₹" />

          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">Purchase financial year</span>
            <select
              value={purchaseYear}
              onChange={(e) => setPurchaseYear(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
            >
              {CII_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <p className="text-xs text-charcoal/50 mt-1">
              {isPreCutoff
                ? "Before 23 July 2024 — you get the grandfathering choice."
                : "On/after 23 July 2024 — only 12.5% without indexation applies."}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">Sale financial year</span>
            <select
              value={saleYear}
              onChange={(e) => setSaleYear(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
            >
              {CII_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <Field label="Transfer expenses (brokerage, legal, etc.)" value={transferExpenses} onChange={setTransferExpenses} suffix="₹" />
          <Field label="Section 54 exemption (reinvested in residential property)" value={section54} onChange={setSection54} suffix="₹" />
          <Field label="Section 54EC exemption (bonds, max ₹50L)" value={section54EC} onChange={setSection54EC} suffix="₹" />
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              LTCG tax payable
            </p>
            <h3 className="font-display text-3xl text-ink">{formatINR(result.totalTax)}</h3>
          </div>

          <div className="card px-6 py-5">
            <div className="mb-2">
              <Badge variant={result.chosenMethod === "with-indexation" ? "success" : "outline"}>
                {result.chosenMethod === "with-indexation" ? "20% with indexation wins" : "12.5% without indexation wins"}
              </Badge>
            </div>
            <div className="ledger-row">
              <span className="label">Gain (without indexation)</span>
              <span className="fill" />
              <span className="value">{formatINR(result.gain)}</span>
            </div>
            {result.taxWithIndexation !== null && (
              <>
                <div className="ledger-row">
                  <span className="label">Indexed gain</span>
                  <span className="fill" />
                  <span className="value">{formatINR(result.indexedGain)}</span>
                </div>
                <div className="ledger-row">
                  <span className="label">Tax @ 20% with indexation</span>
                  <span className="fill" />
                  <span className="value">{formatINR(result.taxWithIndexation)}</span>
                </div>
              </>
            )}
            <div className="ledger-row">
              <span className="label">Tax @ 12.5% without indexation</span>
              <span className="fill" />
              <span className="value">{formatINR(result.taxWithoutIndexation)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Exemptions claimed (54 + 54EC)</span>
              <span className="fill" />
              <span className="value text-ledger">−{formatINR(result.exemptionsClaimed)}</span>
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3">
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Final tax (incl. 4% cess)</span>
                <span className="fill" />
                <span className="value">{formatINR(result.totalTax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-20">
        <ToolArticle title="The grandfathering choice, explained">
          <p>
            Budget 2024 replaced indexed property taxation with a flat
            12.5% rate — but gave people who'd already bought property
            before the change a way to avoid an unfair retroactive hit:
          </p>
          <FormulaBox>
            Tax = MIN(gain × 12.5%, indexed gain × 20%) — only if purchased before 23 July 2024
          </FormulaBox>
          <p>
            Indexation adjusts your purchase price for inflation using the
            Cost Inflation Index (CII), which shrinks your taxable gain —
            valuable for property held many years through high inflation.
            For property bought closer to the sale date, the inflation
            adjustment is small, so the flat 12.5% rate usually wins
            instead. This calculator computes both and shows you which
            wins for your specific numbers, rather than assuming one is
            always better.
          </p>
          <p>
            Property bought on or after 23 July 2024 doesn't get this
            choice at all — it's 12.5% without indexation, full stop.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "What if my property was purchased before 2001?",
              answer:
                "You can use the Fair Market Value as on 1 April 2001 as your cost of acquisition instead of the actual purchase price, with indexation calculated from FY 2001-02 (CII 100). This calculator's earliest year is 2001-02 for that reason — enter the 1 April 2001 FMV as your purchase value if your property predates it.",
            },
            {
              question: "How does Section 54 exemption actually work?",
              answer:
                "If you reinvest the capital gain (not the full sale proceeds) into another residential property within the specified time window, you can claim the reinvested amount as exempt, up to a cap of ₹10 crore. The property must generally be purchased 1 year before to 2 years after the sale, or constructed within 3 years.",
            },
            {
              question: "What are Section 54EC bonds?",
              answer:
                "Specified bonds (like NHAI or REC bonds) that let you defer capital gains tax by investing within 6 months of the sale, capped at ₹50 lakh. These bonds typically have a 5-year lock-in and offer relatively modest interest compared to other investments — the tax deferral is the main draw.",
            },
            {
              question: "Does this apply to agricultural land too?",
              answer:
                "Rural agricultural land in India generally isn't treated as a capital asset at all, so its sale isn't subject to capital gains tax. Urban agricultural land is treated differently and typically is taxable. This calculator doesn't distinguish between these cases — check your land's specific classification before relying on it.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="property-capital-gains-calculator" />
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
