# Code explanation: Retirement, ESI and LWF tools

This walks through every file, line by line for the calculation logic and block by block for the UI and page markup. Line numbers match the delivered files.

## How the pieces fit

```
page.tsx (server)  ──renders──▶  RetirementCalculator.tsx (client)
                                     │  inputs (useState)
                                     ▼
                       calculateRetirement()  in retirementBenefits.ts
                         ├─ computeContribution()  ← your epfWageCeiling.ts
                         ├─ incomeTax / incrementalTax / marginalRate  ← retirementTax.ts
                         ├─ computeEsi / esiWage  ← esi.ts
                         └─ computeLwf  ← lwf.ts
                                     │  result object
                                     ▼
                       ResultLine, TimelineChart, tables
```

All maths is in `lib/`. All display is in `components/`. Pages only add the heading, article, FAQ and SEO metadata. Nothing is sent to a server.

---

## 1. `lib/calculators/retirementTax.ts`: income tax helper

Turns pre-tax amounts into post-tax amounts. Covers a resident individual below 60 with salary or pension income.

| Lines | What it does |
|---|---|
| 1–7 | Header note: Tax Year 2026-27 slabs (unchanged by Budget 2026); surcharge has no marginal relief, so very large lump sums are slightly over-taxed. |
| 9 | `TaxRegime` is either `"new"` or `"old"`. Used across all files. |
| 11–14 | `Slab` type: `upTo` is the top of the slab, `rate` the tax rate inside it. |
| 17–25 | New regime slabs: 0 to ₹4L nil, then 5%, 10%, 15%, 20%, 25% in ₹4L steps, 30% above ₹24L. `Infinity` closes the last slab. |
| 28–33 | Old regime slabs: nil to ₹2.5L, 5% to ₹5L, 20% to ₹10L, 30% above. |
| 35–38 | Standard deduction: ₹75,000 new, ₹50,000 old. Pensioners get it too, which is why pension tax later uses the same function. |
| 41–44 | Rebate limits: taxable income up to ₹12L (new) or ₹5L (old) pays no tax. |
| 46 | Health and education cess, 4%. |
| 48–58 | `slabTax()`: walks the slabs from the bottom. `lower` tracks where the current slab starts. For each slab it taxes only the part of income inside it (`min(taxable, upTo) - lower`), then moves `lower` up. It stops once income is used up. |
| 60–66 | `surchargeRate()`: 10% above ₹50L, 15% above ₹1Cr, 25% above ₹2Cr. Above ₹5Cr it's 37% old regime and capped at 25% new regime. |
| 68–73 | `TaxInput`: gross income, regime, and two optional deduction buckets. One applies to both regimes (employer NPS under 80CCD(2)); the other applies only under the old regime (80C, 80CCD(1B)). |
| 75–98 | `incomeTax()`. Line 77 defaults the both-regime deductions to 0. Line 78 ignores old-only deductions under the new regime. Lines 80–83 compute taxable income, never below 0. Line 85 applies the right slab table. Lines 87–92 apply the rebate: zero tax up to the limit. Under the new regime, marginal relief caps tax at the income above ₹12L, so someone at ₹12.1L doesn't pay more tax than the ₹10k they earned above the limit. Lines 94–95 add surcharge, then cess on the total. Line 96 rounds to whole rupees. |
| 100–110 | `incrementalTax()`: tax on `base + extra` minus tax on `base`. This is how much extra tax a taxable lump sum adds in the retirement year. Returns 0 if there's nothing extra. |
| 113–118 | `marginalRate()`: adds ₹10,000 to income and measures how much the tax goes up, as a fraction. Used to tax PF interest each year at the rate the person's last rupee is taxed at. |

---

## 2. `lib/calculators/esi.ts`: ESI rules

