import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Tool from "@/components/hr-tools/SalaryStructureChecker";

export const metadata: Metadata = {
  title: "Labour Code Salary Structure Checker: 50% Wage Rule, PF and Gratuity Impact",
  description: "Check a salary structure against the Labour Code 50% wage rule. See the amount added back to wages, the PF and gratuity impact, and a compliant structure. Bulk CSV mode for HR teams.",
  alternates: { canonical: "/tools/labour-code-salary-structure-checker" },
};

const FAQ = [
  {
    question: "What is the 50% wage rule under the Labour Codes?",
    answer:
      "If excluded payments such as HRA, conveyance, overtime and commission are more than half of total remuneration, the excess is added back to wages. Wages then can’t effectively fall below 50% of pay for PF, gratuity and other wage-linked dues.",
  },
  {
    question: "Does the 50% rule increase PF?",
    answer:
      "Only if PF is paid on actual wages above the ₹25,000 ceiling, or if wages were below the ceiling. Where PF is capped at the ceiling and wages are already above it, PF doesn’t change.",
  },
  {
    question: "Does it increase gratuity?",
    answer:
      "Yes, usually. Gratuity is 15 days’ wages per year of service, so a higher wages figure raises gratuity for every year of service.",
  },
  {
    question: "Is employer PF part of the 50% test?",
    answer:
      "Yes. The employer’s PF or pension contribution is exclusion (c) and counts towards the excluded payments in the test.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "For HR & Payroll", href: "/" }, { label: "Salary Structure Checker" }]} />
      <header className="mb-8 max-w-3xl">
        <h1 className="mb-3 font-display text-4xl text-ink md:text-5xl">Labour Code Salary Structure Checker</h1>
        <p className="text-lg text-charcoal/70">Check a salary break-up against the 50% wage rule and see what changes for PF, gratuity and take-home pay.</p>
      </header>

      <div className="mb-20">
        <Tool />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "rule",
              label: "How the 50% rule works",
              content: (
                <>
                  <p>Under section 2(y) of the Code on Wages, 2019, wages means all remuneration, including basic pay, dearness allowance and retaining allowance, minus eleven listed exclusions such as HRA, conveyance, overtime and commission.</p>
                  <p>If the excluded payments in clauses (a) to (i) add up to more than half of all remuneration, the excess is added back to wages. Gratuity and retrenchment compensation, clauses (j) and (k), sit outside this test.</p>
                  <p>Only the excess is added back, not the whole of the excluded allowances. That added-back amount then counts for PF, gratuity and other wage-linked dues.</p>
                </>
              ),
            },
            {
              id: "special-allowance",
              label: "What about special allowance?",
              content: (
                <>
                  <p>Special allowance isn’t named in the exclusion list, so this tool treats it as wages by default. Some advisers read it differently. If your legal advice differs, re-tag the component and the result updates.</p>
                  <p>Once you know the wages figure, use it in the <Link href="/tools/full-and-final-settlement-calculator" className="text-accent hover:underline">Full & Final Settlement Calculator</Link> and the <Link href="/tools/epf-wage-ceiling-calculator" className="text-accent hover:underline">EPF Wage Ceiling Calculator</Link>.</p>
                </>
              ),
            },
            {
              id: "bulk",
              label: "Checking every employee at once",
              content: (
                <>
                  <p>Switch to Bulk (CSV), download the template and fill one row per employee using employee IDs only. The file is read in your browser and is never uploaded or stored. You get a status for every row, the total extra gratuity liability and PF cost, and an export to Excel or PDF.</p>
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

      <RelatedTools currentSlug="labour-code-salary-structure-checker" />
    </div>
  );
}
