import type { Metadata } from "next";
import Link from "next/link";
import RetirementCalculator from "@/components/retirement/RetirementCalculator";
import { PageFaq, Sources, type FaqItem } from "@/components/statutory/PageFaq";

const PATH = "/tools/retirement-benefits-calculator";

export const metadata: Metadata = {
  title: "Retirement Benefits & Statutory Deductions Calculator (PF, EPS, NPS, Gratuity, ESI, LWF)",
  description:
    "See what you pay into PF, EPS, NPS, ESI, LWF and Professional Tax each month, and what comes back at retirement — lump sum, pension and gratuity, before and after tax.",
  alternates: { canonical: PATH },
};

const faqs: FaqItem[] = [
  {
    question: "Which salary deductions come back to me at retirement?",
    answer:
      "Your PF and VPF contributions, the employer's EPF share and all interest come back as a lump sum. The employer's EPS share comes back as a monthly pension if you have 10 or more years of service, or as a one-time withdrawal benefit if you have less. NPS comes back as a lump sum plus an annuity. Gratuity and leave encashment are paid by your employer when you leave.",
  },
  {
    question: "Which deductions don't come back?",
    answer:
      "ESI, Labour Welfare Fund and Professional Tax. ESI pays for medical care and cash benefits during sickness, maternity, disablement and unemployment. LWF funds state welfare schemes you can apply for. Professional Tax is a state tax.",
  },
  {
    question: "How does the ₹25,000 PF wage ceiling change my retirement amount?",
    answer:
      "From 17 September 2026 the statutory PF wage ceiling is ₹25,000 instead of ₹15,000. If your PF wage is above ₹15,000, contributions on the capped basis go up, and the employer's EPS share rises to 8.33% of up to ₹25,000. That increases both your EPF corpus and your EPS pension.",
  },
  {
    question: "Is the full 80% NPS lump sum tax-free?",
    answer:
      "No. Since December 2025, non-government subscribers can take up to 80% as a lump sum at normal exit, but the Income Tax Act still exempts only 60% of the corpus. The extra amount is taxed at your slab rate, and annuity income is taxable as well.",
  },
  {
    question: "Why is my gratuity zero?",
    answer:
      "Gratuity needs at least 5 years of continuous service with the same employer, or 1 year for fixed-term employees under the Labour Codes. Changing jobs resets the clock.",
  },
  {
    question: "Does this calculator store my data?",
    answer:
      "No. Everything is calculated in your browser. A share link stores your inputs in the link itself, so only people you send it to can see them.",
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 print:hidden">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/tools" className="hover:underline">Tools</Link> /{" "}
        <span className="text-slate-800">Retirement benefits calculator</span>
      </nav>

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Retirement benefits and salary deductions calculator</h1>
        <p className="text-slate-700">
          Every month your payslip sends money to PF, pension, NPS, ESI, the Labour Welfare Fund and Professional Tax. This
          calculator shows how much goes where, how much comes back when you retire, and what doesn't come back at all.
        </p>
      </header>

      <RetirementCalculator />

      <article className="max-w-3xl space-y-6 leading-relaxed text-slate-800 print:hidden">
        <h2 className="text-2xl font-semibold text-slate-900">How each deduction works</h2>

        <h3 className="text-lg font-semibold">Employees' Provident Fund (EPF)</h3>
        <p>
          You and your employer each put 12% of your PF wage into the fund. All of yours goes to EPF. Of the employer's 12%,
          8.33% of the wage (up to the ceiling) goes to the pension scheme and the rest to EPF. EPF earns interest declared
          each year: 8.25% for FY 2025-26. At retirement the full EPF balance is paid as a lump sum, tax-free if you have at
          least 5 years of continuous service.
        </p>

        <h3 className="text-lg font-semibold">Employees' Pension Scheme (EPS)</h3>
        <p>
          EPS doesn't build a balance you can see. It promises a pension: your average pension wage over the last 60 months
          × years of service ÷ 70, payable from 58. With fewer than 10 years of service you get a one-time withdrawal
          benefit instead. You can start a reduced pension from 50 or defer to 60 for a higher one.
        </p>
        <p>
          The PF wage ceiling rose to ₹25,000 on 17 September 2026. See the{" "}
          <Link href="/tools/epf-wage-ceiling-calculator" className="underline underline-offset-2">
            EPF wage ceiling calculator
          </Link>{" "}
          for how the change affects contributions this month.
        </p>

        <h3 className="text-lg font-semibold">National Pension System (NPS)</h3>
        <p>
          Your employer can contribute to NPS for you, and you can add your own money. At normal exit at 60, non-government
          subscribers can take up to 80% as a lump sum when the corpus is above ₹12 lakh; the rest buys an annuity that pays
          a monthly pension. Only 60% of the corpus is tax-free.
        </p>

        <h3 className="text-lg font-semibold">Gratuity and leave encashment</h3>
        <p>
          Gratuity is 15 days' wages for every year of service: 15/26 × last monthly wage × years. It's payable after 5 years
          with one employer, or 1 year for fixed-term employees, and is tax-free up to ₹20 lakh across your career. Unused
          earned leave paid at retirement is tax-free up to ₹25 lakh.
        </p>

        <h3 className="text-lg font-semibold">What you don't get back</h3>
        <p>
          ESI is health and income insurance for employees whose wage is ₹21,000 a month or less (₹25,000 for persons with
          disability): you pay 0.75%, your employer pays 3.25%.{" "}
          <Link href="/tools/esi-calculator" className="underline underline-offset-2">See what ESI covers</Link>. The Labour
          Welfare Fund is a small state levy that funds welfare schemes for workers and their families.{" "}
          <Link href="/tools/lwf-benefits" className="underline underline-offset-2">See what LWF funds</Link>. Professional
          Tax is a state tax capped at ₹2,500 a year.
        </p>
      </article>

      <div className="max-w-3xl space-y-10 print:hidden">
        <PageFaq items={faqs} />
        <Sources
          items={[
            { label: "EPFO — interest rate for FY 2025-26 and EPF/EPS schemes", href: "https://www.epfindia.gov.in" },
            { label: "PFRDA — NPS exit and withdrawal regulations", href: "https://www.pfrda.org.in" },
            { label: "ESIC — benefits and contributory conditions", href: "https://esic.gov.in/information-benefits" },
            { label: "Income Tax Department — slabs and exemption limits", href: "https://incometaxindia.gov.in" },
          ]}
        />
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Related tools</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li><Link href="/tools/epf-wage-ceiling-calculator" className="underline underline-offset-2">EPF wage ceiling calculator</Link></li>
            <li><Link href="/tools/esi-calculator" className="underline underline-offset-2">ESI calculator and benefits guide</Link></li>
            <li><Link href="/tools/lwf-benefits" className="underline underline-offset-2">Labour Welfare Fund benefits</Link></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
