# WorkTools

Salary, tax and HR calculators for Indian professionals. Built with Next.js
14 (App Router) + Tailwind CSS.

## Run it locally

You need [Node.js](https://nodejs.org) 18+ installed. Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the homepage with the first
tool, "In-Hand Salary Calculator", already working.

## Deploy to Vercel (free)

1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com, sign in with GitHub, click "Add New Project",
   select the repo. Vercel auto-detects Next.js — no config needed.
3. Click Deploy. You'll get a live `*.vercel.app` URL in about a minute.
4. Once you've registered your domain, add it under Project Settings →
   Domains in Vercel, and update your DNS at Cloudflare/your registrar
   as instructed.

Every `git push` after this auto-deploys — no manual redeploy step.

## Project structure

```
app/
  layout.tsx              — shared shell (header, footer, fonts)
  page.tsx                — homepage / tool directory
  tools/
    in-hand-salary-calculator/page.tsx   — first live calculator
lib/
  calculators/salary.ts   — tax & salary math, reused across tools
components/
  PayslipCard.tsx         — the receipt-style result card (design signature)
```

## Adding the next calculator (e.g. HRA Exemption)

1. Add the calculation logic to `lib/calculators/` (new file, or extend
   `salary.ts` if it shares the tax engine).
2. Create `app/tools/hra-exemption-calculator/page.tsx`, following the same
   pattern as the in-hand salary page: a form on the left, a `PayslipCard`
   (or a variant) on the right.
3. Flip `live: false` → `live: true` for that tool in `app/page.tsx`.

This is the reusable pattern — each new calculator is mostly a new form +
a new pure function, not a new design.

## Known simplifications (fix before relying on this for real filings)

- New-regime tax calc does not yet implement surcharge (income > ₹50L) or
  marginal relief right above the ₹12L rebate threshold.
- Old tax regime is not yet implemented (new regime only, since it's the
  default regime most users are on).
- Professional tax default is a flat approximation, not state-specific.

These are fine for a v1 launch (label them as estimates, which the UI
already does) but should be tightened before the site gets meaningful
traffic and people start trusting the numbers.
