# Integration snippets

## 1. `sanity/schemaTypes/index.ts`

Add the import at the top and spread the types into your existing array.
Keep everything already there.

```ts
import { complianceSchemaTypes } from "./compliance";

export const schemaTypes = [
  // ...your existing types (post, etc.)
  ...complianceSchemaTypes,
];
```

If your file exports `schema = { types: [...] }` instead, add
`...complianceSchemaTypes` inside that `types` array.

## 2. `lib/tools.ts`

Add two entries to the tools array. Copy any extra fields your EPF Wage
Ceiling entry has (icon, keywords, etc.) and adjust.

```ts
  {
    slug: "minimum-wage-checker",
    name: "Minimum Wage Checker",
    shortDesc: "Check a salary against your state's minimum wage, incl. the 50% rule.",
    category: "Compliance & PF",
  },
  {
    slug: "lwf-calculator",
    name: "LWF Calculator",
    shortDesc: "Labour Welfare Fund cost by state: deductions, employer share, due dates.",
    category: "Compliance & PF",
  },
```

The three hubs (`/holidays`, `/minimum-wages`, `/lwf-rates`) aren't tools, so
they won't appear in the tools dropdown. Link them from the footer or nav when
you're ready; until then they're reachable via the tool pages, cross-links and
the sitemap.

## 3. `app/sitemap.ts`

```ts
import { complianceSitemapEntries } from "@/lib/compliance/sitemap";

export default async function sitemap() {
  const existing = [/* ...whatever your sitemap returns today... */];
  return [...existing, ...(await complianceSitemapEntries())];
}
```

If your sitemap function isn't `async` yet, make it `async` as above. Only
verified states are included, so the sitemap grows as you publish.

## 4. Webhook for instant updates (optional, recommended)

1. Pick a long random secret (any password generator).
2. Netlify → Site configuration → Environment variables → add
   `SANITY_REVALIDATE_SECRET` = your secret. Redeploy once.
3. sanity.io/manage → project f3c45rz4 → API → Webhooks → Create:
   - URL: `https://salary-tools.com/api/revalidate?secret=YOUR_SECRET`
   - Dataset: production
   - Trigger on: Create, Update, Delete
   - Filter: `_type in ["holidayList", "minimumWageNotification", "minimumWageSchedule", "lwfRule"]`
   - HTTP method: POST
4. Publish any record and check the webhook's attempt log shows 200.

Without the webhook, every page refetches from Sanity at most once an hour.
