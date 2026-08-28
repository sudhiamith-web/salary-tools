import Link from "next/link";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-20 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-ledger font-medium mb-4">
          Built for working India
        </p>
        <h1 className="text-4xl md:text-5xl leading-tight mb-5">
          Know what actually lands in your account.
        </h1>
        <p className="text-charcoal/70 text-lg">
          Free calculators for salary, tax and HR questions — no signup,
          no ads on the results, numbers you can verify against your own
          payslip.
        </p>
      </section>

      <section className="pb-24">
        <h2 className="text-sm uppercase tracking-widest text-charcoal/50 mb-6 font-body font-medium">
          Calculators
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block rounded-lg border border-ink/10 bg-white/40 p-5 hover:border-ledger/50 hover:bg-white/70 transition-colors"
            >
              <h3 className="font-display text-lg text-ink mb-1">{tool.name}</h3>
              <p className="text-sm text-charcoal/60">{tool.shortDesc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
