"use client";

import { useMemo, useState } from "react";
import { computeHRAExemption } from "@/lib/calculators/hra";
import HRACard from "@/components/HRACard";
import ProjectionSection, { ProjectionPoint } from "@/components/ProjectionSection";
import ToolArticle, { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

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

  const unit = mode === "monthly" ? "₹ / month" : "₹ / year";

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">HRA Exemption Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        Find out how much of your House Rent Allowance is actually tax-free
        under Section 10(13A).
      </p>
      <div className="stamp-note mb-10">
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
            <div className="inline-flex rounded-md border border-ink/15 overflow-hidden">
              <button
                onClick={() => switchMode("monthly")}
                className={`px-4 py-1.5 text-sm ${
                  mode === "monthly" ? "bg-ink text-paper" : "bg-white text-charcoal/70"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => switchMode("annual")}
                className={`px-4 py-1.5 text-sm ${
                  mode === "annual" ? "bg-ink text-paper" : "bg-white text-charcoal/70"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <Field label="Basic salary" value={basic} onChange={setBasic} suffix={unit} />
          <Field label="HRA received" value={hraReceived} onChange={setHraReceived} suffix={unit} />
          <Field label="Rent actually paid" value={rentPaid} onChange={setRentPaid} suffix={unit} />

          <div>
            <span className="text-sm font-medium text-ink block mb-1.5">City type</span>
            <div className="inline-flex rounded-md border border-ink/15 overflow-hidden">
              <button
                onClick={() => setIsMetro(true)}
                className={`px-4 py-1.5 text-sm ${
                  isMetro ? "bg-ink text-paper" : "bg-white text-charcoal/70"
                }`}
              >
                Metro
              </button>
              <button
                onClick={() => setIsMetro(false)}
                className={`px-4 py-1.5 text-sm ${
                  !isMetro ? "bg-ink text-paper" : "bg-white text-charcoal/70"
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

      <div className="max-w-2xl mb-20">
        <ProjectionSection
          title="How your exemption changes with rent"
          data={projectionData}
          columnLabel="Rent paid"
          valueLabel="Exempt from tax (annual)"
        />
      </div>

      <div className="mb-20">
        <ToolArticle title="How the HRA exemption is actually calculated">
          <p>
            Section 10(13A) exempts the LEAST of three amounts — not all of
            your HRA, and not automatically the full rent you pay either:
          </p>
          <FormulaBox>
            Exempt HRA = MIN(actual HRA received, rent paid − 10% of basic,
            50% or 40% of basic)
          </FormulaBox>
          <p>
            The third condition is why city matters: employees in Delhi,
            Mumbai, Kolkata, or Chennai get a 50%-of-basic ceiling, while
            everyone else is capped at 40%. Whatever HRA isn't exempt under
            these rules still gets taxed as regular salary income.
          </p>
          <p>
            This only helps you if you're on the old tax regime — the new
            regime doesn't offer this exemption at all, so if you've moved
            to the new regime, this calculator's result becomes purely
            informational rather than something you can actually claim.
          </p>
        </ToolArticle>
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
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
