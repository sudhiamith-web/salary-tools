export interface TOCSection {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl px-5 py-4 font-mono text-sm my-4 whitespace-pre-wrap">
      {children}
    </div>
  );
}

export default function ArticleWithTOC({ sections }: { sections: TOCSection[] }) {
  return (
    <div className="grid md:grid-cols-[180px_1fr] gap-8">
      <nav className="hidden md:block sticky top-24 self-start">
        <p className="text-xs uppercase tracking-widest text-charcoal/40 font-semibold mb-3">
          On this page
        </p>
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="toc-link">
            {s.label}
          </a>
        ))}
      </nav>
      <div className="max-w-2xl space-y-10">
        {sections.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-2xl mb-4">{s.label}</h2>
            <div className="text-charcoal/80 text-[15px] leading-relaxed space-y-4">
              {s.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
