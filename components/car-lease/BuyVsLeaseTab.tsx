"use client";

import { useMemo } from "react";
import SliderField from "@/components/SliderField";
import InsightBanner from "@/components/InsightBanner";
import { OPTION_NAMES, calculateBuyVsLease, type OptionKey, type OptionResult, type Owner, type Regime } from "@/lib/calculators/carLease";
import { Bar, Group, Hint, Segmented, YesNo } from "./controls";
import { rupees } from "./format";
import type { TabProps } from "./types";

const RANK = ["Cheapest", "2nd", "3rd"];

function Row({ k, v, tone }: { k: string; v: string; tone?: "gain" | "muted" }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-charcoal/60">{k}</span>
      <span className={`font-medium tabular-nums ${tone === "gain" ? "text-ledger" : tone === "muted" ? "text-charcoal/50" : "text-ink"}`}>{v}</span>
    </div>
  );
}

function OptionCard({ o, rank, buyAtEnd }: { o: OptionResult; rank: number; buyAtEnd: boolean }) {
  const top = rank === 0;
  const lease = o.key === "lease";
  return (
    <article className={`card flex flex-col gap-3 px-5 py-5 ${top ? "ring-2 ring-ledger" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{OPTION_NAMES[o.key]}</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${top ? "bg-ledger/10 text-ledger" : "bg-slate-100 text-charcoal/60"}`}>{RANK[rank]}</span>
      </div>
      <div>
        <p className="text-xs text-charcoal/60">Net cost</p>
        <p className="font-display text-2xl tabular-nums text-ink">{rupees(o.netCost)}</p>
      </div>
      <div className="space-y-1.5 border-t border-slate-200 pt-3">
        <Row k="Upfront" v={o.upfront > 0 ? rupees(o.upfront) : "₹0"} tone={o.upfront > 0 ? undefined : "muted"} />
        <Row k={o.key === "loan" ? "EMIs + running" : lease ? "Rental + running" : "Running costs"} v={rupees(o.monthlyOutflow)} />
        {o.key === "loan" && <Row k="Interest paid" v={rupees(o.interest)} />}
        {lease && <Row k="Tax saved" v={rupees(-o.taxSaved)} tone="gain" />}
        {lease && <Row k="Buy-back + its tax" v={buyAtEnd ? rupees(o.buyBack) : "—"} tone={buyAtEnd ? undefined : "muted"} />}
        <Row k="Car value at end" v={o.endValue > 0 ? rupees(-o.endValue) : "Returned"} tone={o.endValue > 0 ? "gain" : "muted"} />
        <Row k="Return forgone" v={rupees(o.returnForgone)} />
      </div>
    </article>
  );
}