| Lines | What it does |
|---|---|
| 1–7 | Header with sources: rates unchanged since July 2019; ESIC's 4 June 2026 clarification that the Code wage definition applies and the ₹21,000 / ₹25,000 ceilings stand. |
| 9–12 | Ceiling ₹21,000, ₹25,000 for persons with disability; employee 0.75%, employer 3.25%. |
| 14 | `EsiWageBasis`: `"code"` (Labour Code wage) or `"gross"` (old practice). |
| 16–30 | `esiWage()`. `"gross"` returns gross. `"code"` returns the larger of Basic + DA and half of gross. Why: under the Code, if exclusions (HRA, allowances) exceed 50% of total pay, the excess is added back to wages. Adding back the excess always lands on exactly 50% of gross, so `max(basicDA, gross × 0.5)` is the same rule in one step. |
| 32–39 | `EsiResult` shape: tested wage, ceiling used, covered or not, both shares, total. |
| 41–52 | `computeEsi()`. Line 45 picks the ceiling. Line 46: covered when wage is positive and at or below the ceiling. Lines 48–49 compute each share and round up with `Math.ceil`, because ESIC rounds contributions to the next higher rupee. Not covered means both are 0. |

---

## 3. `lib/calculators/lwf.ts`: LWF maths

| Lines | What it does |
|---|---|
| 1–6 | Header: LWF varies by state; until Sanity data is wired, the user enters payslip amounts. |
| 8 | Three possible deduction cycles. |
| 10–14 | How many times a year each cycle runs: 12, 2 or 1. |
| 16–21 | Result shape: yearly employee, employer and total, plus a monthly equivalent so it can sit in the monthly contribution table. |
| 23–37 | `computeLwf()`: multiplies each per-cycle amount by cycles per year. `Math.max(0, …)` stops negative input from reducing totals. |

---

## 4. `lib/data/stateDeductions.ts`: state list

| Lines | What it does |
|---|---|
| 1–10 | Explains why no PT/LWF amounts are hard-coded: they change by notification, and the verified values will come from your Sanity data. The TODO says where the Sanity fetch goes. |
| 12 | Imports the LWF frequency type so the future Sanity shape matches the calculator. |
| 14–17 | `StateOption`: code and name. |
| 19–56 | All 28 states and 8 union territories, alphabetical, for the dropdowns. |
| 59–66 | `StateLwfRate`: the shape Sanity data should map into, including `verifiedOn` and `sourceUrl` so the page can show when and where each figure was checked. |
| 68–70 | `stateName()`: turns a code into its name, falling back to the code itself. |

---

## 5. `lib/calculators/retirementBenefits.ts`: the engine

### Header and imports (lines 1–44)

| Lines | What it does |
|---|---|
| 1–27 | Summary of every rule the engine uses and where it comes from. Read this first when rates change. |
| 29–34 | Imports `computeContribution` and both ceilings from your existing EPF wage ceiling file. This keeps the PF/EPS split identical across both tools. |
| 35–40 | Imports the tax helper. |
| 41 | Imports the ESI helpers. |
| 42 | Imports the LWF helper. |

### Constants (lines 46–62)

| Lines | What it does |
|---|---|
| 48 | `DEFAULT_EPF_RATE` 8.25%, the FY 2025-26 rate. Change it here when EPFO declares the FY 2026-27 rate. |
| 49 | EPS membership ends at 58. |
| 50 | Minimum EPS pension ₹1,000. |
| 51 | Pensionable service capped at 35 years. |
| 52 | Gratuity cap ₹20 lakh (also the tax-exempt limit). |
| 53 | Leave encashment exemption ₹25 lakh. |
| 54 | Employee PF above ₹2.5 lakh a year earns taxable interest. |
| 55 | Employer PF + NPS + superannuation above ₹7.5 lakh a year is a taxable perquisite. |
| 56–59 | Employer NPS deductible up to 14% (new) or 10% (old) of Basic + DA. |
| 62 | EPS Table D factors for 1–9 years. Index 0 is a placeholder so `TABLE_D[3]` means 3 years. |

### Types (lines 64–281)

| Lines | What it does |
|---|---|
| 66 | Simple or detailed input mode. |
| 67 | PF wage basis: ₹15,000 ceiling, ₹25,000 ceiling, or actual wage. |
| 69–123 | `RetirementInputs`: every input on the page. Grouped as dates, salary, service, PF, NPS, leave, state deductions, tax, and assumptions. `retirementDateOverride` is an empty string when not used. `yearsAtEmployer` and `totalCareerYears` are decimal years (3 years 6 months = 3.5). `jobSwitchEveryYears` 0 means "stay". |
| 125–171 | `DEFAULT_INPUTS`: what a first-time visitor sees. Simple mode, ₹1L CTC, new ceiling, 50% wage rule on, new regime, and conservative return assumptions (7% hike, 10% NPS, 6.5% annuity, 6% inflation). |
| 173–185 | `MonthlyContributions`: one figure per deduction line. Used both for "this month" and "till retirement". |
| 187–192 | One point on the timeline chart: age, EPF balance, NPS balance, accrued gratuity. |
| 194–281 | `RetirementResult`: everything the UI reads. `meta.deflator` turns a future amount into today's rupees. `eps.kind` says whether the person gets a pension, a withdrawal benefit or nothing. `nps.exit` says normal or premature. `gap.shortfall` is negative when there's a surplus. |

