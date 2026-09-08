# Salary-Tools — Master Documentation

**This is the single-file master overview.** For deep detail on any
topic below, see the corresponding file in `docs/` — this document
exists so a new maintainer can understand the entire system from one
read, then dive into `docs/` for whatever they need to actually work on.

---

## 1. What this is

Salary-Tools (salary-tools.com) is a free website of salary, tax, and HR
calculators for Indian professionals, plus a Blog and News section. 16
calculators are live as of this writing, covering salary/CTC breakdowns,
income tax (old and new regime), gratuity, capital gains, ESOPs/RSUs,
freelancer taxation, and more.

**Business model:** organic-search-driven traffic first, monetizing
later via advertising (Google AdSense) and potentially premium features.

---

## 2. The stack, in one paragraph

A **Next.js 14** application, hosted on **Netlify** (using Netlify's
actual Next.js Runtime, not a static export — this matters, see below),
with source code on **GitHub**. The domain is registered and DNS-managed
on **Cloudflare**, which also provides free email routing for
`hello@salary-tools.com`. Blog and News content is authored in an
embedded **Sanity CMS** editor (at `/studio`) and published instantly
with zero deploys via a webhook. **Google Analytics 4** tracks traffic,
gated behind a cookie-consent banner. There is no traditional database —
every calculator is a pure client-side function; nothing a visitor types
into a calculator is ever transmitted or stored.

Full detail: `docs/01-architecture.md`

---

## 3. How to work on this project day to day

**If you have a normal computer:** clone the repo, `npm install`,
`npm run dev`, edit, `git push` — a push to `main` auto-deploys via
Netlify.

**If you don't have admin rights on your machine** (the situation the
current maintainer is in): use **GitHub Codespaces** — a full cloud dev
environment in your browser, no local installs needed. This is
significantly better than editing files directly through GitHub's web
interface, which offers no live preview.

Full detail: `docs/02-getting-started.md`

---

## 4. Deploying a change

Push/upload to the `main` branch on GitHub → Netlify auto-builds →
live within a few minutes. **Never manually configure build settings in
Netlify's dashboard UI** — `netlify.toml` in the repo root is the single
source of truth for build configuration; UI-configured settings silently
override it and have caused real build failures before.

Full detail: `docs/03-deployment.md`

---

## 5. Environment variables you need to know about

| Variable | For | 
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Blog/News content |
| `SANITY_REVALIDATE_SECRET` | Instant content publishing (webhook auth) |

All set in Netlify → Site configuration → Environment variables.
Changing any of these requires a fresh deploy with cache cleared.

Full detail: `docs/04-environment-variables.md`

---

## 6. External accounts this project depends on

GitHub (code), Netlify (hosting — the single point of failure for the
whole site), Cloudflare (DNS + email), Sanity (Blog/News content only,
fully decoupled from the rest of the site), Google Analytics (traffic
data, non-critical). All currently owned by the founder.

Full detail: `docs/05-third-party-services.md`

---

## 7. Publishing a blog post or news update

**No code, no GitHub, no deploy needed.** Go to `salary-tools.com/studio`,
sign in, create or edit a Post, choose Blog or News as its category,
click Publish. It's live within seconds via an instant-revalidation
webhook — this was a deliberate architecture choice specifically so
content publishing never depends on the code deployment pipeline.

Full detail: `docs/06-content-management-cms.md`

---

## 8. The design system, in brief

"Royal Dark" palette — dark navy navigation, purple (`#6D28D9`) as the
primary interactive accent, clean white cards on a near-white
background. Two colors are semantically reserved and must not be
repurposed: green (`ledger` token) always means "positive/exempt" in a
financial breakdown, red (`rust` token) always means "cost/owed" — kept
deliberately separate from the brand accent color so this meaning holds
consistently across every tool.

Every tool page follows one consistent layout: breadcrumb → title →
calculator (sliders + result card) → insight banner (if genuine) →
projection chart (if meaningful) → written article with sidebar table of
contents → FAQ → related tools.

Full detail: `docs/07-design-system.md`

---

## 9. The calculators — the actual product

Every calculator's math lives in `lib/calculators/<name>.ts`, fully
separated from its UI. Each file has a header comment stating what it
covers, the formula, and when the statutory figures were last verified.
**Indian tax law changes at least annually** (the Union Budget) — never
trust a figure without checking its verification date, and re-verify
before extending any calculator's logic.

Full reference for all 16 tools, including the specific statutory rules
and known simplifications behind each one: `docs/08-calculators-reference.md`

---

## 10. Adding a new calculator

Follow the checklist in `docs/09-adding-a-new-calculator.md` — in
short: verify the law first, build the pure-function engine, build the
page matching the standard layout, write an honest insight banner (or
skip it if there's no genuine one), write original article/FAQ content,
and only add the tool to `lib/tools.ts` (which makes it publicly
visible) once it's fully finished and checked.

---

## 11. SEO infrastructure

Sitemap and robots.txt are auto-generated from `lib/tools.ts` and live
Sanity content — no manual maintenance needed as tools/posts are
added. Google Search Console is verified via a Cloudflare DNS record
(domain-level, survives a hosting change). FAQPage and Article/
NewsArticle structured data are built into the relevant shared
components automatically.

Full detail: `docs/10-seo-and-search.md`

---

## 12. Privacy, compliance, and AdSense readiness

No calculator input is ever transmitted or stored — this is an
architectural property, not just a policy claim, and must be preserved
in any new calculator. Analytics is cookie-consent-gated. Privacy,
Terms, About, and Contact pages are all in place as AdSense
prerequisites — if ads are ever added, the Privacy Policy and consent
banner both need updating first, since ad networks introduce their own
tracking.

Full detail: `docs/11-privacy-and-compliance.md`

---

## 13. Don't know a term?

`docs/12-glossary.md` covers every Indian tax/HR term used throughout
the codebase and this documentation (80C, TDS, ESOP, CII, and so on) —
written for someone with zero prior domain background.

---

## Document map

```
DOCUMENTATION.md          ← you are here (master overview)
README.md                  ← short, developer-focused quick reference
docs/
  00-overview.md            ← docs/ folder's own index, slightly deeper than this file
  01-architecture.md
  02-getting-started.md
  03-deployment.md
  04-environment-variables.md
  05-third-party-services.md
  06-content-management-cms.md
  07-design-system.md
  08-calculators-reference.md
  09-adding-a-new-calculator.md
  10-seo-and-search.md
  11-privacy-and-compliance.md
  12-glossary.md
```
