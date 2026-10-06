import type { Metadata } from "next";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import MinimumWageChecker from "@/components/compliance/MinimumWageChecker";
import { ComplianceBreadcrumb, Disclaimer } from "@/components/compliance/Shared";
import { getWageHub } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";
import { getRegion } from "@/lib/compliance/states";

export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Minimum Wage Checker: Is This Salary Compliant?",
  description:
    "Check a salary against the current state minimum wage for any category and zone, including the Code on Wages 50% rule. Shows the monthly and yearly shortfall.",
  alternates: { canonical: "/tools/minimum-wage-checker" },
};

const FAQ = [
  {
    question: "Which salary components count towards the minimum wage?",
    answer:
      "Under the Code on Wages, 2019, wages means basic pay, dearness allowance and retaining allowance. Other allowances are excluded, but if they add up to more than half of total pay, the excess counts as wages. The checker applies this rule when you enter other allowances.",
  },
  {
    question: "What happens if pay is below the minimum wage?",
    answer:
      "Paying less than the notified minimum is an offence under the Code on Wages, and the employer must pay the shortfall. Use the result here as a first check and confirm against the state notification.",
  },
  {
    question: "Why does the checker ask for a zone?",
    answer:
      "Many states fix different rates for different areas, usually higher in cities. The state page lists which districts or cities fall in each zone.",
  },
];

export default async function MinimumWageCheckerPage() {
  const all = await getWageHub();
  const states = Array.from(new Set(all.map((n) => n.state)))
    .map((slug) => ({ slug, name: getRegion(slug)?.name ?? slug }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb items={[{ label: "Minimum wage checker", href: "/tools/minimum-wage-checker" }]} />
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Minimum wage checker</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          Choose the state, employment, category and zone, then enter the pay. You&apos;ll see whether it meets the
          current notified minimum and, if not, the shortfall.{" "}
          <Link href="/minimum-wages" className="text-accent hover:underline">Browse all state rates</Link>.
        </p>
      </header>
      {states.length > 0 ? (
        <MinimumWageChecker states={states} />
      ) : (
        <p className="text-sm text-charcoal/70">State rates are being verified. Check back soon.</p>
      )}
      <section aria-labelledby="faq-heading" className="mt-16 max-w-3xl">
        <h2 id="faq-heading" className="text-2xl font-semibold text-ink mb-4">Frequently asked questions</h2>
        <FAQAccordion items={FAQ} />
      </section>
      <div className="mt-12 space-y-12">
        <Disclaimer />
        <RelatedTools currentSlug="minimum-wage-checker" />
      </div>
    </div>
  );
}
