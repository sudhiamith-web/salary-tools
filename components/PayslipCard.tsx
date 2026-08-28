import { InHandSalaryResult, formatINR } from "@/lib/calculators/salary";

export default function PayslipCard({ result }: { result: InHandSalaryResult }) {
  return (
    <div className="sticky top-6 space-y-4">
      <div className="hero-box">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
          Estimated monthly take-home
        </p>
        <h3 className="font-display text-3xl text-ink">
          {formatINR(result.netMonthlyInHand)}
        </h3>
      </div>

      <div className="card px-6 py-5">
        <p className="text-xs uppercase tracking-widest text-ledger font-semibold mb-2">
          Earnings (annual)
        </p>
        <div className="ledger-row">
          <span className="label">Basic</span>
          <span className="fill" />
          <span className="value">{formatINR(result.basicAnnual)}</span>
        </div>
        <div className="ledger-row">
          <span className="label">Gross income (post employer PF)</span>
          <span className="fill" />
          <span className="value">{formatINR(result.grossAnnualIncome)}</span>
        </div>

        <p className="text-xs uppercase tracking-widest text-rust font-semibold mt-5 mb-2">
          Deductions (annual)
        </p>
        <div className="ledger-row">
          <span className="label">Employee PF</span>
          <span className="fill" />
          <span className="value">{formatINR(result.employeePFAnnual)}</span>
        </div>
        <div className="ledger-row">
          <span className="label">Income tax (incl. cess)</span>
          <span className="fill" />
          <span className="value">{formatINR(result.incomeTax.totalTax)}</span>
        </div>
        <div className="ledger-row">
          <span className="label">Professional tax</span>
          <span className="fill" />
          <span className="value">{formatINR(result.professionalTaxAnnual)}</span>
        </div>

        <div className="border-t border-slate-200 mt-4 pt-3">
          <div className="ledger-row">
            <span className="label font-semibold text-ink">Net annual in-hand</span>
            <span className="fill" />
            <span className="value text-ledger">{formatINR(result.netAnnualInHand)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
