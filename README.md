# Salary-Tools

Salary, tax and HR calculators for Indian professionals. Built with Next.js
14 (App Router) + Tailwind CSS. Live at salary-tools.com.

## ⚠️ Upload instructions (read this before pushing to GitHub)

When you upload this to GitHub, upload the **contents** of this folder
(package.json, app/, lib/, components/, netlify.toml, etc.) directly into
the repo root — NOT this folder itself as a subfolder. If GitHub shows a
folder like `salary-tools/` sitting inside the repo with everything nested
one level down, Netlify's build will fail to find package.json. This
exact mistake cost real time on the first deploy — the fix was setting a
"Base directory" in Netlify, which is extra complexity you don't need if
you upload correctly the first time.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Netlify

This repo includes `netlify.toml`, which tells Netlify exactly how to
build (`npm run build`, publish `.next`, using `@netlify/plugin-nextjs`).
As long as this file sits at the repo root and the Netlify UI's own Build
command / Publish directory fields are left BLANK (so they don't override
the file), the build should work without manual configuration.

## Project structure

```
app/
  layout.tsx
  page.tsx
  tools/
    in-hand-salary-calculator/page.tsx
    hra-exemption-calculator/page.tsx
    old-vs-new-regime-calculator/page.tsx
    gratuity-calculator/page.tsx
    tds-calculator/page.tsx
lib/
  calculators/
    salary.ts      — CTC → in-hand salary, new-regime tax logic
    hra.ts         — Section 10(13A) HRA exemption logic
    oldRegime.ts   — old regime slabs, 80C/80D/HRA deductions, 87A rebate
    gratuity.ts    — Payment of Gratuity Act 1972, Section 10(10) exemption
components/
  PayslipCard.tsx   — result card for the salary calculator
  HRACard.tsx       — result card for the HRA calculator
  RingChart.tsx     — dependency-free SVG donut/ring visual (no chart library)
  Badge.tsx         — small pill component for regime labels and tags
netlify.toml
```

## Adding the next calculator

1. Add calculation logic to `lib/calculators/` — a new file, pure
   functions, no UI.
2. Create `app/tools/<slug>/page.tsx` — form on the left, a receipt-style
   result card on the right (see `HRACard.tsx` or `PayslipCard.tsx` as a
   template — reuse the `.ledger-row`, `.receipt-edge-top/bottom`, and
   `.stamp-note` classes already defined in `globals.css`).
3. Add the tool to the `tools` array in `app/page.tsx` and flip
   `live: false` → `live: true`.

## Known simplifications

- Neither tax engine (old or new regime) implements surcharge (income >
  ₹50L) or marginal relief near the rebate thresholds.
- Old regime engine only models the general slabs (individuals under 60).
  Senior/super-senior citizen slabs are separate and not yet modeled.
- Professional tax default is a flat approximation, not state-specific.
- Gratuity calculator doesn't yet distinguish government vs
  non-government employees (government employees get full tax exemption
  regardless of amount — currently everyone is treated as non-government).
- TDS calculator assumes even monthly withholding across the remaining
  months — real employer TDS schedules often front-load or adjust
  through the year based on declared investments and Form 12BB.
