import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC, { FormulaBox } from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import EsiMiniCalculator from "@/components/statutory/EsiMiniCalculator";

export const metadata: Metadata = {
  title: "ESI Calculator and Benefits Guide: Coverage, Contribution and What ESI Covers",
  description:
    "Check if you're covered by ESI under the Labour Code wage rule, see your 0.75% and your employer's 3.25% share, and learn how to claim medical, sickness, maternity and other ESI benefits.",
  alternates: { canonical: "/tools/esi-calculator" },
};

// Benefit summary. Source: ESIC, Information - Benefits
// (esic.gov.in/information-benefits), checked Oct 2026. Commuting
// accidents: Code on Social Security, 2020, in force 21 Nov 2025.
const BENEFITS: { name: string; what: string; condition: string }[] = [
  { name: "Medical benefit", what: "Full medical care for you and your family at ESI dispensaries and hospitals.", condition: "Available once you're insured." },
  { name: "Sickness benefit", what: "70% of wages in cash for up to 91 days a year of certified sickness.", condition: "Contributions for 78 days in a six-month contribution period." },
  { name: "Extended sickness benefit", what: "80% of wages for up to two years for specified long-term diseases.", condition: "Longer continuous employment and contribution history." },
  { name: "Maternity benefit", what: "Full wages for 26 weeks, extendable by one month on medical advice.", condition: "Contributions for 70 days in the two preceding contribution periods." },
  {
    name: "Disablement benefit",
    what: "90% of wages while temporarily disabled; a monthly payment for life for permanent disablement, in proportion to lost earning capacity.",
    condition: "Employment injury. Accidents while commuting between home and work now count too.",
  },
  { name: "Dependants' benefit", what: "90% of wages paid monthly to dependants if an insured person dies from an employment injury.", condition: "Death due to employment injury or occupational disease." },
  { name: "Unemployment allowance", what: "50% of wages for up to two years in your lifetime, with continued medical care.", condition: "Involuntary loss of employment, subject to ESIC's eligibility rules." },
  { name: "Funeral expenses", what: "Up to ₹15,000 towards the funeral of an insured person.", condition: "Paid to the family or the person who performs the last rites." },
];

const FAQ = [
  {
    question: "Who is covered by ESI?",
    answer:
      "Employees whose wage is ₹21,000 a month or less, or ₹25,000 for persons with disability, in establishments covered by ESI. ESIC has confirmed these ceilings still apply under the Code on Social Security.",
  },
  {
    question: "Why am I covered even though my gross pay is above ₹21,000?",
    answer:
      "Under the Code on Social Security, ESI tests your 'wage': Basic + DA, with allowances above 50% of total pay added back. Someone with high allowances can have gross pay above ₹21,000 but a Code wage at or below it.",
  },
  {
    question: "Do I get my ESI contributions back?",
    answer:
      "No. ESI is insurance, not savings. Your 0.75% and your employer's 3.25% pay for the medical care and cash benefits you can claim while you're covered.",
  },
  {
    question: "How do I start using ESI?",
    answer:
      "Get your insurance number and e-Pehchan card from your employer, add your family members, and visit your allotted ESI dispensary. Cash benefits like sickness or maternity pay are claimed through your ESIC branch office with the certificates ESIC asks for.",
  },
  {
    question: "What happens when my pay crosses the ceiling?",
    answer:
      "Your coverage ends and contributions stop. The Retirement Benefits Calculator shows roughly when that happens at your expected salary growth.",
  },
];

export default function EsiCalculatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/" }, { label: "ESI Calculator" }]} />
      <h1 className="text-3xl mb-2">ESI Calculator and Benefits Guide</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Check whether you&apos;re covered by ESI, what you and your employer pay, and what you can claim in return.
      </p>

      <EsiMiniCalculator />

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "how-calculated",
              label: "How ESI is calculated",
              content: (
                <>
                  <p>
                    ESI applies when your wage is ₹21,000 a month or less (₹25,000 for persons with disability). Since the Code on
                    Social Security took effect on 21 November 2025, ESIC tests the Code&apos;s definition of wages, not just gross
                    pay.
                  </p>
                  <FormulaBox>
                    Code wage = larger of (Basic + DA) and 50% of gross{"\n"}You pay = 0.75% of wage{"\n"}Employer pays = 3.25% of
                    wage
                  </FormulaBox>
                  <p>ESIC rounds each contribution up to the next rupee.</p>
                </>
              ),
            },
            {
              id: "benefits",
              label: "What ESI gets you",
              content: (
                <>
                  <div className="card-flat overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead className="bg-paperDark text-left text-charcoal/60">
                        <tr>
                          <th className="px-4 py-2 font-medium">Benefit</th>
                          <th className="px-4 py-2 font-medium">What you get</th>
                          <th className="px-4 py-2 font-medium">When you qualify</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 align-top">
                        {BENEFITS.map((b) => (
                          <tr key={b.name}>
                            <td className="px-4 py-3 font-medium text-ink">{b.name}</td>
                            <td className="px-4 py-3">{b.what}</td>
                            <td className="px-4 py-3 text-charcoal/60">{b.condition}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-charcoal/50">
                    Conditions are summarised. ESIC&apos;s{" "}
                    <a href="https://esic.gov.in/information-benefits" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      benefits page
                    </a>{" "}
                    has the exact rules.
                  </p>
                </>
              ),
            },
            {
              id: "using-esi",
              label: "How to use it",
              content: (
                <>
                  <p>
                    Add your family on the ESIC portal as soon as you&apos;re covered so they can use ESI hospitals too, and keep
                    your e-Pehchan card and insurance number handy. For treatment, start at your allotted dispensary; it refers
                    you to an ESI or tie-up hospital when needed.
                  </p>
                  <p>
                    On certified sick leave, get the certificate from the ESI doctor and claim sickness benefit through your
                    branch office. Maternity benefit is claimed the same way. If you lose your job, check the unemployment
                    allowance before your coverage lapses.
                  </p>
                  <p>
                    ESI is one of the deductions that never comes back as money. See how it fits with PF, NPS and gratuity in the{" "}
                    <Link href="/tools/retirement-benefits-calculator" className="text-accent hover:underline">
                      Retirement Benefits Calculator
                    </Link>
                    .
                  </p>
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion items={FAQ} />
      </div>

      <RelatedTools currentSlug="esi-calculator" />
    </div>
  );
}
