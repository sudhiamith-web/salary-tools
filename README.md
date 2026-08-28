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
  layout.tsx        — shell + SiteNav dropdown
  page.tsx           — homepage, pulls tool list from lib/tools.ts
  tools/
    in-hand-salary-calculator/page.tsx
    hra-exemption-calculator/page.tsx
    old-vs-new-regime-calculator/page.tsx
    gratuity-calculator/page.tsx
    tds-calculator/page.tsx
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
components/
  PayslipCard.tsx     — result card, salary calculator
  HRACard.tsx         — result card, HRA calculator
  RingChart.tsx       — dependency-free SVG donut (used for simple 2-slice splits)
  Badge.tsx           — pill component for regime/category labels
  FAQAccordion.tsx    — expandable FAQ + FAQPage JSON-LD schema
  ProjectionSection.tsx — Recharts area chart + table, generic sensitivity/
                        projection view reused across tools
  ToolArticle.tsx     — written-explainer wrapper + FormulaBox callout
  RelatedTools.tsx     — cross-links, reads only from lib/tools.ts
  SiteNav.tsx          — header dropdown, reads only from lib/tools.ts
netlify.toml
```

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
