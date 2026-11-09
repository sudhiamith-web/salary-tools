"use client";

import { useMemo } from "react";
import SliderField from "@/components/SliderField";
import InsightBanner from "@/components/InsightBanner";
import { calculateBuyBack, type Owner, type Regime } from "@/lib/calculators/carLease";
import { ChoiceCards, Group, Hint, Segmented, Stat } from "./controls";
import { rupees } from "./format";
import type { TabProps } from "./types";

export default function EndOfLeaseTab({ inputs, set }: TabProps) {
  const r = useMemo(() => calculateBuyBack(inputs), [inputs]);
  const price = Math.min(inputs.buyPrice, inputs.carCost);

  const tip =
    inputs.owner === "lessor"
      ? "Buying from the leasing company at a fair residual price usually creates no perquisite. Get the price in writing and check it is close to market value."
      : r.perquisite > 0
        ? `Paying close to the depreciated value (${rupees(r.depreciatedValue)}) removes the perquisite. Every ₹1 below it is taxed as salary.`
        : "You are paying at or above the depreciated value, so the transfer creates no perquisite.";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
      <div className="card space-y-5 px-5 py-5">
        <Group title="1 · Who owns the car?">
          <ChoiceCards<Owner>
            label="Car owner"
            value={inputs.owner}
            onChange={set("owner")}
            options={[
              { value: "employer", title: "Employer owns the car", sub: "Bought by your company and given to you to use" },
              { value: "lessor", title: "Leasing company owns it", sub: "Operating lease through a lessor; you buy from them" },
            ]}
          />
        </Group>
        <Group title="2 · The buy-back">
          <SliderField label="Original cost of the car" value={inputs.carCost} onChange={set("carCost")} suffix="₹" min={500000} max={5000000} step={50000} />
          <SliderField label="Completed years of use" value={inputs.completedYears} onChange={set("completedYears")} suffix="years" min={1} max={7} step={1} />
          <SliderField label="Price you pay to buy it" value={price} onChange={set("buyPrice")} suffix="₹" min={0} max={inputs.carCost} step={25000} />
          <Hint>A lower buy-back price usually means a higher monthly rental. Use the figures from your lessor’s quote.</Hint>
        </Group>
        <Group title="3 · Your salary">
          <SliderField label="Annual gross salary (excl. employer PF)" value={inputs.salary} onChange={set("salary")} suffix="₹ / year" min={600000} max={5000000} step={50000} />
          <Segmented<Regime> label="Tax regime" value={inputs.regime} onChange={set("regime")} options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]} />
          <Hint>Lease rental, running costs and usage carry over from the Tax saving tab.</Hint>
        </Group>
      </div>

      <div className="min-w-0 space-y-6">
        <section className="card space-y-5 px-6 py-6" aria-live="polite">
          <div>
            <p className="text-sm text-charcoal/60">Extra tax in the year you buy the car</p>
            <p className={`font-display text-4xl tabular-nums md:text-5xl ${r.extraTax > 0 ? "text-rust" : "text-ledger"}`}>{rupees(r.extraTax)}</p>
            <p className="mt-1 text-sm text-charcoal/60">{r.extraTax > 0 ? "Added to your salary as a perquisite and taxed through TDS" : "No perquisite on this transfer"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Depreciated value" value={rupees(r.depreciatedValue)} />
            <Stat label="You pay" value={rupees(price)} />
            <Stat label="Taxable perquisite" value={rupees(r.perquisite)} />
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-4 text-[15px]">
            <div className="flex justify-between gap-3">
              <span>Lease tax saving over {inputs.completedYears} years</span>
              <span className="font-semibold tabular-nums text-ledger">{rupees(r.leaseSavingTotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Less: buy-back tax</span>
              <span className="font-semibold tabular-nums text-rust">{rupees(-r.extraTax)}</span>
            </div>
            <div className="flex justify-between gap-3 text-lg font-bold">
              <span>Net saving from the lease</span>
              <span className={`tabular-nums ${r.netSaving >= 0 ? "text-ledger" : "text-rust"}`}>{rupees(r.netSaving)}</span>
            </div>
          </div>
        </section>

        <section className="card space-y-3 px-6 py-6">
          <h2 className="font-display text-xl text-ink">How the depreciated value is worked out</h2>
          <p className="text-sm text-charcoal/60">Cost reduced by 20% a year on a reducing balance, for each completed year of use.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-3 py-2 font-semibold">After year</th>
                  <th className="px-3 py-2 font-semibold">Depreciation</th>
                  <th className="px-3 py-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {r.schedule.map((y) => (
                  <tr key={y.year} className="border-t border-slate-200">
                    <td className="px-3 py-2">Year {y.year}</td>
                    <td className="px-3 py-2 tabular-nums">{rupees(y.depreciation)}</td>
                    <td className="px-3 py-2 font-semibold tabular-nums">{rupees(y.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <InsightBanner message={tip} />

        <p className="text-xs leading-relaxed text-charcoal/50">
          Transfer of an employer-owned car is valued under Rule 15 of the Income-tax Rules, 2026. Where you buy from a leasing company, the
          employer-asset rule generally doesn&apos;t apply — confirm with a tax professional. Estimates only — not tax advice.
        </p>
      </div>
    </div>
  );
}
