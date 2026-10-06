# Upload guide: Holidays, Minimum Wages, LWF (v3)

v3 replaces the earlier zips. Use only this one.

- 30 new files
- 4 existing files replaced with full versions (no manual edits)

## Step 1: Drag-and-drop (30 files)

Drag these onto the repo root in GitHub's web uploader. When GitHub says a file
already exists, that's expected for the 4 marked REPLACES.

```
lib/compliance/                 9 new files
lib/tools.ts                    REPLACES existing (adds 2 tools; related tools prefer same category)
components/compliance/          7 new files
sanity/schemaTypes/compliance/  5 new files
sanity/schemaTypes/index.ts     REPLACES existing (adds the 4 new types)
app/sitemap.ts                  REPLACES existing (adds verified state pages)
app/api/revalidate/route.ts     REPLACES existing (blog/news logic kept, compliance added)
app/holidays/page.tsx           new
app/minimum-wages/page.tsx      new
app/lwf-rates/page.tsx          new
app/tools/lwf-calculator/page.tsx          new
app/tools/minimum-wage-checker/page.tsx    new
```

## Step 2: Manual paste, bracket folders (4 files)

Add file → Create new file, type the full path including brackets, paste the
content from the zip.

| Type this path exactly |
|---|
| `app/holidays/[year]/page.tsx` |
| `app/holidays/[year]/[state]/page.tsx` |
| `app/minimum-wages/[state]/page.tsx` |
| `app/lwf-rates/[state]/page.tsx` |

## Step 3: Update the existing Sanity webhook (no new webhook needed)

sanity.io/manage → project f3c45rz4 → API → Webhooks → open your existing
`/api/revalidate` webhook → change the Filter to:

```
_type in ["post", "holidayList", "minimumWageNotification", "minimumWageSchedule", "lwfRule"]
```

Leave URL, secret and everything else as is. The same SANITY_REVALIDATE_SECRET
already on Netlify is reused.

## Step 4: Settings check

sanity.io/manage → API → CORS origins: confirm `https://salary-tools.com` is
listed (the minimum wage checker loads rates in the browser).

## Step 5: Deploy

1. Netlify: Trigger deploy → Clear cache and deploy site.
2. Codespaces: `npx sanity deploy` so salary-tools.sanity.studio shows the new
   document types.

## Step 6: Check

- Publish a blog post edit in Studio and confirm it still updates (webhook
  log shows 200). This confirms the merged revalidate route works.
- `/holidays`, `/minimum-wages`, `/lwf-rates` load with all states as
  "Being verified"; state pages carry `noindex, follow`.
- Studio shows: Holiday list, Minimum wage notification, Minimum wage rates
  (per employment), LWF rule.

If the build fails, paste the Netlify build log.
