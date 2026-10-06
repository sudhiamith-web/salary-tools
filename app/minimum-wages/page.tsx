import type { Metadata } from "next";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import StateGrid, { type StateCell } from "@/components/compliance/StateGrid";
import { ComplianceBreadcrumb, Disclaimer } from "@/components/compliance/Shared";
import { rupees, shortDate } from "@/lib/compliance/format";
import { getWageHub, type WageHubRow } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";
import { getRegion } from "@/lib/compliance/states";
import { SKILL_LABELS, SKILL_ORDER, skillRange } from "@/lib/compliance/wages";

export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Minimum Wages in India 2026: State-wise Rates for All States & UTs",
  description:
    "Current minimum wages for all 36 states and UTs, by zone and skill level, with basic and VDA. Every rate is checked against the state's official notification.",
  alternates: { canonical: "/minimum-wages" },
};

// Review this FAQ whenever the Centre notifies the floor wage.
const FAQ = [
  {
    question: "What is the minimum wage in India?",
    answer:
      "There is no single national figure you can pay. Each state and UT notifies its own minimum wages, by skill level and often by zone and type of employment. The rate that binds an employer is the one in its state's current notification.",
  },
  {
    question: "Has the national floor wage under the Code on Wages been fixed?",
    answer:
      "The Code on Wages, 2019 lets the Central Government fix a floor wage that no state can go below. As of October 2026 that floor wage has not been notified. The older National Floor Level Minimum Wage of ₹176 a day (2017) was only advisory.",
  },
  {
    question: "How do I convert a daily minimum wage to monthly?",
    answer:
      "The Code on Wages (Central) Rules, 2026 convert a daily rate to monthly by multiplying it by 26, and to hourly by dividing it by 8. Where a state's own notification uses a different method, follow the state notification.",
  },
  {
    question: "What is VDA?",
    answer:
      "Variable Dearness Allowance is the part of the minimum wage linked to the consumer price index. States revise it periodically, often twice a year, without changing the basic rate. The minimum wage is basic plus VDA.",
  },
  {
    question: "Do allowances count towards the minimum wage?",
    answer:
      "Under the Code on Wages, wages means basic pay, dearness allowance and retaining allowance. Allowances such as HRA and conveyance are excluded, but if excluded payments exceed half of total pay, the excess is treated as wages. Use the minimum wage checker to test a salary.",
  },
];

function latestPerState(rows: WageHubRow[]) {
  const out = new Map<string, WageHubRow>();
  for (const r of rows) if (!out.has(r.state)) out.set(r.state, r); // rows are newest first
  return out;
}

export default async function MinimumWagesHub() {
  const all = await getWageHub();
  const latest = latestPerState(all);

  const cells: Record<string, StateCell> = {};
  latest.forEach((n, state) => {
    const ranges = skillRange(n.schedules, n.monthlyDivisor);
    const lowestSkill = SKILL_ORDER.find((s) => ranges[s]);
    cells[state] = {
      primary: lowestSkill
        ? `${SKILL_LABELS[lowestSkill]} from ${rupees(ranges[lowestSkill]!.min)}/month`
        : "Rates published",
      secondary: `Effective ${shortDate(n.effectiveFrom)}`,
    };
  });

  const recent = all.slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb items={[{ label: "Minimum wages", href: "/minimum-wages" }]} />

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Minimum wages in every state and UT</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          The current rates for all 36 states and UTs, by zone, skill level and employment, with basic and VDA shown
          separately. Each state goes live only after every figure is checked against its official notification.
        </p>
        <p className="mt-4">
          <Link href="/tools/minimum-wage-checker" className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Check a salary against the minimum wage
          </Link>
        </p>
      </header>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="mb-12">
          <h2 id="recent-heading" className="text-xl font-semibold text-ink mb-3">Latest revisions</h2>
          <ol className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {recent.map((n) => {
              const region = getRegion(n.state);
              const count = n.schedules.reduce((a, s) => a + (s.rows?.length ?? 0), 0);
              return (
                <li key={n._id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                  <Link href={`/minimum-wages/${n.state}`} className="font-medium text-ink hover:text-accent">
                    {region?.name ?? n.state}
                  </Link>
                  <span className="text-charcoal/70">
                    {count} rates, effective {shortDate(n.effectiveFrom)}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <StateGrid hrefFor={(slug) => `/minimum-wages/${slug}`} cells={cells} />

      <section aria-labelledby="faq-heading" className="mt-16 max-w-3xl">
        <h2 id="faq-heading" className="text-2xl font-semibold text-ink mb-4">Frequently asked questions</h2>
        <FAQAccordion items={FAQ} />
      </section>

      <div className="mt-12">
        <Disclaimer />
      </div>
    </div>
  );
}
