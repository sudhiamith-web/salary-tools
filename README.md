# Salary-Tools

Salary, tax and HR calculators for Indian professionals. Built with Next.js
14 (App Router) + Tailwind CSS + Recharts. Live at salary-tools.com.

> **Full documentation:** this README is a short developer quick-reference.
> For complete, maintainer-oriented documentation — architecture, deployment,
> environment setup, the design system, a full reference for every
> calculator's underlying tax law, and more — start at
> [`DOCUMENTATION.md`](./DOCUMENTATION.md) or browse the [`docs/`](./docs)
> folder.

## ⚠️ Upload instructions (read this before pushing to GitHub)

Upload the CONTENTS of this folder directly into the repo root — NOT this
folder itself as a subfolder. If GitHub shows a nested folder inside the
repo, Netlify's build will fail to find package.json.

## Run it locally

```bash
npm install
npm run dev
```

## Deploy to Netlify

This repo includes `netlify.toml` (build command, publish directory,
`@netlify/plugin-nextjs`). Leave Netlify's own UI build-setting fields
blank so they don't override the file.

## Project structure

```
app/
  layout.tsx        — shell + SiteNav dropdown + ConsentGate
  page.tsx           — homepage, pulls tool list from lib/tools.ts
  sitemap.ts         — auto-generated sitemap.xml, reads lib/tools.ts —
                        add a tool there and it appears here automatically
  robots.ts          — auto-generated robots.txt, points to the sitemap
  about/page.tsx      — About page
  contact/page.tsx    — Contact page (uses hello@salary-tools.com — set
                        this up as a real domain email before launch)
  terms/page.tsx      — Terms & Conditions / disclaimer
  privacy/page.tsx    — privacy policy (required before AdSense application)
  tools/
    in-hand-salary-calculator/page.tsx
    hra-exemption-calculator/page.tsx
    old-vs-new-regime-calculator/page.tsx
    gratuity-calculator/page.tsx
    tds-calculator/page.tsx
    advance-tax-calculator/page.tsx
    section-80c-planner/page.tsx
    section-80d-calculator/page.tsx
    ltcg-calculator/page.tsx
    stcg-calculator/page.tsx
    freelancer-tax-calculator/page.tsx
    salary-vs-freelance-calculator/page.tsx
    property-capital-gains-calculator/page.tsx
    esop-tax-calculator/page.tsx
    salary-capital-gains-calculator/page.tsx
    rsu-tax-calculator/page.tsx
lib/
  tools.ts           — SINGLE SOURCE OF TRUTH for live tools (nav, homepage,
                        related-tools cross-links all read from here). Add
                        a tool here only once it's actually live — never
                        list unbuilt tools to visitors.
  calculators/
    salary.ts        — CTC → in-hand salary, new-regime tax logic
    hra.ts            — Section 10(13A) HRA exemption logic
    oldRegime.ts      — old regime slabs, 80C/80D/HRA deductions, 87A rebate
    gratuity.ts       — Payment of Gratuity Act 1972 + Labour Codes
                        (fixed-term 1-yr eligibility, 50% wage rule),
                        Section 10(10) exemption
    advanceTax.ts     — Section 234B/234C penal interest, quarterly schedule
    section80c.ts     — 80C (₹1.5L) + 80CCD(1B) NPS bucket (₹50k, separate)
    section80d.ts     — 80D self/family + parents brackets, senior citizen limits
    capitalGains.ts   — LTCG (12.5%, Sec 112A) + STCG (20%, Sec 111A) on
                        listed equity/equity mutual funds only
    section44ada.ts   — presumptive taxation for professionals, ₹50L/₹75L limits
    property.ts       — property LTCG, full CII table 2001-02 to 2026-27,
                        grandfathering choice (12.5% vs 20% indexed)
    esop.ts           — ESOP exercise perquisite + sale capital gains
                        (listed vs unlisted holding-period rules)
    rsu.ts            — foreign RSU vesting perquisite + sale, SBI TTBR
                        forex conversion rule, unlisted-share treatment
components/
  PayslipCard.tsx / HRACard.tsx — result cards (hero-box + card pattern)
  RingChart.tsx       — dependency-free SVG donut (simple 2-slice splits)
  Badge.tsx           — pill component (filled/outline/success/warn variants)
  FAQAccordion.tsx    — expandable FAQ + FAQPage JSON-LD schema
  ProjectionSection.tsx — Recharts area chart + table, generic projections
  ToolArticle.tsx     — written-explainer wrapper + FormulaBox callout
  RelatedTools.tsx     — cross-links, reads only from lib/tools.ts
  SiteNav.tsx          — header dropdown, reads only from lib/tools.ts
  GoogleAnalytics.tsx  — GA4 script loader, reads NEXT_PUBLIC_GA_ID
  ConsentGate.tsx       — cookie banner; only renders GoogleAnalytics after
                        the visitor accepts (stored in localStorage)
netlify.toml
.env.local.example    — copy to .env.local, set NEXT_PUBLIC_GA_ID
```

## Blog & News (Sanity CMS)

Content lives in Sanity, not in the codebase — publishing a post never
requires a deploy. Sanity Studio is embedded in this same app at
`/studio`, so there's nothing separate to host or deploy.

**How it works:** write/publish in Studio → Sanity fires a webhook →
`/api/revalidate` refreshes just the affected page (`revalidatePath` +
`revalidateTag`) → the new/updated post is live within seconds. No
GitHub, no Netlify, no rebuild.

