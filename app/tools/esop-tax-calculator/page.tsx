"use client";

import { useMemo, useState } from "react";
import { computeESOPExercise, computeESOPSale } from "@/lib/calculators/esop";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

export default function ESOPTaxCalculatorPage() {
  const [shares, setShares] = useState(1000);
  const [exercisePrice, setExercisePrice] = useState(50);
  const [fmvAtExercise, setFmvAtExercise] = useState(300);
  const [otherAnnualIncome, setOtherAnnualIncome] = useState(1500000);

  const [isListed, setIsListed] = useState(false);
  const [salePrice, setSalePrice] = useState(500);
  const [holdingMonths, setHoldingMonths] = useState(30);

  const exercise = useMemo(
    () => computeESOPExercise({ shares, exercisePrice, fmvAtExercise }),
    [shares, exercisePrice, fmvAtExercise]
  );

  const perquisiteTax = useMemo(() => {
    const withPerquisite = computeNewRegimeTax(otherAnnualIncome + exercise.totalPerquisite);
    const without = computeNewRegimeTax(otherAnnualIncome);
    return Math.max(0, withPerquisite.totalTax - without.totalTax);
  }, [otherAnnualIncome, exercise.totalPerquisite]);

  const sale = useMemo(
    () =>
      computeESOPSale({
        sharesSold: shares,
        fmvAtExercise,
        salePrice,
        isListed,
        holdingMonthsFromExercise: holdingMonths,
      }),
    [shares, fmvAtExercise, salePrice, isListed, holdingMonths]
  );

  const saleTax = useMemo(() => {
    if (sale.taxRate !== null && sale.taxBeforeCess !== null) {
      return sale.taxBeforeCess * 1.04;
    }
    // Unlisted short-term: taxed at slab rate, added to other income
    const withGain = computeNewRegimeTax(otherAnnualIncome + sale.taxableGain);
    const without = computeNewRegimeTax(otherAnnualIncome);
    return Math.max(0, withGain.totalTax - without.totalTax);
  }, [sale, otherAnnualIncome]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">ESOP Tax Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        ESOPs are taxed twice — once as salary perquisite at exercise, once
        as capital gains at sale. This calculator walks through both stages.
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        DPIIT-recognised eligible startups can defer the perquisite TDS
        payment (not the tax itself) up to 48 months — not modeled here.
        Ask your employer whether this deferral applies to you.
      </div>

      <div className="mb-4">
        <h2 className="text-xl mb-4">Stage 1 — Exercise (perquisite tax)</h2>
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-10">
          <div className="space-y-6 max-w-md">
            <Field label="Shares exercised" value={shares} onChange={setShares} suffix="shares" step={1} />
            <Field label="Exercise price (per share)" value={exercisePrice} onChange={setExercisePrice} suffix="₹" />
            <Field label="FMV at exercise (per share)" value={fmvAtExercise} onChange={setFmvAtExercise} suffix="₹" />
            <Field label="Your other annual income" value={otherAnnualIncome} onChange={setOtherAnnualIncome} suffix="₹ / year" />
          </div>
          <div className="card px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Perquisite tax owed</p>
            <h3 className="font-display text-2xl text-ink mb-4">{formatINR(perquisiteTax)}</h3>
            <div className="ledger-row">
              <span className="label">Perquisite per share</span>
              <span className="fill" />
              <span className="value">{formatINR(exercise.perquisitePerShare)}</span>
            </div>
            <div className="ledger-row">
              <span className="label font-medium text-ink">Total perquisite (added to salary)</span>
              <span className="fill" />
              <span className="value">{formatINR(exercise.totalPerquisite)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-xl mb-4">Stage 2 — Sale (capital gains)</h2>
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-6 max-w-md">
            <div>
              <span className="text-sm font-medium text-ink block mb-1.5">Company status</span>
              <div className="inline-flex rounded-md border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setIsListed(false)}
                  className={`px-4 py-1.5 text-sm ${!isListed ? "bg-accent text-white" : "bg-white text-charcoal/70"}`}
                >
                  Unlisted (most startups)
                </button>
                <button
                  onClick={() => setIsListed(true)}
                  className={`px-4 py-1.5 text-sm ${isListed ? "bg-accent text-white" : "bg-white text-charcoal/70"}`}
                >
                  Listed
                </button>
              </div>
            </div>
            <Field label="Sale price (per share)" value={salePrice} onChange={setSalePrice} suffix="₹" />
            <Field
              label="Holding period from exercise date"
              value={holdingMonths}
              onChange={setHoldingMonths}
              suffix="months"
              step={1}
            />
          </div>
          <div className="card px-6 py-5">
            <div className="mb-2">
              <Badge variant={sale.isLongTerm ? "success" : "outline"}>
                {sale.isLongTerm ? "Long-term" : "Short-term"} · {isListed ? "Listed" : "Unlisted"}
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Capital gains tax owed</p>
            <h3 className="font-display text-2xl text-ink mb-4">{formatINR(saleTax)}</h3>
            <div className="ledger-row">
              <span className="label">Total gain</span>
              <span className="fill" />
              <span className="value">{formatINR(sale.totalGain)}</span>
            </div>
            {sale.exemptAmount > 0 && (
              <div className="ledger-row">
                <span className="label">Exempt (listed LTCG)</span>
                <span className="fill" />
                <span className="value text-ledger">{formatINR(sale.exemptAmount)}</span>
              </div>
            )}
            <div className="ledger-row">
              <span className="label">Rate applied</span>
              <span className="fill" />
              <span className="value">{sale.taxRate !== null ? `${sale.taxRate * 100}%` : "Slab rate"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-20">
        <ToolArticle title="Why ESOPs get taxed twice — and why that's not double taxation">
          <p>
            The two-stage structure looks like double taxation at first
            glance, but it isn't — each stage taxes a different gain:
          </p>
          <FormulaBox>
            Stage 1: (FMV at exercise − exercise price) → salary{"\n"}
            Stage 2: (Sale price − FMV at exercise) → capital gains
          </FormulaBox>
          <p>
            The FMV at exercise becomes your cost basis for the capital
            gains calculation specifically to prevent the appreciation
            you've already paid perquisite tax on from being taxed again.
            Only the gain that happens after exercise — the risk you took
            by continuing to hold the shares — gets capital gains
            treatment.
          </p>
          <p>
            The exercise stage is often the harder one financially: you
            owe real cash tax on a "paper gain" you can't necessarily sell
            to fund, especially for unlisted startup shares with no ready
            market. This is the most common ESOP surprise for employees at
            private companies.
          </p>
        </ToolArticle>
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "How is FMV determined for unlisted (startup) shares?",
              answer:
                "By a Category I merchant banker registered with SEBI, with a valuation report no older than 180 days from the exercise date. This is a formal, paid valuation process — not something you estimate yourself.",
            },
            {
              question: "What if I can't afford the perquisite tax at exercise?",
              answer:
                "This is a genuinely common problem with illiquid startup shares. Some companies offer 'sell-to-cover' arrangements, and DPIIT-recognised eligible startups can let employees defer the TDS payment itself for up to 48 months or until sale/resignation. Ask your company's finance or HR team what options exist before your exercise date.",
            },
            {
              question: "What holding period counts for long-term treatment?",
              answer:
                "The clock starts from your exercise date, not your grant date. Listed shares need more than 12 months held from exercise; unlisted shares need more than 24 months.",
            },
            {
              question: "Do I owe tax if I never sell the shares?",
              answer:
                "You owe the Stage 1 perquisite tax at exercise regardless of whether you ever sell — that's triggered by exercising the option, not by selling. Stage 2 capital gains tax only applies when you actually sell.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="esop-tax-calculator" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
  step = 100,
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