export default function BuyVsLeaseTab({ inputs, set }: TabProps) {
  const r = useMemo(() => calculateBuyVsLease(inputs), [inputs]);
  const byKey = (k: OptionKey) => r.options.find((o) => o.key === k);
  const best = byKey(r.ranked[0]);
  const second = r.ranked[1] ? byKey(r.ranked[1]) : undefined;
  const max = Math.max(1, ...r.options.map((o) => o.netCost));

  const insight = useMemo(() => {
    const parts: string[] = [];
    const cash = byKey("cash");
    const loan = byKey("loan");
    const lease = byKey("lease");
    if (lease && cash && loan) {
      const buyBest = Math.min(cash.netCost, loan.netCost);
      parts.push(
        lease.netCost < buyBest
          ? `The company lease costs ${rupees(buyBest - lease.netCost)} less than the best way of buying, mainly because the rental comes out of pre-tax salary.`
          : `Buying works out ${rupees(lease.netCost - buyBest)} cheaper than the lease here — the tax saving doesn’t cover the rental.`,
      );
      if (inputs.buyAtEnd && inputs.owner === "employer" && r.leaseBuyBackTax > 0)
        parts.push(`Buying an employer-owned car at the end adds ${rupees(r.leaseBuyBackTax)} of tax.`);
    }
    if (r.breakEvenReturn !== null)
      parts.push(`Between cash and a loan, cash wins unless your money earns more than ${r.breakEvenReturn.toFixed(1)}% a year.`);
    else if (cash && loan) parts.push(cash.netCost <= loan.netCost ? "Cash beats the loan at any realistic return." : "The loan beats cash at any realistic return.");
    return parts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, inputs.buyAtEnd, inputs.owner]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
      <div className="card space-y-5 px-5 py-5">
        <Group title="1 · The car">
          <SliderField label="On-road price" value={inputs.carCost} onChange={set("carCost")} suffix="₹" min={500000} max={5000000} step={50000} />
          <SliderField label="Compare over" value={inputs.tenureMonths} onChange={set("tenureMonths")} suffix="months" min={24} max={60} step={12} />
          <SliderField label="Fuel & upkeep" value={inputs.runMonthly} onChange={set("runMonthly")} suffix="₹ / month" min={0} max={40000} step={500} />
          <SliderField label="Resale value at the end" value={inputs.resalePct} onChange={set("resalePct")} suffix={`% · ${rupees(r.resale)}`} min={20} max={80} step={5} />
        </Group>

        <Group title="2 · Car loan">
          <SliderField label="Down payment" value={inputs.downPct} onChange={set("downPct")} suffix={`% · ${rupees(r.downPayment)}`} min={0} max={50} step={5} />
          <SliderField label="Interest rate" value={inputs.loanRate} onChange={set("loanRate")} suffix="% a year" min={7} max={14} step={0.25} />
          <SliderField label="Loan tenure" value={inputs.loanMonths} onChange={set("loanMonths")} suffix={`months · EMI ${rupees(r.emi)}`} min={12} max={84} step={12} />
          <Hint>Car loan interest isn’t deductible for salaried employees. If the loan runs past the comparison period, the balance is paid off from the resale.</Hint>
        </Group>

        <Group title="3 · Company lease">
          <YesNo label="Does your employer offer a car lease?" value={inputs.leaseOffered} onChange={set("leaseOffered")} />
          {inputs.leaseOffered && (
            <>
              <SliderField label="Monthly lease rental (all-in quote)" value={inputs.rentMonthly} onChange={set("rentMonthly")} suffix="₹ / month" min={10000} max={150000} step={1000} />
              <YesNo label="Buy the car at the end?" value={inputs.buyAtEnd} onChange={set("buyAtEnd")} />
              {inputs.buyAtEnd && (
                <>
                  <SliderField label="Buy-back price" value={Math.min(inputs.buyPrice, inputs.carCost)} onChange={set("buyPrice")} suffix="₹" min={0} max={inputs.carCost} step={25000} />
                  <Hint>A lower buy-back price usually means a higher monthly rental. Use the figures from your lessor’s quote.</Hint>
                  <Segmented<Owner>
                    label="Car owned by"
                    value={inputs.owner}
                    onChange={set("owner")}
                    options={[
                      { value: "lessor", label: "Leasing company" },
                      { value: "employer", label: "Employer-owned" },
                    ]}
                  />
                </>
              )}
              <Hint>The lease saving uses the usage and engine from the Tax saving tab, without a chauffeur.</Hint>
            </>
          )}
        </Group>

        <Group title="4 · Your money">
          <SliderField label="Return your money could earn" value={inputs.oppReturn} onChange={set("oppReturn")} suffix="% a year" min={3} max={14} step={0.5} />
          <Hint>For example, an FD or debt fund return. It applies to every rupee you pay out, so all three options are compared fairly.</Hint>
          <SliderField label="Annual gross salary (excl. employer PF)" value={inputs.salary} onChange={set("salary")} suffix="₹ / year" min={600000} max={5000000} step={50000} />
          <Segmented<Regime> label="Tax regime" value={inputs.regime} onChange={set("regime")} options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]} />
        </Group>
      </div>

      <div className="min-w-0 space-y-6">
        {best && (
          <section className="card px-6 py-6" aria-live="polite">
            <p className="text-sm text-charcoal/60">Best option over {r.months} months</p>
            <p className="font-display text-3xl text-ledger md:text-4xl">{OPTION_NAMES[best.key]}</p>
            {second && (
              <p className="mt-1 text-[15px] text-charcoal/60">
                Saves {rupees(second.netCost - best.netCost)} over {OPTION_NAMES[second.key].toLowerCase()} · net cost {rupees(best.netCost)}
              </p>
            )}
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {r.options.map((o) => (
            <OptionCard key={o.key} o={o} rank={r.ranked.indexOf(o.key)} buyAtEnd={inputs.buyAtEnd} />
          ))}
        </div>

        <InsightBanner message={insight} />

        <section className="card space-y-4 px-6 py-6">
          <h2 className="font-display text-xl text-ink">Net cost compared</h2>
          {r.ranked.map((k, i) => {
            const o = byKey(k);
            return o ? <Bar key={k} label={OPTION_NAMES[k]} value={rupees(o.netCost)} pct={(o.netCost / max) * 100} good={i === 0} /> : null;
          })}
        </section>

        <p className="text-xs leading-relaxed text-charcoal/50">
          Net cost = everything you pay out, minus tax saved and the car&apos;s value at the end, adjusted for the return your money could have earned.
          Lease rental is paid from pre-tax salary; cash, EMIs and running costs come from take-home pay. Estimates only — not tax or financial advice.
        </p>
      </div>
    </div>
  );
}
