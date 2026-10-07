"use client";

// Retirement & Statutory Deductions Calculator — interactive UI.
// All maths lives in lib/calculators/retirementBenefits.ts; this file
// only collects inputs, calls the engine and lays out the results.

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
import {
  ESI_EMPLOYEE_RATE,
  ESI_EMPLOYER_RATE,
} from "@/lib/calculators/esi";
import { buildShareUrl, readInputsFromUrl } from "@/lib/calculators/retirementShare";
import { STATES, stateName } from "@/lib/data/stateDeductions";
import {
  DateField,
  NumberField,
  Segmented,
  SelectField,
  Toggle,
  YearsMonthsField,
} from "./fields";
import { ResultLine } from "./ResultLine";
import { TimelineChart } from "./TimelineChart";
import { rupees, rupeesShort, years } from "./format";

interface Scenario {
  label: string;
  result: RetirementResult;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default function RetirementCalculator() {
  const [inputs, setInputs] = useState<RetirementInputs>(DEFAULT_INPUTS);
  const [todaysValue, setTodaysValue] = useState(false);
  const [postTax, setPostTax] = useState(false);
  const [scenarioA, setScenarioA] = useState<Scenario | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  // Load inputs from a shared link once, on the client.
  useEffect(() => {
    const fromUrl = readInputsFromUrl();
    if (fromUrl) setInputs(fromUrl);
  }, []);

  const result = useMemo(() => calculateRetirement(inputs), [inputs]);

  const set =
    <K extends keyof RetirementInputs>(key: K) =>
    (value: RetirementInputs[K]) =>
      setInputs((prev) => ({ ...prev, [key]: value }));

  const detailed = inputs.mode === "detailed";
  const { meta } = result;

  // Future amounts shown in today's rupees when the toggle is on.
  const fv = (amount: number) => (todaysValue ? amount / meta.deflator : amount);
  const lump = postTax ? result.totals.lumpSumPostTax : result.totals.lumpSumPreTax;
  const monthly = postTax ? result.totals.monthlyIncomePostTax : result.totals.monthlyIncomePreTax;

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

  const now = result.monthlyNow;
  const career = result.careerTotals;

  const contributionRows: {
    item: string;
    paidBy: string;
    month: number;
    total: number;
    back: string;
  }[] = [
    { item: "PF (12% of PF wage)", paidBy: "You", month: now.employeePF, total: career.employeePF, back: "Yes, EPF lump sum" },
    { item: "Voluntary PF (VPF)", paidBy: "You", month: now.vpf, total: career.vpf, back: "Yes, EPF lump sum" },
    { item: "Employer PF to EPF", paidBy: "Employer", month: now.employerEPF, total: career.employerEPF, back: "Yes, EPF lump sum" },
    { item: "Employer PF to EPS", paidBy: "Employer", month: now.employerEPS, total: career.employerEPS, back: "As monthly pension" },
    { item: "Employer NPS", paidBy: "Employer", month: now.npsEmployer, total: career.npsEmployer, back: "Yes, lump sum + annuity" },
    { item: "Your NPS", paidBy: "You", month: now.npsEmployee, total: career.npsEmployee, back: "Yes, lump sum + annuity" },
    { item: "ESI", paidBy: "You", month: now.esiEmployee, total: career.esiEmployee, back: "No, buys insurance cover" },
    { item: "ESI", paidBy: "Employer", month: now.esiEmployer, total: career.esiEmployer, back: "No, buys insurance cover" },
    { item: "Professional Tax", paidBy: "You", month: now.pt, total: career.pt, back: "No, state tax" },
    { item: "LWF", paidBy: "You", month: now.lwfEmployee, total: career.lwfEmployee, back: "No, funds welfare schemes" },
    { item: "LWF", paidBy: "Employer", month: now.lwfEmployer, total: career.lwfEmployer, back: "No, funds welfare schemes" },
  ].filter((r) => r.month > 0 || r.total > 0);

  const compareRows = (r: RetirementResult) => [
    { label: "Lump sum at retirement", value: postTax ? r.totals.lumpSumPostTax : r.totals.lumpSumPreTax },
    { label: "Monthly pension + annuity", value: postTax ? r.totals.monthlyIncomePostTax : r.totals.monthlyIncomePreTax },
    { label: "EPF corpus", value: r.epf.corpus },
    { label: "NPS corpus", value: r.nps.corpus },
    { label: "Gratuity", value: r.gratuity.amount },
    { label: "Retirement shortfall", value: r.gap.shortfall },
  ];

  const minEpsStart = Math.min(58, Math.max(50, Math.ceil(Math.min(meta.retirementAge, 58))));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* ------------------------------------------------------ INPUTS */}
      <div className="space-y-6 print:hidden">
        <Section title="Your details">
          <Segmented
            label="How much detail do you want to give?"
            value={inputs.mode}
            options={[
              { value: "simple", label: "Simple" },
              { value: "detailed", label: "Detailed" },
            ]}
            onChange={set("mode")}
            hint={
              detailed
                ? "Detailed mode uses your exact salary breakup and unlocks PF, NPS and tax options."
                : "Simple mode assumes Basic + DA is 50% of CTC and that employer PF is part of CTC."
            }
          />
          <DateField label="Date of birth" value={inputs.dob} onChange={set("dob")} />
          <NumberField
            label="Retirement age"
            value={inputs.retirementAge}
            onChange={set("retirementAge")}
            min={45}
            max={70}
            slider
            suffix="years"
            hint={`You retire on ${meta.retirementDate}, in ${years(meta.yearsToRetirement)}.`}
          />
          <DateField
            label="Exact retirement date (optional)"
            value={inputs.retirementDateOverride}
            onChange={set("retirementDateOverride")}
            hint="Leave blank to retire on your birthday at the age above."
          />
          <SelectField
            label="State you work in"
            value={inputs.stateCode}
            onChange={set("stateCode")}
            options={STATES.map((s) => ({ value: s.code, label: s.name }))}
          />
        </Section>

