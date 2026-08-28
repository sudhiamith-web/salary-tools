"use client";

import { useMemo, useState } from "react";
import { computeNewRegimeTax, formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";

export default function TDSCalculatorPage() {
  const [annualGrossSalary, setAnnualGrossSalary] = useState(1200000);
  const [monthsRemaining, setMonthsRemaining] = useState(12);

  const tax = useMemo(() => computeNewRegimeTax(annualGrossSalary), [annualGrossSalary]);
  const monthlyTDS = useMemo(
    () => (monthsRemaining > 0 ? tax.totalTax / monthsRemaining : 0),
    [tax, monthsRemaining]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">TDS on Salary Calculator</h1>
      <p className="text-charcoal/60 mb-4 max-w-xl">
        Estimate the monthly tax your employer should be withholding from
        your salary, based on the new tax regime (the default regime unless
        you've told your employer otherwise).
      </p>
      <div className="stamp-note mb-10">
        Assumes even withholding across the remaining months. Employers
        often front-load or adjust TDS as the financial year progresses, so
        your actual payslip figure may differ from this estimate.
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6 max-w-md">
          <Field
            label="Annual gross salary"
            value={annualGrossSalary}
            onChange={setAnnualGrossSalary}
            suffix="₹ / year"
          />
          <Field
            label="Months remaining in the financial year"
            value={monthsRemaining}
            onChange={setMonthsRemaining}
            suffix="months"
            step={1}
          />
        </div>

        <div className="sticky top-6">
          <div className="receipt-edge-top" />
          <div className="bg-white px-6 py-6 shadow-sm">
            <div className="mb-2">
              <Badge>New regime</Badge>
            </div>
            <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
              Estimated monthly TDS
            </p>
            <h3 className="font-display text-3xl text-ink mb-6">
              {formatINR(monthlyTDS)}
            </h3>

            <div className="mb-4">
              <div className="ledger-row">
                <span className="label">Taxable income</span>
                <span className="fill" />
                <span className="value">{formatINR(tax.taxableIncome)}</span>
              </div>
              <div className="ledger-row">
                <span className="label">Rebate (Sec 87A)</span>
                <span className="fill" />
                <span className="value text-ledger">−{formatINR(tax.rebate)}</span>
              </div>
              <div className="ledger-row">
                <span className="label">Cess (4%)</span>
                <span className="fill" />
                <span className="value">{formatINR(tax.cess)}</span>
              </div>
            </div>

            <div className="border-t border-ink/10 pt-3">
              <div className="ledger-row">
                <span className="label font-medium text-ink">Total annual tax</span>
                <span className="fill" />
                <span className="value">{formatINR(tax.totalTax)}</span>
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
