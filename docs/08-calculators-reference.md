# Calculators Reference

Every calculator's logic lives in `lib/calculators/`, fully separated
from its UI (`app/tools/<slug>/page.tsx`). This document explains what
each one computes, the statutory basis, and known simplifications —
essentially the "why" behind the code, since the code comments in each
file cover the "what."

**All statutory figures below were last verified August 2026, for FY
2026-27.** Indian tax law changes at minimum once a year (the Union
Budget, typically presented in February). Before trusting any figure
here for a real filing decision, or before extending a calculator,
re-verify against a current, authoritative source (official government
notifications, or multiple corroborating current tax-advisory sources).

## Foundational engines (used by multiple tools)

### `salary.ts` — New tax regime + CTC breakdown
- New-regime income tax slabs (0-4L nil, 4-8L 5%, 8-12L 10%, 12-16L 15%,
  16-20L 20%, 20-24L 25%, above 24L 30%), ₹75,000 standard deduction,
  Section 87A rebate (up to ₹60,000 rebate if taxable income ≤ ₹12L), 4%
  cess.
- `computeInHandSalary()` models a CTC breakup: Basic (% of CTC) →
  Employer/Employee PF → gross income → new-regime tax → net take-home.
- **Known simplification:** does not model surcharge (income > ₹50L) or
  marginal relief near the ₹12L rebate cliff.

### `oldRegime.ts` — Old tax regime
- Old-regime slabs (0-2.5L nil, 2.5-5L 5%, 5-10L 20%, above 10L 30%),
  ₹50,000 standard deduction, Section 87A rebate (up to ₹12,500 if
  taxable income ≤ ₹5L), 4% cess.
- Accepts 80C, 80D, HRA, and "other" deductions as inputs.
- **Verified fact worth remembering:** Section 80C's limit is
  ₹1,50,000 — some competitor sites incorrectly state ₹2,00,000. Don't
  copy that error if referencing this elsewhere.
- **Known simplification:** only models the general slabs (individuals
  under 60); senior/super-senior citizen slabs are not modeled.

### `capitalGains.ts` — Equity LTCG/STCG
- Scoped to **listed equity shares and equity mutual funds only**
  (Sections 111A/112A) — explicitly does not cover property, debt funds,
  gold, or unlisted shares (those have separate rules; see `property.ts`
  and `esop.ts`/`rsu.ts` for the unlisted-share cases).
- LTCG (holding > 12 months): 12.5% + 4% cess on gains above ₹1,25,000
  exemption/year, no indexation.
- STCG (holding ≤ 12 months): flat 20% + 4% cess, no exemption threshold.

## Individual tool reference

### In-Hand Salary Calculator (`salary.ts`)
CTC → take-home breakdown using the new regime by default. See
Foundational Engines above.

### HRA Exemption Calculator (`hra.ts`)
Section 10(13A): exempt amount = LEAST of (actual HRA received, rent
paid − 10% of basic, 50%/40% of basic for metro/non-metro). Metro =
Delhi, Mumbai, Kolkata, Chennai only (a fixed, non-obvious list — even
large cities like Bangalore count as non-metro for this specific rule).
**Old regime only** — the new regime doesn't offer this exemption at
all.

### Old vs New Tax Regime Calculator
Combines `salary.ts` and `oldRegime.ts` side by side on the same
income/deductions, so a visitor sees their actual crossover point rather
than a generic rule of thumb.

### Gratuity Calculator (`gratuity.ts`)
Payment of Gratuity Act 1972 formula: `(15/26) × wage base × years of
service`, unchanged by the Labour Codes. Two real changes from the
Labour Codes (effective **21 November 2025** — verified current law, not
pending):
1. **Fixed-term employees** qualify after 1 year (vs 5 years for
   permanent employees), pro-rata.
2. **The 50% wage rule:** if allowances exceed 50% of total
   remuneration, the excess is added back into the wage base used for
   the calculation — this can meaningfully raise gratuity for
   allowance-heavy salary structures.

Tax exemption (Section 10(10), unchanged by the Labour Codes): least of
actual gratuity, ₹20,00,000 cap, or the formula amount, for
non-government employees. Government employees are fully exempt.