### Helpers (lines 283–356)

| Lines | What it does |
|---|---|
| 285–289 | `parseDate()`: accepts only `yyyy-mm-dd`; returns `null` for anything else so bad input can't crash the engine. Builds the date at local midnight to avoid time-zone shifts. |
| 291–295 | `addYears()`: copies the date and moves the year. |
| 297–303 | `monthsBetween()`: whole months between two dates. Subtracts one if the day of the month hasn't been reached yet. Never negative. |
| 305–310 | `toIsoDate()`: formats a date as `yyyy-mm-dd` for display. |
| 312–314 | `clamp()`: keeps a number between a low and high bound. |
| 317–320 | `gratuityYears()`: a part-year above six months counts as a full year. 7.4 years → 7; 7.6 years → 8. |
| 322–324 | `gratuityAmount()`: 15/26 × last monthly wage × years, rounded, then capped at ₹20 lakh. |
| 326–332 | `tableDFactor()`: returns the Table D factor. Under 0 years → 0; 9+ years → 9.33. In between, it interpolates linearly. Example: 3.5 years = 2.98 + (3.99 − 2.98) × 0.5 = 3.485. EPFO now applies Table D by completed month, so this is a close approximation. |
| 334–339 | `pvGrowingAnnuity()`: today's value of a payment that grows at `g` a year, discounted at `r`, for `n` years. Lines 336–337 handle zero years and the special case where `r = g`, which would otherwise divide by zero. |
| 342–356 | `emptyContributions()`: a zeroed `MonthlyContributions` to start totals from. |

### Salary basics (lines 358–416)

| Lines | What it does |
|---|---|
| 360–365 | `SalaryBase`: gross, Basic + DA, statutory wage, CTC. |
| 367–380 | `pfParams()`: turns the PF option into what `computeContribution` needs. The ceiling is ₹15,000 for the old option and ₹25,000 otherwise. PF runs on actual wage only for the "actual" option. Pension runs on actual wage only with an accepted higher-pension option; otherwise it's capped, as in your EPF tool. |
| 382–384 | `statutoryWageOf()`: with the 50% rule on, wage is the larger of Basic + DA and half of gross. Off, it's Basic + DA. |
| 386–416 | `deriveSalary()`. **Simple mode (389–403):** Basic + DA is taken as 50% of CTC. Employer PF is computed on that, employer NPS too, and both are subtracted from CTC to get gross. **Detailed mode (406–415):** Basic + DA and gross come straight from the breakup. Statutory wage applies the 50% rule. CTC is rebuilt as gross + employer PF (if inside CTC) + employer NPS. |

### `calculateRetirement()` (lines 421–917)

**Dates and ages (lines 425–435)**

| Lines | What it does |
|---|---|
| 421–424 | Takes inputs and an optional `asOf` date. Tests pass a fixed date; the page uses today. |
| 425 | Collects warnings shown in the amber box. |
| 426 | Strips the time of day from `asOf`. |
| 429 | Reads DOB; if invalid, assumes age 30 so the page still shows something sensible. |
| 430–431 | Retirement date is the override if set, otherwise DOB + retirement age. |
| 432 | Months from today to retirement. This is how many times the monthly loop runs. |
| 433 | Current age in years, from whole months. |
| 434 | Retirement age measured from DOB to retirement date. Measuring it this way avoids rounding drift (e.g. 59.9 instead of 60), which would wrongly trigger NPS premature-exit rules. |
| 435 | Years to retirement. |

**Salary over time (lines 437–444)**

| Lines | What it does |
|---|---|
| 438 | Today's salary from `deriveSalary`. |
| 439–440 | Salary rises once every 12 months by the hike rate. `floor(m / 12)` gives the number of hikes received by month `m`. |
| 441–443 | Gross, Basic + DA and statutory wage at any month. |
| 444 | PF ceiling and bases for the whole run. |