        <Section title="Salary">
          {detailed ? (
            <>
              <NumberField label="Basic (monthly)" value={inputs.basic} onChange={set("basic")} prefix="₹" step={500} />
              <NumberField label="Dearness Allowance (monthly)" value={inputs.da} onChange={set("da")} prefix="₹" step={500} />
              <NumberField label="HRA (monthly)" value={inputs.hra} onChange={set("hra")} prefix="₹" step={500} />
              <NumberField label="Special allowance (monthly)" value={inputs.special} onChange={set("special")} prefix="₹" step={500} />
              <NumberField label="Other allowances (monthly)" value={inputs.otherAllowances} onChange={set("otherAllowances")} prefix="₹" step={500} />
              <Toggle
                label="Employer PF is included in my CTC"
                checked={inputs.employerPfInCtc}
                onChange={set("employerPfInCtc")}
              />
            </>
          ) : (
            <NumberField
              label="Monthly CTC"
              value={inputs.monthlyCtc}
              onChange={set("monthlyCtc")}
              prefix="₹"
              step={1000}
              max={2000000}
              slider
            />
          )}
          <p className="text-xs text-slate-500">
            Monthly gross {rupees(result.salaryNow.gross)}, Basic + DA {rupees(result.salaryNow.basicDA)}, wage used for PF and
            gratuity {rupees(result.salaryNow.statutoryWage)}.
          </p>
        </Section>

        <Section title="Service">
          <YearsMonthsField
            label="Time with your current employer"
            value={inputs.yearsAtEmployer}
            onChange={set("yearsAtEmployer")}
            hint="Gratuity depends on this. It resets when you change jobs."
          />
          {detailed && (
            <YearsMonthsField
              label="Total PF service across all jobs"
              value={inputs.totalCareerYears}
              onChange={set("totalCareerYears")}
              hint="EPS pension and PF tax-free status depend on total service if you transferred PF between jobs."
            />
          )}
          <Toggle
            label="I'm a fixed-term employee"
            checked={inputs.isFixedTerm}
            onChange={set("isFixedTerm")}
            hint="Fixed-term employees qualify for gratuity after 1 year under the Labour Codes."
          />
        </Section>

