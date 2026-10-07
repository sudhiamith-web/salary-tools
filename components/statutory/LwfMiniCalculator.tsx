"use client";

// Standalone LWF calculator used on /tools/lwf-benefits.

import Link from "next/link";
import { useMemo, useState } from "react";
import { computeLwf, type LwfFrequency } from "@/lib/calculators/lwf";
import { STATES, stateName } from "@/lib/data/stateDeductions";
import { NumberField, Segmented, SelectField } from "@/components/retirement/fields";
import { ResultLine } from "@/components/retirement/ResultLine";
import { rupees } from "@/components/retirement/format";

export default function LwfMiniCalculator() {
  const [state, setState] = useState("KA");
  const [employee, setEmployee] = useState(0);
  const [employer, setEmployer] = useState(0);
  const [frequency, setFrequency] = useState<LwfFrequency>("yearly");

  const result = useMemo(
    () => computeLwf({ employeeAmount: employee, employerAmount: employer, frequency }),
    [employee, employer, frequency]
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <SelectField
          label="State"
          value={state}
          onChange={setState}
          options={STATES.map((s) => ({ value: s.code, label: s.name }))}
        />
        <p className="text-xs text-slate-500">
          Check the current amounts for {stateName(state)} on our{" "}
          <Link href="/lwf-rates" className="underline underline-offset-2">
            LWF rates page
          </Link>{" "}
          or your payslip, then enter them below.
        </p>
        <NumberField label="Employee contribution" value={employee} onChange={setEmployee} prefix="₹" />
        <NumberField label="Employer contribution" value={employer} onChange={setEmployer} prefix="₹" />
        <Segmented
          label="Deducted"
          value={frequency}
          onChange={setFrequency}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "half-yearly", label: "Half-yearly" },
            { value: "yearly", label: "Yearly" },
          ]}
        />
      </div>
      <div className="rounded-lg border border-slate-300 bg-slate-50 p-5">
        <ResultLine label="You pay a year" tone="loss" value={rupees(result.employeeAnnual)} />
        <ResultLine label="Employer pays a year" value={rupees(result.employerAnnual)} />
        <ResultLine label="Total to the welfare board a year" value={rupees(result.totalAnnual)} />
      </div>
    </div>
  );
}