**Rates (lines 446–456)**

| Lines | What it does |
|---|---|
| 447–450 | EPF interest rate. With an exempted trust, the higher of the trust rate and EPFO's rate is used, since trusts must pay at least EPFO's rate. |
| 451 | Converts annual NPS return into the equivalent monthly rate, so 12 months of compounding gives exactly the annual figure. |
| 452–456 | Yearly LWF from the user's amounts and frequency. |

**Running state (lines 458–498)**

| Lines | What it does |
|---|---|
| 459 | EPF balance starts at the user's existing balance. |
| 460 | Interest earned so far this financial year, not yet credited. |
| 461–463 | Running totals for the "How is this calculated?" note: employee money in, employer money in, interest credited. |
| 464–465 | A sub-balance tracking only contributions above ₹2.5 lakh a year (and their interest), plus its uncredited interest. Interest on this part is taxable. |
| 466 | Employee contribution so far this financial year. |
| 467 | Tax paid along the way on that interest. |
| 469 | NPS balance starts at the existing balance. |
| 471–472 | Career totals, and the first month's contributions for the "This month" column. |
| 473–474 | Pension wage for each EPS month (for the 60-month average) and the count of EPS months. |
| 475–477 | ESI months covered, the age when ESI stops, and whether the person was ever covered. |
| 478 | Timeline points for the chart. |
| 480–481 | Service before today. Simple mode assumes all service was with the current employer. |
| 483–487 | Gratuity accrued at any month, for the chart only: zero until the person qualifies. |
| 489–496 | Adds a timeline point. EPF includes uncredited interest so the line doesn't jump each March. Gratuity is left out in job-switch mode because it resets. |
| 498 | First point, at today. |

**The monthly loop (lines 500–589).** One pass per month from today to retirement.

| Lines | What it does |
|---|---|
| 501 | Age this month. |
| 502 | Calendar month, 0 = January. Used to detect April (new financial year) and March (interest credit). |
| 503–505 | This month's gross, Basic + DA and statutory wage. |
| 508 | In April, reset the ₹2.5 lakh counter. |
| 511 | PF split from your EPF tool: employee 12%, employer total 12%, EPS 8.33% of the capped pension wage. |
| 512 | Still in EPS only if an EPS member and under 58. |
| 513–514 | After 58, or for non-members, the employer's EPS share is 0 and the full employer 12% goes to EPF. |
| 515 | VPF as a percentage of the PF wage. |
| 516 | Everything the employee puts into EPF this month. |
| 519–520 | Interest accrues on the balance before this month's contribution, one-twelfth of the annual rate. This mirrors how EPFO computes interest on monthly running balances. |
| 524–527 | Works out how much of this month's employee contribution is above the ₹2.5 lakh yearly threshold, and adds that part to the taxable sub-balance. |
| 529–531 | Adds this month's employee and employer EPF money to the balance and the running totals. |
| 533–536 | While in EPS, records this month's pension wage. |
| 539–541 | NPS: employer % of Basic + DA, plus the user's fixed monthly amount. The balance grows by one month's return, then the new money is added. |
| 544–547 | ESI coverage this month, using the chosen wage basis. |
| 548–553 | Counts covered months. The first month the person drops out of ESI after being covered is recorded as the exit age. |
| 555–567 | This month's full contribution row. LWF and PT are flat; LWF is shown as a monthly equivalent. |
| 568 | Keeps month 0 as "This month". |
| 569–571 | Adds the row to career totals. |
| 574–586 | At the end of March (or in the final month), credits the year's interest to EPF. Interest on the taxable sub-balance is taxed at the person's marginal rate for that year's salary. Then both accruals reset. |
| 588 | Adds a timeline point every 12 months and at retirement. |

**Already retired (lines 591–613).** If the retirement date isn't in the future, the loop doesn't run. This block still fills "This month" so the table isn't empty, and adds a warning.

| Lines | What it does |
|---|---|
| 615 | Index of the last working month. |
| 616 | Final year's gross salary, used as the base when taxing lump sums. |
| 617 | Retirement date as text. |

**EPF (lines 619–631)**

