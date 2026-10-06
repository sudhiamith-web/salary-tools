import Link from "next/link";
import { REGIONS, type Region } from "@/lib/compliance/states";

export interface StateCell {
  /** Main figure or status line, e.g. "₹15,560 – ₹21,509 / month" */
  primary?: string;
  /** Smaller supporting line, e.g. "Effective 1 Apr 2026" */
  secondary?: string;
  /** Visually de-emphasise (e.g. LWF not applicable) */
  muted?: boolean;
}

function Cell({ region, href, cell }: { region: Region; href: string; cell?: StateCell }) {
  const ready = !!cell;
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-lg border px-4 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
        ready ? "border-slate-200 bg-white hover:border-accent" : "border-dashed border-slate-200 bg-paperDark/40"
      }`}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className={`font-medium ${ready ? "text-ink group-hover:text-accent" : "text-charcoal/50"}`}>{region.name}</span>
        <span className="text-xs text-charcoal/40">{region.code}</span>
      </span>
      {ready ? (
        <>
          {cell.primary && (
            <span className={`mt-1 text-sm ${cell.muted ? "text-charcoal/50" : "text-ink"}`}>{cell.primary}</span>
          )}
          {cell.secondary && <span className="mt-0.5 text-xs text-charcoal/60">{cell.secondary}</span>}
        </>
      ) : (
        <span className="mt-1 text-xs text-charcoal/50">Being verified</span>
      )}
    </Link>
  );
}

export default function StateGrid({
  hrefFor,
  cells,
}: {
  hrefFor: (slug: string) => string;
  cells: Record<string, StateCell | undefined>;
}) {
  const groups: { title: string; regions: Region[] }[] = [
    { title: "States", regions: REGIONS.filter((r) => r.kind === "state") },
    { title: "Union territories", regions: REGIONS.filter((r) => r.kind === "ut") },
  ];
  return (
    <div className="space-y-10">
      {groups.map((g) => {
        const ready = g.regions.filter((r) => cells[r.slug]).length;
        return (
          <section key={g.title} aria-labelledby={`grid-${g.title}`}>
            <h2 id={`grid-${g.title}`} className="text-xl font-semibold text-ink mb-1">{g.title}</h2>
            <p className="text-sm text-charcoal/60 mb-4">
              {ready} of {g.regions.length} published
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.regions.map((r) => (
                <Cell key={r.slug} region={r} href={hrefFor(r.slug)} cell={cells[r.slug]} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
