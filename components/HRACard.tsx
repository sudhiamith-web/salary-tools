import { HRAResult } from "@/lib/calculators/hra";
import { formatINR } from "@/lib/calculators/salary";

export default function HRACard({ result }: { result: HRAResult }) {
  const exemptPercent =
    result.hraReceivedAnnual > 0
      ? Math.round((result.exemptAnnual / result.hraReceivedAnnual) * 100)
      : 0;

  return (
    <div className="sticky top-6 space-y-4">
      <div className="hero-box">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
          HRA exempt from tax — annual
        </p>
        <h3 className="font-display text-3xl text-ink">
          {formatINR(result.exemptAnnual)}
        </h3>
        <p className="text-xs text-charcoal/60 mt-1">
          {exemptPercent}% of the HRA you receive
        </p>
      </div>

      <div className="card px-6 py-5">
        <p className="text-xs uppercase tracking-widest text-charcoal/50 font-semibold mb-2">
          The three conditions — least applies
        </p>
        <div className="ledger-row">
          <span className="label">1. Actual HRA received</span>
          <span className="fill" />
          <span className="value">{formatINR(result.hraReceivedAnnual)}</span>
        </div>
        <div className="ledger-row">
          <span className="label">2. Rent paid − 10% of basic</span>
          <span className="fill" />
          <span className="value">{formatINR(result.rentMinusTenPercent)}</span>
        </div>
        <div className="ledger-row">
          <span className="label">
            3. {result.isMetro ? "50%" : "40%"} of basic ({result.isMetro ? "metro" : "non-metro"})
          </span>
          <span className="fill" />
          <span className="value">{formatINR(result.metroLimit)}</span>
        </div>

        <div className="border-t border-slate-200 mt-4 pt-3">
          <div className="ledger-row">
            <span className="label font-semibold text-ink">Exempt from tax</span>
            <span className="fill" />
            <span className="value text-ledger">{formatINR(result.exemptAnnual)}</span>
          </div>
          <div className="ledger-row">
            <span className="label">Still taxable as salary</span>
            <span className="fill" />
            <span className="value text-rust">{formatINR(result.taxableHRAAnnual)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
