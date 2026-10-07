import type { Metadata } from "next";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import { ComplianceBreadcrumb, Disclaimer } from "@/components/compliance/Shared";
import { getAllLwfRules } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";
import { FREQUENCY_LABEL, slabSummary } from "@/lib/compliance/lwf";
import { getRegion } from "@/lib/compliance/states";
import { shortDate } from "@/lib/compliance/format";

// Employee-facing guide. The employer cost calculator lives at
// /tools/lwf-calculator; this page doesn't duplicate it. Rates come from
// the same verified Sanity rules.
export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Labour Welfare Fund Benefits: What Your LWF Deduction Pays For",
  description:
    "What employees pay into the Labour Welfare Fund in each state, what the state welfare boards fund with it, and how to apply for the schemes.",
  alternates: { canonical: "/tools/lwf-benefits" },
};

const FAQ = [
  {
    question: "What is the Labour Welfare Fund?",
    answer:
      "A small contribution, set by state law, paid by employees and employers to a state labour welfare board. The board uses it to run welfare schemes for workers and their families.",
  },
  {
    question: "Does every state have LWF?",
    answer:
      "No. Only some states levy it, and the amount, frequency and who is covered differ by state. The table on this page lists the states we've verified against the official notification.",
  },
  {
    question: "Do I get my LWF contribution back?",
    answer:
      "No. It isn't savings. In return, you can apply for the welfare schemes your state board runs while you're contributing.",
  },
  {
    question: "How do I apply for an LWF scheme?",
    answer:
      "Go to your state labour welfare board's website or office. You'll usually need proof that LWF was deducted, such as a payslip or an employer certificate, plus documents for the scheme itself, such as a marksheet for a scholarship.",
  },
  {
    question: "I'm an employer. How much LWF do I owe?",
    answer:
      "Use the LWF Calculator. It works out the employer and employee share for your headcount, with deduction months and due dates for each state.",
  },
];

export default async function LwfBenefitsPage() {
  const rules = await getAllLwfRules();
  const byName = (s: string) => getRegion(s)?.name ?? s;
  const levying = rules.filter((r) => r.applicable).sort((a, b) => byName(a.state).localeCompare(byName(b.state)));
  const notLevying = rules.filter((r) => !r.applicable).map((r) => byName(r.state)).sort();

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <ComplianceBreadcrumb items={[{ label: "LWF benefits", href: "/tools/lwf-benefits" }]} />
      <h1 className="text-3xl mb-2">Labour Welfare Fund: what you pay and what it pays for</h1>
      <p className="text-charcoal/60 mb-10 max-w-2xl">
        LWF is usually the smallest line on a payslip and the one people know least about. The money funds state welfare
        schemes that you and your family can apply for.
      </p>

      <section aria-labelledby="pay-heading" className="mb-16">
        <h2 id="pay-heading" className="text-2xl mb-4">What employees pay, by state</h2>
        {levying.length === 0 ? (
          <p className="text-sm text-charcoal/70">LWF rates are being verified. Check back soon.</p>
        ) : (
          <div className="card-flat overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-paperDark text-left text-charcoal/60">
                <tr>
                  <th className="px-4 py-2 font-medium">State</th>
                  <th className="px-4 py-2 font-medium">Deducted</th>
                  <th className="px-4 py-2 font-medium">You pay each time</th>
                  <th className="px-4 py-2 font-medium">Welfare board</th>
                  <th className="px-4 py-2 font-medium">Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {levying.map((r) => {
                  const slabs = r.slabs ?? [];
                  const pay =
                    slabs.length === 0 ? "—" : slabs.length === 1 ? slabSummary(slabs[0]).employee : "Depends on wage or establishment";
                  return (
                    <tr key={r.state}>
                      <td className="px-4 py-2">
                        <Link href={`/lwf-rates/${r.state}`} className="text-ink hover:text-accent hover:underline">
                          {byName(r.state)}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-charcoal/70">{r.frequency ? FREQUENCY_LABEL[r.frequency] : "—"}</td>
                      <td className="px-4 py-2 font-mono tabular-nums">{pay}</td>
                      <td className="px-4 py-2 text-charcoal/70">
                        {r.portalUrl ? (
                          <a href={r.portalUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            {r.boardName ?? "Board website"}
                          </a>
                        ) : (
                          r.boardName ?? "—"
                        )}
                      </td>
                      <td className="px-4 py-2 text-charcoal/60">{r.lastVerified ? shortDate(r.lastVerified) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {notLevying.length > 0 && (
          <p className="text-sm text-charcoal/70 mt-3">No LWF in: {notLevying.join(", ")}.</p>
        )}
        <p className="text-sm text-charcoal/70 mt-3">
          Full rules for each state, including employer share and due dates, are on the{" "}
          <Link href="/lwf-rates" className="text-accent hover:underline">
            LWF rates pages
          </Link>
          . Employers can work out their total cost with the{" "}
          <Link href="/tools/lwf-calculator" className="text-accent hover:underline">
            LWF Calculator
          </Link>
          .
        </p>
      </section>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "what-it-funds",
              label: "What LWF pays for",
              content: (
                <>
                  <p>
                    Each state&apos;s welfare board decides its own schemes, so what&apos;s on offer depends on where you work.
                    Boards commonly support education help for workers&apos; children, medical assistance, help with family events
                    such as weddings, funeral assistance, and recreation or skill-training facilities.
                  </p>
                  <p>
                    Schemes, amounts and eligibility change, so check your state board&apos;s website, linked in the table above,
                    before you apply.
                  </p>
                </>
              ),
            },
            {
              id: "how-to-apply",
              label: "How to apply",
              content: (
                <>
                  <p>
                    Keep your payslips: they&apos;re your proof of contribution. When a scheme fits, such as a child&apos;s
                    admission, a medical bill or a family wedding, check the board&apos;s application window and document list.
                    Apply with your employer&apos;s certificate if the board asks for one, and follow up with the board directly.
                  </p>
                </>
              ),
            },
            {
              id: "big-picture",
              label: "Where LWF fits",
              content: (
                <p>
                  LWF is one of the deductions that never comes back as money at retirement. See how it sits alongside PF, NPS,
                  gratuity and ESI in the{" "}
                  <Link href="/tools/retirement-benefits-calculator" className="text-accent hover:underline">
                    Retirement Benefits Calculator
                  </Link>
                  .
                </p>
              ),
            },
          ]}
        />
      </div>

      <section aria-labelledby="faq-heading" className="mb-12 max-w-3xl">
        <h2 id="faq-heading" className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion items={FAQ} />
      </section>

      <div className="space-y-12">
        <Disclaimer />
        <RelatedTools currentSlug="lwf-benefits" />
      </div>
    </div>
  );
}
