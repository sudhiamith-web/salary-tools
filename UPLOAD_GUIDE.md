# Upload guide: Retirement, ESI and LWF tools

Three new pages, 14 new files. Nothing existing is changed except one edit to `lib/tools.ts`.

Your existing `lib/calculators/epfWageCeiling.ts` is reused as-is. Do not replace it.

## Set 1: drag-and-drop safe (no brackets in the path)

Upload each folder's files into the matching folder in the repo.

| Repo folder | Files |
|---|---|
| `lib/calculators/` | `retirementBenefits.ts`, `retirementTax.ts`, `esi.ts`, `lwf.ts`, `retirementShare.ts` |
| `lib/data/` | `stateDeductions.ts` |
| `components/retirement/` | `RetirementCalculator.tsx`, `fields.tsx`, `ResultLine.tsx`, `TimelineChart.tsx`, `format.ts` |
| `components/statutory/` | `EsiMiniCalculator.tsx`, `LwfMiniCalculator.tsx`, `PageFaq.tsx` |
| `app/tools/retirement-benefits-calculator/` | `page.tsx` |
| `app/tools/esi-calculator/` | `page.tsx` |
| `app/tools/lwf-benefits/` | `page.tsx` |

None of these paths contain brackets, so drag-and-drop works. If GitHub flattens a folder, use "Create new file" and type the full path.

## Set 2: manual edit

Open `lib/tools.ts` and add the three entries from `TOOLS_REGISTRY_SNIPPET.ts`. Rename the fields to match your existing entries. The main calculator goes under "Salary & Tax"; ESI and LWF go under "Compliance & PF" next to the EPF wage ceiling tool. Move them if you prefer.

## Check after deploy

1. `/tools/retirement-benefits-calculator` loads, and changing CTC updates the numbers.
2. "Copy share link" copies a URL with `?s=`. Opening it in a private window restores the inputs.
3. "Download PDF summary" opens the print dialog with inputs hidden.
4. `/tools/esi-calculator` and `/tools/lwf-benefits` load, and their links to each other work.
5. Run the Rich Results Test on all three URLs to confirm FAQPage markup.

## Things that depend on your setup

- **Colour tokens.** Gains use `text-ledger` and losses use `text-rust`. If your Tailwind theme names them differently, find-and-replace in `ResultLine.tsx` and `RetirementCalculator.tsx`.
- **Shared components.** These pages use small local components for fields, FAQ and breadcrumb because I don't have your shared components' props. Paste `SliderField`, `FAQAccordion`, `Breadcrumb`, `RelatedTools` and `InsightBanner` and I'll switch the pages to them to match the standard template.
- **Canonical URLs.** `alternates.canonical` is a relative path and needs `metadataBase` in your root layout. If you don't have it, use the full `https://salary-tools.com/...` URL.
- **`/tools` and `/lwf-rates` links.** The breadcrumb links to `/tools` and the LWF page links to `/lwf-rates`. Change these if those routes don't exist yet.
- **LWF and PT amounts.** These are manual inputs for now. Once your Sanity LWF schema is final, share its field names and I'll fetch verified rates by state.
