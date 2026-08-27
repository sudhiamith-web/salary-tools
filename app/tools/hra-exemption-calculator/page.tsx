"use client";

import { useMemo, useState } from "react";
import { computeHRAExemption } from "@/lib/calculators/hra";
import HRACard from "@/components/HRACard";

type Mode = "monthly" | "annual";

export default function HRAExemptionCalculatorPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [basic, setBasic] = useState(40000); // shown in current mode's units
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

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
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
