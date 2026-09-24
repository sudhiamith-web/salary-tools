export interface SourceDocument {
  title: string;
  description: string;
  href: string; // path under /public
  issuer: string;
  date: string;
}

export default function SourceDocuments({
  documents,
}: {
  documents: SourceDocument[];
}) {
  return (
    <div className="card px-6 py-5">
      <p className="text-xs uppercase tracking-widest text-charcoal/40 font-semibold mb-4">
        Supporting documents
      </p>
      <div className="space-y-4">
        {documents.map((doc) => (
          <a
            key={doc.href}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accentTint text-accent text-xs font-semibold"
            >
              PDF
            </span>
            <span>
              <span className="block text-sm font-medium text-ink group-hover:text-accent">
                {doc.title}
              </span>
              <span className="block text-xs text-charcoal/50">
                {doc.issuer} · {doc.date}
              </span>
              <span className="block text-xs text-charcoal/60 mt-0.5">
                {doc.description}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
