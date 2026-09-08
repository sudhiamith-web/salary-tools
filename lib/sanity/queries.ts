import { sanityClient } from "./client";

export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  category: "blog" | "news";
  excerpt: string;
  coverImage: any;
  authorName: string;
  publishedAt: string;
}

export interface PostDetail extends PostSummary {
  body: any[];
}

const summaryProjection = `{
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  coverImage,
  authorName,
  publishedAt
}`;

export async function getPostsByCategory(category: "blog" | "news"): Promise<PostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "post" && category == $category] | order(publishedAt desc) ${summaryProjection}`,
    { category },
    { next: { tags: [`posts:${category}`] } }
  );
}

export async function getPostBySlug(category: "blog" | "news", slug: string): Promise<PostDetail | null> {
  return sanityClient.fetch(
    `*[_type == "post" && category == $category && slug.current == $slug][0]{
      ${summaryProjection.slice(1, -1)},
      body
    }`,
    { category, slug },
    { next: { tags: [`post:${slug}`] } }
  );
}

export async function getAllSlugsByCategory(category: "blog" | "news"): Promise<string[]> {
  const slugs: string[] = await sanityClient.fetch(
    `*[_type == "post" && category == $category].slug.current`,
    { category }
  );
  return slugs;
}
