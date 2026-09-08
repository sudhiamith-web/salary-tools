# Deployment

## How deployment works

```
Code change → pushed/uploaded to GitHub (main branch)
      │
      ▼
Netlify detects the push (GitHub integration, automatic)
      │
      ▼
Netlify runs the build defined in netlify.toml:
   1. npm install
   2. npm run build   (runs "next build")
      │
      ▼
Build succeeds → new version goes live at salary-tools.com
Build fails → site stays on the previous working version;
              check the build log in Netlify's Deploys tab
```

There is no manual "click deploy" step in normal operation — pushing to
`main` is the trigger. The only manual actions are:
- Uploading/pushing the code change itself (see `02-getting-started.md`)
- Occasionally forcing a fresh build with cache cleared (see below)

## Standard deployment steps

1. Make your code change (locally, via Codespaces, or via GitHub's web
   editor — see `02-getting-started.md`)
2. Commit and push to the `main` branch
3. Go to Netlify → Site → Deploys tab. A new deploy should appear within
   seconds, showing "Building"
4. Wait for it to show "Published" (usually 1-3 minutes for this
   project's size)
5. Visit the live site and verify your change

## When to clear the cache

If a deploy succeeds but the live site doesn't reflect your change, or
if you've just changed environment variables, use **Deploys → Trigger
deploy → Clear cache and deploy site** instead of a normal deploy.
Environment variables in particular are baked in at build time — an
incremental build can miss a newly added variable, so always clear cache
after adding or changing one.

## `netlify.toml` — what it does and why it must stay intact

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

This file tells Netlify exactly how to build the site. **Do not remove
or rename this file, and do not manually override its settings in the
Netlify dashboard UI** (Site configuration → Build & deploy → Build
settings). If UI-configured build settings exist, they silently override
`netlify.toml`, which is exactly the bug that caused a real,
time-consuming build failure previously — leave those UI fields blank so
`netlify.toml` is the single source of truth for build configuration.

## Verifying a deploy is healthy

After any deploy, check the build log (click into the specific deploy in
the Deploys tab) for the "Resolved config" section. It should show:
- `commandOrigin: config` and `publishOrigin: config` (meaning
  `netlify.toml` is being respected, not overridden by dashboard
  settings)
- `publish` pointing to `.next`, and NOT the same path as `base`

If you ever see `commandOrigin: ui` or `publishOrigin: ui`, something in
the Netlify dashboard's Build settings UI has been manually set and is
overriding the config file — clear those UI fields.

## Rolling back a bad deploy

Netlify keeps every previous deploy. If a new deploy breaks something:

1. Go to Deploys tab
2. Find the last known-good deploy (usually just before the broken one)
3. Click into it → "Publish deploy" (or similarly labeled action) to
   make that older version live again immediately
4. Fix the actual code issue afterward, then deploy normally

This is instant and doesn't require touching code — use it first if
something's broken in production, then debug calmly afterward.

## Preview deploys (branches / pull requests)

If a change is pushed to a branch other than `main` (or opened as a pull
request), Netlify automatically builds a preview at a separate temporary
URL, without affecting the live site. This is the safest way to test a
larger or riskier change before merging to `main`. Check the Deploys tab
or the pull request itself for the preview link.

## Domain and DNS

The domain `salary-tools.com` is registered and DNS-managed through
Cloudflare, pointing at Netlify. If DNS ever needs to be re-verified or
changed (e.g., moving to a different host, or troubleshooting a domain
issue):

1. In Netlify, the domain should be listed under Site configuration →
   Domain management
2. In Cloudflare, DNS → Records should show the records Netlify
   requires (typically an A record and/or CNAME) — Netlify's domain
   settings page shows exactly what's required if you need to
   re-verify
3. Records pointing to Netlify should be set to **DNS only** (grey
   cloud icon in Cloudflare), not **Proxied** (orange cloud) — a
   proxied record can interfere with Netlify's own SSL and CDN handling
