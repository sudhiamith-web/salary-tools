"use client";

// Retirement & Statutory Deductions Calculator: interactive part.
// The page (app/tools/retirement-benefits-calculator/page.tsx) fetches
// verified LWF rules from Sanity on the server and passes them in.
// All maths is in lib/calculators/retirementBenefits.ts.

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  calculateRetirement,
  DEFAULT_INPUTS,
  DEFAULT_EPF_RATE,
  NPS_EMPLOYER_LIMIT_PCT,
  type RetirementInputs,
  type RetirementResult,
} from "@/lib/calculators/retirementBenefits";
import { ESI_EMPLOYEE_RATE, ESI_EMPLOYER_RATE } from "@/lib/calculators/esi";
import { buildShareUrl, readInputsFromUrl } from "@/lib/calculators/retirementShare";
import { REGIONS, getRegion } from "@/lib/compliance/states";
import type { LwfRule } from "@/lib/compliance/types";
import { FREQUENCY_LABEL } from "@/lib/compliance/lwf";
import { VerifiedBadge } from "@/components/compliance/Shared";
import SliderField from "@/components/SliderField";
import Badge from "@/components/Badge";
import InsightBanner from "@/components/InsightBanner";
import {
  DateInput,
  InputGroup,
  NumberInput,
  Segmented,
  SelectInput,
  Toggle,
  YearsMonthsInput,
} from "./fields";
import { ResultLine } from "./ResultLine";
import { TimelineChart } from "./TimelineChart";
import { formatINR, rupeesShort, years } from "./format";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card px-6 py-5">
      <h2 className="text-xl mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const btnCls =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-ink hover:border-accent hover:text-accent";

