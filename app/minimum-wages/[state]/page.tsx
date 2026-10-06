import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FAQAccordion from "@/components/FAQAccordion";
import MinimumWageChecker from "@/components/compliance/MinimumWageChecker";
import MinimumWageExplorer from "@/components/compliance/MinimumWageExplorer";
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
import { shortDate } from "@/lib/compliance/format";
import { getWageNotifications } from "@/lib/compliance/queries";
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
  const notes = await getWageNotifications(region.slug);
  const year = notes[0]?.effectiveFrom?.slice(0, 4) ?? String(new Date().getFullYear());
  return {
    title: `Minimum Wages in ${region.name} ${year}: Zone & Skill-wise Rates`,
    description: notes[0]
      ? `${region.name} minimum wages effective ${shortDate(notes[0].effectiveFrom)}: basic, VDA, daily and monthly rates by zone and skill level, from the official notification.`
      : `${region.name} minimum wage rates by zone and skill level.`,
    alternates: { canonical: `/minimum-wages/${region.slug}` },
    robots: notes.length ? undefined : { index: false, follow: true },
  };
}

export default async function MinimumWageStatePage({ params }: { params: Params }) {
  const region = getRegion(params.state);
  if (!region) notFound();

  const notes = await getWageNotifications(region.slug);
  const crumbs = [
    { label: "Minimum wages", href: "/minimum-wages" },
    { label: region.name, href: `/minimum-wages/${region.slug}` },
  ];

  if (notes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ComplianceBreadcrumb items={crumbs} />
        <h1 className="text-3xl font-semibold text-ink mb-6">Minimum wages in {region.name}</h1>
        <PendingVerification what="minimum wage notification" regionName={region.name} backHref="/minimum-wages" />
      </div>
    );
  }

  const current = notes[0];
  const rowCount = current.schedules.reduce((a, s) => a + (s.rows?.length ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb items={crumbs} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Minimum wages in {region.name}</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          {rowCount} rates across {current.schedules.length}{" "}
          {current.schedules.length === 1 ? "employment" : "employments"} and {current.zones.length}{" "}
          {current.zones.length === 1 ? "zone" : "zones"}, effective {shortDate(current.effectiveFrom)}.
          {current.nextRevisionNote && ` ${current.nextRevisionNote}.`}
        </p>
        <div className="mt-4">
          <VerifiedBadge lastVerified={current.lastVerified} />
        </div>
      </header>

      <div className="space-y-12">
        <EditorNote note={current.editorNote} />

        <section aria-labelledby="check-heading">
          <h2 id="check-heading" className="text-xl font-semibold text-ink mb-1">Check a salary</h2>
          <p className="text-sm text-charcoal/60 mb-4">See whether a salary meets the current {region.name} minimum for a category and zone.</p>
          <MinimumWageChecker notification={current} />
        </section>

        <MinimumWageExplorer regionName={region.name} notifications={notes} />

        <NotificationSources sources={current.sources} />

        {current.faqItems && current.faqItems.length > 0 && (
          <section aria-labelledby="faq-heading" className="max-w-3xl">
            <h2 id="faq-heading" className="text-2xl font-semibold text-ink mb-4">Frequently asked questions</h2>
            <FAQAccordion items={current.faqItems} />
          </section>
        )}

        <StateCrossLinks slug={region.slug} name={region.name} year={new Date().getFullYear()} />
        <Disclaimer />
      </div>

      <JsonLd
        data={datasetJsonLd({
          name: `Minimum wages in ${region.name}`,
          description: `Minimum wage rates for ${region.name} effective ${shortDate(current.effectiveFrom)}, by zone and skill level.`,
          path: `/minimum-wages/${region.slug}`,
          lastVerified: current.lastVerified,
          sourceUrl: current.sources?.find((s) => s.url)?.url,
        })}
      />
    </div>
  );
}
