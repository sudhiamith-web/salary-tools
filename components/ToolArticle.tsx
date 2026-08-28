export function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl px-5 py-4 font-mono text-sm my-4">
      {children}
    </div>
  );
}

export default function ToolArticle({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="prose-none max-w-2xl">
      <h2 className="text-2xl mb-4">{title}</h2>
      <div className="text-charcoal/80 text-[15px] leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}
