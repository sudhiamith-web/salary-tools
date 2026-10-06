import { getVerifiedForSitemap } from "./queries";

const BASE = "https://salary-tools.com";

/**
 * Returns sitemap entries for the three hubs, the two tools, and every
 * VERIFIED state page. Unverified states are noindexed, so they are left out.
 * Merge this into app/sitemap.ts (see INTEGRATION_SNIPPETS.md).
 */
export async function complianceSitemapEntries() {
  const now = new Date();
  const fixed = [
    "/holidays",
    "/minimum-wages",
    "/lwf-rates",
    "/tools/lwf-calculator",
    "/tools/minimum-wage-checker",
  ].map((p) => ({ url: `${BASE}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 }));

  const docs = await getVerifiedForSitemap();
  const seen = new Set<string>();
  const dynamic = docs
    .map((d) => {
      const path =
        d.type === "holidayList"
          ? `/holidays/${d.year}/${d.state}`
          : d.type === "minimumWageNotification"
          ? `/minimum-wages/${d.state}`
          : `/lwf-rates/${d.state}`;
      if (seen.has(path)) return null;
      seen.add(path);
      return {
        url: `${BASE}${path}`,
        lastModified: d.lastVerified ? new Date(d.lastVerified) : now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    })
    .filter(Boolean) as { url: string; lastModified: Date; changeFrequency: "monthly"; priority: number }[];

  return [...fixed, ...dynamic];
}
