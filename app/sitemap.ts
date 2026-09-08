import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { getAllSlugsByCategory } from "@/lib/sanity/queries";

const BASE_URL = "https://salary-tools.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/news`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  let blogPages: MetadataRoute.Sitemap = [];
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const [blogSlugs, newsSlugs] = await Promise.all([
      getAllSlugsByCategory("blog"),
      getAllSlugsByCategory("news"),
    ]);
    blogPages = blogSlugs.map((slug) => ({
      url: `${BASE_URL}/blog/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
    newsPages = newsSlugs.map((slug) => ({
      url: `${BASE_URL}/news/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Sanity not configured yet, or a fetch error — sitemap still works
    // for the static pages and tools, just without post URLs for now.
  }

  return [...staticPages, ...toolPages, ...blogPages, ...newsPages];
}