```
sanity.config.ts              — Studio config (schema, project ID from env)
sanity/schemaTypes/post.ts    — the Post content model (title, slug,
                                 category: blog|news, cover image,
                                 excerpt, rich text body, author, date)
app/studio/[[...tool]]/page.tsx — embedded Studio route
app/api/revalidate/route.ts   — webhook Sanity calls on publish/update
lib/sanity/
  client.ts                   — read-only Sanity client + image URL builder
  queries.ts                  — GROQ queries (by category, by slug, all slugs)
app/blog/  and  app/news/     — separate listing + [slug] detail pages,
                                 sharing PostCard and PostBody components
components/
  PostCard.tsx                — listing card, used by both sections
  PostBody.tsx                — Portable Text (rich text) renderer
```

### One-time setup (required before Blog/News work at all)

1. Create a free account at sanity.io, then a new project via the web
   dashboard (Manage Console) — no CLI needed. Note the Project ID.
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
   (usually `production`) as Netlify environment variables.
3. In Sanity's dashboard → API → Webhooks, create a webhook pointing to
   `https://salary-tools.com/api/revalidate`, filtered to the `post`
   document type, with a secret you choose.
4. Set that same secret as `SANITY_REVALIDATE_SECRET` in Netlify.
5. Deploy once (this is the LAST deploy blog work ever needs). Visit
   `salary-tools.com/studio`, sign in with your Sanity account, and
   start writing. Every post after this point is deploy-free.

Set `NEXT_PUBLIC_GA_ID` (format `G-XXXXXXXXXX`) as an environment variable
in Netlify (Site configuration → Environment variables) and redeploy with
cache cleared. Analytics only loads after a visitor accepts the cookie
banner — see `ConsentGate.tsx`. See `.env.local.example` for local dev.

## Design system (Royal Dark)

Palette: `ink #111827` (dark nav, headings), `accent #6D28D9` / `accentDark
#4C1D95` / `accentLight #A78BFA` / `accentTint #EDE9FE` (purple,
interactive elements), `paper #FAFAFA` (page bg). `ledger` (green) and
`rust` (red) are kept SEPARATE from the accent — they carry the
financial "positive/negative" meaning in ledger rows and must not be
repurposed for brand/interactive use.

New structural components (see `components/`):
- `Breadcrumb.tsx` — Home › Calculators › [Tool], present on all 16 tool pages
- `SliderField.tsx` — number input + range slider, pairs with `Field`
- `InsightBanner.tsx` — dynamic "X more → Y benefit" nudge; needs real
  per-tool marginal-delta logic (see HRA and In-Hand Salary pages for
  the pattern), not a generic message
- `ArticleWithTOC.tsx` — two-column article layout with a sticky sidebar
  table of contents; built but NOT YET applied to existing tool articles
  (they still use the older stacked `ToolArticle` component) — retrofit
  is a remaining task, see below
- `SiteNav.tsx` — now renders ONE DROPDOWN PER CATEGORY (not one dropdown
  containing all categories) — adding "Investments" or "Loans" to
  `lib/tools.ts` later just adds another top-level nav item automatically

### Rollout status: complete

All 16 tools now have: the Royal Dark palette, a breadcrumb, `SliderField`
inputs on primary numeric fields, a genuine `InsightBanner` with real
per-tool marginal-delta logic (except Advance Tax, which has its own
inline dynamic insight predating the shared component, and Salary vs
Freelance, whose hero-box comparison already functions as the insight),
and `ArticleWithTOC` with a sticky sidebar table of contents replacing
the old stacked `ToolArticle` layout. `ToolArticle.tsx` is kept only for
its `FormulaBox` export, which some pages still import from there instead
of `ArticleWithTOC.tsx` — both export identical `FormulaBox` components,
so either import path works.

## The standard tool-page template

Every tool page (new or existing) follows this structure top to bottom:
1. Calculator — inputs + result card (existing pattern, keep using it)
2. Projection/sensitivity section — `ProjectionSection` (single series) or
   a bespoke Recharts chart if you need multiple series (see the Old vs
   New Regime page for a two-line example)
3. Written explainer — `ToolArticle` + `FormulaBox`, ORIGINAL content only,
   verify statutory facts before writing anything presented as current law
4. FAQ — `FAQAccordion`, 4-6 original questions per tool
5. `RelatedTools` cross-links at the bottom

When adding a new tool: build the calculator first, add it to
`lib/tools.ts` ONLY once it's actually live, then add the four sections
above using the existing tools as templates.

## Fact-checking discipline

Any statutory figure (tax slabs, exemption caps, statutory percentages)
that gets written into FAQ or article copy must be verified against a
current source before publishing — don't copy figures from competitor
sites without checking. Example: the Labour Codes took legal effect
21 November 2025 and already changed real gratuity rules (fixed-term
eligibility, the 50% wage rule) even though Central/state Rules are
still being finalized through 2026 — verified Aug 2026, re-check
periodically since rules are still rolling out.

## Known simplifications

- Neither tax engine (old or new regime) implements surcharge (income >
  ₹50L) or marginal relief near the rebate thresholds.
- Old regime engine only models general slabs (individuals under 60).
  Senior/super-senior citizen slabs are separate and not yet modeled.
- Professional tax default is a flat approximation, not state-specific.
- TDS calculator assumes even monthly withholding — real employer
  schedules often front-load or adjust through the year.
