# Adding a New Calculator

A checklist-style walkthrough for building tool #17 and beyond, matching
the established pattern exactly. Follow this in order.

## Step 1: Research and verify the statutory basis

Before writing any code, confirm the actual current rule(s) the
calculator will implement — rates, limits, eligibility conditions,
formulas — against a current, authoritative source. See the
"Verification standard" section at the end of
`08-calculators-reference.md`. Do not build from memory or assumption,
and do not copy figures from a competitor site without independent
verification.

## Step 2: Build the calculation engine

Create `lib/calculators/<name>.ts`:
- Pure functions only — no React, no UI concerns
- A header comment stating: what the calculator covers, the formula(s),
  the verification date, and any known simplifications or explicitly
  out-of-scope edge cases
- Exported constants for any statutory figures (limits, rates) rather
  than magic numbers inline — makes future updates a one-line change
- TypeScript interfaces for inputs and outputs

Look at `lib/calculators/hra.ts` or `lib/calculators/section80d.ts` for
a template — both are relatively simple, well-commented examples.

## Step 3: Build the page

Create `app/tools/<slug>/page.tsx` as a client component (`"use client"`
at the top). Follow the standard layout order documented in
`07-design-system.md` under "The standard tool-page layout":

1. `Breadcrumb`
2. Title + description
3. Critical caveat callout, if any (`.callout-warn`)
4. Inputs (`SliderField` for primary numeric fields) + result card
   (`.hero-box` + `.card` with `.ledger-row` breakdowns)
5. `InsightBanner`, only if there's a genuine computable "what if"
6. `ProjectionSection` or a bespoke chart, if a sensitivity view adds
   value
7. `ArticleWithTOC` — 2-4 named sections explaining the rule, with a
   `FormulaBox` for the core formula
8. `FAQAccordion` — 4-6 original questions
9. `RelatedTools currentSlug="<slug>"` at the end

Copy the structure of an existing, similar tool as your starting point
rather than building from a blank file — e.g. `section-80d-calculator`
for another deduction-style tool, or `ltcg-calculator` for another
capital-gains tool.

## Step 4: Write the insight banner logic (if applicable)

If a genuine "what if" delta exists for this tool (e.g., unused
deduction headroom, waiting for long-term capital gains treatment,
increasing an input to cross a threshold), compute it with a real
`useMemo` against the calculator's actual logic — see
`app/tools/hra-exemption-calculator/page.tsx` for a clean example. If no
genuine insight exists, omit the banner. Never hardcode a generic
message.

## Step 5: Write the article content

Write original explanatory content — never paraphrase a competitor
site's copy closely enough to risk being a rewrite of their work.
Structure it into 2-4 logical named sections for the `ArticleWithTOC`
sidebar (e.g., "How it's calculated", "Key rules", "What changed
recently"). Include a `FormulaBox` showing the core formula in
plain-text/pseudo-formula style.

## Step 6: Write the FAQ

4-6 original questions. Good FAQ questions tend to address:
- A common misconception or edge case
- "What if my situation is slightly different" scenarios
- A cross-reference to another tool where relevant ("use the X
  calculator instead if...")

## Step 7: Register the tool

Add an entry to `lib/tools.ts`:

```typescript
{
  slug: "your-tool-slug",
  name: "Your Tool Display Name",
  shortDesc: "One short sentence, shown on cards and nav.",
  category: "Salary & Tax", // or a new category if applicable
},
```

**This is the ONLY step that makes the tool publicly visible** — it
immediately appears in the nav dropdown, the homepage grid, the
sitemap, and every other live tool's "related tools" section. Do this
step LAST, only once the tool is fully built, checked, and ready for
real visitors — never register a half-finished tool.

## Step 8: If this is a new category (not "Salary & Tax")

The navigation automatically renders one dropdown per distinct category
found in `lib/tools.ts` — no other code changes are needed to introduce
a new category (e.g., "Investments", "Loans"). Just use the new category
string consistently across every tool that belongs to it.

## Step 9: Deploy and verify

Follow `03-deployment.md`. After the deploy, manually check:
- The tool appears in the nav dropdown and homepage grid
- Sliders and the result card respond correctly to input changes
- The insight banner (if present) shows a sensible, correctly computed
  message across a few different input combinations — including edge
  cases (zero, very large numbers, boundary values around any threshold)
- The article's sidebar TOC links jump to the correct sections
- The FAQ accordion expands/collapses correctly
- Related tools links point to real, live tools
- The page appears in `/sitemap.xml` (it's generated automatically from
  `lib/tools.ts`, so this should be automatic — but verify)

## Common mistakes to avoid

- **Registering the tool in `lib/tools.ts` before it's actually done** —
  this makes an unfinished tool publicly discoverable and cross-linked
  from other pages
- **Hardcoding a statutory figure without a comment noting where it came
  from and when it was verified** — the next person (or you, in a year)
  has no way to know if it's still current
- **Faking an insight banner with a generic, non-computed message** —
  breaks the pattern that makes these banners trustworthy
- **Skipping the fact-verification step** because a competitor site
  already states a figure — competitor sites have been found to state
  incorrect figures (e.g., an incorrect 80C limit) in this exact domain
