# Retirement, ESI and LWF Benefits Tools

Three tools, built to the standard pattern in `09-adding-a-new-calculator.md`:

| Page | Route | Category |
|---|---|---|
| Retirement Benefits & Deductions Calculator | `/tools/retirement-benefits-calculator` | Salary & Tax |
| ESI Calculator & Benefits | `/tools/esi-calculator` | Compliance & PF |
| Labour Welfare Fund Benefits | `/tools/lwf-benefits` | Compliance & PF |

This page explains how the code works, block by block with line numbers, and what to update when rules change.

## How the pieces fit

```
retirement page.tsx (server)
  ├─ getAllLwfRules()  ← lib/compliance/queries.ts (verified Sanity LWF rules)
  └─ <RetirementCalculator lwfRules> (client)
        └─ calculateRetirement(inputs, { lwfRule })   lib/calculators/retirementBenefits.ts
              ├─ computeContribution()   lib/calculators/epfWageCeiling.ts
              ├─ computeGratuity()       lib/calculators/gratuity.ts
              ├─ estimateLwf()           lib/compliance/lwf.ts
              ├─ computeEsi()            lib/calculators/esi.ts
              └─ incomeTax() etc.        lib/calculators/retirementTax.ts
                                            ← slabs from salary.ts + oldRegime.ts
```

The engine reuses four existing modules, so these tools always agree with the EPF Wage Ceiling Calculator, the Gratuity Calculator, the LWF Calculator and the tax tools. When one of those modules changes, this tool changes with it.

## Rule sources (verified Oct 2026)

| Rule | Value | Where it lives |
|---|---|---|
| EPF interest default | 8.25% (FY 2025-26, ratified 2026) | `DEFAULT_EPF_RATE`, `retirementBenefits.ts` line 54 |
| PF ceiling | ₹25,000 from 17 Sep 2026 (S.O. 5109(E)) | `epfWageCeiling.ts` |
| NPS exit | Normal exit: up to 80% lump sum above ₹12L corpus; ₹6L for ₹8–12L; full up to ₹8L. Premature: 20% lump sum (full up to ₹5L). PFRDA amendment, Dec 2025 | `retirementBenefits.ts` lines 722–759 |
| NPS tax | Only 60% of corpus exempt; Budget 2026 didn't extend it | same |
| Tax slabs | Unchanged for Tax Year 2026-27 | `salary.ts`, `oldRegime.ts` |
| ESI | ₹21,000 ceiling (₹25,000 PwD); 0.75% / 3.25%; Code wage definition per ESIC clarification of 4 Jun 2026 | `esi.ts` |
| Gratuity | 15/26 formula, 50% wage rule, ₹20L exemption | `gratuity.ts` |
| Leave encashment | ₹25L exemption | `LEAVE_ENCASHMENT_EXEMPT_CAP`, line 58 |
| EPS Table D | Year factors 1.02–9.33 (EPFO now applies month-wise) | `TABLE_D`, line 67 |
| LWF | Verified Sanity `lwfRule` documents | `lib/compliance/` |

---

## 1. `lib/calculators/retirementTax.ts`

Turns pre-tax amounts into post-tax amounts. It holds no slab figures of its own.

| Lines | What it does |
|---|---|
| 1–17 | Header: imports figures from the existing tax modules, and adds marginal relief and surcharge for large lump sums. |
| 19–29 | Imports new-regime slabs, ₹75,000 standard deduction, ₹12L rebate limit and cess from `salary.ts`, and the old-regime equivalents from `oldRegime.ts`. A Budget change made in those files flows here automatically. |
| 31–51 | `TaxRegime` type, and three lookup tables (slabs, standard deduction, rebate limit) keyed by regime. |
| 53–62 | `slabTax()`: walks up the slabs, taxing only the part of income inside each one. |
| 64–70 | `surchargeRate()`: 10% above ₹50L, 15% above ₹1Cr, 25% above ₹2Cr; above ₹5Cr, 37% old regime and 25% new. |
| 72–77 | `TaxInput`: income, regime, and deductions that apply in both regimes or old regime only. |
| 79–95 | `incomeTax()`: taxable income after deductions; slab tax; zero tax up to the rebate limit; new-regime marginal relief so tax never exceeds income above ₹12L; then surcharge and cess. |
| 97–101 | `incrementalTax()`: extra tax from adding a lump sum on top of the final year's salary. |
| 103–end | `marginalRate()`: tax on the next ₹10,000, used to tax PF interest each year. |

