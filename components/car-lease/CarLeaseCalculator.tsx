"use client";

// Car Lease Tax Benefit Calculator: three tabs sharing one set of inputs.
// Logic lives in lib/calculators/carLease.ts.

import { useEffect, useState } from "react";
import { DEFAULT_INPUTS, type CarLeaseInputs } from "@/lib/calculators/carLease";
import TaxSavingTab from "./TaxSavingTab";
import EndOfLeaseTab from "./EndOfLeaseTab";
import BuyVsLeaseTab from "./BuyVsLeaseTab";

type TabId = "tax-saving" | "end-of-lease" | "buy-vs-lease";
const TABS: { id: TabId; label: string }[] = [
  { id: "tax-saving", label: "Tax saving" },
  { id: "end-of-lease", label: "End of lease" },
  { id: "buy-vs-lease", label: "Buy vs lease" },
];
const isTab = (h: string): h is TabId => TABS.some((t) => t.id === h);

export default function CarLeaseCalculator() {
  const [inputs, setInputs] = useState<CarLeaseInputs>(DEFAULT_INPUTS);
  const [tab, setTab] = useState<TabId>("tax-saving");
  const [yearsTouched, setYearsTouched] = useState(false);

  // Deep links: /tools/car-lease-tax-calculator#buy-vs-lease
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace("#", "");
      if (isTab(h)) setTab(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const choose = (id: TabId) => {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const set =
    <K extends keyof CarLeaseInputs>(key: K) =>
    (value: CarLeaseInputs[K]) => {
      if (key === "completedYears") setYearsTouched(true);
      setInputs((p) => {
        const next = { ...p, [key]: value };
        // Keep Tab 2's years in step with the lease tenure until the user sets them.
        if (key === "tenureMonths" && !yearsTouched) next.completedYears = Math.max(1, Math.floor(Number(value) / 12));
        return next;
      });
    };

  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Calculator sections" className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => choose(t.id)}
            className={`-mb-px min-h-[44px] border-b-[3px] px-4 py-3 text-[15px] transition-colors ${
              tab === t.id ? "border-accent font-semibold text-ink" : "border-transparent font-medium text-charcoal/60 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "tax-saving" && <TaxSavingTab inputs={inputs} set={set} />}
        {tab === "end-of-lease" && <EndOfLeaseTab inputs={inputs} set={set} />}
        {tab === "buy-vs-lease" && <BuyVsLeaseTab inputs={inputs} set={set} />}
      </div>
    </div>
  );
}
