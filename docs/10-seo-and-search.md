# SEO and Search Infrastructure

## Sitemap (`app/sitemap.ts`)

Automatically generated at `salary-tools.com/sitemap.xml`. Pulls from:
- A fixed list of static pages (homepage, About, Contact, Privacy,
  Terms, Blog index, News index)
- Every tool in `lib/tools.ts` (automatic — adding a tool to that file
  adds it here with no other action needed)
- Every published Blog and News post (fetched live from Sanity at
  request time)

**If Sanity is unreachable or unconfigured** when the sitemap is
generated, the Blog/News URLs are simply omitted (wrapped in a
try/catch) rather than breaking the entire sitemap — the static pages
and tool pages will still be listed correctly.

## Robots.txt (`app/robots.ts`)

Automatically generated at `salary-tools.com/robots.txt`. Currently
allows all crawlers full access and points to the sitemap. No pages are
currently blocked from crawling.

## Google Search Console

Set up as a **Domain property** (covers `salary-tools.com` and all
subdomains), verified via a DNS TXT record in Cloudflare. This means:
- Verification survives even if the hosting provider changes (it's tied
  to DNS, not to Netlify specifically)
- If DNS is ever migrated away from Cloudflare, the TXT record must be
  recreated at the new DNS provider, or Search Console will eventually
  show the property as unverified

**Maintenance tasks:**
- The sitemap should be (re-)submitted in Search Console → Sitemaps
  whenever there's reason to believe indexing has stalled (rare — it
  auto-recrawls periodically) — enter `sitemap.xml`, not the full URL
- New high-priority pages can be pushed for faster indexing via URL
  Inspection → "Request Indexing" — useful right after adding a
  significant new tool or a wave of new content
- Check Coverage/Performance reports periodically for crawl errors or
  pages that aren't getting indexed

## Structured data (Schema.org JSON-LD)

Two schema types are implemented, both improving Google rich-snippet
eligibility:

- **FAQPage schema** — automatically included by the `FAQAccordion`
  component on every tool page. No extra work needed when adding a new
  tool's FAQ; the component handles it.
- **Article / NewsArticle schema** — included on Blog post pages
  (`Article`) and News post pages (`NewsArticle`) respectively, in their
  `[slug]/page.tsx` files, using the post's title, author, publish date,
  and cover image from Sanity.

## Metadata (page titles and descriptions)

Each page sets its own `<title>` and meta description via Next.js's
`generateMetadata` (for dynamic pages like Blog/News posts) or the
static `export const metadata` object (for tool pages and static pages).
When adding a new tool, ensure its page has a distinct, descriptive title
— this is currently handled by the `<h1>` content and should be
reinforced with an explicit `metadata` export if one doesn't already
exist on that page (check the newest tool pages for whether this was
added consistently — this is worth auditing periodically).

## AdSense readiness

See `11-privacy-and-compliance.md` for the compliance prerequisites
(Privacy Policy, Terms, About, Contact pages, cookie consent — all
currently in place). Beyond compliance pages, AdSense approval in
practice also depends on factors outside this codebase's control: site
age and real organic traffic history. There is no code change that
accelerates this — it requires the site to simply run and accumulate
genuine visitors over time before applying.
