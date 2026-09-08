"use client";

import { useMemo, useState } from "react";
import { computeHRAExemption } from "@/lib/calculators/hra";
import HRACard from "@/components/HRACard";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";
import ArticleWithTOC, { FormulaBox } from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Breadcrumb from "@/components/Breadcrumb";
import SliderField from "@/components/SliderField";
import InsightBanner from "@/components/InsightBanner";

type Mode = "monthly" | "annual";

export default function HRAExemptionCalculatorPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [basic, setBasic] = useState(40000);
  const [hraReceived, setHraReceived] = useState(20000);
  const [rentPaid, setRentPaid] = useState(22000);
  const [isMetro, setIsMetro] = useState(true);

  function switchMode(next: Mode) {
    if (next === mode) return;
    const factor = next === "annual" ? 12 : 1 / 12;
    setBasic(Math.round(basic * factor));
    setHraReceived(Math.round(hraReceived * factor));
    setRentPaid(Math.round(rentPaid * factor));
    setMode(next);
  }

  const result = useMemo(() => {
    const factor = mode === "monthly" ? 12 : 1;
    return computeHRAExemption({
      basicAnnual: basic * factor,
      hraReceivedAnnual: hraReceived * factor,
      rentPaidAnnual: rentPaid * factor,
      isMetro,
    });
  }, [basic, hraReceived, rentPaid, isMetro, mode]);

  const projectionData: ProjectionPoint[] = useMemo(() => {
    const factor = mode === "monthly" ? 12 : 1;
    const rentLevels = mode === "monthly"
      ? [10000, 15000, 20000, 25000, 30000, 40000, 50000]
      : [120000, 180000, 240000, 300000, 360000, 480000, 600000];
    return rentLevels.map((r) => ({
      label: mode === "monthly" ? `₹${r / 1000}k/mo` : `₹${r / 100000}L/yr`,
      value: computeHRAExemption({
        basicAnnual: basic * factor,
        hraReceivedAnnual: hraReceived * factor,
        rentPaidAnnual: r * factor,
        isMetro,
      }).exemptAnnual,
    }));
  }, [basic, hraReceived, isMetro, mode]);

  const insight = useMemo(() => {
    const factor = mode === "monthly" ? 12 : 1;
    const bump = mode === "monthly" ? 3000 : 36000;
    const bumped = computeHRAExemption({
      basicAnnual: basic * factor,
      hraReceivedAnnual: hraReceived * factor,
      rentPaidAnnual: (rentPaid + bump) * factor,
      isMetro,
    });
    const delta = bumped.exemptAnnual - result.exemptAnnual;
    return delta > 0
      ? { bump, delta }
      : null;
  }, [basic, hraReceived, rentPaid, isMetro, mode, result.exemptAnnual]);

  const unit = mode === "monthly" ? "₹ / month" : "₹ / year";

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/" }, { label: "HRA Exemption Calculator" }]} />
      <h1 className="text-3xl mb-2">HRA Exemption Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        Find out how much of your House Rent Allowance is actually tax-free
        under Section 10(13A).
      </p>
      <div className="callout-warn mb-10 max-w-xl">
        Applies only under the <strong>Old Tax Regime</strong>. If you're on
        the new regime, HRA exemption doesn't apply — your salary is taxed on
        the gross amount instead.
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-20">
        <div className="space-y-6 max-w-md">
          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">
              Enter figures as
            </span>
            <div className="inline-flex rounded-md border border-slate-300 overflow-hidden">
              <button
                onClick={() => switchMode("monthly")}
                className={`px-4 py-1.5 text-sm ${
                  mode === "monthly" ? "bg-accent text-white" : "bg-white text-charcoal/70"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => switchMode("annual")}
                className={`px-4 py-1.5 text-sm ${
                  mode === "annual" ? "bg-accent text-white" : "bg-white text-charcoal/70"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <SliderField
            label="Basic salary"
            value={basic}
            onChange={setBasic}
            suffix={unit}
            min={mode === "monthly" ? 10000 : 120000}
            max={mode === "monthly" ? 200000 : 2400000}
            step={mode === "monthly" ? 1000 : 12000}
          />
          <SliderField
            label="HRA received"
            value={hraReceived}
            onChange={setHraReceived}
            suffix={unit}
            min={mode === "monthly" ? 5000 : 60000}
            max={mode === "monthly" ? 100000 : 1200000}
            step={mode === "monthly" ? 500 : 6000}
          />
          <SliderField
            label="Rent actually paid"
            value={rentPaid}
            onChange={setRentPaid}
            suffix={unit}
            min={mode === "monthly" ? 5000 : 60000}
            max={mode === "monthly" ? 100000 : 1200000}
            step={mode === "monthly" ? 500 : 6000}
          />

          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">City type</span>
            <div className="inline-flex rounded-md border border-slate-300 overflow-hidden">
              <button
                onClick={() => setIsMetro(true)}
                className={`px-4 py-1.5 text-sm ${
                  isMetro ? "bg-accent text-white" : "bg-white text-charcoal/70"
                }`}
              >
                Metro
              </button>
              <button
                onClick={() => setIsMetro(false)}
                className={`px-4 py-1.5 text-sm ${
                  !isMetro ? "bg-accent text-white" : "bg-white text-charcoal/70"
                }`}
              >
                Non-metro
              </button>
            </div>
            <p className="text-xs text-charcoal/50 mt-2">
              Metro = Delhi, Mumbai, Kolkata, Chennai (50% of basic limit).
              All other cities count as non-metro (40% of basic limit).
            </p>
          </div>
        </div>

        <HRACard result={result} />
      </div>

      {insight && (
        <div className="mb-10 max-w-2xl">
          <InsightBanner
            message={`Increase rent input by ₹${insight.bump.toLocaleString("en-IN")} to raise your exemption by ₹${Math.round(insight.delta).toLocaleString("en-IN")}${mode === "monthly" ? "/yr" : ""}`}
          />
        </div>
      )}

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="How your exemption changes with rent"
          data={projectionData}
          columnLabel="Rent paid"
          valueLabel="Exempt from tax (annual)"
        />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "how-calculated",
              label: "How the exemption is calculated",
              content: (
                <>
                  <p>
                    Section 10(13A) exempts the LEAST of three amounts —
                    not all of your HRA, and not automatically the full
                    rent you pay either:
                  </p>
                  <FormulaBox>
                    Exempt HRA = MIN(actual HRA received, rent paid − 10% of basic,
                    50% or 40% of basic)
                  </FormulaBox>
                  <p>
                    The third condition is why city matters: employees in
                    Delhi, Mumbai, Kolkata, or Chennai get a 50%-of-basic
                    ceiling, while everyone else is capped at 40%. Whatever
                    HRA isn&apos;t exempt under these rules still gets
                    taxed as regular salary income.
                  </p>
                </>
              ),
            },
            {
              id: "regime-note",
              label: "Only under the old regime",
              content: (
                <p>
                  This only helps you if you&apos;re on the old tax regime
                  — the new regime doesn&apos;t offer this exemption at
                  all, so if you&apos;ve moved to the new regime, this
                  calculator&apos;s result becomes purely informational
                  rather than something you can actually claim.
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
              question: "Can I claim HRA exemption if I don't pay rent?",
              answer:
                "No. The exemption is tied to actual rent paid — if you live rent-free (e.g. with family, in your own home) you can't claim HRA exemption even if your salary includes an HRA component.",
            },
            {
              question: "What if my city isn't Delhi, Mumbai, Kolkata, or Chennai?",
              answer:
                "You're treated as non-metro, which caps the third condition at 40% of basic instead of 50%. This applies even to large cities like Bangalore, Pune, or Hyderabad — the metro classification for this specific rule is limited to those four cities.",
            },
            {
              question: "Do I need rent receipts to claim this?",
              answer:
                "Yes, and if your annual rent exceeds ₹1,00,000, you'll also need your landlord's PAN for your employer to process the exemption without it being disallowed.",
            },
            {
              question: "Can I claim HRA exemption on the new tax regime?",
              answer:
                "No — HRA exemption is only available under the old tax regime. If you've chosen the new regime, your full HRA is taxed as regular income regardless of rent paid.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="hra-exemption-calculator" />
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
