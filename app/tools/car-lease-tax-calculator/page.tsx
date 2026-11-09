import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import CarLeaseCalculator from "@/components/car-lease/CarLeaseCalculator";

export const metadata: Metadata = {
  title: "Car Lease Tax Benefit Calculator: Lease vs Buy (FY 2026-27, Rule 15)",
  description:
    "Calculate the tax saving on a company car lease under the new Rule 15 perquisite values, the tax when you buy the car at the end, and whether cash, a car loan or a lease costs less.",
  alternates: { canonical: "/tools/car-lease-tax-calculator" },
};

const FAQ = [
  {
    question: "How much tax can I save with a company car lease?",
    answer:
      "The lease rental and running costs move out of your taxable cash salary, and only a flat perquisite is added back. For a car up to 1.6 litres (or an EV) used for both work and personal trips, that's ₹5,000 a month from FY 2026-27. At the 30% slab, every ₹1 lakh moved out of cash salary saves about ₹31,200 in tax, less the tax on the perquisite.",
  },
  {
    question: "What are the new car perquisite values from 1 April 2026?",
    answer:
      "Under Rule 15 of the Income-tax Rules, 2026, a company car used for both official and personal purposes is valued at ₹5,000 a month (up to 1.6 litres or an EV) or ₹7,000 a month (above 1.6 litres), plus ₹3,000 if a chauffeur is provided. If you pay the running costs yourself, the values are ₹2,000 and ₹3,000. The earlier values were ₹1,800, ₹2,400 and ₹900.",
  },
  {
    question: "Is a car lease tax-free if I use the car only for work?",
    answer:
      "Yes, there is no perquisite if the car is used wholly for official purposes, but you need a logbook of every trip and a certificate from your employer. Without these records, the use can be treated as mixed and the flat value applies.",
  },
  {
    question: "Is an electric car taxed differently?",
    answer:
      "The Income-tax Rules, 2026 place electric vehicles in the same band as cars up to 1.6 litres, so the perquisite is ₹5,000 a month for mixed use. There is no separate flat rate for EVs.",
  },
  {
    question: "Do I pay tax if I buy the car at the end of the lease?",
    answer:
      "If your employer owns the car, yes: the perquisite is the car's cost reduced by 20% a year on a reducing balance for each completed year, minus what you pay. Paying close to that depreciated value avoids the tax. If you buy from a leasing company at a fair price, this rule generally doesn't apply.",
  },
  {
    question: "Is it better to lease a car or buy it with a loan?",
    answer:
      "For most salaried employees in the 30% slab, a company lease costs less because the rental is paid from pre-tax salary. Buying wins when the lease rental is high for the car, when your tax rate is low, or when you plan to buy an employer-owned car at a steep discount at the end. The Buy vs lease tab compares all three options with your numbers.",
  },
  {
    question: "Does the car lease benefit work in the new tax regime?",
    answer:
      "Yes. Perquisite valuation is the same in both regimes, and moving the lease rental out of cash salary lowers taxable income in either. The saving depends on your slab, so the calculator works it out for both.",
  },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Salary & Tax", href: "/" },
          { label: "Car Lease Tax Benefit Calculator" },
        ]}
      />

      <header className="mb-10 max-w-3xl">
        <p className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          Updated for Income-tax Rules 2026 · FY 2026-27
        </p>
        <h1 className="mb-3 font-display text-4xl text-ink md:text-5xl">Car Lease Tax Benefit Calculator</h1>
        <p className="text-lg text-charcoal/70">
          See how much tax you save with a company car lease, what it costs to keep the car at the end, and whether paying cash, taking a car loan or
          leasing works out cheapest.
        </p>
      </header>

      <div className="mb-20">
        <CarLeaseCalculator />
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "how-car-lease-is-taxed",
              label: "How a car lease is taxed",
              content: (
                <>
                  <p>
                    In a company car lease, your employer leases the car and pays the rental out of your CTC. That part of your salary is no longer
                    paid to you in cash, so it is no longer taxed as salary. Instead, the use of the car is a perquisite, and tax law values it at a
                    flat monthly amount that is usually far below the actual cost.
                  </p>
                  <p>
                    The saving is the gap between the two: tax on the rental and running costs you no longer receive as cash, minus tax on the
                    perquisite. If you are in the 30% slab, that gap can be well over ₹1 lakh a year.
                  </p>
                </>
              ),
            },
            {
              id: "rule-15-values",
              label: "Rule 15 values: FY 2025-26 vs 2026-27",
              content: (
                <>
                  <p>
                    The Income-tax Rules, 2026, notified on 20 March 2026 and in force from 1 April 2026, raised the car perquisite values for the
                    first time in decades. For a car used for both work and personal trips:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-left">
                          <th className="px-3 py-2">Situation (per month)</th>
                          <th className="px-3 py-2">Up to 1.6L or EV</th>
                          <th className="px-3 py-2">Above 1.6L</th>
                          <th className="px-3 py-2">Chauffeur</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200">
                          <td className="px-3 py-2">Company car, employer pays running costs</td>
                          <td className="px-3 py-2">₹5,000 (was ₹1,800)</td>
                          <td className="px-3 py-2">₹7,000 (was ₹2,400)</td>
                          <td className="px-3 py-2">+₹3,000 (was ₹900)</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="px-3 py-2">Company car, you pay running costs</td>
                          <td className="px-3 py-2">₹2,000 (was ₹600)</td>
                          <td className="px-3 py-2">₹3,000 (was ₹900)</td>
                          <td className="px-3 py-2">+₹3,000 (was ₹900)</td>
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="px-3 py-2">Own car, employer reimburses</td>
                          <td className="px-3 py-2">Reimbursement − ₹5,000</td>
                          <td className="px-3 py-2">Reimbursement − ₹7,000</td>
                          <td className="px-3 py-2">− ₹3,000 more</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p>Higher values mean a smaller saving than before, but for most employees a lease still comes out well ahead.</p>
                </>
              ),
            },
            {
              id: "official-mixed-personal",
              label: "Official, mixed and personal use",
              content: (
                <>
                  <p>
                    <strong>Official only:</strong> no perquisite at all, provided you keep a logbook of every trip and your employer certifies that
                    the car was used only for work.
                  </p>
                  <p>
                    <strong>Official and personal:</strong> the flat values above apply. This is how most car lease policies work in practice.
                  </p>
                  <p>
                    <strong>Personal only:</strong> the full amount your employer spends on the car — rental, fuel, driver — is taxable, so there is
                    no saving compared with being paid in cash.
                  </p>
                </>
              ),
            },
            {
              id: "end-of-lease",
              label: "End of lease: buying the car",
              content: (
                <>
                  <p>
                    If your employer owns the car and sells it to you, the discount is a perquisite. The car&apos;s cost is reduced by 20% a year on a
                    reducing balance for each completed year, and anything below that value that you don&apos;t pay is taxed as salary. A ₹15 lakh
                    car after three years is valued at ₹7.68 lakh, so buying it for ₹3 lakh adds ₹4.68 lakh to your income.
                  </p>
                  <p>
                    If the car is leased from a leasing company and you buy it from them at a fair residual price, the employer-asset rule generally
                    doesn&apos;t apply. Check the structure with your HR team before you sign.
                  </p>
                </>
              ),
            },
            {
              id: "buy-vs-lease",
              label: "Car lease vs buying: which is cheaper?",
              content: (
                <>
                  <p>
                    Comparing a lease with buying means looking at the whole period, not just the monthly figure. Cash ties up a large amount on day
                    one that could otherwise earn a return. A loan spreads the cost but adds interest, which salaried employees can&apos;t deduct. A
                    lease is paid from pre-tax salary, but you hand the car back unless you buy it.
                  </p>
                  <p>
                    The Buy vs lease tab puts all three on the same footing: every rupee paid out is adjusted for the return it could have earned, and
                    the car&apos;s resale value is credited where you own it at the end. For your overall tax picture, see the{" "}
                    <Link href="/tools/old-vs-new-regime-calculator" className="text-accent hover:underline">
                      Old vs New Tax Regime Calculator
                    </Link>
                    .
                  </p>
                </>
              ),
            },
            {
              id: "sources",
              label: "Rules and sources",
              content: (
                <>
                  <p>
                    Perquisite values: Rule 15 of the Income-tax Rules, 2026, notified by CBDT on 20 March 2026 under the Income-tax Act, 2025, in
                    force from 1 April 2026. Salary threshold for specified employees: ₹4 lakh (CBDT Notification 133/2025). Tax slabs, standard
                    deduction and the Section 87A rebate for FY 2026-27 are unchanged by Budget 2026.
                  </p>
                  <p>
                    The calculator applies the standard deduction only and doesn&apos;t model surcharge (salaries above ₹50 lakh). It is an estimate,
                    not tax advice.
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

      <RelatedTools currentSlug="car-lease-tax-calculator" />
    </div>
  );
}
