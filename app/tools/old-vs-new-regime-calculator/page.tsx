"use client";

import { useMemo, useState } from "react";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import { computeOldRegimeTax, SECTION_80C_LIMIT } from "@/lib/calculators/oldRegime";
import Badge from "@/components/Badge";
import RingChart from "@/components/RingChart";

export default function OldVsNewRegimePage() {
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [section80C, setSection80C] = useState(150000);
  const [section80D, setSection80D] = useState(25000);
  const [hraExemption, setHraExemption] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const newRegime = useMemo(() => computeNewRegimeTax(grossIncome), [grossIncome]);
  const oldRegime = useMemo(
    () =>
      computeOldRegimeTax({
        grossAnnualIncome: grossIncome,
        section80CDeduction: section80C,
        section80DDeduction: section80D,
        hraExemption,
        otherDeductions,
      }),
    [grossIncome, section80C, section80D, hraExemption, otherDeductions]
  );

  const betterRegime = oldRegime.totalTax < newRegime.totalTax ? "old" : "new";
  const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax);
  const takeHomePercent =
    ((grossIncome - Math.min(oldRegime.totalTax, newRegime.totalTax)) / grossIncome) * 100;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Old vs New Tax Regime Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        See your exact tax liability under both regimes, side by side, based
        on your actual deductions — not a rule of thumb.
      </p>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10">
        <div className="space-y-6 max-w-md">
          <Field label="Gross annual income" value={grossIncome} onChange={setGrossIncome} suffix="₹ / year" />
          <Field
            label={`Section 80C investments (max ${formatINR(SECTION_80C_LIMIT)})`}
            value={section80C}
            onChange={setSection80C}
            suffix="₹ / year"
          />
          <Field label="Section 80D health insurance premium" value={section80D} onChange={setSection80D} suffix="₹ / year" />
          <Field label="HRA exemption (from the HRA calculator)" value={hraExemption} onChange={setHraExemption} suffix="₹ / year" />
          <Field label="Other deductions (home loan interest, 80E, etc.)" value={otherDeductions} onChange={setOtherDeductions} suffix="₹ / year" />
          <p className="text-xs text-charcoal/50 pt-2">
            All deduction fields only affect the old regime — the new regime
            doesn't allow any of these except the standard deduction, which
            is already built into both calculations.
          </p>
        </div>

        <div className="sticky top-6 space-y-4">
          <div className="receipt-edge-top" />
          <div className="bg-white px-6 py-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <RingChart
                percent={takeHomePercent}
                color="#1F6F54"
                label={`${Math.round(takeHomePercent)}%`}
                sublabel="take-home"
              />
              <div>
                <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
                  Better choice for you
                </p>
                <Badge variant="filled">
                  {betterRegime === "old" ? "Old regime" : "New regime"}
                </Badge>
                <p className="text-sm text-ledger mt-2">
                  Saves {formatINR(savings)}/year
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge>Old regime</Badge>
              </div>
              <div className="ledger-row">
                <span className="label">Taxable income</span>
                <span className="fill" />
                <span className="value">{formatINR(oldRegime.taxableIncome)}</span>
              </div>
              <div className="ledger-row">
                <span className="label font-medium text-ink">Total tax</span>
                <span className="fill" />
                <span className="value">{formatINR(oldRegime.totalTax)}</span>
              </div>
            </div>

            <div className="border-t border-ink/10 pt-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge>New regime</Badge>
              </div>
              <div className="ledger-row">
                <span className="label">Taxable income</span>
                <span className="fill" />
                <span className="value">{formatINR(newRegime.taxableIncome)}</span>
              </div>
              <div className="ledger-row">
                <span className="label font-medium text-ink">Total tax</span>
                <span className="fill" />
                <span className="value">{formatINR(newRegime.totalTax)}</span>
              </div>
            </div>
          </div>
          <div className="receipt-edge-bottom" />
        </div>
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
          step={1000}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 font-mono text-ink focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
        />
        <span className="text-xs text-charcoal/50 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}
