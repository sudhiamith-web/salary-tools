import type { Metadata } from "next";
import Link from "next/link";
import EsiMiniCalculator from "@/components/statutory/EsiMiniCalculator";
import { PageFaq, Sources, type FaqItem } from "@/components/statutory/PageFaq";

const PATH = "/tools/esi-calculator";

export const metadata: Metadata = {
  title: "ESI Calculator and Benefits Guide: What Your ESI Deduction Covers",
  description:
    "Check if you're covered by ESI under the Labour Code wage rule, see your 0.75% and your employer's 3.25% share, and learn how to claim medical, sickness, maternity and other ESI benefits.",
  alternates: { canonical: PATH },
};

const benefits: { name: string; what: string; condition: string }[] = [
  {
    name: "Medical benefit",
    what: "Full medical care for you and your family at ESI dispensaries and hospitals.",
    condition: "Available once you're insured.",
  },
  {
    name: "Sickness benefit",
    what: "70% of your wages in cash, for up to 91 days a year of certified sickness.",
    condition: "Contributions for 78 days in a six-month contribution period.",
  },
  {
    name: "Extended sickness benefit",
    what: "80% of wages for up to two years for specified long-term diseases.",
    condition: "Longer continuous employment and contribution history.",
  },
  {
    name: "Maternity benefit",
    what: "Full wages for 26 weeks, extendable by one month on medical advice.",
    condition: "Contributions for 70 days in the two preceding contribution periods.",
  },
  {
    name: "Disablement benefit",
    what: "90% of wages while temporarily disabled; a monthly payment for life for permanent disablement, in proportion to lost earning capacity.",
    condition: "Employment injury. Under the Code on Social Security, accidents while commuting between home and work also count.",
  },
  {
    name: "Dependants' benefit",
    what: "90% of wages paid monthly to dependants if an insured person dies from an employment injury.",
    condition: "Death due to employment injury or occupational disease.",
  },
  {
    name: "Unemployment allowance",
    what: "50% of wages for up to two years in your lifetime, with continued medical care for you and your family.",
    condition: "Involuntary loss of employment, subject to ESIC's eligibility rules.",
  },
  {
    name: "Funeral expenses",
    what: "Up to ₹15,000 towards the funeral of an insured person.",
    condition: "Paid to the family or the person who performs the last rites.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "Who is covered by ESI?",
    answer:
      "Employees whose wage is ₹21,000 a month or less, or ₹25,000 for persons with disability, in establishments covered by ESI. ESIC has confirmed the ceiling hasn't changed under the Code on Social Security.",
  },
  {
    question: "Why am I covered even though my gross pay is above ₹21,000?",
    answer:
      "Under the Code on Social Security, ESI tests your 'wage' — Basic + DA, with allowances above 50% of total pay added back. Someone with high allowances can have gross pay above ₹21,000 but a Code wage at or below it.",
  },
  {
    question: "Do I get my ESI contributions back?",
    answer:
      "No. ESI is insurance, not savings. Your 0.75% and your employer's 3.25% pay for the medical care and cash benefits you can claim while you're covered.",
  },
  {
    question: "How do I use ESI?",
    answer:
      "Get your insurance number and e-Pehchan card from your employer, link your family members, and visit your allotted ESI dispensary. Cash benefits like sickness or maternity pay are claimed through your ESIC branch office with the medical certificates ESIC requires.",
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/tools" className="hover:underline">Tools</Link> /{" "}
        <span className="text-slate-800">ESI calculator</span>
      </nav>

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">ESI calculator and benefits guide</h1>
        <p className="text-slate-700">
          ESI is the one payslip deduction that works like health and income insurance. Check whether you're covered, what you
          pay, and what you can claim.
        </p>
      </header>

      <EsiMiniCalculator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">What your ESI contribution gets you</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-slate-600">
                <th className="py-2 pr-4 font-medium">Benefit</th>
                <th className="py-2 pr-4 font-medium">What you get</th>
                <th className="py-2 font-medium">When you qualify</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map((b) => (
                <tr key={b.name} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4 font-medium text-slate-900">{b.name}</td>
                  <td className="py-3 pr-4 text-slate-700">{b.what}</td>
                  <td className="py-3 text-slate-600">{b.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Contributory conditions are summarised. ESIC's benefits page has the exact rules.
        </p>
      </section>

      <section className="max-w-3xl space-y-3 leading-relaxed text-slate-800">
        <h2 className="text-2xl font-semibold text-slate-900">How to make the most of ESI</h2>
        <p>
          Register your family on the ESIC portal as soon as you're covered, so they can use ESI hospitals too. Keep your
          e-Pehchan card and insurance number handy. For a hospital visit, start at your allotted dispensary; it refers you to
          an ESI hospital or a tie-up hospital when needed.
        </p>
        <p>
          If you're on certified sick leave, ask the ESI doctor for the certificate ESIC needs, then claim sickness benefit
          through your branch office. Women employees should claim maternity benefit the same way. If you lose your job, check
          the unemployment allowance before your coverage lapses.
        </p>
        <p>
          ESI stops once your wage crosses the ceiling. The{" "}
          <Link href="/tools/retirement-benefits-calculator" className="underline underline-offset-2">
            retirement benefits calculator
          </Link>{" "}
          shows when that's likely to happen with your salary growth.
        </p>
      </section>

      <div className="max-w-3xl space-y-10">
        <PageFaq items={faqs} />
        <Sources
          items={[
            { label: "ESIC — benefits and contributory conditions", href: "https://esic.gov.in/information-benefits" },
            { label: "ESIC — official website", href: "https://esic.gov.in" },
          ]}
        />
      </div>
    </main>
  );
}
