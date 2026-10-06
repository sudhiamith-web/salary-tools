import type { Metadata } from "next";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import LwfCalculator from "@/components/compliance/LwfCalculator";
import { ComplianceBreadcrumb, Disclaimer } from "@/components/compliance/Shared";
import { getAllLwfRules } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";

export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "LWF Calculator: Labour Welfare Fund Cost by State",
  description:
    "Calculate Labour Welfare Fund contributions for any state: employee deduction, employer share, yearly cost for your headcount, deduction months and due dates.",
  alternates: { canonical: "/tools/lwf-calculator" },
};

const FAQ = [
  {
    question: "How is LWF calculated?",
    answer:
      "Most states charge a fixed amount per employee per cycle, split between employee and employer. A few use wage bands or a percentage of wages with a cap. The calculator applies the verified rule for the state you pick and multiplies by the number of cycles in a year and your headcount.",
  },
  {
    question: "Does LWF apply to every employee?",
    answer:
      "Not always. Some states apply LWF only to establishments above a minimum headcount, or exclude employees above a wage limit or in managerial roles. The calculator tells you when a rule excludes your inputs; the state page has the full coverage notes.",
  },
  {
    question: "Which salary month should the deduction appear in?",
    answer:
      "For monthly states, every month. For half-yearly and yearly states, only in the specified months, which the calculator shows for the selected state.",
  },
];

export default async function LwfCalculatorPage() {
  const rules = await getAllLwfRules();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb items={[{ label: "LWF calculator", href: "/tools/lwf-calculator" }]} />
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">LWF calculator</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          Pick a state, enter your headcount, and see what you deposit with the Labour Welfare Board each year. Only
          states verified against their official notification are listed.{" "}
          <Link href="/lwf-rates" className="text-accent hover:underline">See all state rates</Link>.
        </p>
      </header>
      <LwfCalculator rules={rules} />
      <section aria-labelledby="faq-heading" className="mt-16 max-w-3xl">
        <h2 id="faq-heading" className="text-2xl font-semibold text-ink mb-4">Frequently asked questions</h2>
        <FAQAccordion items={FAQ} />
      </section>
      <div className="mt-12 space-y-12">
        <Disclaimer />
        <RelatedTools currentSlug="lwf-calculator" />
      </div>
    </div>
  );
}