        {detailed && (
          <Section title="Provident Fund and pension">
            <Segmented
              label="PF wage basis"
              value={inputs.pfWageOption}
              onChange={set("pfWageOption")}
              options={[
                { value: "new-ceiling", label: "₹25,000 ceiling" },
                { value: "old-ceiling", label: "₹15,000 ceiling" },
                { value: "actual", label: "Actual wage" },
              ]}
              hint="The ceiling rose from ₹15,000 to ₹25,000 on 17 Sept 2026 (S.O. 5109(E)). Use ₹15,000 only to compare."
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
            <NumberField
              label="Voluntary PF (VPF)"
              value={inputs.vpfPct}
              onChange={set("vpfPct")}
              min={0}
              max={88}
              step={1}
              suffix="% of PF wage"
              slider
            />
            <NumberField
              label="Current EPF balance"
              value={inputs.existingEpfBalance}
              onChange={set("existingEpfBalance")}
              prefix="₹"
              step={10000}
              hint="From your EPFO passbook. Leave 0 if you don't know."
            />
            <Toggle
              label="My employer runs its own (exempted) PF trust"
              checked={inputs.exemptTrust}
              onChange={set("exemptTrust")}
            />
            {inputs.exemptTrust && (
              <NumberField
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
          </Section>
        )}

        {detailed && (
          <Section title="NPS">
            <NumberField
              label="Employer NPS contribution"
              value={inputs.npsEmployerPct}
              onChange={set("npsEmployerPct")}
              min={0}
              max={20}
              step={1}
              suffix="% of Basic + DA"
              slider
              hint={`Deductible up to ${NPS_EMPLOYER_LIMIT_PCT[inputs.regime]}% under the ${inputs.regime} regime.`}
            />
            <NumberField
              label="Your own NPS contribution"
              value={inputs.npsVoluntaryMonthly}
              onChange={set("npsVoluntaryMonthly")}
              prefix="₹"
              step={500}
              suffix="per month"
              hint="Up to ₹50,000 a year is deductible under 80CCD(1B), old regime only."
            />
            <NumberField
              label="Current NPS balance"
              value={inputs.existingNpsBalance}
              onChange={set("existingNpsBalance")}
              prefix="₹"
              step={10000}
            />
            <NumberField
              label="Lump sum you'll take at 60"
              value={inputs.npsLumpSumPct}
              onChange={set("npsLumpSumPct")}
              min={0}
              max={80}
              step={5}
              suffix="% of corpus"
              slider
              hint="Up to 80% for corpus above ₹12 lakh. Only 60% is tax-free today."
            />
          </Section>
        )}

        {detailed && (
          <Section title="Leave and tax">
            <NumberField
              label="Earned leave balance at retirement"
              value={inputs.leaveDaysAtRetirement}
              onChange={set("leaveDaysAtRetirement")}
              step={5}
              suffix="days"
            />
            <Segmented
              label="Tax regime"
              value={inputs.regime}
              onChange={set("regime")}
              options={[
                { value: "new", label: "New regime" },
                { value: "old", label: "Old regime" },
              ]}
            />
          </Section>
        )}

        <details className="rounded-lg border border-slate-200 bg-white p-5">
          <summary className="cursor-pointer text-lg font-semibold text-slate-900">Assumptions</summary>
          <div className="mt-4 space-y-4">
            <NumberField label="Yearly salary hike" value={inputs.salaryHikePct} onChange={set("salaryHikePct")} max={25} step={0.5} suffix="%" />
            <NumberField
              label="EPF interest rate"
              value={inputs.epfRatePct}
              onChange={set("epfRatePct")}
              max={12}
              step={0.05}
              suffix="%"
              hint="Default is 8.25%, the rate for FY 2025-26."
            />
            <NumberField label="NPS return" value={inputs.npsReturnPct} onChange={set("npsReturnPct")} max={15} step={0.5} suffix="%" />
            <NumberField label="Annuity rate" value={inputs.annuityRatePct} onChange={set("annuityRatePct")} max={10} step={0.25} suffix="%" />
            <NumberField label="Inflation" value={inputs.inflationPct} onChange={set("inflationPct")} max={12} step={0.5} suffix="%" />
            <NumberField
              label="Return on savings after retirement"
              value={inputs.postRetReturnPct}
              onChange={set("postRetReturnPct")}
              max={12}
              step={0.5}
              suffix="%"
            />
            <NumberField label="Plan up to age" value={inputs.lifeExpectancy} onChange={set("lifeExpectancy")} min={60} max={100} suffix="years" />
          </div>
        </details>
      </div>

      {/* ----------------------------------------------------- RESULTS */}
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-300 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
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
              label="In"
              value={todaysValue ? "today" : "future"}
              onChange={(v) => setTodaysValue(v === "today")}
              options={[
                { value: "future", label: "Future rupees" },
                { value: "today", label: "Today's rupees" },
              ]}
            />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            When you retire on {meta.retirementDate} at {meta.retirementAge}, you can expect
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-ledger">{rupeesShort(fv(lump))}</p>
          <p className="text-sm text-slate-600">as a lump sum, plus</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ledger">{rupees(fv(monthly))} a month</p>
          <p className="text-sm text-slate-600">
            from EPS pension and NPS annuity{postTax ? ", after tax" : ", before tax"}
            {todaysValue ? ", in today's rupees." : "."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-md border border-slate-400 px-3 py-1.5 text-sm text-slate-800 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              {shareState === "copied" ? "Link copied" : shareState === "failed" ? "Copy failed" : "Copy share link"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md border border-slate-400 px-3 py-1.5 text-sm text-slate-800 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Download PDF summary
            </button>
            <button
              type="button"
              onClick={() => setScenarioA({ label: "Scenario A", result })}
              className="rounded-md border border-slate-400 px-3 py-1.5 text-sm text-slate-800 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              {scenarioA ? "Replace Scenario A" : "Save as Scenario A to compare"}
            </button>
          </div>
        </section>

        {result.warnings.length > 0 && (
          <section className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <h2 className="text-sm font-semibold text-amber-900">Things to watch</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>
        )}

        <Section title="What comes back to you">
          <ResultLine
            label="EPF lump sum"
            tone="gain"
            value={rupees(fv(result.epf.corpus))}
            sub={result.epf.taxFree ? "Tax-free (5+ years of service)" : "Taxable: service under 5 years"}
            how={
              <>
                <p>
                  Your contributions {rupees(result.epf.employeeShare)} + employer's EPF share{" "}
                  {rupees(result.epf.employerShare)} + interest {rupees(result.epf.interest)} at{" "}
                  {inputs.exemptTrust ? Math.max(inputs.trustRatePct, inputs.epfRatePct) : inputs.epfRatePct}% a year, plus your
                  current balance.
                </p>
                <p>Interest accrues monthly and is credited every March, the way EPFO does it.</p>
                {result.epf.interestTaxPaidDuringWork > 0 && (
                  <p>
                    You'll pay about {rupees(result.epf.interestTaxPaidDuringWork)} in tax along the way on interest earned by
                    contributions above ₹2.5 lakh a year.
                  </p>
                )}
              </>
            }
          />

          {result.eps.kind === "pension" && (
            <ResultLine
              label={`EPS pension from age ${result.eps.startAge}`}
              tone="gain"
              value={`${rupees(fv(postTax ? result.eps.postTaxMonthly : result.eps.monthlyPension))}/month`}
              sub="For life. Taxable as income."
              how={
                <>
                  <p>
                    Pensionable salary {rupees(result.eps.pensionableSalary)} (average of the last 60 months, capped at the
                    ceiling) × {result.eps.serviceYears} years of service ÷ 70.
                  </p>
                  <p>
                    Service of 20+ years gets a 2-year bonus; service counts up to 35 years. Pension starting before 58 is cut
                    4% per year early; deferring to 59 or 60 adds 4% per year. Minimum pension is ₹1,000.
                  </p>
                  <p>EPS pension stays flat for life; it doesn't rise with inflation.</p>
                </>
              }
            />
          )}
          {result.eps.kind === "withdrawal" && (
            <ResultLine
              label="EPS withdrawal benefit"
              tone="gain"
              value={rupees(fv(result.eps.withdrawalAmount))}
              sub="One-time, because EPS service is under 10 years"
              how={
                <p>
                  Table D factor for {result.eps.serviceYears} years × your last EPS wage. EPFO now applies Table D month by
                  month, so the actual figure can differ slightly.
                </p>
              }
            />
          )}

          {result.nps.corpus > 0 && (
            <>
              <ResultLine
                label="NPS lump sum"
                tone="gain"
                value={rupees(fv(result.nps.lumpSum))}
                sub={
                  result.nps.lumpSumTaxable > 0
                    ? `${rupees(fv(result.nps.lumpSumTaxable))} of this is taxable`
                    : "Tax-free"
                }
                how={
                  <>
                    <p>
                      NPS corpus at retirement {rupees(fv(result.nps.corpus))} at {inputs.npsReturnPct}% a year.{" "}
                      {result.nps.exit === "normal"
                        ? "Normal exit at 60: full lump sum up to ₹8 lakh corpus, ₹6 lakh for ₹8–12 lakh, and up to 80% above ₹12 lakh."
                        : "Premature exit before 60: 20% lump sum and 80% annuity (full lump sum up to ₹5 lakh)."}
                    </p>
                    <p>Only 60% of the corpus is tax-exempt today; anything above that is taxed at your slab.</p>
                  </>
                }
              />
              <ResultLine
                label="NPS annuity"
                tone="gain"
                value={`${rupees(fv(postTax ? result.nps.postTaxMonthly : result.nps.monthlyAnnuity))}/month`}
                sub="For life. Taxable as income."
                how={
                  <p>
                    {rupees(fv(result.nps.annuityCorpus))} buys an annuity at {inputs.annuityRatePct}% a year. Actual annuity
                    rates depend on the plan and insurer you choose.
                  </p>
                }
              />
            </>
          )}

          <ResultLine
            label="Gratuity"
            tone={result.gratuity.amount > 0 ? "gain" : "neutral"}
            value={rupees(fv(result.gratuity.amount))}
            sub={
              result.gratuity.amount > 0
                ? result.gratuity.taxable > 0
                  ? `${rupees(fv(result.gratuity.taxable))} above the ₹20 lakh exemption is taxable`
                  : "Tax-free up to ₹20 lakh"
                : "Not eligible with this employer"
            }
            how={
              <p>
                15/26 × last monthly wage {rupees(fv(result.gratuity.lastWage))} × {result.gratuity.years} years. A part-year above
                six months counts as a full year. Payable after 5 years of continuous service (1 year for fixed-term employees),
                capped at ₹20 lakh.
              </p>
            }
          />

          {result.leave.amount > 0 && (
            <ResultLine
              label="Leave encashment"
              tone="gain"
              value={rupees(fv(result.leave.amount))}
              sub={
                result.leave.taxable > 0
                  ? `${rupees(fv(result.leave.taxable))} is taxable`
                  : "Tax-free"
              }
              how={
                <p>
                  {result.leave.days} days × (last Basic + DA ÷ 30). Exempt up to the least of ₹25 lakh, 10 months' salary and
                  30 days per year of service with this employer.
                </p>
              }
            />
          )}

          {postTax && result.totals.taxOnLumpSums > 0 && (
            <ResultLine
              label="Estimated tax on taxable lump sums"
              tone="loss"
              value={`-${rupees(fv(result.totals.taxOnLumpSums))}`}
              how={
                <p>
                  Taxable parts are added to your final year's salary under the {inputs.regime} regime, using today's slabs.
                </p>
              }
            />
          )}
        </Section>

        <Section title="What you put in each month">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left text-slate-600">
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 pr-3 font-medium">Paid by</th>
                  <th className="py-2 pr-3 text-right font-medium">This month</th>
                  <th className="py-2 pr-3 text-right font-medium">Till retirement</th>
                  <th className="py-2 font-medium">Comes back?</th>
                </tr>
              </thead>
              <tbody>
                {contributionRows.map((r) => (
                  <tr key={`${r.item}-${r.paidBy}`} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{r.item}</td>
                    <td className="py-2 pr-3 text-slate-600">{r.paidBy}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{rupees(r.month)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{rupeesShort(r.total)}</td>
                    <td className="py-2 text-slate-600">{r.back}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            "Till retirement" adds up contributions as your salary grows {inputs.salaryHikePct}% a year, before interest.
          </p>
        </Section>

        <Section title="What you don't get back">
          <p className="text-sm text-slate-600">
            These deductions don't build savings. ESI and LWF buy you cover and benefits you can claim; Professional Tax is a
            state tax.
          </p>

          <div className="space-y-3 rounded-md border border-slate-200 p-4">
            <h3 className="font-medium text-slate-900">ESI</h3>
            <Segmented
              label="Wage used to test ESI coverage"
              value={inputs.esiWageBasis}
              onChange={set("esiWageBasis")}
              options={[
                { value: "code", label: "Labour Code wage" },
                { value: "gross", label: "Gross wage" },
              ]}
              hint="ESIC has said the Code on Social Security wage definition applies from 21 Nov 2025."
            />
            <Toggle label="I'm a person with disability" checked={inputs.isPwd} onChange={set("isPwd")} />
            <ResultLine
              label={`Wage tested against the ₹${result.esi.ceiling.toLocaleString("en-IN")} ceiling`}
              value={rupees(result.esi.wageNow)}
              sub={result.esi.coveredNow ? "You're covered by ESI" : "Above the ceiling, so ESI doesn't apply"}
            />
            {result.esi.coveredNow && (
              <>
                <ResultLine
                  label={`You pay (${ESI_EMPLOYEE_RATE * 100}%)`}
                  tone="loss"
                  value={`${rupees(now.esiEmployee)}/month`}
                  how={<p>ESIC rounds each contribution up to the next rupee.</p>}
                />
                <ResultLine
                  label={`Employer pays (${ESI_EMPLOYER_RATE * 100}%)`}
                  value={`${rupees(now.esiEmployer)}/month`}
                />
                <p className="text-xs text-slate-500">
                  {result.esi.exitAge
                    ? `With your salary growth, you'll cross the ceiling around age ${result.esi.exitAge}.`
                    : "You stay under the ceiling until retirement at this salary growth."}
                </p>
              </>
            )}
            <p className="text-sm">
              <Link href="/tools/esi-calculator" className="underline underline-offset-2">
                What ESI covers and how to claim it
              </Link>
            </p>
          </div>

          <div className="space-y-3 rounded-md border border-slate-200 p-4">
            <h3 className="font-medium text-slate-900">Labour Welfare Fund ({stateName(inputs.stateCode)})</h3>
            <p className="text-xs text-slate-500">Enter the LWF amounts from your payslip. Not every state levies LWF.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="You pay per deduction" value={inputs.lwfEmployee} onChange={set("lwfEmployee")} prefix="₹" />
              <NumberField label="Employer pays per deduction" value={inputs.lwfEmployer} onChange={set("lwfEmployer")} prefix="₹" />
            </div>
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
            <ResultLine label="You pay a year" tone="loss" value={rupees(result.lwfAnnual.employee)} />
            <ResultLine label="Employer pays a year" value={rupees(result.lwfAnnual.employer)} />
            <p className="text-sm">
              <Link href="/tools/lwf-benefits" className="underline underline-offset-2">
                What LWF funds and how to apply
              </Link>
            </p>
          </div>

          <div className="space-y-3 rounded-md border border-slate-200 p-4">
            <h3 className="font-medium text-slate-900">Professional Tax</h3>
            <NumberField
              label="Professional Tax per month"
              value={inputs.ptMonthly}
              onChange={set("ptMonthly")}
              prefix="₹"
              max={2500}
              hint="Check your payslip. Some states don't levy it; others charge more in one month of the year."
            />
            <ResultLine label="Till retirement" tone="loss" value={rupeesShort(career.pt)} />
          </div>
        </Section>

        <Section title="Try a what-if">
          <div className="grid gap-4 sm:grid-cols-2 print:hidden">
            <NumberField
              label="Add voluntary PF"
              value={inputs.vpfPct}
              onChange={set("vpfPct")}
              max={88}
              suffix="%"
              slider
            />
            <NumberField
              label="Retire at"
              value={inputs.retirementAge}
              onChange={(v) => setInputs((p) => ({ ...p, retirementAge: v, retirementDateOverride: "" }))}
              min={45}
              max={70}
              suffix="years"
              slider
            />
            {result.eps.kind === "pension" && (
              <NumberField
                label="Start EPS pension at"
                value={result.eps.startAge}
                onChange={set("epsStartAge")}
                min={minEpsStart}
                max={60}
                suffix="years"
                slider
                hint="Early pension (from 50) is cut 4% a year; deferring adds 4% a year."
              />
            )}
          </div>
          <TimelineChart
            data={result.timeline}
            deflator={meta.deflator}
            todaysValue={todaysValue}
            yearsToRetirement={meta.yearsToRetirement}
          />
          <p className="text-xs text-slate-500">
            Gratuity shows only once you'd qualify. It drops out of the chart in job-switch mode.
          </p>
        </Section>

        <Section title="Will it be enough?">
          <NumberField
            label="Your monthly expenses today"
            value={inputs.monthlyExpensesToday}
            onChange={set("monthlyExpensesToday")}
            prefix="₹"
            step={1000}
          />
          <ResultLine
            label="You'll need at retirement"
            value={rupeesShort(fv(result.gap.requiredCorpus))}
            how={
              <p>
                Your expenses grow {inputs.inflationPct}% a year to {rupees(result.gap.annualExpenseAtRetirement)} a year at
                retirement, then keep rising with inflation for {years(result.gap.yearsInRetirement)}, while savings earn{" "}
                {inputs.postRetReturnPct}%.
              </p>
            }
          />
          <ResultLine
            label="These benefits give you"
            value={rupeesShort(fv(result.gap.availableCorpus))}
            how={<p>After-tax lump sums plus today's value of after-tax EPS pension and NPS annuity.</p>}
          />
          <ResultLine
            label={result.gap.shortfall > 0 ? "Shortfall to fill from other savings" : "Surplus"}
            tone={result.gap.shortfall > 0 ? "loss" : "gain"}
            value={rupeesShort(fv(Math.abs(result.gap.shortfall)))}
          />
        </Section>

        <Section title="If you switch jobs">
          <NumberField
            label="Switch jobs every"
            value={inputs.jobSwitchEveryYears}
            onChange={set("jobSwitchEveryYears")}
            min={0}
            max={15}
            step={1}
            suffix="years (0 = stay)"
            slider
            hint="Assumes you transfer PF each time, so EPF and EPS continue. Gratuity starts over at each new employer."
          />
          {result.jobSwitch.enabled && (
            <>
              <ResultLine
                label="Total gratuity across jobs"
                value={rupees(fv(result.jobSwitch.total))}
                sub={`${result.jobSwitch.stints.filter((s) => s.amount > 0).length} of ${result.jobSwitch.stints.length} jobs pay gratuity`}
              />
              <ResultLine
                label="Compared with staying"
                tone={result.jobSwitch.differenceVsStaying >= 0 ? "gain" : "loss"}
                value={rupees(fv(result.jobSwitch.differenceVsStaying))}
                how={<p>Amounts from earlier jobs are paid when you leave them, not at retirement.</p>}
              />
            </>
          )}
        </Section>

        {scenarioA && (
          <Section title="Compare scenarios">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-slate-600">
                    <th className="py-2 pr-3 font-medium">Item</th>
                    <th className="py-2 pr-3 text-right font-medium">Scenario A</th>
                    <th className="py-2 pr-3 text-right font-medium">Current</th>
                    <th className="py-2 text-right font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows(result).map((row, i) => {
                    const a = compareRows(scenarioA.result)[i].value;
                    const diff = row.value - a;
                    const better = row.label === "Retirement shortfall" ? diff < 0 : diff > 0;
                    return (
                      <tr key={row.label} className="border-b border-slate-100">
                        <td className="py-2 pr-3">{row.label}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{rupeesShort(fv(a))}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{rupeesShort(fv(row.value))}</td>
                        <td
                          className={`py-2 text-right tabular-nums ${
                            diff === 0 ? "" : better ? "text-ledger" : "text-rust"
                          }`}
                        >
                          {rupeesShort(fv(diff))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setScenarioA(null)}
              className="text-sm text-slate-600 underline underline-offset-2 print:hidden"
            >
              Clear comparison
            </button>
          </Section>
        )}

        <p className="text-xs text-slate-500">
          Estimates only, based on current rules and the assumptions you set. Not financial, tax or legal advice. Check your
          EPFO passbook, NPS statement and payslip, and speak to a qualified advisor before making decisions.
        </p>
      </div>
    </div>
  );
}
