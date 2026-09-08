# Third-Party Services Registry

Every external service this project depends on, what it's used for, and
what happens if it's unavailable or misconfigured. All accounts are
currently owned by the founder — if the project ever changes hands,
these are the accounts that need to be transferred or re-created.

## GitHub

**Used for:** Source code hosting and version control. Every deployment
originates from a push/upload to this repository's `main` branch.

**What breaks without it:** Nothing breaks for existing visitors (the
live site is on Netlify, independent of GitHub once built), but no new
deployments can happen.

## Netlify

**Used for:** Hosting the built Next.js application — this is where
`salary-tools.com` actually serves from. Handles the CDN, SSL
certificates, serverless functions (for the Sanity revalidation
webhook), and automatic builds triggered by GitHub pushes.

**Plan:** Free tier. Sufficient for current traffic levels; would need
upgrading if traffic or build-minute usage grows substantially.

**What breaks without it:** The entire site goes down. This is the
single most critical service.

**Key settings to never lose:** the GitHub repository connection, the
domain configuration (`salary-tools.com` pointed here), and all
environment variables (see `04-environment-variables.md`).

## Cloudflare

**Used for two separate things:**
1. **Domain registration and DNS** — `salary-tools.com` is registered
   here, and DNS records point the domain to Netlify
2. **Email Routing** — forwards `hello@salary-tools.com` to the
   founder's personal Gmail inbox, and (combined with Gmail's "Send
   mail as" feature) allows sending as that address too

**What breaks without it:** If DNS is misconfigured, the domain stops
resolving to the site entirely (visitors would see a DNS error, not a
site error). If Email Routing breaks, the Contact page's email address
stops receiving mail.

**Note:** Cloudflare is NOT used for hosting the site itself — no
Cloudflare Pages or Workers are involved. Its role is domain/DNS/email
only.

## Sanity

**Used for:** Storing and serving all Blog and News content. This is a
completely separate system from the calculator pages — calculators have
no dependency on Sanity at all.

**Plan:** Free tier. Sufficient for a blog/news volume at this site's
current scale.

**What breaks without it:** `/blog` and `/news` would show "no posts
yet" or fail to load; `/studio` (the content editor) would be
inaccessible. Calculator pages, the homepage, and all other pages are
entirely unaffected — Sanity is fully decoupled from the rest of the
site.

**Where content actually lives:** Not in this codebase, not in GitHub —
entirely inside Sanity's own hosted database, accessed via API. This
means content survives independently of code deployments, and also
means content must be backed up/exported separately from a normal code
backup if that's ever needed (Sanity provides data export tools in its
own dashboard).

## Google Analytics (GA4)

**Used for:** Understanding site traffic — page views, which
calculators get used, general visitor patterns. Only loads after a
visitor accepts the cookie consent banner (see
`11-privacy-and-compliance.md`).

**What breaks without it:** Nothing user-facing — GA is purely
observational. The founder would simply lose visibility into traffic
patterns.

## Domain email (hello@salary-tools.com)

**Not a separate account** — this is Cloudflare Email Routing (above)
combined with the founder's personal Gmail account's "Send mail as"
feature. There is no dedicated mailbox service (no paid Google
Workspace, no Zoho Mail) — this was a deliberate free-tier choice.

**Known limitation:** emails sent "as" this address may occasionally
show a subtle "via gmail.com" note in some recipients' mail clients,
depending on their provider. This is cosmetic, not a deliverability
problem. If this ever needs to be eliminated entirely, the fix is
upgrading to Google Workspace (~₹150/user/month) or a similar paid
mailbox service.

## Summary table

| Service | Purpose | Plan | Single point of failure? |
|---|---|---|---|
| GitHub | Source code | Free | No (site keeps running without it) |
| Netlify | Hosting | Free | **Yes — entire site depends on this** |
| Cloudflare | DNS + domain email | Free | Yes for DNS (site becomes unreachable if broken) |
| Sanity | Blog/News content | Free | No (only Blog/News affected, not calculators) |
| Google Analytics | Traffic analytics | Free | No (purely observational) |
