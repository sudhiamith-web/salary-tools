// FAQ list with FAQPage JSON-LD. Server component (no "use client").
// If your shared FAQAccordion takes { items: {question, answer}[] },
// you can replace this with it — the data shape is the same.

export interface FaqItem {
  question: string;
  answer: string;
}

export function PageFaq({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">Frequently asked questions</h2>
      {items.map((i) => (
        <details key={i.question} className="rounded-md border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-medium text-slate-900">{i.question}</summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{i.answer}</p>
        </details>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

export function Sources({ items }: { items: { label: string; href: string }[] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold text-slate-900">Sources</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((s) => (
          <li key={s.href + s.label}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
