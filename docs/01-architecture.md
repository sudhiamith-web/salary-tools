# Architecture

## System diagram (in words)

```
Visitor's browser
      │
      ▼
Netlify (hosting + CDN + serverless functions)
      │  runs the Next.js app, built from...
      ▼
GitHub (source code repository)
      │  connected via Netlify's GitHub integration —
      │  every push to the main branch triggers a build
      ▼
[Cloudflare]  ──DNS──▶  salary-tools.com points to Netlify
[Cloudflare]  ──Email Routing──▶  hello@salary-tools.com forwards to Gmail

Blog/News content:
Sanity Studio (embedded at /studio, part of the Next.js app)
      │  content authored here is stored in...
      ▼
Sanity's hosted database (a separate service, NOT in this codebase)
      │  fetched at request time by...
      ▼
Next.js pages (/blog, /news) — via GROQ queries
      │  when content is published, Sanity calls...
      ▼
/api/revalidate (a Next.js API route) — refreshes just the changed
page, instantly, with NO rebuild and NO deploy

Analytics:
Visitor's browser ──▶ Google Analytics (GA4), only after cookie consent
```

## Why this architecture, specifically

**Next.js on Netlify (not a static export):** the site uses Netlify's
actual Next.js Runtime (`@netlify/plugin-nextjs` in `netlify.toml`), not
a plain static site export. This matters because it enables:
- Server-side rendering and dynamic data fetching (needed for Blog/News
  to pull fresh content from Sanity on each request)
- On-demand revalidation (needed for zero-deploy content publishing)
- API routes (needed for the Sanity webhook handler)

A simpler static export would have been easier to reason about, but
would have made content publishing require a full rebuild every time —
explicitly ruled out as a requirement.

**Sanity CMS, embedded rather than externally hosted:** Sanity Studio
(the content editor) is embedded directly inside this Next.js app at the
`/studio` route, rather than using Sanity's own separate hosted Studio
(which normally requires their CLI to deploy). This was a deliberate
choice because the founder's local machine can't run CLI tools (no admin
rights) — embedding means Studio ships as part of the normal app
deployment, with zero separate deployment step ever needed again after
initial setup.

**No traditional database for calculators:** every calculator is a pure
function — given the same inputs, always produces the same outputs, with
no server round-trip. This keeps calculators fast, keeps user financial
data entirely client-side (nothing is ever transmitted or stored — see
`11-privacy-and-compliance.md`), and avoids the operational overhead of
running and securing a database for what is, functionally, arithmetic.

**Cloudflare for DNS/email only, not hosting:** the domain is registered
and DNS-managed through Cloudflare, but the actual site is NOT served
through Cloudflare's hosting products (no Cloudflare Pages/Workers
involved). Cloudflare's role is purely: point the domain at Netlify, and
provide free email routing for the `hello@salary-tools.com` address.

## Directory structure

```
app/                          — Next.js App Router pages
  layout.tsx                  — global shell: header (dark nav), footer,
                                 fonts, ConsentGate (cookie banner + GA)
  page.tsx                    — homepage (pulls tool list from lib/tools.ts)
  sitemap.ts                  — auto-generated sitemap.xml
  robots.ts                   — auto-generated robots.txt
  about/, contact/, terms/, privacy/  — static trust/compliance pages
  studio/[[...tool]]/         — embedded Sanity Studio
  api/revalidate/             — webhook Sanity calls on publish
  blog/, news/                — listing + [slug] detail pages
  tools/<slug>/page.tsx       — one folder per calculator (16 total)

lib/
  tools.ts                    — SINGLE SOURCE OF TRUTH for which tools are
                                 live; drives navigation, homepage, and
                                 cross-links. See note below.
  calculators/                — one file per calculator's pure logic,
                                 fully decoupled from UI (see
                                 08-calculators-reference.md)
  sanity/
    client.ts                 — read-only Sanity client + image URL builder
    queries.ts                — GROQ queries for fetching posts

components/                   — shared UI: cards, sliders, FAQ accordion,
                                 breadcrumb, the article/TOC layout, etc.

sanity/
  schemaTypes/post.ts         — the content model for Blog/News posts
sanity.config.ts               — Sanity Studio configuration

netlify.toml                  — build configuration (see 03-deployment.md)
tailwind.config.ts             — design tokens (see 07-design-system.md)
.env.local.example             — template for required environment variables
```

## The `lib/tools.ts` pattern — read this carefully

This file is the single source of truth for which calculators are
publicly visible. The navigation dropdown, the homepage grid, the
sitemap, and every "related tools" cross-link block all read from this
one array — nothing else hardcodes the tool list.

**The rule: a tool only gets added to `lib/tools.ts` once it is fully
built, tested, and ready for real visitors.** An unbuilt or half-finished
tool should never appear here — the site deliberately shows nothing
rather than a "coming soon" placeholder (a decision made after review
found placeholder-heavy tool directories look unfinished, not ambitious).

## Request flow for a calculator page

1. Visitor requests `/tools/hra-exemption-calculator`
2. Next.js serves the page (client component — calculators are
   interactive, so they render and compute entirely in the browser)
3. The page imports its calculation logic from `lib/calculators/hra.ts`
4. As the visitor adjusts sliders, React state updates trigger
   recomputation via `useMemo` — no network request involved
5. Nothing about the visitor's inputs is ever sent anywhere (confirmed
   in the Privacy Policy — see `11-privacy-and-compliance.md`)

## Request flow for a Blog/News page

1. Visitor requests `/blog/some-post-slug`
2. Next.js runs `getPostBySlug()` (in `lib/sanity/queries.ts`), which
   queries Sanity's API
3. The page renders server-side with the fetched content
4. This page is cached; it's only re-fetched when Sanity's webhook tells
   Next.js to revalidate that specific path (see `06-content-management-cms.md`)

## Version/technology summary

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Not a static export — uses SSR/API routes |
| Hosting | Netlify | Via `@netlify/plugin-nextjs` |
| Styling | Tailwind CSS | Custom design tokens, see `07-design-system.md` |
| Charts | Recharts | Used for projection charts and comparisons |
| CMS | Sanity | Embedded Studio, GROQ queries, webhook-driven revalidation |
| Analytics | Google Analytics 4 | Consent-gated, see `11-privacy-and-compliance.md` |
| DNS/Domain | Cloudflare | Registrar + DNS + Email Routing |
| Source control | GitHub | Web-upload workflow, not local `git` — see `02-getting-started.md` |