**Note:** `salary.ts`'s own `computeNewRegimeTax()` has no marginal relief or surcharge. That's fine for the salary tools, but it under-states tax just above ₹12L and on very high incomes. Consider moving the logic here into `salary.ts` so every tool uses it.

## 2. `lib/calculators/esi.ts`

Unchanged from the first version.

| Lines | What it does |
|---|---|
| 9–12 | Ceilings ₹21,000 and ₹25,000 (PwD); rates 0.75% and 3.25%. |
| 23–30 | `esiWage()`: `"gross"` returns gross pay; `"code"` returns the larger of Basic + DA and half of gross. That is the Code's 50% add-back rule in one step. |
| 41–52 | `computeEsi()`: covered if wage is at or under the ceiling; each share rounded up to the next rupee, as ESIC does. |

## 3. `lib/calculators/retirementBenefits.ts`: the engine

### Header, imports, constants (lines 1–67)

| Lines | What it does |
|---|---|
| 1–34 | Every rule the engine uses and where it comes from. Read this first when a rule changes. |
| 35–50 | Imports: PF split from `epfWageCeiling.ts`, tax helper, ESI helper, `computeGratuity` and `GRATUITY_EXEMPTION_CAP` from `gratuity.ts`, and `estimateLwf` and `CYCLES_PER_YEAR` from `lib/compliance/lwf.ts`. |
| 54–65 | Constants: EPF rate, EPS exit age 58, minimum pension ₹1,000, 35-year service cap, ₹25L leave exemption, ₹2.5L PF interest threshold, ₹7.5L employer contribution limit, NPS employer deduction limits (14% new, 10% old). |
| 67 | EPS Table D factors; index 0 is a placeholder so `TABLE_D[3]` means 3 years. |

### Types and defaults (lines 69–294)

| Lines | What it does |
|---|---|
| 74–129 | `RetirementInputs`. `stateSlug` uses the same slugs as `lib/compliance/states.ts`, so it matches Sanity `lwfRule.state`. `lwfSource` is `"verified"` (use Sanity) or `"manual"` (use payslip amounts). `lwfFrequency` reuses the compliance `LwfFrequency` type. |
| 131–178 | `DEFAULT_INPUTS`: simple mode, ₹1L CTC, Karnataka, verified LWF, new ceiling, 50% rule on, new regime. |
| 180–199 | Monthly contribution row and timeline point shapes. |
| 201–294 | `RetirementResult`. `lwf` reports where the figure came from, whether it applies, and the reason if not. |

### Helpers (lines 296–420)

| Lines | What it does |
|---|---|
| 298–327 | Date parsing (invalid input returns `null`), adding years, whole months between dates, ISO formatting, clamp. |
| 329–335 | `tableDFactor()`: Table D, interpolated between whole years. |
| 339–343 | `pvGrowingAnnuity()`: value today of a payment that grows at `g`, discounted at `r`, for `n` years. |
| 345–359 | Zeroed contribution row. |
| 370–383 | `pfParams()`: ceiling ₹15,000 or ₹25,000; PF on actual wage only for the "actual" option; pension on actual wage only with an accepted higher-pension option. |
| 385–387 | Statutory wage: larger of Basic + DA and half of gross when the 50% rule is on. |
| 389–420 | `deriveSalary()`. Simple mode: Basic + DA = 50% of CTC, then gross = CTC minus employer PF and employer NPS. Detailed mode: from the breakup. |

### `calculateRetirement(inputs, options)` (lines 424–956)

**Setup (lines 424–533)**

