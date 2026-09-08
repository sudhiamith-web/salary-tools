# Environment Variables

All environment variables the project uses, what they do, and where to
set them. Copy `.env.local.example` (repo root) to `.env.local` for
local development; set the real values in Netlify for production.

## Where to set these in Netlify

Netlify → Site configuration → Environment variables → Add a variable.
After adding or changing any variable, **you must trigger a fresh deploy
with cache cleared** (see `03-deployment.md`) — variables are baked in
at build time, not read live.

## Full reference

| Variable | Required? | What it does | Where to get the value |
|---|---|---|---|
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 Measurement ID. If unset, no analytics loads at all (and no cookie banner logic breaks — it just has nothing to gate) | analytics.google.com → Admin → Data Streams → your web stream. Format: `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Required for Blog/News | Identifies which Sanity project's content to fetch | sanity.io/manage → your project → shown on the overview page |
| `NEXT_PUBLIC_SANITY_DATASET` | Required for Blog/News | Which dataset within the Sanity project to use | Almost always `production` — set when the Sanity project was created |
| `SANITY_REVALIDATE_SECRET` | Required for Blog/News | A shared secret proving a revalidation request genuinely came from Sanity's webhook, not an outside party | You choose this value yourself — a long random string. Must be set to the EXACT same value in Sanity's webhook configuration (Sanity dashboard → API → Webhooks) |

## Naming convention: why some start with `NEXT_PUBLIC_`

Next.js only exposes environment variables to browser-side code if their
name starts with `NEXT_PUBLIC_`. Variables without that prefix (like
`SANITY_REVALIDATE_SECRET`) are only accessible server-side — this is
intentional and correct for a secret value that should never reach the
browser. **Do not rename `SANITY_REVALIDATE_SECRET` to start with
`NEXT_PUBLIC_`** — doing so would expose the secret publicly, defeating
its entire purpose.

## Verifying variables are working

- **GA_ID**: visit the live site, accept the cookie banner, then check
  Google Analytics → Reports → Realtime for an active user
- **Sanity variables**: visit `/studio` on the live site — if it loads
  the Sanity Studio interface, the project ID/dataset are correct. Visit
  `/blog` — if posts you've published in Studio appear, the connection
  is fully working
- **Revalidate secret**: publish or edit a post in Studio, then check
  `/blog` within a few seconds — if the change appears without a manual
  deploy, the webhook and secret are correctly configured. If not, check
  Sanity's webhook delivery log (Sanity dashboard → API → Webhooks →
  your webhook → Attempt log) for error responses from `/api/revalidate`
