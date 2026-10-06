import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { COMPLIANCE_TAG } from "@/lib/compliance/sanityFetch";

/**
 * Sanity webhook target. When you publish a holiday list, wage notification,
 * wage schedule or LWF rule, Sanity calls this URL and every compliance page
 * refetches on its next visit. No Netlify deploy needed.
 *
 * Webhook URL: https://salary-tools.com/api/revalidate?secret=YOUR_SECRET
 * Env var on Netlify: SANITY_REVALIDATE_SECRET=YOUR_SECRET
 */
export async function POST(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, message: "Invalid secret" }, { status: 401 });
  }
  revalidateTag(COMPLIANCE_TAG);
  return NextResponse.json({ ok: true, revalidated: COMPLIANCE_TAG, at: new Date().toISOString() });
}
