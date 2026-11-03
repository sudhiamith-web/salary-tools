import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Tool from "@/components/hr-tools/FnfCalculator";

export const metadata: Metadata = {
  title: "Full and Final Settlement Calculator: Gratuity, Leave Encashment, Notice Pay and Due Date",
  description: "Work out a full and final settlement: final salary, leave encashment, gratuity, notice recovery and TDS estimate, plus the 2-working-day payment deadline under the Code on Wages. Bulk CSV mode for HR teams.",
  alternates: { canonical: "/tools/full-and-final-settlement-calculator" },
};

const FAQ = [
  {
    question: "When must a full and final settlement be paid?",
    answer:
      "Under the Code on Wages, 2019, within two working days of the employee’s removal, dismissal, retrenchment or resignation.",
  },
  {
    question: "How is leave encashment calculated?",
    answer:
      "Leave days × the daily rate your policy uses, usually wages or gross pay divided by 30 or 26. Pick the basis in the calculator.",
  },
  {
    question: "Can notice shortfall be recovered from the settlement?",
    answer:
      "If the employment terms allow it, the shortfall is usually recovered at gross pay ÷ 30 per day. Turn recovery off if you’re waiving the notice.",
  },
  {
    question: "Is gratuity payable for 4 years 7 months of service?",
    answer:
      "For a permanent employee, generally not: the five-year qualifying period hasn’t been met. Fixed-term employees qualify after one year.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "For HR & Payroll", href: "/" }, { label: "Full & Final Settlement" }]} />
      <header className="mb-8 max-w-3xl">
        <h1 className="mb-3 font-display text-4xl text-ink md:text-5xl">Full & Final Settlement Calculator</h1>
        <p className="text-lg text-charcoal/70">Work out final salary, leave encashment, gratuity, recoveries and an estimated TDS, and the date the settlement is due.</p>
      </header>

      <div className="mb-20">
        <Tool />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "deadline",
              label: "The two-working-day deadline",
              content: (
                <>
                  <p>Section 17(2) of the Code on Wages, 2019 requires wages to be paid within two working days when an employee is removed, dismissed, retrenched or resigns. The calculator counts two working days after the last working day, skipping your weekly offs and any holidays you enter.</p>
                </>
              ),
            },
            {
              id: "gratuity",
              label: "Gratuity in the settlement",
              content: (
                <>
                  <p>Gratuity is 15 days’ wages for each year of service, on a 26-day month. A final part-year of more than six months counts as a full year. Permanent employees qualify after five years; fixed-term employees after one year.</p>
                  <p>Use the wages figure from the <Link href="/tools/labour-code-salary-structure-checker" className="text-accent hover:underline">Salary Structure Checker</Link>, which applies the 50% rule. For gratuity alone, see the <Link href="/tools/gratuity-calculator" className="text-accent hover:underline">Gratuity Calculator</Link>.</p>
                </>
              ),
            },
            {
              id: "tax",
              label: "Tax on the settlement",
              content: (
                <>
                  <p>Gratuity is exempt up to ₹20 lakh and leave encashment up to ₹25 lakh over a lifetime for non-government employees, subject to conditions. Salary, notice pay and other earnings are taxable. The TDS line is a rough estimate; use your payroll’s TDS computation for the actual deduction.</p>
                </>
              ),
            },
          ]}
        />
      </div>

      <section aria-labelledby="faq-heading" className="mb-20 max-w-3xl">
        <h2 id="faq-heading" className="mb-4 text-2xl">
          Frequently asked questions
        </h2>
        <FAQAccordion items={FAQ} />
      </section>

      <RelatedTools currentSlug="full-and-final-settlement-calculator" />
    </div>
  );
}