export default function RetirementCalculator({ lwfRules }: { lwfRules: LwfRule[] }) {
  const [inputs, setInputs] = useState<RetirementInputs>(DEFAULT_INPUTS);
  const [todaysValue, setTodaysValue] = useState(false);
  const [postTax, setPostTax] = useState(false);
  const [scenarioA, setScenarioA] = useState<RetirementResult | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  // Restore inputs from a shared link once, after the first render, so the
  // server and client HTML match.
  useEffect(() => {
    const fromUrl = readInputsFromUrl();
    if (fromUrl) setInputs(fromUrl);
  }, []);

  const lwfRule = useMemo(
    () => lwfRules.find((r) => r.state === inputs.stateSlug) ?? null,
    [lwfRules, inputs.stateSlug]
  );

  const result = useMemo(() => calculateRetirement(inputs, { lwfRule }), [inputs, lwfRule]);

  // Genuine "what if": the extra EPF corpus from 2% more VPF, using the
  // same engine. Skipped when VPF is already near the maximum.
  const vpfInsight = useMemo(() => {
    if (inputs.vpfPct > 86 || result.meta.monthsToRetirement < 12) return null;
    const bumped = calculateRetirement({ ...inputs, vpfPct: inputs.vpfPct + 2 }, { lwfRule });
    const delta = bumped.epf.corpus - result.epf.corpus;
    return delta > 0 ? delta : null;
  }, [inputs, lwfRule, result.epf.corpus, result.meta.monthsToRetirement]);

  const set =
    <K extends keyof RetirementInputs>(key: K) =>
    (value: RetirementInputs[K]) =>
      setInputs((prev) => ({ ...prev, [key]: value }));

  const detailed = inputs.mode === "detailed";
  const { meta } = result;
  const fv = (amount: number) => (todaysValue ? amount / meta.deflator : amount);
  const lump = postTax ? result.totals.lumpSumPostTax : result.totals.lumpSumPreTax;
  const monthly = postTax ? result.totals.monthlyIncomePostTax : result.totals.monthlyIncomePreTax;
  const now = result.monthlyNow;
  const career = result.careerTotals;
  const regionName = getRegion(inputs.stateSlug)?.name ?? inputs.stateSlug;
  const minEpsStart = Math.min(58, Math.max(50, Math.ceil(Math.min(meta.retirementAge, 58))));
  const showManualLwf = inputs.lwfSource === "manual" || !lwfRule;

  const handleShare = async () => {
    try {
      const url = buildShareUrl(inputs);
      window.history.replaceState(null, "", url);
      await navigator.clipboard.writeText(url);
      setShareState("copied");
    } catch {
      setShareState("failed");
    }
    setTimeout(() => setShareState("idle"), 3000);
  };

  const contributionRows = [
    { item: "PF (12% of PF wage)", paidBy: "You", month: now.employeePF, total: career.employeePF, back: "Yes, EPF lump sum" },
    { item: "Voluntary PF", paidBy: "You", month: now.vpf, total: career.vpf, back: "Yes, EPF lump sum" },
    { item: "Employer PF to EPF", paidBy: "Employer", month: now.employerEPF, total: career.employerEPF, back: "Yes, EPF lump sum" },
    { item: "Employer PF to EPS", paidBy: "Employer", month: now.employerEPS, total: career.employerEPS, back: "As monthly pension" },
    { item: "Employer NPS", paidBy: "Employer", month: now.npsEmployer, total: career.npsEmployer, back: "Yes, lump sum + annuity" },
    { item: "Your NPS", paidBy: "You", month: now.npsEmployee, total: career.npsEmployee, back: "Yes, lump sum + annuity" },
    { item: "ESI", paidBy: "You", month: now.esiEmployee, total: career.esiEmployee, back: "No, buys insurance cover" },
    { item: "ESI", paidBy: "Employer", month: now.esiEmployer, total: career.esiEmployer, back: "No, buys insurance cover" },
    { item: "Professional Tax", paidBy: "You", month: now.pt, total: career.pt, back: "No, state tax" },
    { item: "LWF (monthly equivalent)", paidBy: "You", month: now.lwfEmployee, total: career.lwfEmployee, back: "No, funds welfare schemes" },
    { item: "LWF (monthly equivalent)", paidBy: "Employer", month: now.lwfEmployer, total: career.lwfEmployer, back: "No, funds welfare schemes" },
  ].filter((r) => r.month > 0 || r.total > 0);

  const compareRows = (r: RetirementResult) => [
    { label: "Lump sum at retirement", value: postTax ? r.totals.lumpSumPostTax : r.totals.lumpSumPreTax },
    { label: "Monthly pension + annuity", value: postTax ? r.totals.monthlyIncomePostTax : r.totals.monthlyIncomePreTax },
    { label: "EPF corpus", value: r.epf.corpus },
    { label: "NPS corpus", value: r.nps.corpus },
    { label: "Gratuity", value: r.gratuity.amount },
    { label: "Retirement shortfall", value: r.gap.shortfall },
  ];

  return (
    <>
      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-12">
        {/* ------------------------------------------------- INPUTS */}
        <div className="space-y-10 max-w-md print:hidden">
          <InputGroup title="Your details">
            <Segmented
              label="How much detail do you want to give?"
              value={inputs.mode}
              onChange={set("mode")}
              options={[
                { value: "simple", label: "Simple" },
                { value: "detailed", label: "Detailed" },
              ]}
              hint={
                detailed
                  ? "Uses your exact salary breakup and unlocks PF, NPS, leave and tax options."
                  : "Assumes Basic + DA is 50% of CTC and employer PF is part of CTC."
              }
            />
            <DateInput label="Date of birth" value={inputs.dob} onChange={set("dob")} />
            <SliderField
              label="Retirement age"
              value={inputs.retirementAge}
              onChange={(v) => setInputs((p) => ({ ...p, retirementAge: v, retirementDateOverride: "" }))}
              suffix="years"
              min={45}
              max={70}
              step={1}
            />
            <DateInput
              label="Exact retirement date (optional)"
              value={inputs.retirementDateOverride}
              onChange={set("retirementDateOverride")}
              hint={`You retire on ${meta.retirementDate}, in ${years(meta.yearsToRetirement)}. Leave blank to retire on your birthday.`}
            />
            <SelectInput
              label="State you work in"
              value={inputs.stateSlug}
              onChange={set("stateSlug")}
              options={REGIONS.map((r) => ({ value: r.slug, label: r.name }))}
            />
          </InputGroup>

          <InputGroup title="Salary">
            {detailed ? (
              <>
                <SliderField label="Basic (monthly)" value={inputs.basic} onChange={set("basic")} suffix="₹ / month" min={5000} max={500000} step={500} />
                <NumberInput label="Dearness Allowance (monthly)" value={inputs.da} onChange={set("da")} suffix="₹ / month" step={500} />
                <NumberInput label="HRA (monthly)" value={inputs.hra} onChange={set("hra")} suffix="₹ / month" step={500} />
                <NumberInput label="Special allowance (monthly)" value={inputs.special} onChange={set("special")} suffix="₹ / month" step={500} />
                <NumberInput label="Other allowances (monthly)" value={inputs.otherAllowances} onChange={set("otherAllowances")} suffix="₹ / month" step={500} />
                <Toggle label="Employer PF is included in my CTC" checked={inputs.employerPfInCtc} onChange={set("employerPfInCtc")} />
              </>
            ) : (
              <SliderField label="Monthly CTC" value={inputs.monthlyCtc} onChange={set("monthlyCtc")} suffix="₹ / month" min={10000} max={1000000} step={1000} />
            )}
            <p className="text-xs text-charcoal/50">
              Monthly gross {formatINR(result.salaryNow.gross)}, Basic + DA {formatINR(result.salaryNow.basicDA)}, wage used
              for PF and gratuity {formatINR(result.salaryNow.statutoryWage)}.
            </p>
          </InputGroup>

          <InputGroup title="Service">
            <YearsMonthsInput
              label="Time with your current employer"
              value={inputs.yearsAtEmployer}
              onChange={set("yearsAtEmployer")}
              hint="Gratuity depends on this. It resets when you change jobs."
            />
            {detailed && (
              <YearsMonthsInput
                label="Total PF service across all jobs"
                value={inputs.totalCareerYears}
                onChange={set("totalCareerYears")}
                hint="EPS pension and tax-free PF depend on total service if you transferred PF between jobs."
              />
            )}
            <Toggle
              label="I'm a fixed-term employee"
              checked={inputs.isFixedTerm}
              onChange={set("isFixedTerm")}
              hint="Fixed-term employees qualify for gratuity after 1 year under the Labour Codes."
            />
          </InputGroup>

          {detailed && (
            <InputGroup title="Provident Fund and pension">
              <Segmented
                label="PF wage basis"
                value={inputs.pfWageOption}
                onChange={set("pfWageOption")}
                options={[
                  { value: "new-ceiling", label: "₹25,000 ceiling" },
                  { value: "old-ceiling", label: "₹15,000 ceiling" },
                  { value: "actual", label: "Actual wage" },
                ]}
                hint="The ceiling rose to ₹25,000 on 17 Sept 2026 (S.O. 5109(E)). Pick ₹15,000 only to compare."
              />
              <Toggle
                label="Apply the Labour Codes 50% wage rule"
                checked={inputs.applyWageRule}
                onChange={set("applyWageRule")}
                hint="If allowances exceed half your pay, the excess is added back to the wage for PF and gratuity."
              />
              <Toggle
                label="I'm an EPS (pension) member"
                checked={inputs.epsMember}
                onChange={set("epsMember")}
                hint="Most employees are. If your passbook shows no pension contribution, switch this off."
              />
              {inputs.epsMember && (
                <Toggle
                  label="I have an accepted higher-pension option"
                  checked={inputs.higherPension}
                  onChange={set("higherPension")}
                  hint="Only if EPFO has accepted your option. Pension then runs on actual wages."
                />
              )}
              <SliderField label="Voluntary PF (VPF)" value={inputs.vpfPct} onChange={set("vpfPct")} suffix="% of PF wage" min={0} max={88} step={1} />
              <NumberInput
                label="Current EPF balance"
                value={inputs.existingEpfBalance}
                onChange={set("existingEpfBalance")}
                suffix="₹"
                step={10000}
                hint="From your EPFO passbook. Leave 0 if you don't know."
              />
              <Toggle label="My employer runs its own (exempted) PF trust" checked={inputs.exemptTrust} onChange={set("exemptTrust")} />
              {inputs.exemptTrust && (
                <NumberInput
                  label="Trust interest rate"
                  value={inputs.trustRatePct}
                  onChange={set("trustRatePct")}
                  min={DEFAULT_EPF_RATE}
                  max={12}
                  step={0.05}
                  suffix="%"
                  hint="Exempted trusts must pay at least the EPFO rate."
                />
              )}
            </InputGroup>
          )}

          {detailed && (
            <InputGroup title="NPS">
              <SliderField label="Employer NPS contribution" value={inputs.npsEmployerPct} onChange={set("npsEmployerPct")} suffix="% of Basic + DA" min={0} max={20} step={1} />
              <p className="text-xs text-charcoal/50 -mt-3">
                Deductible up to {NPS_EMPLOYER_LIMIT_PCT[inputs.regime]}% under the {inputs.regime} regime.
              </p>
              <NumberInput
                label="Your own NPS contribution"
                value={inputs.npsVoluntaryMonthly}
                onChange={set("npsVoluntaryMonthly")}
                suffix="₹ / month"
                step={500}
                hint="Up to ₹50,000 a year is deductible under 80CCD(1B), old regime only."
              />
              <NumberInput label="Current NPS balance" value={inputs.existingNpsBalance} onChange={set("existingNpsBalance")} suffix="₹" step={10000} />
              <SliderField label="Lump sum you'll take at 60" value={inputs.npsLumpSumPct} onChange={set("npsLumpSumPct")} suffix="% of corpus" min={0} max={80} step={5} />
              <p className="text-xs text-charcoal/50 -mt-3">Up to 80% for a corpus above ₹12 lakh. Only 60% is tax-free today.</p>
            </InputGroup>
          )}

          {detailed && (
            <InputGroup title="Leave and tax">
              <NumberInput label="Earned leave balance at retirement" value={inputs.leaveDaysAtRetirement} onChange={set("leaveDaysAtRetirement")} suffix="days" step={5} />
              <Segmented
                label="Tax regime"
                value={inputs.regime}
                onChange={set("regime")}
                options={[
                  { value: "new", label: "New regime" },
                  { value: "old", label: "Old regime" },
                ]}
              />
            </InputGroup>
          )}

          <details className="card-flat px-5 py-4">
            <summary className="cursor-pointer font-display text-lg text-ink">Assumptions</summary>
            <div className="mt-5 space-y-5">
              <NumberInput label="Yearly salary hike" value={inputs.salaryHikePct} onChange={set("salaryHikePct")} max={25} step={0.5} suffix="%" />
              <NumberInput
                label="EPF interest rate"
                value={inputs.epfRatePct}
                onChange={set("epfRatePct")}
                max={12}
                step={0.05}
                suffix="%"
                hint="Default 8.25%, the rate for FY 2025-26."
              />
              <NumberInput label="NPS return" value={inputs.npsReturnPct} onChange={set("npsReturnPct")} max={15} step={0.5} suffix="%" />
              <NumberInput label="Annuity rate" value={inputs.annuityRatePct} onChange={set("annuityRatePct")} max={10} step={0.25} suffix="%" />
              <NumberInput label="Inflation" value={inputs.inflationPct} onChange={set("inflationPct")} max={12} step={0.5} suffix="%" />
              <NumberInput label="Return on savings after retirement" value={inputs.postRetReturnPct} onChange={set("postRetReturnPct")} max={12} step={0.5} suffix="%" />
              <NumberInput label="Plan up to age" value={inputs.lifeExpectancy} onChange={set("lifeExpectancy")} min={60} max={100} suffix="years" />
            </div>
          </details>
        </div>

        {/* ------------------------------------------------- RESULT CARD */}
        <div className="lg:sticky lg:top-6 self-start">
          <div className="card px-6 py-5">
            <div className="flex flex-wrap gap-4 mb-4 print:hidden">
              <Segmented
                label="Show amounts"
                value={postTax ? "post" : "pre"}
                onChange={(v) => setPostTax(v === "post")}
                options={[
                  { value: "pre", label: "Before tax" },
                  { value: "post", label: "After tax" },
                ]}
              />
              <Segmented
                label="Value in"
                value={todaysValue ? "today" : "future"}
                onChange={(v) => setTodaysValue(v === "today")}
                options={[
                  { value: "future", label: "Future ₹" },
                  { value: "today", label: "Today's ₹" },
                ]}
              />
            </div>

            <div className="hero-box mb-5">
              <p className="text-xs uppercase tracking-widest text-charcoal/50 font-medium mb-1">
                At retirement, {meta.retirementDate}
              </p>
              <p className="font-display text-3xl text-ink">{rupeesShort(fv(lump))}</p>
              <p className="text-sm text-charcoal/70">lump sum, plus</p>
              <p className="font-display text-2xl text-ink mt-2">{formatINR(fv(monthly))}/month</p>
              <p className="text-sm text-charcoal/70">
                pension and annuity, {postTax ? "after tax" : "before tax"}
                {todaysValue ? ", in today's rupees" : ""}
              </p>
            </div>

            <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">What comes back to you</p>
            <ResultLine
              label="EPF lump sum"
              tone="gain"
              value={formatINR(fv(result.epf.corpus))}
              sub={result.epf.taxFree ? "Tax-free (5+ years of service)" : "Taxable: service under 5 years"}
              how={
                <>
                  <p>
                    Your contributions {formatINR(result.epf.employeeShare)} + employer EPF share{" "}
                    {formatINR(result.epf.employerShare)} + interest {formatINR(result.epf.interest)}, plus your current balance.
                    Interest accrues monthly and is credited every March, as EPFO does it.
                  </p>
                  {result.epf.interestTaxPaidDuringWork > 0 && (
                    <p>
                      You&apos;ll also pay about {formatINR(result.epf.interestTaxPaidDuringWork)} in tax along the way on interest
                      earned by contributions above ₹2.5 lakh a year.
                    </p>
                  )}
                </>
              }
            />
            {result.eps.kind === "pension" && (
              <ResultLine
                label={`EPS pension from ${result.eps.startAge}`}
                tone="gain"
                value={`${formatINR(fv(postTax ? result.eps.postTaxMonthly : result.eps.monthlyPension))}/mo`}
                sub="For life. Taxable as income. Doesn't rise with inflation."
                how={
                  <>
                    <p>
                      Pensionable salary {formatINR(result.eps.pensionableSalary)} (average of the last 60 months, capped at the
                      ceiling) × {result.eps.serviceYears} years ÷ 70.
                    </p>
                    <p>
                      20+ years of service adds a 2-year bonus; service counts up to 35 years. Starting before 58 cuts the pension
                      4% a year; deferring to 59 or 60 adds 4% a year. Minimum ₹1,000.
                    </p>
                  </>
                }
              />
            )}
            {result.eps.kind === "withdrawal" && (
              <ResultLine
                label="EPS withdrawal benefit"
                tone="gain"
                value={formatINR(fv(result.eps.withdrawalAmount))}
                sub="One-time, because EPS service is under 10 years"
                how={
                  <p>
                    Table D factor for {result.eps.serviceYears} years × your last EPS wage. EPFO applies Table D month by month,
                    so the actual figure can differ slightly.
                  </p>
                }
              />
            )}
            {result.nps.corpus > 0 && (
              <>
                <ResultLine
                  label="NPS lump sum"
                  tone="gain"
                  value={formatINR(fv(result.nps.lumpSum))}
                  sub={result.nps.lumpSumTaxable > 0 ? `${formatINR(fv(result.nps.lumpSumTaxable))} of this is taxable` : "Tax-free"}
                  how={
                    <p>
                      Corpus {formatINR(fv(result.nps.corpus))} at {inputs.npsReturnPct}% a year.{" "}
                      {result.nps.exit === "normal"
                        ? "Normal exit at 60: full lump sum up to ₹8 lakh, ₹6 lakh for ₹8–12 lakh, up to 80% above ₹12 lakh."
                        : "Premature exit before 60: 20% lump sum, 80% annuity (full lump sum up to ₹5 lakh)."}{" "}
                      Only 60% of the corpus is tax-exempt.
                    </p>
                  }
                />
                <ResultLine
                  label="NPS annuity"
                  tone="gain"
                  value={`${formatINR(fv(postTax ? result.nps.postTaxMonthly : result.nps.monthlyAnnuity))}/mo`}
                  sub="For life. Taxable as income."
                  how={
                    <p>
                      {formatINR(fv(result.nps.annuityCorpus))} buys an annuity at {inputs.annuityRatePct}% a year. Real rates
                      depend on the plan and insurer.
                    </p>
                  }
                />
              </>
            )}
            <ResultLine
              label="Gratuity"
              tone={result.gratuity.amount > 0 ? "gain" : "neutral"}
              value={formatINR(fv(result.gratuity.amount))}
              sub={
                result.gratuity.amount > 0
                  ? result.gratuity.taxable > 0
                    ? `${formatINR(fv(result.gratuity.taxable))} above the ₹20 lakh exemption is taxable`
                    : "Tax-free up to ₹20 lakh"
                  : "Not eligible with this employer"
              }
              how={
                <p>
                  15/26 × wage base {formatINR(fv(result.gratuity.lastWage))} × {result.gratuity.years} years, the same formula as
                  our{" "}
                  <Link href="/tools/gratuity-calculator" className="text-accent hover:underline">
                    Gratuity Calculator
                  </Link>
                  . Six months or more counts as a full year.
                </p>
              }
            />
            {result.leave.amount > 0 && (
              <ResultLine
                label="Leave encashment"
                tone="gain"
                value={formatINR(fv(result.leave.amount))}
                sub={result.leave.taxable > 0 ? `${formatINR(fv(result.leave.taxable))} is taxable` : "Tax-free"}
                how={
                  <p>
                    {result.leave.days} days × (last Basic + DA ÷ 30). Exempt up to the least of ₹25 lakh, 10 months&apos; salary
                    and 30 days per year of service.
                  </p>
                }
              />
            )}
            {postTax && result.totals.taxOnLumpSums > 0 && (
              <ResultLine
                label="Tax on lump sums"
                tone="loss"
                value={`-${formatINR(fv(result.totals.taxOnLumpSums))}`}
                how={<p>Taxable parts are added to your final year&apos;s salary under the {inputs.regime} regime, at today&apos;s slabs.</p>}
              />
            )}

            <div className="flex flex-wrap gap-2 mt-5 print:hidden">
              <button type="button" onClick={handleShare} className={btnCls}>
                {shareState === "copied" ? "Link copied" : shareState === "failed" ? "Copy failed" : "Copy share link"}
              </button>
              <button type="button" onClick={() => window.print()} className={btnCls}>
                Download PDF summary
              </button>
              <button type="button" onClick={() => setScenarioA(result)} className={btnCls}>
                {scenarioA ? "Replace Scenario A" : "Save as Scenario A"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="callout-warn mb-8 max-w-3xl">
          <p className="font-medium mb-1">Things to watch</p>
          <ul className="list-disc pl-5 space-y-1">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {vpfInsight && (
        <div className="mb-10 max-w-3xl print:hidden">
          <InsightBanner
            message={`Adding 2% more Voluntary PF would grow your EPF corpus by ${formatINR(fv(vpfInsight))} by retirement`}
            linkLabel="Add 2% VPF"
            onLinkClick={() => setInputs((p) => ({ ...p, mode: "detailed", vpfPct: p.vpfPct + 2 }))}
          />
        </div>
      )}

      <div className="space-y-8 mb-20">
        <Panel title="What you put in each month">
          <div className="card-flat overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-paperDark text-left text-charcoal/60">
                <tr>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Paid by</th>
                  <th className="px-4 py-2 text-right font-medium">This month</th>
                  <th className="px-4 py-2 text-right font-medium">Till retirement</th>
                  <th className="px-4 py-2 font-medium">Comes back?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributionRows.map((r) => (
                  <tr key={`${r.item}-${r.paidBy}`}>
                    <td className="px-4 py-2 text-ink">{r.item}</td>
                    <td className="px-4 py-2 text-charcoal/70">{r.paidBy}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{formatINR(r.month)}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{rupeesShort(r.total)}</td>
                    <td className="px-4 py-2 text-charcoal/70">{r.back}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-charcoal/50">
            &quot;Till retirement&quot; adds up contributions as your salary grows {inputs.salaryHikePct}% a year, before interest.
          </p>
        </Panel>

        <Panel title="What you don't get back">
          <p className="text-sm text-charcoal/70">
            These deductions don&apos;t build savings. ESI and LWF buy you cover and benefits you can claim; Professional Tax is a
            state tax.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card-flat px-5 py-4 space-y-4">
              <h3 className="text-lg">ESI</h3>
              <Segmented
                label="Wage tested for coverage"
                value={inputs.esiWageBasis}
                onChange={set("esiWageBasis")}
                options={[
                  { value: "code", label: "Labour Code" },
                  { value: "gross", label: "Gross" },
                ]}
              />
              <Toggle label="I'm a person with disability" checked={inputs.isPwd} onChange={set("isPwd")} />
              <div>
                <ResultLine label="Wage tested" value={formatINR(result.esi.wageNow)} sub={`Ceiling ${formatINR(result.esi.ceiling)}`} />
                {result.esi.coveredNow ? (
                  <>
                    <ResultLine label={`You pay (${ESI_EMPLOYEE_RATE * 100}%)`} tone="loss" value={`${formatINR(now.esiEmployee)}/mo`} />
                    <ResultLine label={`Employer (${ESI_EMPLOYER_RATE * 100}%)`} value={`${formatINR(now.esiEmployer)}/mo`} />
                    <p className="text-xs text-charcoal/50 mt-1">
                      {result.esi.exitAge
                        ? `At your salary growth you cross the ceiling around age ${result.esi.exitAge}.`
                        : "You stay under the ceiling until retirement."}
                    </p>
                  </>
                ) : (
                  <Badge>Not covered</Badge>
                )}
              </div>
              <Link href="/tools/esi-calculator" className="text-sm text-accent hover:underline block">
                What ESI covers
              </Link>
            </div>

            <div className="card-flat px-5 py-4 space-y-4">
              <h3 className="text-lg">LWF in {regionName}</h3>
              {lwfRule && inputs.lwfSource === "verified" && (
                <>
                  <VerifiedBadge lastVerified={lwfRule.lastVerified} />
                  {result.lwf.covered ? (
                    <div>
                      <ResultLine label="You pay a year" tone="loss" value={formatINR(result.lwf.employeeAnnual)} />
                      <ResultLine label="Employer a year" value={formatINR(result.lwf.employerAnnual)} />
                      {lwfRule.frequency && (
                        <p className="text-xs text-charcoal/50 mt-1">Deducted {FREQUENCY_LABEL[lwfRule.frequency].toLowerCase()}.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-charcoal/70">{result.lwf.reason ?? "No LWF applies."}</p>
                  )}
                  <Link href={`/lwf-rates/${inputs.stateSlug}`} className="text-sm text-accent hover:underline block">
                    {regionName} LWF rules
                  </Link>
                </>
              )}
              {!lwfRule && (
                <p className="text-xs text-charcoal/60">
                  We haven&apos;t verified {regionName}&apos;s LWF rates yet. Enter the amounts from your payslip, or leave them at 0.
                </p>
              )}
              {showManualLwf && (
                <>
                  <NumberInput label="You pay per deduction" value={inputs.lwfEmployee} onChange={set("lwfEmployee")} suffix="₹" />
                  <NumberInput label="Employer per deduction" value={inputs.lwfEmployer} onChange={set("lwfEmployer")} suffix="₹" />
                  <Segmented
                    label="Deducted"
                    value={inputs.lwfFrequency}
                    onChange={set("lwfFrequency")}
                    options={[
                      { value: "monthly", label: "Monthly" },
                      { value: "half-yearly", label: "Half-yearly" },
                      { value: "yearly", label: "Yearly" },
                    ]}
                  />
                  <ResultLine label="You pay a year" tone="loss" value={formatINR(result.lwf.employeeAnnual)} />
                </>
              )}
              {lwfRule && (
                <Toggle
                  label="Use my payslip amounts instead"
                  checked={inputs.lwfSource === "manual"}
                  onChange={(v) => set("lwfSource")(v ? "manual" : "verified")}
                />
              )}
              <Link href="/tools/lwf-benefits" className="text-sm text-accent hover:underline block">
                What LWF funds
              </Link>
            </div>

            <div className="card-flat px-5 py-4 space-y-4">
              <h3 className="text-lg">Professional Tax</h3>
              <NumberInput
                label="PT per month"
                value={inputs.ptMonthly}
                onChange={set("ptMonthly")}
                suffix="₹"
                max={2500}
                hint="From your payslip. Some states don't levy it; some charge more in one month."
              />
              <ResultLine label="Till retirement" tone="loss" value={rupeesShort(career.pt)} />
            </div>
          </div>
        </Panel>

        <Panel title="Try a what-if">
          <div className="grid gap-6 sm:grid-cols-2 print:hidden">
            <SliderField label="Voluntary PF" value={inputs.vpfPct} onChange={set("vpfPct")} suffix="% of PF wage" min={0} max={88} step={1} />
            <SliderField
              label="Retire at"
              value={inputs.retirementAge}
              onChange={(v) => setInputs((p) => ({ ...p, retirementAge: v, retirementDateOverride: "" }))}
              suffix="years"
              min={45}
              max={70}
              step={1}
            />
            {result.eps.kind === "pension" && (
              <SliderField
                label="Start EPS pension at"
                value={result.eps.startAge}
                onChange={set("epsStartAge")}
                suffix="years"
                min={minEpsStart}
                max={60}
                step={1}
              />
            )}
          </div>
          <TimelineChart data={result.timeline} deflator={meta.deflator} todaysValue={todaysValue} yearsToRetirement={meta.yearsToRetirement} />
          <p className="text-xs text-charcoal/50">Gratuity appears once you&apos;d qualify, and is hidden in job-switch mode.</p>
        </Panel>

        <div className="grid gap-8 md:grid-cols-2">
          <Panel title="Will it be enough?">
            <SliderField
              label="Your monthly expenses today"
              value={inputs.monthlyExpensesToday}
              onChange={set("monthlyExpensesToday")}
              suffix="₹ / month"
              min={10000}
              max={500000}
              step={1000}
            />
            <div>
              <ResultLine
                label="You'll need"
                value={rupeesShort(fv(result.gap.requiredCorpus))}
                how={
                  <p>
                    Expenses grow {inputs.inflationPct}% a year to {formatINR(result.gap.annualExpenseAtRetirement)} a year at
                    retirement, then keep rising for {years(result.gap.yearsInRetirement)} while savings earn{" "}
                    {inputs.postRetReturnPct}%.
                  </p>
                }
              />
              <ResultLine
                label="These benefits give"
                value={rupeesShort(fv(result.gap.availableCorpus))}
                how={<p>After-tax lump sums plus the value of after-tax EPS pension and NPS annuity.</p>}
              />
              <ResultLine
                label={result.gap.shortfall > 0 ? "Shortfall" : "Surplus"}
                tone={result.gap.shortfall > 0 ? "loss" : "gain"}
                value={rupeesShort(fv(Math.abs(result.gap.shortfall)))}
              />
            </div>
          </Panel>

          <Panel title="If you switch jobs">
            <SliderField
              label="Switch jobs every"
              value={inputs.jobSwitchEveryYears}
              onChange={set("jobSwitchEveryYears")}
              suffix="years (0 = stay)"
              min={0}
              max={15}
              step={1}
            />
            <p className="text-xs text-charcoal/50 -mt-2">
              Assumes you transfer PF each time, so EPF and EPS continue. Gratuity restarts at every employer.
            </p>
            {result.jobSwitch.enabled && (
              <div>
                <ResultLine
                  label="Gratuity across jobs"
                  value={formatINR(fv(result.jobSwitch.total))}
                  sub={`${result.jobSwitch.stints.filter((s) => s.amount > 0).length} of ${result.jobSwitch.stints.length} jobs pay gratuity`}
                />
                <ResultLine
                  label="Compared with staying"
                  tone={result.jobSwitch.differenceVsStaying >= 0 ? "gain" : "loss"}
                  value={formatINR(fv(result.jobSwitch.differenceVsStaying))}
                  how={<p>Gratuity from earlier jobs is paid when you leave them, not at retirement.</p>}
                />
              </div>
            )}
          </Panel>
        </div>

        {scenarioA && (
          <Panel title="Compare scenarios">
            <div className="card-flat overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-paperDark text-left text-charcoal/60">
                  <tr>
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 text-right font-medium">Scenario A</th>
                    <th className="px-4 py-2 text-right font-medium">Current</th>
                    <th className="px-4 py-2 text-right font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compareRows(result).map((row, i) => {
                    const a = compareRows(scenarioA)[i].value;
                    const diff = row.value - a;
                    const better = row.label === "Retirement shortfall" ? diff < 0 : diff > 0;
                    return (
                      <tr key={row.label}>
                        <td className="px-4 py-2 text-ink">{row.label}</td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">{rupeesShort(fv(a))}</td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">{rupeesShort(fv(row.value))}</td>
                        <td className={`px-4 py-2 text-right font-mono tabular-nums ${diff === 0 ? "" : better ? "text-ledger" : "text-rust"}`}>
                          {rupeesShort(fv(diff))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => setScenarioA(null)} className="text-sm text-accent hover:underline print:hidden">
              Clear comparison
            </button>
          </Panel>
        )}

        <p className="text-xs text-charcoal/50 max-w-3xl">
          Estimates only, based on current rules and the assumptions you set. Not financial, tax or legal advice. Check your EPFO
          passbook, NPS statement and payslip, and speak to a qualified advisor before making decisions.
        </p>
      </div>
    </>
  );
}
