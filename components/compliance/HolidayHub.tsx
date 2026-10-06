import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import { getHolidayHub, getHolidayYears } from "@/lib/compliance/queries";
import { nationalHolidays } from "@/lib/compliance/holidays";
import { shortDate, weekday } from "@/lib/compliance/format";
import StateGrid, { type StateCell } from "./StateGrid";
import { ComplianceBreadcrumb, Disclaimer, JsonLd } from "./Shared";

export function holidayHubFaq(year: number) {
  return [
    {
      question: `What are the national holidays in ${year}?`,
      answer: `India has three national holidays: Republic Day (26 January), Independence Day (15 August) and Gandhi Jayanti (2 October). In ${year} they fall on ${nationalHolidays(year).map((h) => weekday(h.date)).join(", ")} respectively.`,
    },
    {
      question: "Do private companies have to follow the state government holiday list?",
      answer:
        "Not as such. The state government list governs government offices. Private factories, shops and establishments must give the paid holidays set by the state's National and Festival Holidays Act or Shops and Establishments Act. That is usually a much shorter list: the national holidays plus a few festival holidays the employer chooses. Each state page shows both.",
    },
    {
      question: "What is a restricted holiday?",
      answer:
        "A restricted (or optional) holiday is one an employee can choose to take from a published list, up to a limit. Offices stay open on these days. The limit is set by the employer's policy or the government's rules for its own staff.",
    },
    {
      question: "Why might a holiday date change during the year?",
      answer:
        "Festivals that follow the lunar calendar, such as Eid, depend on moon sighting. States often notify a tentative date and confirm or change it closer to the day. These are marked on each state page.",
    },
  ];
}

export default async function HolidayHub({ year }: { year: number }) {
  const [rows, years] = await Promise.all([getHolidayHub(year), getHolidayYears()]);
  const allYears = Array.from(new Set([...years, year])).sort((a, b) => a - b);

  const cells: Record<string, StateCell> = {};
  for (const r of rows) {
    cells[r.state] = {
      primary: `${r.general + r.national} holidays${r.restricted ? ` + ${r.restricted} restricted` : ""}`,
      secondary: typeof r.privateMinimum === "number" ? `Private employers: at least ${r.privateMinimum} paid` : undefined,
    };
  }

  const faq = holidayHubFaq(year);
  const national = nationalHolidays(year);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ComplianceBreadcrumb
        items={[
          { label: "Holidays", href: "/holidays" },
          ...(year !== new Date().getFullYear() ? [{ label: String(year), href: `/holidays/${year}` }] : []),
        ]}
      />

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink">Holiday list {year} for every state and UT</h1>
        <p className="mt-3 text-charcoal/80 leading-relaxed">
          Each state&apos;s official government holiday list, and separately, the paid holidays private employers must
          give under state law. Every list is checked against the state&apos;s own notification before it&apos;s published.
        </p>
        {allYears.length > 1 && (
          <nav aria-label="Year" className="mt-5 flex flex-wrap gap-2">
            {allYears.map((y) => (
              <Link
                key={y}
                href={y === new Date().getFullYear() ? "/holidays" : `/holidays/${y}`}
                aria-current={y === year ? "page" : undefined}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  y === year ? "border-accent bg-accentTint text-accent" : "border-slate-300 bg-white text-charcoal/70 hover:border-accent"
                }`}
              >
                {y}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <section aria-labelledby="national-heading" className="mb-12">
        <h2 id="national-heading" className="text-xl font-semibold text-ink mb-3">National holidays in {year}</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {national.map((h) => (
            <li key={h.date} className="card px-5 py-4">
              <p className="font-medium text-ink">{h.name}</p>
              <p className="text-sm text-charcoal/70 mt-0.5">{shortDate(h.date)}, {weekday(h.date)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-charcoal/60">These apply in every state, to government and private employers alike.</p>
      </section>

      <StateGrid hrefFor={(slug) => `/holidays/${year}/${slug}`} cells={cells} />

      <section aria-labelledby="faq-heading" className="mt-16 max-w-3xl">
        <h2 id="faq-heading" className="text-2xl font-semibold text-ink mb-4">Frequently asked questions</h2>
        <FAQAccordion items={faq} />
      </section>

      <div className="mt-12">
        <Disclaimer />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Holiday list ${year} for all Indian states and UTs`,
          url: `https://salary-tools.com/holidays/${year}`,
        }}
      />
    </div>
  );
}
