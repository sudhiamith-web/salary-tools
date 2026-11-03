import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import Tool from "@/components/hr-tools/ComplianceCalendar";

export const metadata: Metadata = {
  title: "Payroll Compliance Calendar 2026: PF, ESI, TDS, Professional Tax and LWF Due Dates",
  description: "Monthly payroll compliance calendar for India: PF, ESI and TDS due dates plus state-wise professional tax and LWF dates, with sources. Download to Google or Outlook Calendar.",
  alternates: { canonical: "/tools/payroll-compliance-calendar" },
};

const FAQ = [
  {
    question: "When is PF due each month?",
    answer:
      "By the 15th of the following month.",
  },
  {
    question: "When is TDS on salary deposited?",
    answer:
      "By the 7th of the following month. TDS deducted in March is due by 30 April.",
  },
  {
    question: "Is ESI due on the 15th or 21st?",
    answer:
      "The 15th of the following month. Some older guides still mention the 21st.",
  },
  {
    question: "Why do some dates say Verify?",
    answer:
      "Published sources disagree, or only one source was found. Confirm those dates with the state department before relying on them.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "For HR & Payroll", href: "/" }, { label: "Payroll Compliance Calendar" }]} />
      <header className="mb-8 max-w-3xl">
        <h1 className="mb-3 font-display text-4xl text-ink md:text-5xl">Payroll Compliance Calendar</h1>
        <p className="text-lg text-charcoal/70">Every PF, ESI, TDS, professional tax and LWF due date for your states, month by month. Add it to Google or Outlook Calendar.</p>
      </header>

      <div className="mb-20">
        <Tool />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "central",
              label: "Central due dates",
              content: (
                <>
                  <p>TDS on salaries is deposited by the 7th of the next month (March deductions by 30 April). PF and ESI contributions are due by the 15th of the next month. Quarterly salary TDS returns and the statutory bonus deadline are also shown.</p>
                </>
              ),
            },
            {
              id: "states",
              label: "State dates and how they’re checked",
              content: (
                <>
                  <p>Professional tax and Labour Welfare Fund dates vary by state. Each state is added only after its dates are checked against published sources, and every item links to them. Items marked Verify have sources that disagree or a single source; confirm them before you rely on them.</p>
                  <p>For state LWF amounts, see the <Link href="/tools/lwf-calculator" className="text-accent hover:underline">LWF Calculator</Link>.</p>
                </>
              ),
            },
            {
              id: "reminders",
              label: "Getting reminders",
              content: (
                <>
                  <p>Add to calendar downloads an .ics file with 12 months of due dates for your states. Import it into Google Calendar, Outlook or Apple Calendar.</p>
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

      <RelatedTools currentSlug="payroll-compliance-calendar" />
    </div>
  );
}
