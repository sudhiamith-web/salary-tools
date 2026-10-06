# Upload guide: Holidays, Minimum Wages, LWF

31 new code files. Nothing in this zip overwrites an existing file.
Then 3 small edits to existing files (see INTEGRATION_SNIPPETS.md) and 2 settings.

## Step 1: Drag-and-drop safe (27 files)

Drag these folders onto the repo root in GitHub's web uploader. They merge into
your existing folders.

```
lib/compliance/            (9 files: states, types, format, sanityFetch, queries,
                            wages, lwf, holidays, sitemap)
components/compliance/     (7 files: Shared, StateGrid, HolidayHub, HolidayExplorer,
                            MinimumWageExplorer, MinimumWageChecker, LwfCalculator)
sanity/schemaTypes/compliance/  (5 files: shared, holidayList, minimumWage,
                                 lwfRule, index)
app/holidays/page.tsx
app/minimum-wages/page.tsx
app/lwf-rates/page.tsx
app/tools/lwf-calculator/page.tsx
app/tools/minimum-wage-checker/page.tsx
app/api/revalidate/route.ts
```

## Step 2: Manual paste, bracket folders (4 files)

Use **Add file → Create new file**, type the full path including brackets,
paste the content from the zip.

| Type this path exactly | Copy from zip |
|---|---|
| `app/holidays/[year]/page.tsx` | same path |
| `app/holidays/[year]/[state]/page.tsx` | same path |
| `app/minimum-wages/[state]/page.tsx` | same path |
| `app/lwf-rates/[state]/page.tsx` | same path |

## Step 3: Edit 3 existing files

Copy the snippets from `INTEGRATION_SNIPPETS.md` into:

1. `sanity/schemaTypes/index.ts`: register the 4 new document types
2. `lib/tools.ts`: register the 2 new tools under "Compliance & PF"
3. `app/sitemap.ts`: add verified state pages to the sitemap

## Step 4: Settings (one time)

1. **Sanity CORS** (sanity.io/manage → project f3c45rz4 → API → CORS origins):
   confirm `https://salary-tools.com` is listed. The minimum wage checker
   loads rates in the browser and needs this.
2. **Instant updates (recommended)**: see "Webhook" in INTEGRATION_SNIPPETS.md.
   Without it, pages still refresh on their own within an hour of publishing.

## Step 5: Deploy and redeploy Studio

1. Netlify: Trigger deploy → Clear cache and deploy site.
2. Codespaces: `npx sanity deploy` so salary-tools.sanity.studio shows the new
   document types. The embedded /studio picks them up from the Netlify deploy.

## Step 6: Check

- `/holidays`, `/minimum-wages`, `/lwf-rates` load and show all 36 states as
  "Being verified".
- Open any state page: it should say it's being verified. View source and
  confirm `<meta name="robots" content="noindex, follow">`.
- In Studio you should see: Holiday list, Minimum wage notification,
  Minimum wage rates (per employment), LWF rule.

If a build fails, paste the Netlify build log here. The likeliest cause is an
import name: these files assume `@/components/FAQAccordion` takes `items` and
`@/components/RelatedTools` takes `currentSlug`, as on the EPF tool page.
