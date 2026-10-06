# Data entry guide

How to fill holidays, minimum wages and LWF in Studio so each state can go live.

## Ground rules

1. **Official sources only.** State labour department notifications, gazettes,
   Labour Welfare Board circulars, or the state government's holiday G.O.
   Don't copy from aggregators (including labourcodes360): their errors come
   with the data.
2. **Draft until checked.** A record stays hidden until Status = Verified. Studio
   blocks Verified without a "Last verified on" date and at least one source.
3. **Upload the PDF** into Official sources whenever you have it. Links to
   government sites break often; the uploaded file stays.
4. **One state at a time, fully.** A complete state ranks; a half-done one is
   hidden anyway.

## Suggested order

| Order | Dataset | Records | Why first |
|---|---|---|---|
| 1 | LWF | 36 (about 20 are "not applicable") | Fastest win; proves the publish flow |
| 2 | Holidays 2026, then 2027 | 1 per state per year | 2027 lists usually come out Nov to Jan |
| 3 | Minimum wages | 1 notification + several schedules per state | Biggest; start with states you know best |

## LWF: one record per state

1. Create **LWF rule**, pick the state.
2. If the state has no LWF law: switch off "State levies LWF", add the source
   you used to confirm that, set verified date and status. Done.
3. Otherwise fill: Act, Board, portal, effective date, frequency, deduction
   months (half-yearly/yearly only), due dates, minimum employees, wage limit,
   coverage notes.
4. **Contribution rates**: one row if everyone pays the same. Add rows for
   wage bands (fill Wage from/to) or establishment types (fill Label). Use
   "% of wages" with caps where the state charges a percentage.
5. Sources → Verified → Publish.

## Holidays: one record per state per year

1. Create **Holiday list**, pick state and year.
2. Enter every holiday from the government notification. Mark each:
   National (26 Jan, 15 Aug, 2 Oct only), General, or Restricted.
   Tick "Date may change" for moon-sighting festivals.
3. **Private employers** section, from the state's National and Festival
   Holidays Act or Shops and Establishments Act (not the government list):
   Act name, minimum paid holidays, mandatory holidays, festival holidays the
   employer picks, eligibility, rule for working on a holiday.
4. Sources → Verified → Publish.

## Minimum wages: notification first, then schedules

1. Create **Minimum wage notification**: state, effective date, framework,
   days per month (leave 26 unless the notification says otherwise).
2. Add every **zone** exactly as you'll type it later (e.g. `Zone I`) with the
   areas it covers. One zone called `All areas` if the state has no zones.
3. Save, then for each scheduled employment create a **Minimum wage rates
   (per employment)** document:
   - Pick the notification.
   - Employment name exactly as notified.
   - **Unit: Month or Day.** Check the notification's column header every
     time. This is the most common error.
   - VDA by zone (once per zone).
   - Rows: category, skill, zone, basic. Use row menu → Duplicate, then change
     zone and basic. VDA override only if that row's VDA differs.
4. Fix any yellow warnings (daily-vs-monthly) and red errors (unknown zone).
5. On the notification: sources, verified date, status Verified → Publish.
   Publishing the notification makes all its schedules live.
6. For a VDA-only revision, create a **new** notification with the new
   effective date and new schedules. Keep the old one: the page shows both
   with a date switcher.

## Verification checklist (before marking Verified)

- [ ] Effective date matches the notification
- [ ] Unit (month/day) matches each table's header
- [ ] Zone names consistent; every zone has its areas
- [ ] Spot-check 3 random rows against the PDF (basic + VDA = total in PDF)
- [ ] Source PDF uploaded or official link added
- [ ] After publishing: open the live page and compare the same 3 rows

## Research leads (verify before entering)

Found during planning in secondary sources. Not verified. Each must be
checked against the official notification.

| Item | Lead | Where it came from |
|---|---|---|
| Maharashtra LWF | ₹25 employee / ₹75 employer, half-yearly | ksandk.com newsletter citing the Board's public notice |
| Karnataka LWF | ₹50 / ₹100 yearly; threshold cut from 50 to 10 employees (gazetted 7 Jan 2026) | ksandk.com; beaconfiling.com |
| Haryana LWF | Possibly revised to max ₹35 / ₹70 monthly from 1 Jan 2026 | ezhrm.in, single source |
| Karnataka private holidays | 10 a year (5 national incl. May Day and Rajyotsava + 5 festival). Another source says "at least 5" | simpliance.in; lkslaw.com |
| Kerala | Government notification says labour-law establishments follow the Kerala NFH Act, 1958 | Kerala 2026 holiday notification |
| Daily to monthly | ×26 under Code on Wages (Central) Rules, 2026 (notified 8 May 2026) | scconline.com, taxguru.in |
| National floor wage | Not notified as of mid-2026 | lawsikho.com, calcguru.in |

## Yearly maintenance calendar (typical; confirm per state)

| When | What to check |
|---|---|
| Nov to Jan | Next year's holiday lists |
| Mar to Apr | Minimum wage / VDA revisions (many states revise 1 April) |
| Sep to Oct | Second VDA revision in states that revise twice a year |
| Dec and Jun | LWF half-yearly cycles; check for rate notices before due dates |
| Any time | Code on Wages floor wage notification: update the FAQ in `app/minimum-wages/page.tsx` |
