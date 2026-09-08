import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugsByCategory } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/client";
import PostBody from "@/components/PostBody";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllSlugsByCategory("news");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug("news", params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Salary-Tools News`,
    description: post.excerpt,
  };
}

export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug("news", params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.authorName },
    ...(post.coverImage && { image: urlForImage(post.coverImage).width(1200).url() }),
  };

  const date = new Date(post.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">News</p>
      <h1 className="text-3xl mb-3">{post.title}</h1>
      <p className="text-sm text-charcoal/50 mb-10">
        {post.authorName} · {date}
      </p>
      <PostBody value={post.body} />
    </div>
  );
}