| Lines | What it does |
|---|---|
| 620 | Total PF service = past service + years to retirement. |
| 621 | EPF withdrawal is tax-free with at least 5 years of continuous service. |
| 622–626 | Warns if under 5 years. |
| 627–631 | Warns if any year's contributions crossed ₹2.5 lakh. |

**EPS (lines 633–682)**

| Lines | What it does |
|---|---|
| 634 | EPS service = past service + months in EPS. Non-members get 0. |
| 635–639 | Last pension wage. If the loop never ran, it's computed from today's wage. |
| 640–641 | Takes the last 60 pension wages. If there are fewer than 60, pads with the earliest one as a stand-in for past wages. |
| 642 | Pensionable salary = average of those 60 months. |
| 644 | EPS exit is at retirement or 58, whichever is earlier. |
| 645 | Earliest pension start: not before 50, and not before leaving EPS. |
| 646 | Pension start age from the slider, kept between that minimum and 60. |
| 648–651 | Defaults: no EPS payout. |
| 653–672 | With 10+ years: pension. Service gets a 2-year bonus at 20+ years and is capped at 35. Pension = pensionable salary × service ÷ 70. Starting before 58 cuts it 4% per year early; deferring past 58 adds 4% per year. Minimum ₹1,000. Under 10 years: Table D withdrawal benefit on the last pension wage, plus a warning about the scheme certificate option. |
| 673–682 | Warnings for non-members and for the higher-pension option. |

**NPS (lines 684–721)**

| Lines | What it does |
|---|---|
| 685–689 | Corpus and defaults. |
| 691–706 | Retirement at 60 or later is a normal exit: full lump sum up to ₹8L corpus, ₹6L for ₹8L–₹12L, and the user's chosen % (max 80) above ₹12L. Anything above 60% of corpus is taxable. Before 60 is a premature exit: full lump sum up to ₹5L, otherwise 20% lump sum, all of it taxable, plus a warning. |
| 707 | What's left buys the annuity. |
| 708 | Monthly annuity = annuity corpus × annuity rate ÷ 12. |
| 710–715 | Warns if employer NPS is above the deductible limit for the chosen regime. |
| 716–721 | Warns if employer PF + EPS + NPS in year one exceeds ₹7.5 lakh. |

**Gratuity and job switching (lines 723–771)**

| Lines | What it does |
|---|---|
| 724 | Years with the current employer at retirement, if they stay. |
| 725 | Qualifying period: 5 years, or 1 for fixed-term employees. |
| 726–728 | Eligibility, counted years, and last wage. |
| 731–748 | Job-switch mode. Splits the remaining months into stints of N years. The first stint includes time already served. Each stint's gratuity uses the wage in its last month and pays only if the stint qualifies. |
| 749 | Total gratuity across all stints. |
| 751–757 | Gratuity paid at retirement: the last stint in switch mode, otherwise the stay-put amount. |
| 758 | Stay-put gratuity, for the comparison line. |
| 759–760 | Exempt up to ₹20 lakh; the rest is taxable. |
| 762–771 | Warnings for not qualifying, or for stints too short to qualify. |

**Leave encashment (lines 773–787)**

| Lines | What it does |
|---|---|
| 774–776 | Amount = leave days × (final Basic + DA ÷ 30). |
| 777–780 | Completed years with the last employer, and leave days capped at 30 per year of service. |
| 781–787 | Exempt amount is the least of: the actual amount, ₹25 lakh, 10 months' salary, and the capped-days value. The rest is taxable. |

**Tax at retirement (lines 789–802)**

| Lines | What it does |
|---|---|
| 790–791 | Adds the taxable parts of NPS, gratuity and leave, and taxes them on top of the final year's salary. |
| 792 | Final EPF corpus. |
| 794–795 | Total lump sum before and after that tax. |
| 798–802 | EPS pension and NPS annuity are taxed as yearly income. The post-tax share is applied to both monthly figures. |

**Retirement gap (lines 804–819)**

| Lines | What it does |
|---|---|
| 805–807 | Inflation, post-retirement return, and the deflator (how much prices rise by retirement). |
| 808 | Years from retirement to "plan up to age". |
| 809 | Yearly expenses at retirement = today's monthly × 12 × deflator. |
| 811–813 | Corpus needed: today's value at retirement of expenses that keep rising with inflation, paid at the start of each year (hence × (1 + r)). |
| 814–817 | Today's value at retirement of the after-tax EPS pension, discounted further if it starts after retirement. Pension is flat, so growth is 0. |
| 818 | Same for the NPS annuity. |
| 819 | What the benefits provide = after-tax lump sums + pension value + annuity value. |

