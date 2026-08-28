import Link from "next/link";
import { relatedTools } from "@/lib/tools";

export default function RelatedTools({ currentSlug }: { currentSlug: string }) {
  const related = relatedTools(currentSlug);
  if (related.length === 0) return null;

  return (
    <div className="border-t border-ink/10 pt-8 mt-4">
      <h3 className="text-sm uppercase tracking-widest text-charcoal/50 font-medium mb-4">
        Related calculators
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="block rounded-lg border border-ink/10 bg-white/40 p-4 hover:border-ledger/50 hover:bg-white/70 transition-colors"
          >
            <h4 className="font-display text-base text-ink mb-1">{tool.name}</h4>
            <p className="text-xs text-charcoal/60">{tool.shortDesc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
