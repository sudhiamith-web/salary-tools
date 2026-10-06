import Link from "next/link";
import { shortDate } from "@/lib/compliance/format";
import type { SourceDoc } from "@/lib/compliance/types";

const BASE = "https://salary-tools.com";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ComplianceBreadcrumb({ items }: { items: { label: string; href: string }[] }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-charcoal/60 mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-ink">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:text-accent">{c.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${BASE}${c.href}`,
          })),
        }}
      />
    </>
  );
}

export function VerifiedBadge({ lastVerified }: { lastVerified?: string }) {
  if (!lastVerified) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-charcoal/70">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 text-accent" fill="currentColor">
        <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm3.7 6.2-4.2 4.2a.75.75 0 0 1-1.06 0L4.3 8.27a.75.75 0 1 1 1.06-1.06l1.6 1.6 3.67-3.67a.75.75 0 0 1 1.06 1.06Z" />
      </svg>
      Checked against the official notification on {shortDate(lastVerified)}
    </span>
  );
}

export function EditorNote({ note }: { note?: string }) {
  if (!note) return null;
  return (
    <div role="note" className="rounded-lg border border-accent/30 bg-accentTint px-4 py-3 text-sm text-ink">
      {note}
    </div>
  );
}

export function NotificationSources({ sources }: { sources?: SourceDoc[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <section aria-labelledby="sources-heading" className="card px-6 py-5">
      <h2 id="sources-heading" className="text-base font-semibold text-ink mb-3">Official sources</h2>
      <ul className="space-y-3">
        {sources.map((s, i) => (
          <li key={`${s.title}-${i}`} className="text-sm">
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink hover:text-accent underline-offset-2 hover:underline">
                {s.title}
              </a>
            ) : (
              <span className="font-medium text-ink">{s.title}</span>
            )}
            <span className="block text-xs text-charcoal/60 mt-0.5">
              {[s.issuedBy, s.reference, s.issuedOn ? shortDate(s.issuedOn) : undefined].filter(Boolean).join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Disclaimer() {
  return (
    <p className="text-xs text-charcoal/60 leading-relaxed max-w-prose">
      This page summarises official government notifications for general information. It is not legal advice.
      Rates and lists can change through new notifications; confirm with the issuing department or a qualified
      labour law professional before acting on them.
    </p>
  );
}

export function PendingVerification({ what, regionName, backHref }: { what: string; regionName: string; backHref: string }) {
  return (
    <div className="card px-6 py-8 max-w-2xl">
      <h2 className="text-lg font-semibold text-ink mb-2">{regionName} {what} is being verified</h2>
      <p className="text-sm text-charcoal/70 mb-4">
        We publish a state only after every figure has been checked against the official notification.
        This one isn&apos;t ready yet.
      </p>
      <Link href={backHref} className="text-sm font-medium text-accent hover:underline">
        See states that are ready
      </Link>
    </div>
  );
}

export function StateCrossLinks({ slug, name, year }: { slug: string; name: string; year: number }) {
  const links = [
    { href: `/holidays/${year}/${slug}`, label: `${name} holiday list ${year}` },
    { href: `/minimum-wages/${slug}`, label: `Minimum wages in ${name}` },
    { href: `/lwf-rates/${slug}`, label: `LWF rates in ${name}` },
    { href: "/tools/minimum-wage-checker", label: "Minimum wage checker" },
    { href: "/tools/lwf-calculator", label: "LWF calculator" },
  ];
  return (
    <nav aria-labelledby="more-heading">
      <h2 id="more-heading" className="text-base font-semibold text-ink mb-3">More for {name}</h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-block rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink hover:border-accent hover:text-accent">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Schema.org Dataset markup for a state data page. */
export function datasetJsonLd(opts: { name: string; description: string; path: string; lastVerified?: string; sourceUrl?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: `${BASE}${opts.path}`,
    ...(opts.lastVerified ? { dateModified: opts.lastVerified } : {}),
    ...(opts.sourceUrl ? { isBasedOn: opts.sourceUrl } : {}),
    creator: { "@type": "Organization", name: "Salary-Tools", url: BASE },
    isAccessibleForFree: true,
    spatialCoverage: { "@type": "Place", name: "India" },
  };
}