**ESI and return (lines 821–917).** Lines 822–825 test ESI coverage today. Lines 827–916 package everything into the result. Ages and years are rounded to one decimal; career totals are rounded to whole rupees.

---

## 6. `lib/calculators/retirementShare.ts`: share links

| Lines | What it does |
|---|---|
| 1–3 | Inputs are stored in the URL; nothing is sent anywhere. |
| 10 | Query parameter name `s`. |
| 12–17 | `toBase64Url()`: encodes text as UTF-8 bytes, then base64, then makes it URL-safe (`+`→`-`, `/`→`_`, no `=`). UTF-8 matters because `btoa` alone fails on characters like `₹`. |
| 19–25 | `fromBase64Url()`: the reverse, restoring padding first. |
| 27–36 | `encodeInputs()`: stores only inputs that differ from the defaults, keeping links short. |
| 39–53 | `decodeInputs()`: starts from defaults and copies in only known keys whose type matches the default's type. A tampered link can't inject unexpected values. Any parse error returns `null`. |
| 55–59 | `readInputsFromUrl()`: safe to call during server rendering (returns `null` there). |
| 61–65 | `buildShareUrl()`: current page URL with the encoded inputs. |

---

## 7. `components/retirement/format.ts`

`rupees()` formats with Indian digit grouping (₹1,00,000) and keeps the sign. `rupeesShort()` shortens to Cr or L above ₹1 lakh. `years()` prints "3.5 yrs" or "4 yrs".

## 8. `components/retirement/fields.tsx`: inputs

| Lines | What it does |
|---|---|
| 1–6 | Client component; dependency-free controls you can swap for `SliderField`. |
| 8–19 | `NumberField` props. `slider` adds a range input under the number box. |
| 21–75 | `NumberField`. `useId` links each label to its input for screen readers. `handle()` ignores non-numbers and clamps to min/max. The range input shares the same handler. Every control has a visible focus ring. |
| 77–105 | `DateField`: native date picker. |
| 107–153 | `YearsMonthsField`: two boxes (years, months) stored as one decimal value. Months are clamped 0–11. Uses a `fieldset` and `legend` so the pair is announced together. |
| 155–184 | `Toggle`: checkbox with an optional hint. |
| 186–220 | `Segmented`: a button group. `aria-pressed` tells assistive tech which option is selected. Generic `T` keeps option values type-safe. |
| 222–253 | `SelectField`: native dropdown. |

## 9. `components/retirement/ResultLine.tsx`

Label on the left, amount on the right, optional sub-line, and an optional native `<details>` "How is this calculated?" note. `tone="gain"` uses `text-ledger`, `tone="loss"` uses `text-rust`, and anything else stays neutral, following your convention that these tokens only carry financial meaning. The explainer is hidden when printing.

## 10. `components/retirement/TimelineChart.tsx`

| Lines | What it does |
|---|---|
| 18–28 | Props: timeline data, deflator, whether to show today's value, years to retirement. |
| 30–42 | For today's value, works out the yearly inflation rate from the deflator and deflates each point by the years elapsed to that age. |
| 43–45 | With fewer than two points (no future retirement date), shows a hint instead of an empty chart. |
| 47–64 | Recharts stacked area: EPF, NPS, gratuity. Y-axis uses short rupee labels; tooltip shows full amounts. |

## 11. `components/retirement/RetirementCalculator.tsx`: the main UI