| Lines | What it does |
|---|---|
| 424–427 | `CalculateOptions`: an optional fixed date (for testing) and the verified LWF rule for the chosen state. |
| 433–436 | Reads options; strips time of day. |
| 439–445 | DOB (falls back to age 30 if invalid), retirement date (override or DOB + age), months to go, current age, retirement age measured from DOB to avoid rounding drift. |
| 448–454 | Salary at any month: rises once every 12 months by the hike rate. |
| 457–461 | EPF rate (exempted trusts pay at least EPFO's rate); monthly NPS rate. |
| 464–484 | `lwfYear()`: yearly LWF at a given monthly gross. With a verified rule, it calls `estimateLwf()`, the same function the LWF Calculator uses, so wage bands, percentage rates, wage limits and non-levying states are all handled. Headcount is set to the rule's minimum because an employee can't know it. Without a verified rule (or when the user chooses payslip amounts), it multiplies the entered amounts by cycles per year. |
| 485 | LWF at today's salary, for the results card. |
| 487–494 | `gratuityAt()`: calls `computeGratuity()` with that month's Basic + DA and, when the 50% rule is on, that month's gross as total remuneration. |
| 497–516 | Running balances and counters (EPF, taxable PF sub-balance, NPS, totals, EPS wages, ESI coverage, timeline). |
| 518–519 | Past service: simple mode treats it all as current-employer service. |
| 521–533 | Timeline points; gratuity shown only once eligible and hidden in job-switch mode. |

**Monthly loop (lines 535–627)**

| Lines | What it does |
|---|---|
| 536–540 | Age, calendar month, and this month's gross, Basic + DA and statutory wage. |
| 542–543 | Resets the ₹2.5L counter in April. |
| 545–551 | PF split from `computeContribution()`. After 58, or for non-members, EPS is 0 and the full employer 12% goes to EPF. VPF on the PF wage. |
| 553–555 | Interest accrues monthly on the balance before this month's credit, as EPFO computes it. |
| 557–562 | Employee contribution above ₹2.5L in the financial year goes to a taxable sub-balance. |
| 564–572 | Adds contributions to EPF; records the EPS pension wage. |
| 573–576 | NPS: one month's growth, then employer % of Basic + DA plus the user's own amount. |
| 578–579 | LWF for this month's wage, so wage bands update as salary grows. |
| 581–591 | ESI coverage; the first month coverage stops becomes the exit age. |
| 593–609 | This month's contribution row; month 0 becomes "This month"; added to career totals. |
| 611–624 | Every March (or at the end), credits interest to EPF and taxes interest on the taxable sub-balance at the marginal rate. |
| 626 | Timeline point every 12 months. |

**After the loop (lines 629–956)**

| Lines | What it does |
|---|---|
| 629–655 | If the retirement date has passed, still fills "This month" and adds a warning. |
| 657–669 | EPF: tax-free with 5+ years of service; warnings for short service and for contributions above ₹2.5L. |
| 671–720 | EPS: service, average pension wage over the last 60 months (padded if fewer), start age between the earliest allowed and 60. 10+ years gives a pension (2-year bonus at 20+ years, 35-year cap, ÷ 70, minus 4% a year before 58, plus 4% a year after, minimum ₹1,000). Under 10 years gives the Table D withdrawal benefit. |
| 722–759 | NPS exit rules and taxable part; annuity; warnings for employer NPS above the deductible limit and employer contributions above ₹7.5L. |
| 761–765 | Gratuity if the person stays: `computeGratuity()` at the final month. |
| 767–785 | Job-switch mode: splits the remaining time into stints, calling `computeGratuity()` for each at its own final wage. |
| 787–793 | Gratuity paid at retirement (last stint, or stay-put), exempt part up to ₹20L, taxable part, wage base used. |
| 795–804 | Warnings for not qualifying or short stints. |
| 806–820 | Leave encashment and its exempt part (least of ₹25L, 10 months' salary, 30 days per year of service). |
| 822–835 | Tax on taxable lump sums on top of the final year's salary; pension and annuity taxed as income. |
| 837–852 | Retirement gap: corpus needed for inflation-linked expenses vs after-tax lump sums plus the value of pension and annuity. |
| 854–858 | ESI today. |
| 860–955 | Result object, including `lwf.source`, `covered` and `reason`. |

## 4. `lib/calculators/retirementShare.ts`

Unchanged. Encodes only inputs that differ from the defaults into `?s=`, and decodes only known keys of the right type. Links made before this revision (with the old `stateCode` key) still open; the state falls back to the default.

## 5. Components

### `components/retirement/fields.tsx`
Secondary inputs styled to match `SliderField`: `NumberInput`, `DateInput`, `YearsMonthsInput` (years + months as one decimal), `Toggle`, `Segmented` (same look as the Gratuity Calculator's category buttons) and `SelectInput`, plus `InputGroup` for headed groups. Primary numeric inputs on the pages use `SliderField` itself.

### `components/retirement/ResultLine.tsx`
One `.ledger-row` (label, dotted fill, mono value), an optional sub-line, and an optional "How is this calculated?" `<details>`. `tone="gain"` uses `text-ledger`, `tone="loss"` uses `text-rust`, following the design-system rule.

### `components/retirement/TimelineChart.tsx`
Stacked Recharts area chart (EPF, NPS, gratuity by age) in `accent`, `accentLight` and `gold`, with axis styling copied from `ProjectionSection`. These hex values need sweeping if the palette changes.

### `components/retirement/format.ts`
Re-exports `formatINR` from `salary.ts` and adds `rupeesShort()` (₹1.25 Cr, ₹48.6 L) for large totals and the chart axis.

### `components/retirement/RetirementCalculator.tsx`

| Lines | What it does |
|---|---|
| 40–50 | `Panel`: a `.card` with a heading, and the shared button style, used for the sections under the calculator. |
| 52–64 | State, and restoring inputs from a share link after first render. |
| 66–71 | Picks the verified LWF rule for the chosen state and runs the engine. |
| 73–82 | Insight banner calculation: the real extra EPF corpus from 2% more VPF, computed with the same engine. |
| 82–96 | `set()` helper and shortcuts, including today's-value conversion and whether to show manual LWF fields. |
| 98–108 | Share link: updates the address bar and copies the URL. |
| 110–132 | Rows for the contributions table and the scenario comparison. |
| 136–332 | Inputs column (left, `max-w-md`). Your details, Salary, Service in both modes; PF, NPS, Leave and tax in detailed mode; collapsible Assumptions. |
| 334–516 | Result card (right, sticky): pre/post-tax and future/today toggles, `.hero-box` with lump sum and monthly income, ledger rows for each benefit with explainers, and share, PDF and Scenario A buttons. |
| 518–527 | Warnings in `.callout-warn`. |
| 529–537 | `InsightBanner`; its link switches to detailed mode and adds 2% VPF. |
| 540–568 | Contributions table. |
| 570–677 | What you don't get back. ESI with wage basis and PwD options. LWF: with a verified rule, shows `VerifiedBadge`, yearly amounts or the reason it doesn't apply, and a link to `/lwf-rates/[state]`; without one, shows payslip inputs. Users can switch to their payslip amounts. Professional Tax input. |
| 679–706 | What-if sliders and the timeline chart. |
| 708–772 | Retirement gap and job-switch panels. |
| 775–809 | Scenario comparison table. |
| 811–814 | Disclaimer. |

### `components/statutory/EsiMiniCalculator.tsx`
Standard layout: `SliderField` inputs on the left, result card on the right with a `Badge`, the employee share as the headline and ledger rows below. The insight banner shows how much the tested wage can rise before coverage ends. Gross can't fall below Basic + DA.

## 6. Pages

- **Retirement page** is a server component. It fetches verified LWF rules (cached for `REVALIDATE_SECONDS`, refreshed by the existing revalidate webhook), then follows the standard order: `Breadcrumb`, title, calculator, `ArticleWithTOC` with `FormulaBox` (PF and EPS, NPS, Gratuity and leave, What you don't get back), `SourceDocuments` with the Gazette PDF already in `public/documents/`, `FAQAccordion`, `RelatedTools`. Everything except the results is hidden when printing.
- **ESI page** keeps the benefit summary in a `BENEFITS` array, with the source and check date in the comment above it.
- **LWF benefits page** is now an employee guide with no calculator, so it doesn't compete with `/tools/lwf-calculator`. It lists, from verified Sanity rules, what employees pay in each levying state, how often, and the welfare board link, then explains what boards fund and how to apply. It uses `ComplianceBreadcrumb` and `Disclaimer` like the other compliance pages.

## Known simplifications

All are stated on the page or in a warning:
- EPS ignores the pre-September 2014 ₹6,500 pensionable-salary rule for older service, so long-serving members' pensions may be overstated.
- Table D is interpolated by year; EPFO applies it by month.
- Salary rises once every 12 months from today.
- Tax uses today's slabs for all future years; no surcharge marginal relief.
- Gratuity payable is not capped, matching the Gratuity Calculator; only the ₹20L exemption is applied.
- ESI is tested month by month; continuation to the end of a contribution period isn't modelled.
- LWF assumes the employer meets any minimum-headcount rule.
- The EPF Scheme 2026 (notified June 2026) hasn't been checked for changes to EPS.

## What to update when rules change

| Change | Edit |
|---|---|
| New EPF interest rate | `DEFAULT_EPF_RATE`, plus the "8.25%" text in the page article and the Assumptions hint |
| Budget changes slabs | `salary.ts` / `oldRegime.ts` only |
| ESI ceiling notified | `esi.ts` constants, plus the ESI page FAQ and article |
| NPS tax exemption raised to 80% | NPS block in the engine (`npsLumpTaxable`), plus the page FAQ and article |
| Gratuity cap changes | `gratuity.ts` |
| LWF rates | Sanity Studio only; no code change |
