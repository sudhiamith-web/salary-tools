"use client";

import { useMemo, useState } from "react";
import { computeProperty, CII, CII_YEARS, GRANDFATHER_CUTOFF_YEAR, ImprovementEntry } from "@/lib/calculators/property";
import { formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";
import { FormulaBox } from "@/components/ToolArticle";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Breadcrumb from "@/components/Breadcrumb";
import SliderField from "@/components/SliderField";
import ImprovementsInput from "@/components/ImprovementsInput";

export default function IndexationCalculatorPage() {
  const [purchaseValue, setPurchaseValue] = useState(3000000);
  const [purchaseYear, setPurchaseYear] = useState("2012-13");
  const [saleYear, setSaleYear] = useState("2026-27");
  const [saleValue, setSaleValue] = useState(9000000);
  const [transferExpenses, setTransferExpenses] = useState(50000);
  const [improvements, setImprovements] = useState<ImprovementEntry[]>([]);

  const isPreCutoff = purchaseYear < GRANDFATHER_CUTOFF_YEAR;
  const purchaseCII = CII[purchaseYear];
  const saleCII = CII[saleYear];

  const result = useMemo(
    () =>
      computeProperty({
        saleValue,
        purchaseValue,
        purchaseYear,
        saleYear,
        improvements,
        transferExpenses,
        section54Exemption: 0,
        section54ECExemption: 0,
        isPreJuly2024Purchase: isPreCutoff,
      }),
    [saleValue, purchaseValue, purchaseYear, saleYear, improvements, transferExpenses, isPreCutoff]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/" }, { label: "Indexation Calculator" }]} />
      <h1 className="text-3xl mb-2">Indexation Calculator (Cost Inflation Index)</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        Look up the exact CII values for your purchase and sale years, and
        see your indexed cost of acquisition and improvement — the exact
        inputs behind an indexed capital gains calculation.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        Indexation now applies almost exclusively to property (land/
        building) bought before 23 July 2024. Gold, unlisted shares, debt
        funds, and property bought on/after that date no longer get an
        indexation option — see the FAQ below for what's still eligible.
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 mb-14">
        <div className="space-y-6 max-w-md">
          <SliderField label="Purchase value" value={purchaseValue} onChange={setPurchaseValue} suffix="₹" min={0} max={50000000} step={100000} />

          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">Purchase financial year</span>
            <select
              value={purchaseYear}
              onChange={(e) => setPurchaseYear(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
            >
              {CII_YEARS.map((y) => (
                <option key={y} value={y}>{y} (CII {CII[y]})</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">Sale financial year</span>
            <select
              value={saleYear}
              onChange={(e) => setSaleYear(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
            >
              {CII_YEARS.map((y) => (
                <option key={y} value={y}>{y} (CII {CII[y]})</option>
              ))}
            </select>
            <p className="text-xs text-charcoal/50 mt-1">
              {isPreCutoff
                ? "Purchase year is before 23 July 2024 — indexation is a genuine option for this sale."
                : "Purchase year is on/after 23 July 2024 — indexation isn't available; shown here for reference only."}
            </p>
          </div>

          <ImprovementsInput improvements={improvements} onChange={setImprovements} years={CII_YEARS} />

          <SliderField label="Sale value (to also see the resulting tax)" value={saleValue} onChange={setSaleValue} suffix="₹" min={0} max={50000000} step={100000} />
          <SliderField label="Transfer expenses" value={transferExpenses} onChange={setTransferExpenses} suffix="₹" min={0} max={1000000} step={10000} />
        </div>

        <div className="space-y-4">
          <div className="hero-box">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              Total indexed cost
            </p>
            <h3 className="font-display text-3xl text-ink">{formatINR(result.indexedCost)}</h3>
          </div>

          <div className="card px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-charcoal/50 font-semibold mb-2">
              CII values used
            </p>
            <div className="ledger-row">
              <span className="label">CII for {purchaseYear} (purchase)</span>
              <span className="fill" />
              <span className="value">{purchaseCII}</span>
            </div>
            <div className="ledger-row">
              <span className="label">CII for {saleYear} (sale)</span>
              <span className="fill" />
              <span className="value">{saleCII}</span>
            </div>

            <div className="border-t border-slate-200 mt-3 pt-3">
              <div className="ledger-row">
                <span className="label">Indexed cost of acquisition</span>
                <span className="fill" />
                <span className="value">{formatINR(result.indexedPurchaseCost)}</span>
              </div>
              {result.totalImprovementCost > 0 && (
                <div className="ledger-row">
                  <span className="label">Indexed cost of improvement</span>
                  <span className="fill" />
                  <span className="value">{formatINR(result.indexedImprovementCost)}</span>
                </div>
              )}
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Total indexed cost</span>
                <span className="fill" />
                <span className="value">{formatINR(result.indexedCost)}</span>
              </div>
            </div>
          </div>

          <div className="card px-6 py-5">
            <div className="mb-2">
              <Badge variant={result.chosenMethod === "with-indexation" ? "success" : "outline"}>
                {result.chosenMethod === "with-indexation" ? "Indexed (20%) wins" : "Flat 12.5% wins"}
              </Badge>
            </div>
            <div className="ledger-row">
              <span className="label">Indexed gain</span>
              <span className="fill" />
              <span className="value">{formatINR(result.indexedGain)}</span>
            </div>
            <div className="ledger-row">
              <span className="label">Gain without indexation</span>
              <span className="fill" />
              <span className="value">{formatINR(result.gain)}</span>
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3">
              <div className="ledger-row">
                <span className="label font-semibold text-ink">Tax (incl. 4% cess, no exemptions applied)</span>
                <span className="fill" />
                <span className="value">{formatINR(result.chosenTax * 1.04)}</span>
              </div>
            </div>
            <p className="text-xs text-charcoal/50 mt-3">
              Claiming Section 54/54EC exemptions? Use the{" "}
              <a href="/tools/property-capital-gains-calculator" className="text-accent underline">
                Property Capital Gains Tax Calculator
              </a>{" "}
              instead — it includes those exemptions in the final figure.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-20 max-w-3xl">
        <h3 className="text-xl mb-4">Full Cost Inflation Index (CII) table</h3>
        <div className="card-flat overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paperDark/60 text-left">
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase">Financial Year</th>
                <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase text-right">CII</th>
              </tr>
            </thead>
            <tbody>
              {CII_YEARS.map((y) => (
                <tr key={y} className="border-t border-slate-100">
                  <td className="px-4 py-1.5 text-ink">{y}</td>
                  <td className="px-4 py-1.5 text-right font-mono">{CII[y]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-charcoal/50 mt-2">
          Base year 2001-02 = 100. CII is notified annually by the CBDT.
        </p>
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "formula",
              label: "The indexation formula",
              content: (
                <>
                  <p>
                    Indexation adjusts a cost incurred in the past for
                    inflation between then and the year of sale, using the
                    Cost Inflation Index:
                  </p>
                  <FormulaBox>
                    Indexed cost = Actual cost × (CII of sale year ÷ CII of the year the cost was incurred)
                  </FormulaBox>
                  <p>
                    This applies to your original purchase cost — using
                    the purchase year&apos;s CII — and separately to any
                    cost of improvement, using THAT improvement&apos;s own
                    year, not your original purchase year. A renovation
                    done 10 years after buying the property only gets 10
                    years of inflation adjustment, not the full holding
                    period.
                  </p>
                </>
              ),
            },
            {
              id: "still-eligible",
              label: "What's still eligible for indexation today",
              content: (
                <p>
                  Since Budget 2024, indexation has been removed for
                  nearly every asset class. The one significant exception:
                  land and buildings purchased before 23 July 2024 retain
                  a choice between the indexed 20% rate and the flat 12.5%
                  rate — whichever produces lower tax. Property bought on
                  or after that date, along with gold, unlisted shares,
                  and debt mutual funds, no longer have an indexation
                  option at all, regardless of holding period.
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
              question: "Can I use indexation for gold or unlisted shares?",
              answer:
                "Not anymore, for sales on or after 23 July 2024. Budget 2024 removed the indexation option for these asset classes entirely — they're now taxed at a flat rate without any inflation adjustment to the cost base, regardless of how long they were held.",
            },
            {
              question: "What CII value do I use if I inherited the property?",
              answer:
                "Use the CII of the year the ORIGINAL owner acquired the property, not the year you inherited it — inheritance itself isn't a taxable transfer, so the holding period and acquisition cost carry over from the previous owner.",
            },
            {
              question: "Is there a minimum improvement cost to qualify for indexation?",
              answer:
                "No minimum, but improvements made before 1 April 2001 don't qualify at all — only capital expenditure on additions or alterations made after that date counts as indexable cost of improvement.",
            },
            {
              question: "Why does my indexed cost look lower than expected?",
              answer:
                "Check that you've selected the correct purchase year — a common mistake is selecting the year you moved in or registered the property rather than the year you actually paid for it, which can shift the CII used and understate your indexed cost.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="indexation-calculator" />
    </div>
  );
}
