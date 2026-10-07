import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC, { FormulaBox } from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import SourceDocuments from "@/components/SourceDocuments";
import RelatedTools from "@/components/RelatedTools";
import RetirementCalculator from "@/components/retirement/RetirementCalculator";
import { getAllLwfRules } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";

// Refetch verified LWF rules on the same schedule as the compliance pages.
export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Retirement Benefits & Salary Deductions Calculator: PF, EPS, NPS, Gratuity, ESI, LWF",
  description:
    "See what you pay into PF, EPS, NPS, ESI, LWF and Professional Tax each month, and what comes back at retirement: lump sum, pension and gratuity, before and after tax.",
  alternates: { canonical: "/tools/retirement-benefits-calculator" },
};

const FAQ = [
  {
    question: "Which salary deductions come back to me at retirement?",
    answer:
      "Your PF and VPF, the employer's EPF share and all interest come back as a lump sum. The employer's EPS share comes back as a monthly pension with 10 or more years of service, or a one-time withdrawal benefit with less. NPS comes back as a lump sum plus an annuity. Gratuity and leave encashment are paid by your employer when you leave.",
  },
  {
    question: "Which deductions don't come back?",
    answer:
      "ESI, Labour Welfare Fund and Professional Tax. ESI pays for medical care and cash benefits during sickness, maternity, disablement and unemployment. LWF funds state welfare schemes you can apply for. Professional Tax is a state tax.",
  },
  {
    question: "How does the ₹25,000 PF wage ceiling change my retirement amount?",
    answer:
      "From 17 September 2026 the PF wage ceiling is ₹25,000 instead of ₹15,000. If your PF wage is above ₹15,000, contributions on the capped basis go up, and the employer's EPS share rises to 8.33% of up to ₹25,000. Both your EPF corpus and your EPS pension increase. The EPF Wage Ceiling Calculator shows the month-by-month change.",
  },
  {
    question: "Is the full 80% NPS lump sum tax-free?",
    answer:
      "No. Since December 2025, non-government subscribers can take up to 80% as a lump sum at normal exit when the corpus is above ₹12 lakh, but the Income Tax Act still exempts only 60% of the corpus. The rest is taxed at your slab rate, and annuity income is taxable too.",
  },
  {
    question: "Why does the calculator show no gratuity?",
    answer:
      "Gratuity needs 5 years of continuous service with the same employer, or 1 year for fixed-term employees under the Labour Codes. Changing jobs resets the clock. Use the job-switch section to see how often switching costs you gratuity.",
  },
  {
    question: "Does this calculator store my data?",
    answer:
      "No. Everything is calculated in your browser. A share link carries your inputs inside the link itself, so only people you send it to can see them.",
  },
];

export default async function RetirementBenefitsCalculatorPage() {
  const lwfRules = await getAllLwfRules();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Calculators", href: "/" },
            { label: "Retirement Benefits Calculator" },
          ]}
        />
      </div>
      <h1 className="text-3xl mb-2">Retirement Benefits & Salary Deductions Calculator</h1>
      <p className="text-charcoal/60 mb-10 max-w-2xl">
        See what your payslip sends to PF, pension, NPS, ESI, the Labour Welfare Fund and Professional Tax, how much comes back
        when you retire, and what never comes back.
      </p>

      <RetirementCalculator lwfRules={lwfRules} />

      <div className="mb-20 print:hidden">
        <ArticleWithTOC
          sections={[
            {
              id: "pf-eps",
              label: "PF and EPS",
              content: (
                <>
                  <p>
                    You and your employer each pay 12% of your PF wage. All of yours goes to EPF. Of the employer&apos;s 12%, 8.33%
                    of the wage (up to the ceiling) goes to the Employees&apos; Pension Scheme and the rest to EPF. EPF earns the
                    rate EPFO declares each year: 8.25% for FY 2025-26. The full EPF balance is paid as a lump sum when you retire,
                    tax-free with at least 5 years of continuous service.
                  </p>
                  <p>EPS doesn&apos;t build a balance you can withdraw. It pays a pension from 58:</p>
                  <FormulaBox>EPS pension = pensionable salary × years of service ÷ 70</FormulaBox>
                  <p>
                    Pensionable salary is the average pension wage of your last 60 months. With fewer than 10 years of service you
                    get a one-time withdrawal benefit instead. The PF ceiling rose to ₹25,000 on 17 September 2026; the{" "}
                    <Link href="/tools/epf-wage-ceiling-calculator" className="text-accent hover:underline">
                      EPF Wage Ceiling Calculator
                    </Link>{" "}
                    shows how that changes this month&apos;s contribution.
                  </p>
                </>
              ),
            },
            {
              id: "nps",
              label: "NPS",
              content: (
                <>
                  <p>
                    Your employer can contribute to NPS for you, and you can add your own money. At normal exit at 60,
                    non-government subscribers with a corpus above ₹12 lakh can take up to 80% as a lump sum; the rest buys an
                    annuity that pays a monthly pension.
                  </p>
                  <FormulaBox>Tax-free lump sum = up to 60% of corpus{"\n"}Taxable = lump sum above 60% + all annuity income</FormulaBox>
                  <p>
                    Retiring before 60 counts as a premature exit: 80% must buy an annuity. You can usually stay invested until 60
                    instead.
                  </p>
                </>
              ),
            },
            {
              id: "gratuity-leave",
              label: "Gratuity and leave",
              content: (
                <>
                  <p>
                    Gratuity is worked out exactly as in our{" "}
                    <Link href="/tools/gratuity-calculator" className="text-accent hover:underline">
                      Gratuity Calculator
                    </Link>
                    , including the Labour Codes&apos; 50% wage rule and the 1-year rule for fixed-term employees.
                  </p>
                  <FormulaBox>Gratuity = (15 / 26) × wage base × years of service</FormulaBox>
                  <p>
                    Up to ₹20 lakh of gratuity is tax-free across your career. Unused earned leave paid out when you retire is
                    tax-free up to ₹25 lakh.
                  </p>
                </>
              ),
            },
            {
              id: "not-returned",
              label: "What you don't get back",
              content: (
                <>
                  <p>
                    <strong>ESI</strong> is health and income insurance for employees whose wage is ₹21,000 a month or less
                    (₹25,000 for persons with disability). You pay 0.75% and your employer pays 3.25%.{" "}
                    <Link href="/tools/esi-calculator" className="text-accent hover:underline">
                      See what ESI covers
                    </Link>
                    .
                  </p>
                  <p>
                    <strong>Labour Welfare Fund</strong> is a small state levy that funds welfare schemes for workers and their
                    families.{" "}
                    <Link href="/tools/lwf-benefits" className="text-accent hover:underline">
                      See what LWF pays for
                    </Link>
                    .
                  </p>
                  <p>
                    <strong>Professional Tax</strong> is a state tax, capped at ₹2,500 a year.
                  </p>
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="mb-20 max-w-3xl print:hidden">
        <SourceDocuments
          documents={[
            {
              title: "Gazette notification S.O. 5109(E): EPF wage ceiling",
              description: "Raises the EPF wage ceiling from ₹15,000 to ₹25,000.",
              href: "/documents/epfo-wage-ceiling-gazette-notification-so-5109e-17-sep-2026.pdf",
              issuer: "Ministry of Labour & Employment",
              date: "17 September 2026",
            },
          ]}
        />
      </div>

      <div className="mb-20 print:hidden">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion items={FAQ} />
      </div>

      <div className="print:hidden">
        <RelatedTools currentSlug="retirement-benefits-calculator" />
      </div>
    </div>
  );
}
