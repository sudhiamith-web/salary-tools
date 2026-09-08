import Link from "next/link";
import Image from "next/image";
import { urlForImage } from "@/lib/sanity/client";
import type { PostSummary } from "@/lib/sanity/queries";

export default function PostCard({ post }: { post: PostSummary }) {
  const date = new Date(post.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="block rounded-xl border border-slate-200/70 bg-white overflow-hidden hover:border-accent hover:shadow-md transition-all"
    >
      {post.coverImage && (
        <div className="aspect-[16/9] bg-slate-100 relative">
          <Image
            src={urlForImage(post.coverImage).width(600).height(340).url()}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <p className="text-xs text-charcoal/50 mb-1">{date}</p>
        <h3 className="font-display text-lg text-ink mb-2">{post.title}</h3>
        {post.excerpt && <p className="text-sm text-charcoal/60 line-clamp-2">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
