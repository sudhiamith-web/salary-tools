import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Tool from "@/components/hr-tools/IncrementPlanner";

export const metadata: Metadata = {
  title: "Salary Increment Planner: Merit Matrix, Budget and PF/Gratuity Cost Impact",
  description: "Plan salary increments with a merit matrix (rating × compa-ratio). See the budget vs planned spend, new CTCs and the extra employer PF and gratuity cost. Team CSV upload stays in your browser.",
  alternates: { canonical: "/tools/salary-increment-planner" },
};

const FAQ = [
  {
    question: "What is a compa-ratio?",
    answer:
      "Salary divided by the midpoint of its pay range. 1.0 means at the midpoint; below 0.9 is low in the range.",
  },
  {
    question: "Does the increment raise PF?",
    answer:
      "If wages are below the ₹25,000 ceiling, or PF is paid on full wages, yes. The planner shows the extra employer PF.",
  },
  {
    question: "Is my team file uploaded?",
    answer:
      "No. The file is read and calculated in your browser. Use employee IDs only and leave out names and other personal details.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "For HR & Payroll", href: "/" }, { label: "Increment Planner" }]} />
      <header className="mb-8 max-w-3xl">
        <h1 className="mb-3 font-display text-4xl text-ink md:text-5xl">Salary Increment Budget Planner</h1>
        <p className="text-lg text-charcoal/70">Set a merit matrix, apply it to your team and see the budget, the new CTCs and the extra PF and gratuity cost.</p>
      </header>

      <div className="mb-20">
        <Tool />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "matrix",
              label: "How a merit matrix works",
              content: (
                <>
                  <p>A merit matrix sets the increment % by two things: the performance rating and where the employee sits in the pay range (compa-ratio, salary ÷ range midpoint). Employees lower in the range get more for the same rating, so pay moves towards the midpoint over time.</p>
                </>
              ),
            },
            {
              id: "cost",
              label: "The cost beyond the increment",
              content: (
                <>
                  <p>An increment also raises wage-linked costs. The planner adds the extra employer PF (12%, on the ₹25,000 ceiling or full wages) and the extra gratuity provision (15/26 of a month’s wages per year of service).</p>
                  <p>Check that new structures still meet the 50% rule with the <Link href="/tools/labour-code-salary-structure-checker" className="text-accent hover:underline">Salary Structure Checker</Link>.</p>
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

      <RelatedTools currentSlug="salary-increment-planner" />
    </div>
  );
}
