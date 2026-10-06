import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FAQAccordion from "@/components/FAQAccordion";
import LwfCalculator from "@/components/compliance/LwfCalculator";
import {
  ComplianceBreadcrumb,
  datasetJsonLd,
  Disclaimer,
  EditorNote,
  JsonLd,
  NotificationSources,
  PendingVerification,
  StateCrossLinks,
  VerifiedBadge,
} from "@/components/compliance/Shared";
import { monthName, rupees, shortDate } from "@/lib/compliance/format";
import { FREQUENCY_LABEL, slabSummary } from "@/lib/compliance/lwf";
import { getLwfRule } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";
import { getRegion, REGIONS } from "@/lib/compliance/states";

export const revalidate = REVALIDATE_SECONDS;

type Params = { state: string };

export function generateStaticParams(): Params[] {
  return REGIONS.map((r) => ({ state: r.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const region = getRegion(params.state);
  if (!region) return {};
  const rule = await getLwfRule(region.slug);
  return {
    title: rule && !rule.applicable
      ? `LWF in ${region.name}: Is Labour Welfare Fund Applicable?`
      : `LWF in ${region.name}: Contribution Rates, Due Dates & Rules`,
    description: rule && !rule.applicable
      ? `${region.name} does not levy Labour Welfare Fund. Checked against official sources.`
      : `${region.name} Labour Welfare Fund: employee and employer contribution, frequency, deduction months, due dates and who is covered.`,
    alternates: { canonical: `/lwf-rates/${region.slug}` },
    robots: rule ? undefined : { index: false, follow: true },
  };
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card px-5 py-4">
      <dt className="text-sm text-charcoal/60">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}

export default async function LwfStatePage({ params }: { params: Params }) {
  const region = getRegion(params.state);
  if (!region) notFound();
  const rule = await getLwfRule(region.slug);
  const crumbs = [
    { label: "LWF rates", href: "/lwf-rates" },
    { label: region.name, href: `/lwf-rates/${region.slug}` },
  ];

  if (!rule) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ComplianceBreadcrumb items={crumbs} />
        <h1 className="text-3xl font-semibold text-ink mb-6">Labour Welfare Fund in {region.name}</h1>
        <PendingVerification what="LWF rule" regionName={region.name} backHref="/lwf-rates" />
      </div>
    );
  }

  const year = new Date().getFullYear();
  const first = rule.slabs?.[0];
  const firstSum = first ? slabSummary(first) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb items={crumbs} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Labour Welfare Fund in {region.name}</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          {rule.applicable
            ? `${region.name} collects LWF under the ${rule.actName ?? "state Labour Welfare Fund Act"}.${
                rule.effectiveFrom ? ` Current rates apply from ${shortDate(rule.effectiveFrom)}.` : ""
              }`
            : `${region.name} does not levy Labour Welfare Fund. Employers here don't deduct or deposit LWF.`}
        </p>
        <div className="mt-4">
          <VerifiedBadge lastVerified={rule.lastVerified} />
        </div>
      </header>

      <div className="space-y-12">
        <EditorNote note={rule.editorNote} />

        {rule.applicable && (
          <>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Fact label="Employee pays" value={firstSum?.employee ?? "—"} />
              <Fact label="Employer pays" value={firstSum?.employer ?? "—"} />
              <Fact label="How often" value={rule.frequency ? FREQUENCY_LABEL[rule.frequency] : "—"} />
              <Fact
                label="Applies from"
                value={rule.minEmployees ? `${rule.minEmployees}+ employees` : "All covered establishments"}
              />
            </dl>

            {(rule.slabs?.length ?? 0) > 1 && (
              <section aria-labelledby="slabs-heading">
                <h2 id="slabs-heading" className="text-xl font-semibold text-ink mb-3">Rates by band</h2>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-paperDark/60 text-left text-charcoal/70">
                      <tr>
                        <th scope="col" className="px-4 py-2.5 font-medium">Applies to</th>
                        <th scope="col" className="px-4 py-2.5 font-medium">Employee</th>
                        <th scope="col" className="px-4 py-2.5 font-medium">Employer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rule.slabs!.map((s, i) => {
                        const sum = slabSummary(s);
                        const band =
                          s.wageFrom !== undefined || s.wageTo !== undefined
                            ? `Wages ${s.wageFrom !== undefined ? rupees(s.wageFrom) : "up"} to ${s.wageTo !== undefined ? rupees(s.wageTo) : "and above"}`
                            : null;
                        return (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-4 py-2.5 text-ink">{[s.label, band].filter(Boolean).join(", ") || "All employees"}</td>
                            <td className="px-4 py-2.5 text-ink">{sum.employee}</td>
                            <td className="px-4 py-2.5 text-ink">{sum.employer}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section aria-labelledby="when-heading" className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 id="when-heading" className="text-xl font-semibold text-ink mb-3">When to deduct and pay</h2>
                {rule.frequency === "monthly" ? (
                  <p className="text-sm text-charcoal/80">Deduct the employee share from every month&apos;s salary.</p>
                ) : rule.deductionMonths && rule.deductionMonths.length > 0 ? (
                  <p className="text-sm text-charcoal/80">
                    Deduct the employee share from the salary for{" "}
                    {rule.deductionMonths.map((m) => monthName(m - 1, true)).join(" and ")}.
                  </p>
                ) : null}
                {rule.dueDates && rule.dueDates.length > 0 && (
                  <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white text-sm">
                    {rule.dueDates.map((d) => (
                      <li key={d.period} className="flex justify-between gap-4 px-4 py-2.5">
                        <span className="text-charcoal/70">{d.period}</span>
                        <span className="text-ink">Pay by {d.due}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {rule.portalUrl && (
                  <p className="mt-3 text-sm">
                    <a href={rule.portalUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                      {rule.boardName ?? "Labour Welfare Board"} portal
                    </a>
                  </p>
                )}
              </div>
              {(rule.coverageNotes || rule.excludedAboveWage) && (
                <div>
                  <h2 className="text-xl font-semibold text-ink mb-3">Who is covered</h2>
                  {rule.excludedAboveWage && (
                    <p className="text-sm text-charcoal/80 mb-2">
                      Employees earning more than {rupees(rule.excludedAboveWage)} a month are not covered.
                    </p>
                  )}
                  {rule.coverageNotes && <p className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">{rule.coverageNotes}</p>}
                </div>
              )}
            </section>

            <section aria-labelledby="calc-heading">
              <h2 id="calc-heading" className="text-xl font-semibold text-ink mb-1">Work out your cost</h2>
              <p className="text-sm text-charcoal/60 mb-4">Enter your headcount in {region.name} to see the yearly deposit.</p>
              <LwfCalculator rules={[rule]} fixedState={rule.state} />
            </section>
          </>
        )}

        <NotificationSources sources={rule.sources} />

        {rule.faqItems && rule.faqItems.length > 0 && (
          <section aria-labelledby="faq-heading" className="max-w-3xl">
            <h2 id="faq-heading" className="text-2xl font-semibold text-ink mb-4">Frequently asked questions</h2>
            <FAQAccordion items={rule.faqItems} />
          </section>
        )}

        <StateCrossLinks slug={region.slug} name={region.name} year={year} />
        <Disclaimer />
      </div>

      <JsonLd
        data={datasetJsonLd({
          name: `Labour Welfare Fund rates in ${region.name}`,
          description: `LWF contribution, frequency and due dates for ${region.name}.`,
          path: `/lwf-rates/${region.slug}`,
          lastVerified: rule.lastVerified,
          sourceUrl: rule.sources?.find((s) => s.url)?.url,
        })}
      />
    </div>
  );
}
