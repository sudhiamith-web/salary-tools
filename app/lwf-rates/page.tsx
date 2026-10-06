import type { Metadata } from "next";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import StateGrid, { type StateCell } from "@/components/compliance/StateGrid";
import { ComplianceBreadcrumb, Disclaimer } from "@/components/compliance/Shared";
import { FREQUENCY_LABEL, slabSummary } from "@/lib/compliance/lwf";
import { getAllLwfRules } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";
import { getRegion } from "@/lib/compliance/states";

export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "LWF Rates 2026: Labour Welfare Fund Contribution for Every State",
  description:
    "State-wise Labour Welfare Fund rates: employee and employer contribution, frequency, deduction months and due dates, checked against each state's notification.",
  alternates: { canonical: "/lwf-rates" },
};

const FAQ = [
  {
    question: "What is the Labour Welfare Fund?",
    answer:
      "It is a state-run fund that pays for welfare schemes for workers, such as education grants, medical help and housing support. Employees and employers both contribute fixed amounts, deposited with the state's Labour Welfare Board.",
  },
  {
    question: "Is there a central LWF law?",
    answer:
      "No. Each state that levies LWF has its own Labour Welfare Fund Act and rules, so amounts, frequency, due dates and coverage differ from state to state. States without such a law don't collect LWF.",
  },
  {
    question: "How often is LWF deducted?",
    answer:
      "It depends on the state: some collect monthly, some every six months and some once a year. For half-yearly and yearly states, the employee share is deducted only in the salary of the specified months.",
  },
  {
    question: "Is LWF the same as Professional Tax?",
    answer:
      "No. Professional Tax is a state tax on employment. LWF is a welfare contribution paid to a welfare board, and the employer pays a share too.",
  },
];

export default async function LwfHub() {
  const rules = await getAllLwfRules();
  const cells: Record<string, StateCell> = {};
  for (const r of rules) {
    if (!r.applicable) {
      cells[r.state] = { primary: "No LWF in this state", muted: true };
      continue;
    }
    const s = r.slabs?.[0];
    const sum = s ? slabSummary(s) : null;
    cells[r.state] = {
      primary: sum ? `${sum.employee} employee, ${sum.employer} employer` : "Rates published",
      secondary: [r.frequency ? FREQUENCY_LABEL[r.frequency] : null, (r.slabs?.length ?? 0) > 1 ? "varies by band" : null]
        .filter(Boolean)
        .join(", "),
    };
  }

  const applicable = rules
    .filter((r) => r.applicable)
    .sort((a, b) => (getRegion(a.state)?.name ?? "").localeCompare(getRegion(b.state)?.name ?? ""));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb items={[{ label: "LWF rates", href: "/lwf-rates" }]} />

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Labour Welfare Fund rates by state</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          What employees and employers pay, how often, and when it&apos;s due, for every state and UT. Each state is
          checked against its Labour Welfare Board&apos;s notification before it goes live.
        </p>
        <p className="mt-4">
          <Link href="/tools/lwf-calculator" className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Work out your LWF cost
          </Link>
        </p>
      </header>

      {applicable.length > 0 && (
        <section aria-labelledby="table-heading" className="mb-12">
          <h2 id="table-heading" className="text-xl font-semibold text-ink mb-3">States that levy LWF</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-paperDark/60 text-left text-charcoal/70">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">State / UT</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Employee</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Employer</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {applicable.map((r) => {
                  const s = r.slabs?.[0];
                  const sum = s ? slabSummary(s) : null;
                  const multi = (r.slabs?.length ?? 0) > 1;
                  return (
                    <tr key={r.state} className="border-t border-slate-100">
                      <td className="px-4 py-2.5">
                        <Link href={`/lwf-rates/${r.state}`} className="font-medium text-ink hover:text-accent">
                          {getRegion(r.state)?.name ?? r.state}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-ink">{sum?.employee ?? "—"}{multi && <span className="text-charcoal/50"> *</span>}</td>
                      <td className="px-4 py-2.5 text-ink">{sum?.employer ?? "—"}</td>
                      <td className="px-4 py-2.5 text-charcoal/70">{r.frequency ? FREQUENCY_LABEL[r.frequency] : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {applicable.some((r) => (r.slabs?.length ?? 0) > 1) && (
            <p className="mt-2 text-xs text-charcoal/60">* Rate varies by wage band or establishment type. Open the state for details.</p>
          )}
        </section>
      )}

      <StateGrid hrefFor={(slug) => `/lwf-rates/${slug}`} cells={cells} />

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
