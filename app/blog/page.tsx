import type { Metadata } from "next";
import { getPostsByCategory } from "@/lib/sanity/queries";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = {
  title: "Blog — Salary-Tools",
  description: "Guides and explainers on Indian salary, tax, and HR topics.",
};

export const revalidate = 3600; // fallback safety net; on-demand revalidation handles real updates

export default async function BlogIndexPage() {
  const posts = await getPostsByCategory("blog");

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">Blog</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Guides and explainers on salary structuring, tax planning, and HR
        topics — written to go deeper than a single calculator can.
      </p>

      {posts.length === 0 ? (
        <p className="text-charcoal/50 text-sm">No posts published yet — check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
