import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity/client";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="text-2xl text-ink mt-8 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl text-ink mt-6 mb-2">{children}</h3>,
    normal: ({ children }) => <p className="text-charcoal/80 text-[15px] leading-relaxed mb-4">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent pl-4 italic text-charcoal/70 my-4">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-charcoal/80">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-charcoal/80">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} className="text-accent underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  },
  types: {
    image: ({ value }) => (
      <div className="my-6 rounded-xl overflow-hidden border border-slate-200">
        <Image
          src={urlForImage(value).width(900).url()}
          alt={value.alt || ""}
          width={900}
          height={500}
          className="w-full h-auto"
        />
      </div>
    ),
  },
};

export default function PostBody({ value }: { value: any[] }) {
  return <PortableText value={value} components={components} />;
}
