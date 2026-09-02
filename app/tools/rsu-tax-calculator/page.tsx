"use client";

import { useMemo, useState } from "react";
import { computeRSUVest, computeRSUSale } from "@/lib/calculators/rsu";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function RSUTaxCalculatorPage() {
  const [shares, setShares] = useState(100);
  const [fmvUSD, setFmvUSD] = useState(50);
  const [vestRate, setVestRate] = useState(83);
  const [otherAnnualIncome, setOtherAnnualIncome] = useState(1800000);

  const [salePriceUSD, setSalePriceUSD] = useState(90);
  const [saleRate, setSaleRate] = useState(85);
  const [holdingMonths, setHoldingMonths] = useState(30);

  const vest = useMemo(
    () => computeRSUVest({ shares, fmvPerShareUSD: fmvUSD, usdInrRate: vestRate }),
    [shares, fmvUSD, vestRate]
  );

  const vestTax = useMemo(() => {
    const withPerquisite = computeNewRegimeTax(otherAnnualIncome + vest.totalPerquisiteINR);
    const without = computeNewRegimeTax(otherAnnualIncome);
    return Math.max(0, withPerquisite.totalTax - without.totalTax);
  }, [otherAnnualIncome, vest.totalPerquisiteINR]);

  const sale = useMemo(
    () =>
      computeRSUSale({
        sharesSold: shares,
        costBasisINRPerShare: vest.fmvPerShareINR,
        salePriceUSD,
        usdInrRateAtSale: saleRate,
        holdingMonthsFromVesting: holdingMonths,
      }),
    [shares, vest.fmvPerShareINR, salePriceUSD, saleRate, holdingMonths]
  );

  const saleTax = useMemo(() => {
    if (sale.taxRate !== null && sale.taxBeforeCess !== null) {
      return sale.taxBeforeCess * 1.04;
    }
    const withGain = computeNewRegimeTax(otherAnnualIncome + sale.gain);
    const without = computeNewRegimeTax(otherAnnualIncome);
    return Math.max(0, withGain.totalTax - without.totalTax);
  }, [sale, otherAnnualIncome]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">US Stocks & RSU Tax Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        For RSUs of a foreign (typically US-listed) company vesting to an
        Indian tax resident — perquisite at vesting, capital gains at sale,
        with the correct forex conversion rule applied.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        This is the most complex tool on the site — genuinely. It doesn't
        model Foreign Tax Credit (if US tax was withheld) or the Schedule
        FA disclosure itself. Cross-border filing has real complexity;
        treat this as a starting estimate and involve a CA experienced
        with foreign equity compensation for your actual filing.
      </div>

      <div className="mb-4">
        <h2 className="text-xl mb-4">Stage 1 — Vesting (perquisite tax)</h2>
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-10">
          <div className="space-y-6 max-w-md">
            <Field label="Shares vested" value={shares} onChange={setShares} suffix="shares" step={1} />
            <Field label="FMV per share at vesting" value={fmvUSD} onChange={setFmvUSD} suffix="USD" />
            <Field label="USD/INR rate (SBI TTBR, last day of prior month)" value={vestRate} onChange={setVestRate} suffix="₹ / $" />
            <Field label="Your other annual income" value={otherAnnualIncome} onChange={setOtherAnnualIncome} suffix="₹ / year" />
            <p className="text-xs text-charcoal/50 -mt-4">
              Use the SBI TT Buying Rate for the last working day of the
              month BEFORE your vesting month — not the vesting date's
              rate, and not today's rate. Look this up from SBI's
              published historical rates.
            </p>
          </div>
          <div className="card px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Perquisite tax owed</p>
            <h3 className="font-display text-2xl text-ink mb-4">{formatINR(vestTax)}</h3>
            <div className="ledger-row">
              <span className="label">FMV per share (INR)</span>
              <span className="fill" />
              <span className="value">{formatINR(vest.fmvPerShareINR)}</span>
            </div>
            <div className="ledger-row">
              <span className="label font-medium text-ink">Total perquisite (added to salary)</span>
              <span className="fill" />
              <span className="value">{formatINR(vest.totalPerquisiteINR)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-xl mb-4">Stage 2 — Sale (capital gains)</h2>
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-6 max-w-md">
            <Field label="Sale price per share" value={salePriceUSD} onChange={setSalePriceUSD} suffix="USD" />
            <Field label="USD/INR rate at sale (SBI TTBR)" value={saleRate} onChange={setSaleRate} suffix="₹ / $" />
            <Field
              label="Holding period from vesting date"
              value={holdingMonths}
              onChange={setHoldingMonths}
              suffix="months"
              step={1}
            />
            <p className="text-xs text-charcoal/50 -mt-4">
              Foreign shares always follow unlisted-share rules for Indian
              tax purposes — &gt;24 months is long-term, regardless of
              being listed on a US exchange.
            </p>
          </div>
          <div className="card px-6 py-5">
            <div className="mb-2">
              <Badge variant={sale.isLongTerm ? "success" : "outline"}>
                {sale.isLongTerm ? "Long-term (12.5%)" : "Short-term (slab rate)"}
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Capital gains tax owed</p>
            <h3 className="font-display text-2xl text-ink mb-4">{formatINR(saleTax)}</h3>
            <div className="ledger-row">
              <span className="label">Sale value (INR)</span>
              <span className="fill" />
              <span className="value">{formatINR(sale.saleValueINR)}</span>
            </div>
            <div className="ledger-row">
              <span className="label font-medium text-ink">Capital gain</span>
              <span className="fill" />
              <span className="value">{formatINR(sale.gain)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="callout-info mb-20 max-w-3xl">
        <h3 className="font-medium text-ink mb-3">Don't forget Schedule FA</h3>
        <p className="text-sm text-charcoal/70">
          If you hold foreign shares (including unsold RSUs), you must
          disclose them in Schedule FA of your ITR — on a CALENDAR YEAR
          basis (1 January to 31 December), not the usual April-March
          financial year. This applies even if you didn't sell anything;
          simply holding foreign equity creates the disclosure obligation.
          Missing this isn't just a paperwork issue — penalties under the
          Black Money Act can be severe.
        </p>
      </div>

      <div className="mb-20">
        <ToolArticle title="Why the exchange rate date trips people up">
          <p>
            The single most common RSU tax filing error in India is using
            the wrong exchange rate date. Rule 115/206 of the Income Tax
            Rules is specific about which date's rate applies:
          </p>
          <FormulaBox>
            Rate to use = SBI TT Buying Rate on the LAST WORKING DAY of the month BEFORE the vesting/sale month
          </FormulaBox>
          <p>
            Not the vesting date itself, not the sale date itself, not
            today's rate when you're filing. If your RSUs vested on 15
            March, you'd use the SBI TTBR from the last working day of
            February — not March 15th's rate. This is easy to get wrong
            because it's genuinely unintuitive, and getting it wrong
            changes your perquisite value and therefore your tax.
          </p>
          <p>
            The same backward-looking rule applies separately to the sale
            transaction, using its own preceding month. Multiple vesting
            tranches in different months each need their own correctly
            dated rate — there's no shortcut to using one average rate for
            the year.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "Where do I find the correct SBI TT Buying Rate?",
              answer:
                "SBI publishes historical TT buying rates, and several tax sites maintain lookup archives of these specific dated rates. Search for the exact date you need (the last working day of the month before your vesting or sale month) rather than using a general currency converter, which won't match the rate the Income Tax Department expects.",
            },
            {
              question: "What is Foreign Tax Credit and why isn't it in this calculator?",
              answer:
                "If the US withheld tax on your RSU income (common for dividends, sometimes for sales), you may be able to claim credit for that against your Indian tax liability under the India-US DTAA, via Form 67. This involves genuinely complex treaty mechanics that vary by income type and depend on your specific broker and company's withholding practices — beyond what a self-serve calculator can safely estimate. Get this reviewed by a CA experienced with cross-border equity compensation.",
            },
            {
              question: "Do I owe tax in the US as well as India?",
              answer:
                "Possibly, depending on your visa/residency history and the specific equity plan — this is highly situational and not something this calculator addresses. If you have any US tax filing obligations, that's a separate, parallel process from your Indian filing.",
            },
            {
              question: "What if I have RSUs vesting in multiple months?",
              answer:
                "Each vesting tranche uses its own preceding-month exchange rate — run this calculator separately for each tranche rather than trying to average them together, since using one blended rate across multiple vest dates will produce an incorrect perquisite value.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="rsu-tax-calculator" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
  step = 1,
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
