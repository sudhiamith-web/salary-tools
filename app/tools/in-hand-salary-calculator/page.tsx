"use client";

import { useMemo, useState } from "react";
import { computeInHandSalary } from "@/lib/calculators/salary";
import PayslipCard from "@/components/PayslipCard";

export default function InHandSalaryCalculatorPage() {
  const [ctc, setCtc] = useState(1200000);
  const [basicPercent, setBasicPercent] = useState(40);
  const [pfRate, setPfRate] = useState(12);
  const [proTax, setProTax] = useState(2400);

  const result = useMemo(
    () =>
      computeInHandSalary({
        annualCTC: ctc,
        basicPercentOfCTC: basicPercent,
        employerPFRate: pfRate,
        professionalTaxAnnual: proTax,
      }),
    [ctc, basicPercent, pfRate, proTax]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">In-Hand Salary Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Estimate your monthly take-home from your annual CTC, using the new
        tax regime slabs for FY 2026-27. Adjust the assumptions below to
        match your own offer letter.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6 max-w-md">
          <Field label="Annual CTC" value={ctc} onChange={setCtc} suffix="₹ / year" />
          <Field
            label="Basic salary (% of CTC)"
            value={basicPercent}
            onChange={setBasicPercent}
            suffix="%"
            step={1}
          />
          <Field
            label="Employer PF contribution (% of basic)"
            value={pfRate}
            onChange={setPfRate}
            suffix="%"
            step={1}
          />
          <Field
            label="Professional tax (annual)"
            value={proTax}
            onChange={setProTax}
            suffix="₹ / year"
          />
          <p className="text-xs text-charcoal/50 pt-2">
            Professional tax varies by state and is capped by law (typically
            ₹2,400/year max). The default shown is an approximation — check
            your state's actual slab.
          </p>
        </div>

        <PayslipCard result={result} />
      </div>
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
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
