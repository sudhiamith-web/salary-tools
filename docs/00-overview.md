# Salary-Tools — Documentation

Welcome. This is the complete reference for maintaining and extending
Salary-Tools (salary-tools.com), written so that someone with **zero prior
context** on this project can pick it up and work on it confidently.

If you're new here, read this page first, then follow the links in the
order that matches what you're trying to do.

## What this project is

Salary-Tools is a free, public website offering salary, tax, and HR
calculators for Indian professionals (16 tools live as of this writing:
in-hand salary, HRA exemption, old vs new tax regime, gratuity, TDS,
advance tax, Section 80C/80D, LTCG/STCG, freelancer tax, and others). It
also has a Blog and a News section for longer-form content.

The business goal: build organic search traffic through genuinely useful,
accurate tools and content, eventually monetizing through advertising and
premium features.

### Roadmap context

All 16 live tools sit under one category, "Salary & Tax." The
navigation and homepage are already structured to support additional
categories (e.g., "Investments", "Loans", "Government Schemes",
"Business") as they get built — adding a new category requires no
navigation code changes, just consistent use of the new category string
in `lib/tools.ts` (see `01-architecture.md`).

Monetization sequencing, as currently planned: organic traffic first
(SEO-driven, via genuinely useful tools and content), then advertising
(Google AdSense — see `11-privacy-and-compliance.md` for the
compliance prerequisites already in place), with affiliate and premium
features as later phases once traffic is established.

## How this documentation is organized

| File | What it covers | Read this if you're... |
|---|---|---|
| `01-architecture.md` | The full tech stack and how the pieces fit together | New to the project, need the big picture |
| `02-getting-started.md` | Local setup, running the project, making your first change | Setting up to work on the codebase |
| `03-deployment.md` | How code changes go live (GitHub → Netlify) | Deploying a change |
| `04-environment-variables.md` | Every environment variable, what it does, where to set it | Setting up a new environment, or a service breaks |
| `05-third-party-services.md` | Every external account this project depends on, what each does | Managing accounts, billing, access |
| `06-content-management-cms.md` | How Blog/News content works (Sanity CMS) | Publishing a blog post or news update |
| `07-design-system.md` | Colors, typography, components, the Royal Dark palette | Building UI, keeping visual consistency |
| `08-calculators-reference.md` | Every calculator: what it computes, the formula, the law behind it | Checking or fixing a calculator's logic |
| `09-adding-a-new-calculator.md` | Step-by-step template for building tool #17 and beyond | Adding a new calculator |
| `10-seo-and-search.md` | Sitemap, robots.txt, Search Console, structured data | SEO work, indexing issues |
| `11-privacy-and-compliance.md` | Privacy policy, cookie consent, AdSense readiness | Legal/compliance questions, ad monetization |
| `12-glossary.md` | Indian tax and HR terms used throughout the codebase | You don't recognize a term like "80C" or "TDS" |

The root-level `README.md` (one level up from this `docs/` folder) is a
shorter, developer-focused quick-reference — this documentation set is
the deeper, complete version. If the two ever disagree, this
documentation is authoritative; update the README to match.

## The five-minute mental model

1. **The site is a Next.js 14 app** (App Router), hosted on **Netlify**,
   with its domain registered and DNS-managed on **Cloudflare**.
2. **There is no traditional database.** Calculator logic is pure
   TypeScript functions that run in the visitor's browser — nothing is
   stored server-side for calculators.
3. **Blog and News content lives in Sanity** (a separate content
   service), not in the codebase. Publishing a post never requires a
   code deployment — content updates are instant via a webhook.
4. **Every calculator follows one consistent template**: a form with
   sliders, a result card, a dynamic "insight" banner, a written
   explainer with a sidebar table of contents, an FAQ, and links to
   related tools. See `08-calculators-reference.md` and
   `09-adding-a-new-calculator.md`.
5. **Deploying code changes is manual today**: files are uploaded to
   GitHub via its web interface (not `git push` from a terminal), which
   triggers an automatic Netlify build. See `03-deployment.md` for the
   exact steps and the specific mistakes to avoid.

## Who owns what (as of this writing)

The site is maintained by a solo founder with limited local development
tooling access (no admin rights on their primary machine — see
`02-getting-started.md` for how this shapes the workflow). All external
accounts (Netlify, Cloudflare, Sanity, Google Analytics, GitHub) are
owned by the founder. See `05-third-party-services.md` for the full
account registry and what each service is used for.

## Conventions used throughout this documentation

- Code you'd actually run or paste is in fenced code blocks.
- File paths are relative to the repository root unless stated otherwise.
- "The founder" refers to the site's owner/operator, regardless of who's
  reading this at any given time.
- Statutory/legal figures (tax rates, exemption limits) are marked with
  the date they were last verified. **Always re-verify before trusting an
  old figure** — Indian tax law changes at least once a year with the
  Union Budget, sometimes more often.
