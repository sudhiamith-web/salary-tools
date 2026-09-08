# Privacy and Compliance

## Data handling — the core commitment

Every calculator computes entirely client-side, in the visitor's
browser. No calculator input (salary figures, rent, tax details, or
anything else a visitor types in) is ever transmitted to a server or
stored anywhere. This is stated directly in the Privacy Policy
(`app/privacy/page.tsx`) and is a real architectural property, not just
a claim — verify this remains true for any new calculator: it must not
introduce a server-side API call that transmits raw user inputs.

## Cookie consent (`components/ConsentGate.tsx`)

Google Analytics is **consent-gated**, not loaded unconditionally:
- On first visit, a banner offers Accept/Decline
- The choice is stored in the browser's `localStorage`
- Google Analytics (`components/GoogleAnalytics.tsx`) only renders if
  consent was explicitly granted
- Declining is fully respected — no analytics loads, and the choice
  persists across visits until the visitor clears their browser storage

**If adding any other tracking/analytics script in the future, it must
go through this same consent gate** — don't add a new script directly to
`layout.tsx` without routing it through `ConsentGate.tsx`, or the site's
stated privacy commitments become inaccurate.

## The four compliance/trust pages

| Page | Purpose |
|---|---|
| `/privacy` | Full privacy policy — data handling, cookies, third-party services, no-ads-currently statement |
| `/terms` | Terms & Conditions — "estimates not advice" disclaimer, no-liability statement, no-affiliation statement |
| `/about` | Who operates the site, why it exists |
| `/contact` | A real, monitored email address (`hello@salary-tools.com`) |

All four exist specifically because they're expected/required for
Google AdSense approval, in addition to being generally good practice
for a financial information site. **If AdSense is ever applied for, do
not remove or gut any of these pages** — Search Console/AdSense
reviewers do check for genuine, substantive content on all four, not
just their existence.

## The "no ads yet" commitment

The Privacy Policy explicitly states no advertising currently runs on
the site, with a commitment to update the policy in advance of adding
any. **If/when ads (e.g., AdSense) are added, the Privacy Policy and the
cookie consent banner both need updating** — ad networks typically set
their own tracking cookies, which must be disclosed and, depending on
jurisdiction, consented to, separately from the current GA-only consent
flow. This is a real compliance obligation, not optional polish.

## Accuracy disclaimer

The Terms page states the site is not tax, financial, or legal advice,
and figures should be verified against official sources or a
professional. This disclaimer exists precisely because the site
publishes genuinely complex statutory calculations (see
`08-calculators-reference.md`) — it does not reduce the obligation to
keep those calculations accurate; it manages liability for the
inevitable edge cases and law changes that any calculator can't perfectly
track in real time.

## What's NOT yet implemented (known gaps, as of this writing)

- No formal cookie categorization beyond a single Accept/Decline (no
  granular "analytics only" vs "marketing" consent tiers) — acceptable
  for GA-only tracking, but would need revisiting if ad-network cookies
  are added
- No data subject request process (e.g., a way for a visitor to request
  what data is held about them) — currently moot since no personal data
  is stored server-side, but would need addressing if that ever changes
  (e.g., if user accounts or saved calculations are ever introduced)
