import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Tool from "@/components/hr-tools/BonusCalculator";

export const metadata: Metadata = {
  title: "Statutory Bonus Calculator 2026: Eligibility ₹21,000, Calculation Ceiling and Deadline",
  description: "Check statutory bonus eligibility under the Code on Wages (₹21,000 wage ceiling) and calculate the bonus at 8.33% to 20% on ₹7,000 or the minimum wage. Bulk CSV bonus register for HR teams.",
  alternates: { canonical: "/tools/statutory-bonus-calculator" },
};

const FAQ = [
  {
    question: "What is the bonus eligibility limit in 2026?",
    answer:
      "₹21,000 a month in wages (basic + DA), notified under the Code on Wages on 25 August 2026.",
  },
  {
    question: "Is bonus calculated on full salary?",
    answer:
      "No. It’s calculated on ₹7,000 a month or the applicable minimum wage, whichever is higher, or on actual wages if they’re below that.",
  },
  {
    question: "What is the minimum statutory bonus?",
    answer:
      "8.33% of the calculation base, or ₹100, whichever is higher.",
  },
  {
    question: "When is the bonus payment deadline?",
    answer:
      "Within eight months of the accounting year’s close – 30 November for an April–March year.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "For HR & Payroll", href: "/" }, { label: "Statutory Bonus" }]} />
      <header className="mb-8 max-w-3xl">
        <h1 className="mb-3 font-display text-4xl text-ink md:text-5xl">Statutory Bonus Calculator</h1>
        <p className="text-lg text-charcoal/70">Check bonus eligibility under the Code on Wages and work out the bonus at any rate from 8.33% to 20%.</p>
      </header>

      <div className="mb-20">
        <Tool />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "eligibility",
              label: "Who is eligible",
              content: (
                <>
                  <p>Employees whose wages (basic + DA) are up to ₹21,000 a month and who worked at least 30 days in the accounting year are eligible. The ceiling was notified on 25 August 2026 (S.O. 4711(E)), with effect from 21 November 2025.</p>
                </>
              ),
            },
            {
              id: "calculation",
              label: "How bonus is calculated",
              content: (
                <>
                  <p>The bonus is worked out on ₹7,000 a month or the applicable minimum wage, whichever is higher (S.O. 4710(E)), or on actual wages if they’re lower. The rate is at least 8.33% and at most 20%, depending on the allocable surplus. Find the minimum wage with the <Link href="/tools/minimum-wage-checker" className="text-accent hover:underline">Minimum Wage Checker</Link>.</p>
                </>
              ),
            },
            {
              id: "deadline",
              label: "When to pay",
              content: (
                <>
                  <p>Bonus is due within eight months of the close of the accounting year. For an April–March year, that’s 30 November.</p>
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

      <RelatedTools currentSlug="statutory-bonus-calculator" />
    </div>
  );
}