**Known simplification:** doesn't yet distinguish government employees
from private-sector ones for eligibility purposes beyond the exemption
calculation itself (the category selector does exist for this, but
double-check the logic if extending it).

### TDS on Salary Calculator (`salary.ts`, reused)
Estimated annual tax (new regime) ÷ months remaining in the financial
year. **Known simplification:** assumes even monthly withholding — real
employer TDS schedules often front-load or adjust through the year based
on bonuses and declared investments.

### Advance Tax Calculator (`advanceTax.ts`)
Section 234C: interest triggers if CUMULATIVE advance tax paid falls
short of **12%/36%/75%/100%** thresholds by the four due dates — note
these are NOT the commonly quoted 15%/45%/75%/100% payment-schedule
percentages; the gap is a deliberate buffer. Interest = shortfall × 1% ×
(3 months for Q1-Q3 shortfalls, 1 month for Q4). Presumptive taxpayers
(44AD/44ADA) only need 100% by 15 March.

Section 234B (separate from 234C): if total advance tax paid is under
90% of net tax payable, 1%/month simple interest on the balance, from 1
April until actually paid — this can run well past the financial year's
end, unlike 234C.

**Known simplification:** doesn't model the exemption for shortfalls
caused by unanticipated capital gains or lottery/casual income (a real,
separate provision in the Act).

### Section 80C Tax Planner (`section80c.ts`)
₹1,50,000 combined limit (80C + 80CCC + 80CCD(1)), PLUS a genuinely
separate ₹50,000 bucket for NPS under Section 80CCD(1B) — so the true
combined ceiling is ₹2,00,000, but only if ₹50,000 of that specifically
comes from NPS. Tax saved is computed as an actual before/after
difference using `oldRegime.ts`, not a flat percentage estimate.

### Section 80D Health Insurance Calculator (`section80d.ts`)
Two **independent** brackets — self/family and parents — each capped at
₹25,000 (or ₹50,000 if anyone covered in that bracket is a senior
citizen, 60+). The ₹5,000 preventive-checkup deduction is a sub-limit
WITHIN whichever bracket has room, not additional money on top.

### LTCG / STCG Calculators
See Foundational Engines (`capitalGains.ts`) above — these are thin UI
wrappers around that shared logic.

### Freelancer Tax Calculator — Section 44ADA (`section44ada.ts`)
Presumptive income = 50% of gross receipts (minimum declarable).
Eligibility: ₹50L gross receipts, or ₹75L if cash receipts are ≤5% of
total. Crossing the limit loses the scheme entirely for that year, not
just on the excess.

### Salary vs Freelance Tax Comparison
Combines `salary.ts` (assumes typical 40% Basic / 12% PF structure) and
`section44ada.ts` for a side-by-side take-home comparison. **Explicitly
scoped as tax-mechanics-only** — the tool's own copy states it doesn't
model the value of employer benefits (PF match, gratuity accrual, health
insurance) that a salaried structure includes but freelance income
doesn't. Don't let this comparison's framing drift into implying
freelance is simply "better."

### Property Capital Gains Tax Calculator (`property.ts`)
The most statutorily complex tool on the site. Property (land/building)
held > 24 months = long-term. Contains the full verified Cost Inflation
Index (CII) table, 2001-02 through 2026-27.

**The grandfathering rule** (Budget 2024, cutoff 23 July 2024):
- Property acquired ON/AFTER 23 July 2024: only 12.5%, no indexation.
- Property acquired BEFORE 23 July 2024: taxpayer's choice of the LOWER
  of (12.5% without indexation) or (20% with indexation using the CII
  table). The calculator computes both and picks the lower automatically
  — do not hardcode an assumption that one always wins; it genuinely
  depends on the specific numbers.

**Cost of improvement** (Section 48/55, added alongside the Indexation
Calculator below): each improvement/renovation is indexed from ITS OWN
year, not the original purchase year — `indexedImprovementCost = cost ×
(CII of sale year ÷ CII of the improvement's own year)`. Improvements
before 1 April 2001 aren't eligible. This is entered as a repeatable
list (`components/ImprovementsInput.tsx`, shared with the Indexation
Calculator).

Sections 54 (reinvest in residential property, up to ₹10 crore) and 54EC
(specified bonds within 6 months, capped ₹50L) are modeled as
user-entered exemption amounts, not automatically calculated eligibility
— the user must determine and enter how much they're claiming.

