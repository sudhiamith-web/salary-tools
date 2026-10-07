# Upload guide: revised Retirement, ESI and LWF tools

This revision fits the three tools into the existing codebase: shared components, the standard page layout, verified LWF data from Sanity, and the existing gratuity and tax logic.

## Step 1: delete these files from the repo

| File | Why |
|---|---|
| `TOOLS_REGISTRY_SNIPPET.ts` (repo root) | **Breaks `next build`.** It isn't valid TypeScript, and `tsconfig.json` includes every `.ts` file. |
| `CODE_EXPLANATION.md` (repo root) | Replaced by `docs/13-retirement-esi-lwf-tools.md`. |
| `UPLOAD_GUIDE.md` (repo root) | The old guide. Don't commit this one either. |
| `lib/calculators/lwf.ts` | Replaced by the existing `lib/compliance/lwf.ts`. |
| `lib/data/stateDeductions.ts` | Replaced by the existing `lib/compliance/states.ts`. |
| `components/statutory/LwfMiniCalculator.tsx` | The LWF page no longer has its own calculator. |
| `components/statutory/PageFaq.tsx` | Replaced by the existing `FAQAccordion`. |

In the GitHub web UI: open each file, then use the "…" menu and choose "Delete file".

## Step 2: upload these files (all drag-and-drop safe; no brackets in the paths)

| Repo folder | Files | New or replaced |
|---|---|---|
| `lib/` | `tools.ts` | Replaced (adds the 3 tools) |
| `lib/calculators/` | `retirementBenefits.ts`, `retirementTax.ts` | Replaced |
| `components/retirement/` | `RetirementCalculator.tsx`, `fields.tsx`, `ResultLine.tsx`, `TimelineChart.tsx`, `format.ts` | Replaced |
| `components/statutory/` | `EsiMiniCalculator.tsx` | Replaced |
| `app/tools/retirement-benefits-calculator/` | `page.tsx` | Replaced |
| `app/tools/esi-calculator/` | `page.tsx` | Replaced |
| `app/tools/lwf-benefits/` | `page.tsx` | Replaced |
| `docs/` | `13-retirement-esi-lwf-tools.md` | New |

These files are unchanged and stay as they are: `lib/calculators/esi.ts`, `lib/calculators/retirementShare.ts`.

Do Step 1 and Step 2 in the same session. Uploading `tools.ts` is what makes the three tools public (nav, homepage, sitemap, related tools).

## Step 3: check after deploy

1. **Retirement calculator** (`/tools/retirement-benefits-calculator`):
   - Changing CTC updates the result card.
   - Pick a state with a verified LWF rule: the LWF box shows the "Checked against the official notification" badge and yearly amounts.
   - Pick an unverified state: it asks for payslip amounts.
   - The insight banner shows a VPF figure, and its button switches to detailed mode with +2% VPF.
2. **Share and print:** "Copy share link" works in a private window, and "Download PDF summary" prints only the results.
3. **ESI page** (`/tools/esi-calculator`): moving Gross above ₹42,000 with Basic + DA at ₹10,000 shows "Not covered".
4. **LWF benefits page** (`/tools/lwf-benefits`): the state table lists your verified states and links to `/lwf-rates/[state]`.
5. **Navigation and SEO:**
   - The nav dropdowns show the retirement tool under Salary & Tax, and ESI and LWF benefits under Compliance & PF.
   - `/sitemap.xml` lists all three URLs.
   - The Rich Results Test passes FAQPage on all three.
