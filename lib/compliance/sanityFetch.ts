// Minimal Sanity HTTP query helper.
//
// Why not reuse lib/sanity's client? This file has zero package
// dependencies, so it works in server components AND in client components
// (the minimum wage checker fetches a state's rates in the browser).
// It reads only PUBLISHED documents from the public dataset.

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f3c45rz4";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = "2024-01-01";

/** Cache tag used by app/api/revalidate to refresh every compliance page at once. */
export const COMPLIANCE_TAG = "compliance";

/** How long pages cache before refetching, if the webhook isn't set up. */
export const REVALIDATE_SECONDS = 3600;

export async function sanityQuery<T>(
  query: string,
  params: Record<string, string | number> = {},
  opts: { browser?: boolean } = {}
): Promise<T> {
  const host = opts.browser ? "apicdn.sanity.io" : "api.sanity.io";
  const search = new URLSearchParams({ query, perspective: "published" });
  for (const [k, v] of Object.entries(params)) search.set(`$${k}`, JSON.stringify(v));

  const url = `https://${PROJECT_ID}.${host}/v${API_VERSION}/data/query/${DATASET}?${search.toString()}`;

  const res = await fetch(
    url,
    opts.browser
      ? undefined
      : ({ next: { revalidate: REVALIDATE_SECONDS, tags: [COMPLIANCE_TAG] } } as RequestInit)
  );

  if (!res.ok) {
    throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

/** Same as sanityQuery but returns a fallback instead of throwing (keeps pages up if Sanity is down). */
export async function sanityQuerySafe<T>(
  query: string,
  params: Record<string, string | number>,
  fallback: T
): Promise<T> {
  try {
    const r = await sanityQuery<T>(query, params);
    return r ?? fallback;
  } catch (e) {
    console.error(e);
    return fallback;
  }
}
