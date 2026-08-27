import { HRAResult } from "@/lib/calculators/hra";
import { formatINR } from "@/lib/calculators/salary";

export default function HRACard({ result }: { result: HRAResult }) {
  return (
    <div className="sticky top-6">
      <div className="receipt-edge-top" />
      <div className="bg-white px-6 py-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
          HRA exempt from tax — annual
        </p>
        <h3 className="font-display text-3xl text-ledger mb-6">
          {formatINR(result.exemptAnnual)}
        </h3>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-ink/60 font-medium mb-1">
            The three conditions (least of these applies)
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
        </div>

        <div className="border-t border-ink/10 pt-3 mb-1">
          <div className="ledger-row">
            <span className="label font-medium text-ink">Exempt from tax</span>
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
      <div className="receipt-edge-bottom" />
    </div>
  );
}
