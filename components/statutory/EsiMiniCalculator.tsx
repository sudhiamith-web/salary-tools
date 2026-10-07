"use client";

// ESI calculator for /tools/esi-calculator. Inputs on the left, result
// card on the right, matching the standard tool layout.

import { useMemo, useState } from "react";
import {
  computeEsi,
  esiWage,
  ESI_EMPLOYEE_RATE,
  ESI_EMPLOYER_RATE,
  type EsiWageBasis,
} from "@/lib/calculators/esi";
import { formatINR } from "@/lib/calculators/salary";
import SliderField from "@/components/SliderField";
import Badge from "@/components/Badge";
import InsightBanner from "@/components/InsightBanner";
import { Segmented, Toggle } from "@/components/retirement/fields";
import { ResultLine } from "@/components/retirement/ResultLine";

export default function EsiMiniCalculator() {
  const [basicDA, setBasicDA] = useState(10000);
  const [gross, setGross] = useState(18000);
  const [basis, setBasis] = useState<EsiWageBasis>("code");
  const [isPwd, setIsPwd] = useState(false);

  const safeGross = Math.max(gross, basicDA);
  const result = useMemo(
    () => computeEsi({ wage: esiWage(basicDA, safeGross, basis), isPwd }),
    [basicDA, safeGross, basis, isPwd]
  );

  // Genuine insight: under the Labour Code test, show how much gross pay
  // can rise before ESI coverage ends.
  const headroom = result.covered ? result.ceiling - result.wage : 0;

  return (
    <>
      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-10">
        <div className="space-y-6 max-w-md">
          <SliderField label="Basic + DA (monthly)" value={basicDA} onChange={setBasicDA} suffix="₹ / month" min={0} max={60000} step={500} />
          <SliderField label="Gross pay (monthly)" value={gross} onChange={setGross} suffix="₹ / month" min={0} max={80000} step={500} />
          <p className="text-xs text-charcoal/50 -mt-4">All monthly earnings: Basic, DA, HRA and allowances.</p>
          <Segmented
            label="Wage used to test coverage"
            value={basis}
            onChange={setBasis}
            options={[
              { value: "code", label: "Labour Code wage" },
              { value: "gross", label: "Gross wage" },
            ]}
            hint="Under the Code on Social Security, allowances above 50% of pay are added back to Basic + DA."
          />
          <Toggle label="I'm a person with disability" checked={isPwd} onChange={setIsPwd} />
        </div>

        <div className="lg:sticky lg:top-6 self-start">
          <div className="card px-6 py-5">
            <div className="mb-3">{result.covered ? <Badge variant="filled">Covered by ESI</Badge> : <Badge>Not covered</Badge>}</div>
            <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">You pay each month</p>
            <h3 className="font-display text-3xl text-ink mb-6">{formatINR(result.employee)}</h3>
            <ResultLine label="Wage tested" value={formatINR(result.wage)} sub={`Ceiling ${formatINR(result.ceiling)}`} />
            <ResultLine label={`You pay (${ESI_EMPLOYEE_RATE * 100}%)`} tone="loss" value={formatINR(result.employee)} />
            <ResultLine label={`Employer pays (${ESI_EMPLOYER_RATE * 100}%)`} value={formatINR(result.employer)} />
            <div className="border-t border-slate-200 mt-2 pt-2">
              <ResultLine label="Total to ESIC" value={formatINR(result.total)} />
            </div>
          </div>
        </div>
      </div>

      {result.covered && headroom > 0 && (
        <div className="mb-16 max-w-2xl">
          <InsightBanner
            message={`Your tested wage can rise by ${formatINR(headroom)} a month before you leave ESI coverage`}
          />
        </div>
      )}
    </>
  );
}