**When updating for a new financial year:** add the new year's CII value
to the `CII` table in `property.ts` (CBDT typically notifies this
mid-year) — don't let the table go stale, since indexation calculations
directly depend on it. Both this tool and the Indexation Calculator
import from the same `CII` table, so a single update propagates to both.

### Indexation Calculator (`property.ts`, same engine as above)
A dedicated tool for the "indexation calculator" / "CII calculator"
search intent specifically — same underlying engine and math as the
Property Capital Gains Tax Calculator, but framed around the indexed
cost figures themselves (CII values used, indexed cost of acquisition,
indexed cost of improvement) as the primary output, rather than leading
with the final tax payable. Does not model Section 54/54EC exemptions
(the page points users to the Property Capital Gains Tax Calculator for
that) — this tool's job is showing the indexation math clearly, not
being the final word on total tax owed.

**Maintenance note:** since this shares `property.ts` with the Property
Capital Gains Tax Calculator, any change to the engine (a new CII year,
a fix to the improvement-indexation logic, a change to the grandfathering
rule) automatically applies to both tools — there is no separate copy of
this logic to keep in sync.

### ESOP Tax Calculator (`esop.ts`)
Two-stage taxation, genuinely not double taxation:
1. **Exercise:** perquisite = (FMV at exercise − exercise price) ×
   shares, taxed as salary at slab rate.
2. **Sale:** capital gain = sale price − FMV at exercise (FMV becomes
   the cost basis specifically to avoid re-taxing already-taxed
   appreciation). Listed shares: >12 months = LTCG rules; unlisted
   (most startup ESOPs): >24 months = LTCG rules, else slab rate.

**Known simplification:** doesn't model the DPIIT-eligible-startup
deferral option (Section 192(1C), which lets eligible startups defer the
Stage 1 TDS *payment* — not the tax itself — up to 48 months or
sale/resignation). This is a real, current provision not yet built into
the calculator logic.

### Salary + Capital Gains Tax Calculator
Combines `salary.ts` and `capitalGains.ts` to show that capital gains
tax and salary tax are computed independently and simply summed — a
large capital gain does NOT push salary income into a higher bracket.
The tool's FAQ correctly notes the actual ITR form is usually ITR-2 for
this combination (not ITR-3, which requires business/professional
income) — a correction versus at least one competitor site that mislabels
this.

### US Stocks & RSU Tax Calculator (`rsu.ts`)
The most complex tool, by design scoped conservatively. Key facts:
- Foreign shares are NEVER "listed" for Indian tax purposes (no STT on a
  recognized Indian exchange) — they always follow UNLISTED share rules
  for capital gains, regardless of being listed on NASDAQ/NYSE.
- **Forex conversion rule (Rule 115/206):** both the vesting perquisite
  and the sale proceeds must be converted using the SBI TT Buying Rate
  (TTBR) for the **last working day of the month BEFORE** the
  vesting/sale month — not the transaction date itself, not the current
  date. This is the single most common real-world filing error the tool
  exists to prevent.
- Unlisted-share holding threshold: >24 months from vesting = LTCG
  (12.5%); ≤24 months = STCG at slab rate.

**Explicitly out of scope, by design, not oversight:** Foreign Tax
Credit (Form 67, India-US DTAA mechanics) and Schedule FA disclosure
itself (only a reminder banner is shown, no computation). These involve
genuine cross-border complexity beyond what a self-serve calculator
should attempt — the tool's copy says so directly and recommends a CA
experienced with foreign equity compensation. Do not attempt to add FTC
computation without significant additional domain research; getting it
wrong here has real financial consequences for users.

## The verification standard for any new statutory figure

Before adding or changing any tax rate, exemption limit, or deduction
cap anywhere in `lib/calculators/`:

1. Search for the current rule from at least one authoritative or
   corroborated current source (not a single blog post)
2. Note the verification date in a code comment, matching the style
   already used in each file's header comment
3. If the figure contradicts what a competitor site states, consider
   whether to flag the discrepancy in the tool's own FAQ/article copy
   (as done for the 80C limit and the ITR-2/ITR-3 distinction) — being
   right where competitors are wrong is a genuine trust/differentiation
   asset for this site
