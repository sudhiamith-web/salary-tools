"use client";

// Standalone ESI calculator used on /tools/esi-calculator.

import { useMemo, useState } from "react";
import {
  computeEsi,
  esiWage,
  ESI_EMPLOYEE_RATE,
  ESI_EMPLOYER_RATE,
  type EsiWageBasis,
} from "@/lib/calculators/esi";
import { NumberField, Segmented, Toggle } from "@/components/retirement/fields";
import { ResultLine } from "@/components/retirement/ResultLine";
import { rupees } from "@/components/retirement/format";

export default function EsiMiniCalculator() {
  const [basicDA, setBasicDA] = useState(10000);
  const [gross, setGross] = useState(18000);
  const [basis, setBasis] = useState<EsiWageBasis>("code");
  const [isPwd, setIsPwd] = useState(false);

  const result = useMemo(
    () => computeEsi({ wage: esiWage(basicDA, gross, basis), isPwd }),
    [basicDA, gross, basis, isPwd]
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <NumberField label="Basic + DA (monthly)" value={basicDA} onChange={setBasicDA} prefix="₹" step={500} />
        <NumberField
          label="Gross pay (monthly)"
          value={gross}
          onChange={(v) => setGross(Math.max(v, basicDA))}
          prefix="₹"
          step={500}
          hint="All monthly earnings: Basic, DA, HRA and allowances."
        />
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
      <div className="rounded-lg border border-slate-300 bg-slate-50 p-5">
        <ResultLine label="Wage tested for ESI" value={rupees(result.wage)} sub={`Ceiling ${rupees(result.ceiling)}`} />
        <ResultLine
          label="Covered by ESI?"
          value={result.covered ? "Yes" : "No"}
          sub={result.covered ? "You and your family get ESI benefits." : "Your wage is above the ceiling."}
        />
        <ResultLine label={`You pay (${ESI_EMPLOYEE_RATE * 100}%)`} tone="loss" value={`${rupees(result.employee)}/month`} />
        <ResultLine label={`Employer pays (${ESI_EMPLOYER_RATE * 100}%)`} value={`${rupees(result.employer)}/month`} />
        <ResultLine label="Total to ESIC" value={`${rupees(result.total)}/month`} />
      </div>
    </div>
  );
}
