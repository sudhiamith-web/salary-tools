"use client";

import { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="divide-y divide-ink/10 border-t border-b border-slate-200">
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-medium text-ink text-sm">{item.question}</span>
              <span className="text-charcoal/40 text-lg flex-shrink-0">
                {openIndex === i ? "−" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <p className="text-sm text-charcoal/70 pb-4 pr-8 leading-relaxed">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
