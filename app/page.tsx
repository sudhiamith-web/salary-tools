import Link from "next/link";

const tools = [
  {
    slug: "in-hand-salary-calculator",
    name: "In-Hand Salary Calculator",
    desc: "Turn your CTC into a real monthly payslip breakup.",
    live: true,
  },
  {
    slug: "hra-exemption-calculator",
    name: "HRA Exemption Calculator",
    desc: "How much of your HRA is actually tax-free.",
    live: true,
  },
  { slug: "income-tax-calculator", name: "Income Tax Calculator", desc: "Old regime vs new regime, side by side.", live: false },
  { slug: "gratuity-calculator", name: "Gratuity Calculator", desc: "What you're owed after 5+ years of service.", live: false },
  { slug: "pf-calculator", name: "EPF Calculator", desc: "Track your PF corpus and employer matching.", live: false },
  { slug: "leave-encashment-calculator", name: "Leave Encashment Calculator", desc: "Cash value of your unused leave.", live: false },
  { slug: "notice-pay-calculator", name: "Notice Pay Calculator", desc: "What a shorter notice period costs you.", live: false },
  { slug: "tds-calculator", name: "TDS Calculator", desc: "Estimate monthly TDS on your salary.", live: false },
  { slug: "salary-hike-calculator", name: "Salary Hike Calculator", desc: "What that hike percentage means in real money.", live: false },
  { slug: "take-home-calculator", name: "Take-Home Pay Calculator", desc: "State-wise professional tax adjusted take-home.", live: false },
];

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
          {tools.map((tool) =>
            tool.live ? (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="block rounded-lg border border-ink/10 bg-white/40 p-5 hover:border-ledger/50 hover:bg-white/70 transition-colors"
              >
                <h3 className="font-display text-lg text-ink mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-charcoal/60">{tool.desc}</p>
              </Link>
            ) : (
              <div
                key={tool.slug}
                className="rounded-lg border border-dashed border-ink/15 p-5 opacity-60"
              >
                <h3 className="font-display text-lg text-ink mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-charcoal/60">{tool.desc}</p>
                <p className="text-xs text-gold mt-3 font-medium">
                  Coming soon
                </p>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
