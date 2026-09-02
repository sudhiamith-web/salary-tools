# Salary-Tools

Salary, tax and HR calculators for Indian professionals. Built with Next.js
14 (App Router) + Tailwind CSS + Recharts. Live at salary-tools.com.

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

## Analytics setup

Set `NEXT_PUBLIC_GA_ID` (format `G-XXXXXXXXXX`) as an environment variable
in Netlify (Site configuration → Environment variables) and redeploy with
cache cleared. Analytics only loads after a visitor accepts the cookie
banner — see `ConsentGate.tsx`. See `.env.local.example` for local dev.

## Design system

Cool near-white background (`paper: #F7F9FC`), white floating cards with
soft shadows (`.card` / `.card-flat` classes), bright blue accent
(`accent: #2E5EFF`) as the primary interactive color, tinted callouts for
info/insight/warnings (`.callout-info`, `.callout-insight`,
`.callout-warn`), and a bright `.hero-box` for each tool's primary result
number. Dotted-leader `.ledger-row` rows are kept for label→value detail
breakdowns — the one surviving piece of the original paper/ledger look.

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
