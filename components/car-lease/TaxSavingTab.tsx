"use client";

import { useMemo } from "react";
import SliderField from "@/components/SliderField";
import InsightBanner from "@/components/InsightBanner";
import { RULE3_OLD_RATES, calculateTaxSaving, usageComparison, type Engine, type LeaseType, type Regime, type Usage } from "@/lib/calculators/carLease";
import { Bar, ChoiceCards, Group, Hint, Note, Segmented, Stat, YesNo } from "./controls";
import { rupees } from "./format";
import type { TabProps } from "./types";

const USAGE_LABEL: Record<Usage, string> = { official: "Official only", mixed: "Official + personal", personal: "Personal only" };

const USAGE_HINT: Record<Usage, string> = {
  official: "No perquisite if the car is used only for work — but you need a logbook and an employer certificate.",
  mixed: "The most common case. A flat monthly value is taxed, whatever the car actually costs.",
  personal: "Whatever the employer spends (lease, fuel, driver) is fully taxable, so there is no saving.",
};

function recordsNeeded(usage: Usage, lease: LeaseType): string {
  if (usage === "official")
    return "A logbook for every trip (date, destination, distance, purpose) and a certificate from your employer that the car was used only for official work. Without these, the use can be treated as mixed.";
  if (usage === "personal") return "None for the saving — there isn’t one. Paying for the car from take-home salary may be simpler.";
  return lease === "own"
    ? "Bills for fuel, service and driver salary. To claim more than the flat official-use deduction, keep a trip logbook and an employer certificate."
    : "The lease agreement and your employer’s payroll records. No logbook is needed for the flat value.";
}

export default function TaxSavingTab({ inputs, set }: TabProps) {
  const r = useMemo(() => calculateTaxSaving(inputs), [inputs]);
  const rOld = useMemo(() => calculateTaxSaving(inputs, RULE3_OLD_RATES), [inputs]);
  const comps = useMemo(() => usageComparison(inputs), [inputs]);
  const max = Math.max(1, ...comps.map((c) => c.saving));
  const years = inputs.tenureMonths / 12;

  let insight = "Income-tax Rules 2026 raised car perquisite values from 1 April 2026. ";
  if (inputs.usage === "mixed" && rOld.saving > r.saving)
    insight += `For this setup you save ${rupees(rOld.saving - r.saving)} a year less than you would have under the FY 2025-26 values (${rupees(rOld.saving)}).`;
  else if (inputs.usage === "official") insight += "Wholly official use is unaffected — the perquisite stays nil if you keep records.";
  else if (inputs.usage === "personal") insight += "For personal-only use the change doesn’t matter: the full cost is taxed either way.";
  else insight += "For this setup the change makes no difference to your tax.";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
      <div className="card space-y-5 px-5 py-5">
        <Group title="1 · Type of car lease">
          <ChoiceCards<LeaseType>
            label="Type of car lease"
            value={inputs.leaseType}
            onChange={set("leaseType")}
            options={[
              { value: "company", title: "Company car lease", sub: "Employer owns or leases the car; rental comes out of your CTC" },
              { value: "companyEmp", title: "Company car, you pay running costs", sub: "Employer leases the car; fuel and upkeep are on you" },
              { value: "own", title: "Own car + running-cost reimbursement", sub: "Your car (cash or loan); employer reimburses fuel, upkeep, driver" },
            ]}
          />
        </Group>

        <Group title="2 · How is the car used?">
          <Segmented<Usage>
            label="Car use"
            value={inputs.usage}
            onChange={set("usage")}
            options={(["official", "mixed", "personal"] as Usage[]).map((u) => ({ value: u, label: USAGE_LABEL[u] }))}
          />
          <Hint>{USAGE_HINT[inputs.usage]}</Hint>
        </Group>

        <Group title="3 · Car details">
          <Segmented<Engine>
            label="Engine"
            value={inputs.engine}
            onChange={set("engine")}
            options={[
              { value: "small", label: "Up to 1.6L or EV" },
              { value: "large", label: "Above 1.6L" },
            ]}
          />
          <YesNo label="Chauffeur provided by employer?" value={inputs.chauffeur} onChange={set("chauffeur")} />
          {inputs.leaseType !== "own" && (
            <SliderField label="Monthly lease rental" value={inputs.rentMonthly} onChange={set("rentMonthly")} suffix="₹ / month" min={10000} max={150000} step={1000} />
          )}
          <SliderField
            label={inputs.leaseType === "companyEmp" ? "Fuel & upkeep you pay (not tax-relevant)" : "Fuel & upkeep paid by employer"}
            value={inputs.runMonthly}
            onChange={set("runMonthly")}
            suffix="₹ / month"
            min={0}
            max={40000}
            step={500}
          />
          {inputs.chauffeur && (
            <SliderField label="Chauffeur salary" value={inputs.driverMonthly} onChange={set("driverMonthly")} suffix="₹ / month" min={10000} max={50000} step={1000} />
          )}
          <SliderField label="Lease tenure" value={inputs.tenureMonths} onChange={set("tenureMonths")} suffix="months" min={24} max={60} step={12} />
        </Group>

        <Group title="4 · Your salary">
          <SliderField label="Annual gross salary (excl. employer PF)" value={inputs.salary} onChange={set("salary")} suffix="₹ / year" min={600000} max={5000000} step={50000} />
          <Segmented<Regime> label="Tax regime" value={inputs.regime} onChange={set("regime")} options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]} />
        </Group>
      </div>

      <div className="min-w-0 space-y-6">
        <section className="card space-y-5 px-6 py-6" aria-live="polite">
          <div>
            <p className="text-sm text-charcoal/60">Estimated tax saving per year</p>
            <p className={`font-display text-4xl tabular-nums md:text-5xl ${r.saving > 0 ? "text-ledger" : "text-rust"}`}>{rupees(r.saving)}</p>
            <p className="mt-1 text-sm text-charcoal/60">{r.saving > 0 ? `${rupees(r.saving / 12)} a month more in hand` : "No tax saving for this combination"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Moved out of taxable cash salary" value={rupees(r.restructured)} />
            <Stat label="Perquisite added (Rule 15)" value={rupees(r.perquisite)} />
            <Stat label="Tax without car benefit" value={rupees(r.taxBefore)} />
            <Stat label="Tax with car benefit" value={rupees(r.taxAfter)} />
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-slate-200 pt-4">
            <span className="font-medium text-ink">Total saving over {inputs.tenureMonths} months</span>
            <span className="font-display text-2xl tabular-nums text-ink">{rupees(r.saving * years)}</span>
          </div>
        </section>

        <InsightBanner message={insight} />

        <section className="card space-y-4 px-6 py-6">
          <h2 className="font-display text-xl text-ink">Same car, different use — annual saving</h2>
          {comps.map((c) => (
            <Bar key={c.usage} label={USAGE_LABEL[c.usage]} value={rupees(c.saving)} pct={(c.saving / max) * 100} good={c.saving > 0} />
          ))}
        </section>

        <Note tone="warn" title="Records you will need:">
          {recordsNeeded(inputs.usage, inputs.leaseType)}
        </Note>

        <p className="text-xs leading-relaxed text-charcoal/50">
          Assumes FY 2026-27 slabs, 4% cess, no surcharge, and the standard deduction only (₹75,000 new / ₹50,000 old regime), with the Section 87A
          rebate and marginal relief. Estimates only — not tax advice. Confirm the structure with your employer&apos;s payroll team or a tax professional.
        </p>
      </div>
    </div>
  );
}
