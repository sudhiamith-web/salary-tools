"use client";

import { useMemo, useState } from "react";
import { computeGratuity } from "@/lib/calculators/gratuity";
import { formatINR } from "@/lib/calculators/salary";
import Badge from "@/components/Badge";

export default function GratuityCalculatorPage() {
  const [monthlySalary, setMonthlySalary] = useState(45000);
  const [years, setYears] = useState(7.5);

  const result = useMemo(
    () => computeGratuity({ lastDrawnMonthlySalary: monthlySalary, yearsOfService: years }),
    [monthlySalary, years]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Gratuity Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Calculate your gratuity under the Payment of Gratuity Act, 1972 —
        applies once you've completed 5+ years with an employer.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6 max-w-md">
          <Field
            label="Last drawn monthly salary (Basic + DA)"
            value={monthlySalary}
            onChange={setMonthlySalary}
            suffix="₹ / month"
          />
          <Field
            label="Years of service"
            value={years}
            onChange={setYears}
            suffix="years"
            step={0.1}
          />
          <p className="text-xs text-charcoal/50 pt-2">
            6+ months beyond a completed year rounds up to the next full
            year, per the Act's standard rounding rule.
          </p>
        </div>

        <div className="sticky top-6">
          <div className="receipt-edge-top" />
          <div className="bg-white px-6 py-6 shadow-sm">
            {!result.eligibleForGratuity ? (
              <div>
                <Badge>Not yet eligible</Badge>
                <p className="text-sm text-charcoal/60 mt-3">
                  The Act requires 5+ years of continuous service (with
                  exceptions for death or disability). At your current
                  tenure, gratuity isn't payable yet.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
                  Gratuity payable
                </p>
                <h3 className="font-display text-3xl text-ink mb-6">
                  {formatINR(result.gratuityAmount)}
                </h3>

                <div className="mb-4">
                  <div className="ledger-row">
                    <span className="label">Rounded years of service</span>
                    <span className="fill" />
                    <span className="value">{result.roundedYears}</span>
                  </div>
                </div>

                <div className="border-t border-ink/10 pt-3">
                  <div className="ledger-row">
                    <span className="label font-medium text-ink">Exempt from tax</span>
                    <span className="fill" />
                    <span className="value text-ledger">{formatINR(result.exemptAmount)}</span>
                  </div>
                  <div className="ledger-row">
                    <span className="label">Taxable amount</span>
                    <span className="fill" />
                    <span className="value text-rust">{formatINR(result.taxableAmount)}</span>
                  </div>
                </div>
              </>
            )}
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
