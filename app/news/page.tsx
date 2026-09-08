import type { Metadata } from "next";
import { getPostsByCategory } from "@/lib/sanity/queries";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = {
  title: "News — Salary-Tools",
  description: "Tax and payroll law updates relevant to Indian salaried professionals.",
};

export const revalidate = 3600;

export default async function NewsIndexPage() {
  const posts = await getPostsByCategory("news");

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-3xl mb-2">News</h1>
      <p className="text-charcoal/60 mb-10 max-w-xl">
        Tax and payroll law updates that actually change your numbers —
        Budget announcements, Labour Code updates, and similar.
      </p>

      {posts.length === 0 ? (
        <p className="text-charcoal/50 text-sm">No news posted yet — check back soon.</p>
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
