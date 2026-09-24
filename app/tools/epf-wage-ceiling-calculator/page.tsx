"use client";

import { useMemo, useState } from "react";
import {
  OLD_EPF_WAGE_CEILING,
  NEW_EPF_WAGE_CEILING,
  CEILING_CHANGE_EFFECTIVE_DATE,
  GAZETTE_REF,
  WageBasis,
  computeContribution,
  computeSeptemberSplit,
  checkCoverage,
  computeBulkImpact,
} from "@/lib/calculators/epfWageCeiling";
import { formatINR } from "@/lib/calculators/salary";
import Breadcrumb from "@/components/Breadcrumb";
import SliderField from "@/components/SliderField";
import Badge from "@/components/Badge";
import InsightBanner from "@/components/InsightBanner";
import Tabs from "@/components/Tabs";
import SourceDocuments from "@/components/SourceDocuments";
import ArticleWithTOC from "@/components/ArticleWithTOC";
import { FormulaBox } from "@/components/ToolArticle";
import FAQAccordion from "@/components/FAQAccordion";
import RelatedTools from "@/components/RelatedTools";

type Period = "sep2026" | "fromOct2026" | "reference";

function BasisToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: WageBasis;
  onChange: (v: WageBasis) => void;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-ink block mb-1.5">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {(["capped", "actual"] as WageBasis[]).map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`text-left px-3 py-2 rounded-md border text-xs ${
              value === v
                ? "bg-accentTint border-accent text-ink"
                : "bg-white text-charcoal/70 border-slate-300"
            }`}
          >
            {v === "capped" ? "Capped at ceiling" : "On actual wages"}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "ledger" | "rust" | "default";
}) {
  return (
    <div className="ledger-row">
      <span className="label">{label}</span>
      <span className="fill" />
      <span
        className={`value ${
          emphasis === "ledger" ? "text-ledger" : emphasis === "rust" ? "text-rust" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function EpfWageCeilingCalculatorPage() {
  // Calculator tab state
  const [actualWages, setActualWages] = useState(20000);
  const [period, setPeriod] = useState<Period>("sep2026");
  const [daysBeforeChange, setDaysBeforeChange] = useState(16);
  const [daysAfterChange, setDaysAfterChange] = useState(14);
  const [proRateMode, setProRateMode] = useState<"proRated" | "notProRated">("proRated");
  const [prePfBasis, setPrePfBasis] = useState<WageBasis>("capped");
  const [prePensionBasis, setPrePensionBasis] = useState<WageBasis>("capped");
  const [postPfBasis, setPostPfBasis] = useState<WageBasis>("capped");
  const [postPensionBasis, setPostPensionBasis] = useState<WageBasis>("capped");

  const septResult = useMemo(
    () =>
      computeSeptemberSplit({
        actualWages,
        daysBeforeChange,
        daysAfterChange,
        totalDaysInMonth: 30,
        prePfBasis,
        prePensionBasis,
        postPfBasis,
        postPensionBasis,
      }),
    [actualWages, daysBeforeChange, daysAfterChange, prePfBasis, prePensionBasis, postPfBasis, postPensionBasis]
  );

  const fromOctResult = useMemo(
    () =>
      computeContribution({
        actualWages,
        ceiling: NEW_EPF_WAGE_CEILING,
        pfBasis: postPfBasis,
        pensionBasis: postPensionBasis,
      }),
    [actualWages, postPfBasis, postPensionBasis]
  );

  const referenceResult = useMemo(
    () =>
      computeContribution({
        actualWages,
        ceiling: OLD_EPF_WAGE_CEILING,
        pfBasis: prePfBasis,
        pensionBasis: prePensionBasis,
      }),
    [actualWages, prePfBasis, prePensionBasis]
  );

  const activeResult =
    period === "sep2026"
      ? proRateMode === "proRated"
        ? septResult.proRated
        : septResult.notProRated
      : period === "fromOct2026"
      ? fromOctResult
      : referenceResult;

  // Fixed full-month old-vs-new comparison, always shown, capped basis.
  const oldVsNew = useMemo(() => {
    const oldB = computeContribution({
      actualWages,
      ceiling: OLD_EPF_WAGE_CEILING,
      pfBasis: "capped",
      pensionBasis: "capped",
    });
    const newB = computeContribution({
      actualWages,
      ceiling: NEW_EPF_WAGE_CEILING,
      pfBasis: "capped",
      pensionBasis: "capped",
    });
    return { oldB, newB };
  }, [actualWages]);

  const insight = useMemo(() => {
    if (actualWages <= OLD_EPF_WAGE_CEILING) return null;
    const delta = oldVsNew.newB.employeePF - oldVsNew.oldB.employeePF;
    if (delta <= 0) return null;
    return delta;
  }, [actualWages, oldVsNew]);

  // Coverage checker tab state
  const [coverageWages, setCoverageWages] = useState(20000);
  const [wasMemberBefore, setWasMemberBefore] = useState(true);
  const [contributionOnActual, setContributionOnActual] = useState(false);

  const coverage = useMemo(
    () =>
      checkCoverage({
        monthlyWages: coverageWages,
        wasEpfMemberBefore: wasMemberBefore,
        contributionWasOnActualWages: contributionOnActual,
      }),
    [coverageWages, wasMemberBefore, contributionOnActual]
  );

  // Bulk cost impact tab state
  const [employeeCount, setEmployeeCount] = useState(50);
  const [avgWage, setAvgWage] = useState(20000);

  const bulk = useMemo(
    () => computeBulkImpact({ employeeCount, averageMonthlyWage: avgWage }),
    [employeeCount, avgWage]
  );

  const supportingDocuments = [
    {
      title: "Cabinet approves enhancement of EPFO wage ceiling from ₹15,000 to ₹25,000",
      description: "PIB press release on the Union Cabinet's approval, 16 September 2026.",
      href: "/documents/epfo-wage-ceiling-pib-cabinet-approval-16-sep-2026.pdf",
      issuer: "Press Information Bureau, Ministry of Labour & Employment",
      date: "16 Sep 2026",
    },
    {
      title: `Gazette Notification ${GAZETTE_REF}`,
      description: "Official notification of the ₹25,000 wage ceiling under Chapter III, Code on Social Security, 2020.",
      href: "/documents/epfo-wage-ceiling-gazette-notification-so-5109e-17-sep-2026.pdf",
      issuer: "Ministry of Labour and Employment, Gazette of India",
      date: "17 Sep 2026",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/" },
          { label: "EPF Wage Ceiling Calculator" },
        ]}
      />
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">EPF Wage Ceiling Calculator</h1>
        <Badge variant="filled">₹15,000 → ₹25,000</Badge>
      </div>
      <p className="text-charcoal/60 mb-10 max-w-2xl">
        Work out EPF/EPS contributions under the revised ₹{NEW_EPF_WAGE_CEILING.toLocaleString("en-IN")} wage
        ceiling — including the {CEILING_CHANGE_EFFECTIVE_DATE} transition month — check whether an employee is
        newly covered, and estimate the bulk cost impact for your organisation.
      </p>

      <Tabs
        items={[
          {
            id: "calculator",
            label: "Calculator",
            content: (
              <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-4">
                <div className="space-y-6 max-w-md">
                  <SliderField
                    label="Employee's actual monthly wages"
                    value={actualWages}
                    onChange={setActualWages}
                    suffix="₹ / month"
                    min={5000}
                    max={100000}
                    step={500}
                  />

                  <div>
                    <span className="text-sm font-medium text-ink block mb-1.5">Calculation period</span>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "sep2026", label: `September 2026 (transition month)` },
                        { id: "fromOct2026", label: "October 2026 onward (full month, new ceiling)" },
                        { id: "reference", label: "Reference: pre-17 Sep 2026 basis (old ceiling)" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setPeriod(opt.id as Period)}
                          className={`text-left px-4 py-2 rounded-md border text-sm ${
                            period === opt.id
                              ? "bg-accentTint border-accent text-ink"
                              : "bg-white text-charcoal/70 border-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {period === "sep2026" && (
                    <>
                      <div>
                        <span className="text-sm font-medium text-ink block mb-1.5">September calculation approach</span>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => setProRateMode("proRated")}
                            className={`text-left px-4 py-2 rounded-md border text-sm ${
                              proRateMode === "proRated"
                                ? "bg-accentTint border-accent text-ink"
                                : "bg-white text-charcoal/70 border-slate-300"
                            }`}
                          >
                            Pro-rated
                            <span className="block text-xs opacity-70">
                              Blend the old and new ceilings by days worked in each period
                            </span>
                          </button>
                          <button
                            onClick={() => setProRateMode("notProRated")}
                            className={`text-left px-4 py-2 rounded-md border text-sm ${
                              proRateMode === "notProRated"
                                ? "bg-accentTint border-accent text-ink"
                                : "bg-white text-charcoal/70 border-slate-300"
                            }`}
                          >
                            Not pro-rated
                            <span className="block text-xs opacity-70">
                              Apply the new ₹25,000 ceiling to the whole of September
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-charcoal/50 mt-2">
                          Neither approach is prescribed by the Gazette notification, which is silent on
                          September's contribution mechanics. Both are shown so you can apply whichever your
                          payroll policy follows — see the disclaimer below the results.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-xs font-medium text-ink block mb-1">Days worked, 1–16 Sep (max 16)</span>
                          <input
                            type="number"
                            min={0}
                            max={16}
                            value={daysBeforeChange}
                            onChange={(e) =>
                              setDaysBeforeChange(Math.max(0, Math.min(16, Number(e.target.value))))
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-ink"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-medium text-ink block mb-1">Days worked, 17–30 Sep (max 14)</span>
                          <input
                            type="number"
                            min={0}
                            max={14}
                            value={daysAfterChange}
                            onChange={(e) =>
                              setDaysAfterChange(Math.max(0, Math.min(14, Number(e.target.value))))
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-ink"
                          />
                        </label>
                      </div>

                      <BasisToggle label="1–16 Sep — PF wage basis" value={prePfBasis} onChange={setPrePfBasis} />
                      <BasisToggle label="1–16 Sep — Pension (EPS) basis" value={prePensionBasis} onChange={setPrePensionBasis} />
                      <BasisToggle label="17–30 Sep — PF wage basis" value={postPfBasis} onChange={setPostPfBasis} />
                      <BasisToggle label="17–30 Sep — Pension (EPS) basis" value={postPensionBasis} onChange={setPostPensionBasis} />
                    </>
                  )}

                  {period === "fromOct2026" && (
                    <>
                      <BasisToggle label="PF wage basis" value={postPfBasis} onChange={setPostPfBasis} />
                      <BasisToggle label="Pension (EPS) basis" value={postPensionBasis} onChange={setPostPensionBasis} />
                    </>
                  )}

                  {period === "reference" && (
                    <>
                      <BasisToggle label="PF wage basis" value={prePfBasis} onChange={setPrePfBasis} />
                      <BasisToggle label="Pension (EPS) basis" value={prePensionBasis} onChange={setPrePensionBasis} />
                    </>
                  )}

                  <p className="text-xs text-charcoal/50">
                    By default, Pension (EPS) stays capped at the ceiling even when the PF wage basis is
                    &ldquo;on actual&rdquo; — this is the standard rule. Set a Pension basis to &ldquo;on
                    actual&rdquo; only for an employee with a valid, already-exercised higher-pension option.
                  </p>
                </div>

                <div className="sticky top-6 space-y-6">
                  <div className="card px-6 py-5">
                    <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
                      Contribution wage basis
                    </p>
                    <h3 className="font-display text-3xl text-ink mb-6">
                      {formatINR(activeResult.contributionWage)}
                    </h3>

                    <ResultRow label="Employee PF @ 12%" value={formatINR(activeResult.employeePF)} emphasis="rust" />
                    <ResultRow label="Employer EPS @ 8.33%" value={formatINR(activeResult.employerEPS)} />
                    <ResultRow label="Employer EPF @ 3.67% (residual)" value={formatINR(activeResult.employerEPFResidual)} />
                    <ResultRow label="Employer EDLI @ 0.5% (illustrative)" value={formatINR(activeResult.employerEDLI)} />

                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <ResultRow
                        label="Total monthly EPF/EPS flow"
                        value={formatINR(activeResult.totalMonthlyFlow)}
                        emphasis="ledger"
                      />
                    </div>

                    {period === "sep2026" && (
                      <p className="text-xs text-charcoal/50 mt-4">
                        {proRateMode === "proRated"
                          ? `Pro-rated: blends ${daysBeforeChange} day(s) at the ₹15,000 ceiling with ${daysAfterChange} day(s) at the ₹25,000 ceiling. The other approach (not pro-rated) would give a contribution wage of ${formatINR(
                              septResult.notProRated.contributionWage
                            )}.`
                          : `Not pro-rated: applies the ₹25,000 ceiling to the whole of September. The pro-rated approach would give a contribution wage of ${formatINR(
                              septResult.proRated.contributionWage
                            )}.`}
                      </p>
                    )}
                  </div>

                  <SourceDocuments documents={supportingDocuments} />
                </div>
              </div>
            ),
          },
          {
            id: "coverage",
            label: "Coverage Checker",
            content: (
              <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-4">
                <div className="space-y-6 max-w-md">
                  <SliderField
                    label="Employee's monthly wages"
                    value={coverageWages}
                    onChange={setCoverageWages}
                    suffix="₹ / month"
                    min={5000}
                    max={40000}
                    step={500}
                  />

                  <div>
                    <span className="text-sm font-medium text-ink block mb-1.5">
                      Was this employee an EPF member before 17 September 2026?
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setWasMemberBefore(true)}
                        className={`px-4 py-2 rounded-md border text-sm ${
                          wasMemberBefore
                            ? "bg-accentTint border-accent text-ink"
                            : "bg-white text-charcoal/70 border-slate-300"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setWasMemberBefore(false)}
                        className={`px-4 py-2 rounded-md border text-sm ${
                          !wasMemberBefore
                            ? "bg-accentTint border-accent text-ink"
                            : "bg-white text-charcoal/70 border-slate-300"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {wasMemberBefore && (
                    <div>
                      <span className="text-sm font-medium text-ink block mb-1.5">
                        Was their contribution already on actual wages (uncapped)?
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setContributionOnActual(true)}
                          className={`px-4 py-2 rounded-md border text-sm ${
                            contributionOnActual
                              ? "bg-accentTint border-accent text-ink"
                              : "bg-white text-charcoal/70 border-slate-300"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setContributionOnActual(false)}
                          className={`px-4 py-2 rounded-md border text-sm ${
                            !contributionOnActual
                              ? "bg-accentTint border-accent text-ink"
                              : "bg-white text-charcoal/70 border-slate-300"
                          }`}
                        >
                          No — capped at ₹15,000
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sticky top-6">
                  <div className="card px-6 py-5">
                    <Badge
                      variant={
                        coverage.outcome === "excluded-above-ceiling"
                          ? "outline"
                          : coverage.outcome === "already-covered-no-change" ||
                            coverage.outcome === "existing-member-already-actual"
                          ? "success"
                          : "warn"
                      }
                    >
                      {coverage.headline}
                    </Badge>
                    <p className="text-sm text-charcoal/70 mt-4 leading-relaxed">{coverage.detail}</p>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "bulk",
            label: "Bulk Cost Impact",
            content: (
              <div className="grid lg:grid-cols-[1fr_380px] gap-10 mb-4">
                <div className="space-y-6 max-w-md">
                  <label className="block">
                    <span className="text-sm font-medium text-ink block mb-1.5">
                      Number of employees in the ₹15,001–₹25,000 wage band
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-ink"
                    />
                  </label>

                  <SliderField
                    label="Average monthly wage of this group"
                    value={avgWage}
                    onChange={setAvgWage}
                    suffix="₹ / month"
                    min={15000}
                    max={25000}
                    step={500}
                  />

                  <p className="text-xs text-charcoal/50">
                    This is a planning estimate for a group assumed to be at or above both ceilings, calculated
                    on the statutory-minimum (capped) basis. Actual bulk impact will vary with your real wage
                    distribution — treat this as directional, not a payroll-exact figure.
                  </p>
                </div>

                <div className="sticky top-6">
                  <div className="card px-6 py-5">
                    <p className="text-xs uppercase tracking-widest text-charcoal/40 font-medium mb-1">
                      Additional monthly employer cost
                    </p>
                    <h3 className="font-display text-3xl text-ink mb-6">
                      {formatINR(bulk.totalMonthlyEmployerDelta)}
                    </h3>
                    <ResultRow label="Per employee — old ceiling" value={formatINR(bulk.perEmployeeOldEmployerCost)} />
                    <ResultRow label="Per employee — new ceiling" value={formatINR(bulk.perEmployeeNewEmployerCost)} />
                    <ResultRow label="Per employee — increase" value={formatINR(bulk.perEmployeeDelta)} emphasis="rust" />
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <ResultRow
                        label="Estimated additional annual cost"
                        value={formatINR(bulk.totalAnnualEmployerDelta)}
                        emphasis="rust"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "checklist",
            label: "Action Checklist",
            content: (
              <div className="max-w-3xl">
                <p className="text-sm text-charcoal/60 mb-6">
                  General transition guidance, not an exhaustive or legally binding checklist. Confirm each item
                  against EPFO&apos;s own circulars and your compliance advisor before acting.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Identify affected employees",
                      detail: "List employees with actual wages between ₹15,001 and ₹25,000, split by whether they're existing PF members and whether their contribution basis is capped or actual.",
                    },
                    {
                      title: "Decide your September approach",
                      detail: "Choose pro-rated vs not-pro-rated for the transition month and apply it consistently across payroll, pending any EPFO circular.",
                    },
                    {
                      title: "Update payroll system ceiling parameters",
                      detail: "Change the statutory PF ceiling value from ₹15,000 to ₹25,000 in your payroll/HRMS configuration effective 17 September 2026.",
                    },
                    {
                      title: "Re-check EPS vs EPF split logic",
                      detail: "Confirm your system still caps the Pension (EPS) contribution at the ceiling by default, splitting only the employer's residual to EPF, and doesn't apply the new ceiling to EPS incorrectly for members without a valid higher-pension option.",
                    },
                    {
                      title: "Recompute CTC structures",
                      detail: "Where employer PF is built into CTC, the newly higher employer contribution for affected employees may change net take-home unless CTC structures are revisited.",
                    },
                    {
                      title: "Communicate to affected employees",
                      detail: "Explain the change in their own payslip — both those seeing a higher deduction and those newly brought into mandatory coverage.",
                    },
                    {
                      title: "Enrol newly-in-band employees",
                      detail: "For employees in the ₹15,001–₹25,000 band who weren't PF members before, confirm with EPFO guidance whether enrolment is now required and complete UAN generation/linking if so.",
                    },
                    {
                      title: "Update offer letters and CTC templates",
                      detail: "Any standard offer-letter or CTC-breakup templates referencing the ₹15,000 ceiling should be updated to ₹25,000 for new hires.",
                    },
                    {
                      title: "Budget for the employer cost increase",
                      detail: "Use the Bulk Cost Impact tab to estimate the additional monthly and annual employer outgo across your affected headcount.",
                    },
                    {
                      title: "Watch for the EPFO implementation circular",
                      detail: "The Gazette notification doesn't cover September's transition mechanics — check for a follow-up EPFO circular and be ready to adjust your chosen approach if it differs.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="card px-5 py-4">
                      <h4 className="font-display text-base text-ink mb-1.5">{item.title}</h4>
                      <p className="text-xs text-charcoal/60 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />

      {insight !== null && (
        <div className="mb-10 max-w-2xl mt-6">
          <InsightBanner
            message={`Moving from the ₹15,000 cap to the ₹25,000 cap adds ₹${insight.toLocaleString(
              "en-IN"
            )}/month to this employee's own PF deduction alone (capped basis, full month).`}
          />
        </div>
      )}

      <div className="max-w-2xl mb-20 mt-4">
        <p className="text-xs uppercase tracking-widest text-charcoal/40 font-semibold mb-3">
          Old ceiling vs new ceiling — full month, capped basis
        </p>
        <div className="card px-6 py-5">
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-charcoal/50 mb-2">
            <span>Component</span>
            <span className="text-right">Old (₹15,000)</span>
            <span className="text-right">New (₹25,000)</span>
            <span className="text-right">Diff.</span>
          </div>
          {[
            {
              label: "Contribution wage basis",
              oldV: oldVsNew.oldB.contributionWage,
              newV: oldVsNew.newB.contributionWage,
            },
            {
              label: "Employee PF @ 12%",
              oldV: oldVsNew.oldB.employeePF,
              newV: oldVsNew.newB.employeePF,
            },
            {
              label: "Employer EPS @ 8.33%",
              oldV: oldVsNew.oldB.employerEPS,
              newV: oldVsNew.newB.employerEPS,
            },
            {
              label: "Employer EPF @ 3.67%",
              oldV: oldVsNew.oldB.employerEPFResidual,
              newV: oldVsNew.newB.employerEPFResidual,
            },
            {
              label: "Total monthly flow",
              oldV: oldVsNew.oldB.totalMonthlyFlow,
              newV: oldVsNew.newB.totalMonthlyFlow,
            },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-4 gap-2 text-sm py-1.5 border-t border-slate-100 first:border-0">
              <span className="text-charcoal/80">{row.label}</span>
              <span className="text-right font-mono">{formatINR(row.oldV)}</span>
              <span className="text-right font-mono">{formatINR(row.newV)}</span>
              <span className="text-right font-mono text-ledger">
                +{formatINR(row.newV - row.oldV)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-charcoal/50 mt-3">
          For educational and internal planning purposes only; this is not legal advice. Verify figures against
          the final Gazette notification, the Code on Social Security, 2020, and applicable EPF/EPS Schemes
          before acting.
        </p>
      </div>

      <div className="mb-20">
        <ArticleWithTOC
          sections={[
            {
              id: "what-changed",
              label: "What changed",
              content: (
                <>
                  <p>
                    The Union Cabinet approved raising the EPF wage ceiling from ₹15,000 to
                    ₹{NEW_EPF_WAGE_CEILING.toLocaleString("en-IN")} per month, and the Ministry of Labour &amp;
                    Employment formally notified it via {GAZETTE_REF}, under Section 2(89) of the Code on Social
                    Security, 2020. The notification took effect from its date of publication in the Official
                    Gazette — {CEILING_CHANGE_EFFECTIVE_DATE} — and superseded an earlier notification, S.O.
                    2702(E) dated 29 May 2026.
                  </p>
                  <p>
                    This is the ceiling used for mandatory coverage and the statutory minimum contribution base
                    under Chapter III (Employees&apos; Provident Fund) of the Code — it had remained unchanged
                    since September 2014, when it was last raised from ₹6,500.
                  </p>
                </>
              ),
            },
            {
              id: "formula",
              label: "How the contribution is calculated",
              content: (
                <>
                  <p>
                    The ceiling caps the wage figure used for the statutory minimum contribution — it doesn&apos;t
                    change the contribution rates themselves, which stay at 12% for both employee and employer.
                  </p>
                  <FormulaBox>{`Contribution wage = min(actual wages, ceiling)  [or actual wages, if a higher-wage arrangement already applies]
Employee PF = 12% × contribution wage
Employer EPS (pension) = 8.33% × pension wage (capped by default)
Employer EPF (residual) = (12% × contribution wage) − Employer EPS`}</FormulaBox>
                  <p>
                    An employee already earning above the ceiling still contributes on their actual wages if
                    their employer already uses actual wages as the base (common under Para 26(6) of the EPF
                    Scheme) — the ceiling only sets the statutory <em>minimum</em>, not a hard cap on every
                    arrangement.
                  </p>
                </>
              ),
            },
            {
              id: "september-transition",
              label: "The September 2026 transition month",
              content: (
                <>
                  <p>
                    Because the new ceiling took effect mid-month, September 2026 straddles both the old
                    ₹15,000 ceiling (1–16 September) and the new ₹25,000 ceiling (17–30 September). The Gazette
                    notification itself is silent on how to calculate contributions for this broken period.
                  </p>
                  <p>
                    This tool gives you two approaches to choose from — a day-based pro-rated blend of the two
                    ceilings, or simply applying the new ceiling to the whole month — so you can match whichever
                    your organisation&apos;s payroll policy adopts. Neither is presented as an EPFO-mandated
                    formula; check for a follow-up EPFO circular specifically addressing this transition before
                    finalising September payroll.
                  </p>
                </>
              ),
            },
            {
              id: "coverage",
              label: "Who's newly covered",
              content: (
                <p>
                  Employees earning up to ₹15,000 were already within mandatory coverage before this change.
                  Employees in the new ₹15,001–₹25,000 band may now fall within mandatory coverage, though
                  whether a specific employee who was never enrolled needs fresh enrolment — versus remaining an
                  excluded employee because their wages exceeded the ceiling in force when they joined — is a
                  case-specific question. Use the Coverage Checker tab as a starting point, and confirm
                  edge cases against EPFO guidance.
                </p>
              ),
            },
          ]}
        />
      </div>

      <div className="mb-20">
        <h2 className="text-2xl mb-4">Frequently asked questions</h2>
        <FAQAccordion
          items={[
            {
              question: "When exactly did the ₹25,000 ceiling take effect?",
              answer:
                "17 September 2026 — the date the Gazette notification (S.O. 5109(E)) was published. The notification states the ceiling applies from the date of publication, with no retrospective effect.",
            },
            {
              question: "Did the contribution rates change too?",
              answer:
                "No. The employee and employer contribution rates stay at 12% each. Only the wage ceiling used to calculate the statutory minimum contribution base has changed, from ₹15,000 to ₹25,000.",
            },
            {
              question: "How should I calculate PF for September 2026?",
              answer:
                "The Gazette notification doesn't prescribe a methodology for this broken period. This tool offers two approaches — a days-based pro-rated blend of the old and new ceilings, or applying the new ceiling to the whole month — so you can follow your organisation's chosen policy. Watch for a follow-up EPFO circular that may formally address this.",
            },
            {
              question: "Does this mean I now contribute on ₹25,000 even if I earn more?",
              answer:
                "No. ₹25,000 is a ceiling, not a target. If your actual wages are below it, contributions on the capped basis are calculated on your actual wages. If they're above it, contributions on the capped basis are capped at ₹25,000, unless your employer already contributes on actual wages under an existing higher-wage arrangement.",
            },
            {
              question: "Is Pension (EPS) also capped at ₹25,000 now?",
              answer:
                "By default, yes — EPS stays capped at the applicable ceiling even where the PF wage basis is on actual wages. It only runs on actual wages for an employee who already has a valid, exercised higher-pension option in place, which is uncommon.",
            },
          ]}
        />
      </div>

      <RelatedTools currentSlug="epf-wage-ceiling-calculator" />
    </div>
  );
}