| Lines | What it does |
|---|---|
| 1–34 | Client component and imports. |
| 36–39 | `Scenario`: a saved result for comparison. |
| 41–48 | `Section`: a titled panel. |
| 50–54 | State: inputs, today's-value toggle, post-tax toggle, saved Scenario A, share-button status. |
| 57–60 | On first load, reads inputs from a shared link. Runs in `useEffect` so server and client render the same HTML first. |
| 62 | Recalculates only when inputs change. |
| 64–67 | `set("field")` returns a setter for one input, so each control is one line. |
| 69–75 | Shortcuts: detailed mode, `fv()` to show today's value, and the headline lump sum and monthly income for the chosen pre/post-tax view. |
| 77–89 | Share: writes the link into the address bar, copies it, and shows "Link copied" for 3 seconds. |
| 92–110 | Rows of the "What you put in each month" table: item, who pays, this month, till retirement, and whether it comes back. Rows that are zero both now and over the career are hidden. |
| 112–119 | Rows for the scenario comparison table. |
| 121 | Earliest EPS start age for the slider, matching the engine's rule. |
| 125–383 | **Inputs column**, hidden when printing. Your details (127–165): mode, DOB, retirement age slider, optional exact date, state. Salary (167–196): CTC in simple mode, full breakup in detailed mode, with a line showing gross, Basic + DA and the PF wage. Service (198–219): time with employer, total PF service (detailed), fixed-term toggle. PF and pension (222–290, detailed): ceiling option, 50% rule, EPS membership, higher pension, VPF, current balance, exempted trust. NPS (293–333, detailed): employer %, own contribution, current balance, lump-sum %. Leave and tax (336–353, detailed). Assumptions (356–382): collapsible, available in both modes. |
| 385–441 | **Headline**: pre/post-tax and future/today toggles; lump sum and monthly income at retirement; share, PDF and Scenario A buttons. |
| 443–452 | Warnings from the engine. |
| 454–604 | **What comes back**: EPF, EPS pension or withdrawal, NPS lump sum and annuity, gratuity, leave encashment, and (after tax) the tax on lump sums. Each has its own explainer built from the actual numbers. |
| 606–634 | **What you put in each month** table, scrollable on small screens. |
| 636–724 | **What you don't get back**: ESI with wage basis and PwD options, the wage tested, both shares and when ESI stops; LWF with payslip amounts and frequency; Professional Tax. Each links to its own page. |
| 726–767 | **What-ifs**: VPF, retirement age and EPS start-age sliders, then the timeline chart. Moving the retirement-age slider clears any exact date so the slider takes effect. |
| 769–798 | **Will it be enough?**: expenses input, corpus needed, corpus provided, shortfall or surplus. |
| 800–827 | **Job switching**: switch interval, total gratuity across jobs, and the difference vs staying. |
| 829–871 | **Scenario comparison**: Scenario A vs current. The difference is coloured green when better (lower for shortfall, higher for everything else). |
| 873–878 | Disclaimer. |

## 12. `components/statutory/`

- **`EsiMiniCalculator.tsx`**: standalone ESI check for the ESI page. Gross can't be set below Basic + DA. Reuses `computeEsi`, `esiWage`, the shared fields and `ResultLine`.
- **`LwfMiniCalculator.tsx`**: state picker, payslip amounts and frequency, yearly totals. Points to `/lwf-rates` for the verified figures.
- **`PageFaq.tsx`**: `PageFaq` renders questions as `<details>` and emits FAQPage JSON-LD from the same data, so the markup always matches the visible FAQ. `Sources` renders the source list with links that open in a new tab.

## 13. Pages

Each `page.tsx` is a server component. It exports `metadata` (title, description, canonical), then renders the breadcrumb, heading, the client calculator, article content, FAQ, sources and related links.

- **Retirement page:** explains EPF, EPS, NPS, gratuity and leave encashment, and summarises ESI, LWF and PT with links. Article sections are hidden in print so the PDF is just the summary.
- **ESI page:** the benefits table is driven by the `benefits` array (lines 15–56). Edit that array to change the table. Includes how to use ESI in practice.
- **LWF page:** explains that schemes vary by state, gives common examples without per-state claims, and explains how to apply.

---

## Known simplifications

All of these are stated on the page or in a warning.

- EPS ignores the pre-September 2014 ₹6,500 pensionable-salary rule for older service, so pensions for long-serving members may be overstated.
- Table D is interpolated by year; EPFO applies it by month.
- Salary rises once every 12 months from today, not on each employer's appraisal date.
- Tax uses today's slabs for all future years and no surcharge marginal relief.
- NPS ₹8L–₹12L: the balance after the ₹6L lump sum is treated as annuity; PFRDA also allows systematic withdrawal.
- ESI coverage is tested monthly; the rule that coverage continues to the end of a contribution period isn't modelled.
- The EPF Scheme 2026 (notified June 2026) hasn't been checked for changes to EPS; please confirm before launch.
