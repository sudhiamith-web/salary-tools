import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FAQAccordion from "@/components/FAQAccordion";
import HolidayExplorer from "@/components/compliance/HolidayExplorer";
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
import { getHolidayList, getHolidayYears } from "@/lib/compliance/queries";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";
import { getRegion, REGIONS } from "@/lib/compliance/states";

export const revalidate = REVALIDATE_SECONDS;

type Params = { year: string; state: string };

function parseYear(raw: string): number | null {
  const y = Number(raw);
  return Number.isInteger(y) && y >= 2025 && y <= 2100 ? y : null;
}

export async function generateStaticParams(): Promise<Params[]> {
  const years = Array.from(new Set([...(await getHolidayYears()), new Date().getFullYear()]));
  return years.flatMap((y) => REGIONS.map((r) => ({ year: String(y), state: r.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const year = parseYear(params.year);
  const region = getRegion(params.state);
  if (!year || !region) return {};
  const data = await getHolidayList(region.slug, year);
  return {
    title: `${region.name} Holiday List ${year}: Government & Private Employer Holidays`,
    description: `${region.name} holiday list ${year} from the official notification: general and restricted holidays with dates and days, plus the paid holidays private employers must give.`,
    alternates: { canonical: `/holidays/${year}/${region.slug}` },
    // Unverified states show a placeholder: keep them out of Google until data is live.
    robots: data ? undefined : { index: false, follow: true },
  };
}

export default async function HolidayStatePage({ params }: { params: Params }) {
  const year = parseYear(params.year);
  const region = getRegion(params.state);
  if (!year || !region) notFound();

  const data = await getHolidayList(region.slug, year);
  const crumbs = [
    { label: "Holidays", href: "/holidays" },
    ...(year !== new Date().getFullYear() ? [{ label: String(year), href: `/holidays/${year}` }] : []),
    { label: region.name, href: `/holidays/${year}/${region.slug}` },
  ];

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ComplianceBreadcrumb items={crumbs} />
        <h1 className="text-3xl font-semibold text-ink mb-6">{region.name} holiday list {year}</h1>
        <PendingVerification what={`holiday list for ${year}`} regionName={region.name} backHref={year === new Date().getFullYear() ? "/holidays" : `/holidays/${year}`} />
      </div>
    );
  }

  const general = data.holidays.filter((h) => h.kind !== "restricted").length;
  const restricted = data.holidays.length - general;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb items={crumbs} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">{region.name} holiday list {year}</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          {general} government holidays{restricted ? ` and ${restricted} restricted holidays` : ""}, from the{" "}
          {region.name} government notification.
          {typeof data.privateEmployerRules?.minimumPaidHolidays === "number" &&
            ` Private employers must give at least ${data.privateEmployerRules.minimumPaidHolidays} paid holidays.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <VerifiedBadge lastVerified={data.lastVerified} />
        </div>
      </header>

      <div className="space-y-12">
        <EditorNote note={data.editorNote} />

        <HolidayExplorer
          year={year}
          regionName={region.name}
          holidays={data.holidays ?? []}
          privateEmployerRules={data.privateEmployerRules}
        />

        <NotificationSources sources={data.sources} />

        {data.faqItems && data.faqItems.length > 0 && (
          <section aria-labelledby="faq-heading" className="max-w-3xl">
            <h2 id="faq-heading" className="text-2xl font-semibold text-ink mb-4">Frequently asked questions</h2>
            <FAQAccordion items={data.faqItems} />
          </section>
        )}

        <StateCrossLinks slug={region.slug} name={region.name} year={year} />
        <Disclaimer />
      </div>

      <JsonLd
        data={datasetJsonLd({
          name: `${region.name} holiday list ${year}`,
          description: `Government and private-employer holidays for ${region.name} in ${year}.`,
          path: `/holidays/${year}/${region.slug}`,
          lastVerified: data.lastVerified,
          sourceUrl: data.sources?.find((s) => s.url)?.url,
        })}
      />
    </div>
  );
}
