import { InHandSalaryResult, formatINR } from "@/lib/calculators/salary";

export default function PayslipCard({ result }: { result: InHandSalaryResult }) {
  return (
    <div className="sticky top-6">
      <div className="receipt-edge-top" />
      <div className="bg-white px-6 py-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
          Estimated payslip — monthly
        </p>
        <h3 className="font-display text-3xl text-ink mb-6">
          {formatINR(result.netMonthlyInHand)}
        </h3>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-ledger font-medium mb-1">
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
        </div>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-rust font-medium mb-1">
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
        </div>

        <div className="border-t border-ink/10 pt-3">
          <div className="ledger-row">
            <span className="label font-medium text-ink">Net annual in-hand</span>
            <span className="fill" />
            <span className="value text-ledger">{formatINR(result.netAnnualInHand)}</span>
          </div>
        </div>
      </div>
      <div className="receipt-edge-bottom" />
    </div>
  );
}
