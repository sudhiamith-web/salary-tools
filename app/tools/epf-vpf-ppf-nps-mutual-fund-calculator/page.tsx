import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import SavingsCompareCalculator from "@/components/savings-compare/SavingsCompareCalculator";

export const metadata: Metadata = {
  title: "EPF vs VPF vs PPF vs NPS vs Mutual Fund Calculator (After Tax, FY 2026-27)",
  description:
    "Compare EPF, VPF, PPF, NPS and mutual funds after tax. See how much of your salary actually gets invested under the old and new regimes, and what you keep at retirement.",
  alternates: { canonical: "/tools/epf-vpf-ppf-nps-mutual-fund-calculator" },
};

const FAQ = [
  {
    question: "Is EPF or NPS invested before tax?",
    answer:
      "Only the employer's share is invested before tax in both regimes: employer EPF up to 12% of basic, and employer NPS up to 14% of basic in the new regime or 10% in the old regime (private sector). Your own EPF, VPF and NPS contributions are deductible only in the old regime, and only within the ₹1.5 lakh 80C limit plus the extra ₹50,000 for NPS.",
  },
  {
    question: "Which is better in the new tax regime: VPF, PPF, NPS or a mutual fund?",
    answer:
      "In the new regime your own contributions to VPF, PPF, NPS and mutual funds all come from after-tax salary, so the difference is in returns, tax at withdrawal and lock-in. Employer NPS is the exception: it's still tax-free up to 14% of basic, so more of each rupee gets invested. Whether that beats an equity fund depends on the returns you assume — use the calculator's scenarios to test it.",
  },
  {
    question: "Is VPF interest tax-free?",
    answer:
      "Interest is tax-free on your own EPF and VPF contributions of up to ₹2.5 lakh a year combined. Interest on contributions above that is taxable every year. Withdrawals are tax-free after five years of continuous service.",
  },
  {
    question: "How much of my NPS can I withdraw tax-free at 60?",
    answer:
      "Since PFRDA's December 2025 rules, non-government subscribers with a corpus above ₹12 lakh can take up to 80% as a lump sum. But only 60% of the corpus is tax-free under income-tax law. The extra 20% and the pension from the annuity are taxed at your slab rate.",
  },
  {
    question: "How are mutual fund gains taxed at retirement?",
    answer:
      "For equity funds, long-term gains above ₹1.25 lakh in a year are taxed at 12.5% plus cess. The calculator assumes you sell everything at retirement, which is the most conservative case. Selling in stages over several years can lower the tax.",
  },
  {
    question: "Can I put more than ₹1.5 lakh a year in PPF?",
    answer:
      "No. PPF accepts up to ₹1.5 lakh per financial year. In the calculator, any amount above that is capped and flagged.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/" },
          { label: "EPF vs VPF vs PPF vs NPS vs Mutual Fund" },
        ]}
      />

      <header className="mb-10 max-w-3xl">
        <h1 className="mb-3 font-display text-4xl text-ink md:text-5xl">EPF vs VPF vs PPF vs NPS vs Mutual Fund Calculator</h1>
        <p className="text-lg text-charcoal/70">
          See what each option leaves you after tax – at the start, while it grows, and when you withdraw. Works for both the old and new tax
          regimes.
        </p>
      </header>

      <div className="mb-20">
        <SavingsCompareCalculator />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "pre-tax-vs-after-tax",
              label: "Pre-tax vs after-tax rupees",
              content: (
                <>
                  <p>
                    A rupee invested before tax has a head start that compounds for decades. At the 30% slab, ₹10,000 of salary becomes only
                    about ₹6,880 once income tax and cess are taken out. A route that invests the full ₹10,000 starts roughly 45% ahead.
                  </p>
                  <p>
                    That head start depends on who contributes and which regime you&apos;re in. Your employer&apos;s EPF and NPS contributions
                    go in before tax in both regimes. Your own EPF, VPF, PPF, NPS and ELSS contributions only get a deduction in the old
                    regime, and they share the same ₹1.5 lakh 80C limit. In the new regime they all come from take-home pay, just like a
                    regular mutual fund SIP.
                  </p>
                </>
              ),
            },
            {
              id: "tax-at-withdrawal",
              label: "Tax when you withdraw",
              content: (
                <>
                  <p>
                    A pre-tax start doesn&apos;t mean a tax-free finish. EPF, VPF and PPF are tax-free at withdrawal (EPF after five years of
                    continuous service). NPS gives back some of its head start: only 60% of the corpus is tax-free, and the extra lump sum and
                    the pension are taxed. Mutual funds are taxed only on gains, at 12.5% above ₹1.25 lakh for equity.
                  </p>
                  <p>
                    That&apos;s why the calculator shows three numbers for every option: what actually gets invested, the value before exit
                    tax, and what you keep after it. Use the <strong>Before tax / After tax</strong> switch on the growth chart to see both
                    views year by year.
                  </p>
                </>
              ),
            },
            {
              id: "limits",
              label: "Limits that change the answer",
              content: (
                <>
                  <p>
                    <strong>₹2.5 lakh EPF + VPF rule:</strong> interest on your own contributions above ₹2.5 lakh a year is taxable every
                    year, which lowers the VPF return for high earners.
                  </p>
                  <p>
                    <strong>Employer NPS:</strong> tax-free up to 14% of basic + DA in the new regime and 10% in the old regime (private
                    sector). Employer EPF, NPS and superannuation together are tax-free only up to ₹7.5 lakh a year.
                  </p>
                  <p>
                    <strong>PPF:</strong> ₹1.5 lakh a year at most, with a 15-year lock-in that you can extend in five-year blocks.
                  </p>
                  <p>
                    For the full picture of what your salary deductions pay back at retirement, try the{" "}
                    <Link href="/tools/retirement-benefits-calculator" className="text-accent hover:underline">
                      Retirement Benefits Calculator
                    </Link>
                    . To check your EPF on the new ₹25,000 wage ceiling, use the{" "}
                    <Link href="/tools/epf-wage-ceiling-calculator" className="text-accent hover:underline">
                      EPF Wage Ceiling Calculator
                    </Link>
                    .
                  </p>
                </>
              ),
            },
            {
              id: "rates-sources",
              label: "Rates and sources",
              content: (
                <>
                  <p>
                    EPF/VPF: 8.25% for FY 2025-26, declared by EPFO (circular INV-11/2/2021-INV/E-41960/2519) after government ratification.
                    PPF: 7.1% for October–December 2026, per the Ministry of Finance office memorandum F.No.1/4/2019-NS dated 30 September
                    2026. Small-savings rates are reviewed every quarter.
                  </p>
                  <p>
                    NPS exit rules follow the PFRDA (Exits and Withdrawals under NPS) Amendment Regulations notified in December 2025. NPS and
                    mutual fund returns are assumptions you set; past returns don&apos;t guarantee future returns.
                  </p>
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

      <RelatedTools currentSlug="epf-vpf-ppf-nps-mutual-fund-calculator" />
    </div>
  );
}
