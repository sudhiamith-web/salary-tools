# Design System

The current visual identity is called **"Royal Dark"** internally — a
dark navigation bar, a purple primary accent, and clean white cards on a
near-white background. All tokens live in `tailwind.config.ts` and
`app/globals.css`; never hardcode a color value in a component when a
token already exists for it.

## Color tokens

Defined in `tailwind.config.ts` under `theme.extend.colors`:

| Token | Hex | Use |
|---|---|---|
| `ink` | `#111827` | Dark navigation bar, headings, primary text |
| `paper` | `#FAFAFA` | Page background |
| `paperDark` | `#F3F4F6` | Slightly deeper background (table headers, etc.) |
| `accent` | `#6D28D9` | Primary interactive color — buttons, active states, links, brand mark |
| `accentDark` | `#4C1D95` | Hover/pressed states for accent elements |
| `accentLight` | `#A78BFA` | Secondary chart series, subtle highlights |
| `accentTint` | `#EDE9FE` | Light backgrounds for hero boxes and active nav items |
| `insight` | `#4C1D95` | Text color for insight banners |
| `insightTint` | `#F5F3FF` | Background for insight banners |
| `ledger` | `#0E9F6E` | **Reserved for financial "positive/exempt" meaning** — earnings, tax saved, exemptions. NOT a general-purpose green; don't reuse for unrelated UI |
| `rust` | `#DC2626` | **Reserved for financial "negative/owed" meaning** — deductions, tax payable. NOT a general-purpose red |
| `gold` | `#C27803` | Warning/caution accents |
| `charcoal` | `#374151` | Secondary/muted body text |

**Important rule:** `ledger` and `rust` carry specific financial meaning
throughout the ledger-row breakdowns on every calculator. They are
deliberately kept separate from the `accent` (brand/interactive) color
so that a visitor can learn, once, that green means "good for you" and
red means "costs you" — and have that hold true on every single tool.
Never repurpose these two tokens for non-financial UI decoration.

## Typography

- **Display font (headings, hero numbers):** Fraunces (serif) — loaded
  via `next/font/google` in `app/layout.tsx`
- **Body font:** IBM Plex Sans
- **Monospace (all numeric values):** IBM Plex Mono — every rupee figure
  on the site uses this, for visual consistency and to make numbers easy
  to scan/compare

## Core component patterns

Documented here at the pattern level; see `components/` for the actual
implementations.

### `.card` / `.card-flat`
The standard white container with a soft shadow (`.card`) or a flat
border-only version (`.card-flat`, used for tables). Defined in
`app/globals.css`.

### `.hero-box`
The prominent, tinted box used for every calculator's primary result
number (`accentTint` background). Every tool page should have exactly
one — it's the first thing a visitor's eye should land on.

### `.ledger-row`
A label-dotted-leader-value row, used throughout result breakdowns
(e.g., "Basic salary ⋯⋯⋯ ₹4,80,000"). This is the one surviving visual
element from an earlier "paper ledger" design iteration — kept because
it genuinely works well for label→value pairs, independent of the
broader palette around it.

### `Breadcrumb` (component)
`Home › Calculators › [Tool Name]` trail, present on every tool page.
See `components/Breadcrumb.tsx`.

### `SliderField` (component)
A number input paired with a range slider — the standard input pattern
for a calculator's primary numeric fields. See
`components/SliderField.tsx`. Secondary/precise inputs (e.g., four small
quarterly payment amounts) may reasonably stay as plain number inputs
where a slider adds no value — this is a judgment call, not a hard rule.

### `InsightBanner` (component)
A tinted callout showing a **genuinely computed, tool-specific**
"what if" nudge (e.g., "Using your remaining ₹40,000 of 80C headroom
would save you ₹12,000 more"). See `components/InsightBanner.tsx`.

**Critical rule when adding this to a new tool:** the message must be
backed by a real calculation using that tool's actual logic — never a
generic or hardcoded message. If there's no genuine, computable "what
if" insight for a given tool, it's acceptable to omit the banner
entirely rather than fake one.

### `ArticleWithTOC` (component)
The two-column article layout — a sticky sidebar table of contents on
the left, content sections on the right. See
`components/ArticleWithTOC.tsx`. Every tool's written explainer uses
this; it replaced an earlier single-column `ToolArticle` component
(`components/ToolArticle.tsx`, kept only for its `FormulaBox`
sub-component, still used for displaying formulas in a code-block style).

### `Badge` (component)
Small pill labels — `variant="filled"` (accent-colored), `"outline"`
(default), `"success"` (green, ties to the `ledger` meaning), `"warn"`
(amber). See `components/Badge.tsx`.

### `FAQAccordion` (component)
Expandable Q&A list with FAQPage JSON-LD schema markup baked in (for
Google rich-snippet eligibility). See `components/FAQAccordion.tsx`.

### `ProjectionSection` (component)
A Recharts area chart + table showing how a result changes across a
range of the primary input (e.g., tax at different income levels). See
`components/ProjectionSection.tsx`. For a two-series comparison (like
Old vs New Regime), a bespoke chart is used instead — see that tool's
page for the pattern rather than trying to force `ProjectionSection`
into a shape it wasn't designed for.

## The standard tool-page layout, top to bottom

Every calculator page follows this order — new tools should match it:

1. Breadcrumb
2. Title + one-sentence description
3. Any critical caveat (e.g., "old regime only") as a `.callout-warn` box
4. Calculator: inputs (with `SliderField` for primary numeric fields) on
   the left, result card (`.hero-box` + `.card` with `.ledger-row`
   breakdowns) on the right
5. `InsightBanner`, if a genuine one exists for this tool
6. `ProjectionSection` (or a bespoke chart), if a meaningful sensitivity
   view exists
7. `ArticleWithTOC` — the written explainer, split into 2-4 logical
   named sections
8. FAQ (`FAQAccordion`) — 4-6 original questions
9. `RelatedTools` — cross-links to other live tools

## Changing the palette in the future

If the palette changes again, the token-based approach means most of the
work is a one-line edit per token in `tailwind.config.ts` — Tailwind
class names like `bg-accent` or `text-ledger` propagate automatically.
The exceptions are **raw hex values inside Recharts chart props**
(`stroke="#6D28D9"` etc.) and inside `RingChart` component calls, which
must be manually swept — search the codebase for the specific hex values
being replaced (see `01-architecture.md` for the file list, or simply
`grep -r "#6D28D9"` across `app/` and `components/`).
