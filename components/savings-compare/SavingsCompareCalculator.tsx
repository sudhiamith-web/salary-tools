"use client";

// EPF vs VPF vs PPF vs NPS vs Mutual Fund calculator UI.
// Logic lives in lib/calculators/savingsCompare.ts.

import { useMemo, useState, type ReactNode } from "react";
import SliderField from "@/components/SliderField";
import InsightBanner from "@/components/InsightBanner";
import {
  DEFAULT_INPUTS,
  RATES,
  SLABS,
  calculateSavings,
  defaultEmployeeEpf,
  defaultEmployerEpf,
  fillOrder,
  type MixInputs,
  type RouteResult,
  type SavingsInputs,
  type Scenario,
} from "@/lib/calculators/savingsCompare";
import GrowthChart from "./GrowthChart";
import { ROUTE_COLORS, rupees, rupeesShort } from "./format";
import { downloadPdfReport } from "./pdfReport";

// ---------- small local controls ----------

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            o.value === value ? "bg-accent text-white" : "text-charcoal/70 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Chips({ label, value, options, onChange }: { label: string; value: number; options: number[]; onChange: (v: number) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1 text-sm font-medium ${
            o === value ? "border-accent bg-accent/10 text-accent" : "border-slate-200 bg-slate-50 text-charcoal/70"
          }`}
        >
          {o}%
        </button>
      ))}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 100,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-accent">
        {prefix && <span className="text-charcoal/50">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isNaN(n) ? 0 : Math.max(0, n));
          }}
          className="w-full bg-transparent text-right tabular-nums outline-none"
        />
        {suffix && <span className="text-charcoal/50">{suffix}</span>}
      </span>
      {hint && <span className="mt-1 block text-xs text-charcoal/50">{hint}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-ink">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-none rounded-full transition-colors ${checked ? "bg-accent" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {children}
    </div>
  );
}

// ---------- result pieces ----------

function RouteCard({ r, rank, total, retireAge, fv, sameMode, amount }: {
  r: RouteResult;
  rank?: number;
  total: number;
  retireAge: number;
  fv: (v: number) => number;
  sameMode: boolean;
  amount: number;
}) {
  const gain = r.exit.post - r.invested;
  const Row = ({ label, value, tone }: { label: string; value: string; tone?: "gain" | "loss" }) => (
    <div className="flex justify-between gap-3 py-0.5 text-sm">
      <span className="text-charcoal/60">{label}</span>
      <span className={`font-medium tabular-nums ${tone === "gain" ? "text-ledger" : tone === "loss" ? "text-rust" : "text-ink"}`}>{value}</span>
    </div>
  );
  return (
    <article className="card border-t-4 px-5 py-4" style={{ borderTopColor: ROUTE_COLORS[r.key] }}>
      <h3 className="flex items-baseline justify-between gap-2 font-display text-lg text-ink">
        {r.name}
        {rank !== undefined && <span className="whitespace-nowrap font-sans text-xs font-semibold text-charcoal/50">#{rank} of {total}</span>}
      </h3>
      <p className="mt-2 font-display text-3xl text-ink tabular-nums">{rupeesShort(fv(r.exit.post))}</p>
      <p className="mb-3 text-xs text-charcoal/50">in hand after tax · {r.note}</p>
      <Row label="Starts with" value={`${rupees(r.firstMonth)}/mo`} />
      <Row label="Total put in" value={rupeesShort(fv(r.invested))} />
      <Row label={`Value at ${retireAge}`} value={rupeesShort(fv(r.value))} />
      <Row label="Tax at withdrawal" value={r.exit.exitTax > 0 ? `−${rupeesShort(fv(r.exit.exitTax))}` : "None"} tone={r.exit.exitTax > 0 ? "loss" : undefined} />
      {sameMode && (
        <Row
          label="Tax before investing"
          value={r.firstMonth < amount - 1 ? `−${rupeesShort(fv(r.grossLost))}` : "None"}
          tone={r.firstMonth < amount - 1 ? "loss" : undefined}
        />
      )}
      {r.exit.pension ? <Row label="Pension (before tax)" value={`${rupees(fv(r.exit.pension))}/mo`} /> : null}
      <Row label="Growth after all tax" value={`${gain >= 0 ? "+" : ""}${rupeesShort(fv(gain))}`} tone={gain >= 0 ? "gain" : "loss"} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {r.tags.map((t) => (
          <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-charcoal/60">
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

// ---------- main ----------

export default function SavingsCompareCalculator() {
  const [inputs, setInputs] = useState<SavingsInputs>(DEFAULT_INPUTS);
  const [epfTouched, setEpfTouched] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>("mid");
  const [todaysValue, setTodaysValue] = useState(false);
  const [chartTax, setChartTax] = useState<"before" | "after">("before");
  const [pdfState, setPdfState] = useState<"idle" | "busy" | "error">("idle");

  const set = <K extends keyof SavingsInputs>(key: K) => (value: SavingsInputs[K]) => setInputs((p) => ({ ...p, [key]: value }));
  const setMix = (key: keyof MixInputs) => (value: number) => setInputs((p) => ({ ...p, mix: { ...p.mix, [key]: value } }));

  const setBasic = (basic: number) =>
    setInputs((p) => ({
      ...p,
      basicMonthly: basic,
      ...(epfTouched ? {} : { epfEmpMonthly: defaultEmployeeEpf(basic), epfErMonthly: defaultEmployerEpf(basic) }),
    }));

  const setRegime = (regime: SavingsInputs["regime"]) =>
    setInputs((p) => {
      const near = (v: number) => SLABS[regime].reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
      return { ...p, regime, slab: near(p.slab), retTax: near(p.retTax) };
    });

  const pickScenario = (s: Scenario) => {
    setScenario(s);
    setInputs((p) => ({ ...p, rNps: RATES.scenarios[s].nps, rMf: RATES.scenarios[s].mf }));
  };

  const result = useMemo(() => calculateSavings(inputs), [inputs]);
  const fv = (v: number) => (todaysValue ? v / result.deflator : v);
  const same = inputs.mode === "same";
  const old = inputs.regime === "old";
  const ranked = useMemo(() => [...result.routes].sort((a, b) => b.exit.post - a.exit.post), [result]);
  const rankOf = (key: string) => ranked.findIndex((r) => r.key === key) + 1;

  // Insight lines, also used in the PDF.
  const insight = useMemo(() => {
    const lines: string[] = [];
    if (same && ranked.length >= 2) {
      const [top, second] = ranked;
      lines.push(
        `${top.name} leaves you the most after tax: ${rupeesShort(fv(top.exit.post))} at ${inputs.retireAge}, about ${rupeesShort(fv(top.exit.post - second.exit.post))} more than ${second.name}.`,
      );
      const emp = result.routes.find((r) => r.key === "npsEmp");
      const mf = result.routes.find((r) => r.key === "mf");
      if (emp && mf && mf.firstMonth > 0 && emp.firstMonth / mf.firstMonth > 1.01)
        lines.push(
          `Routing ${rupees(inputs.amountMonthly)} through employer NPS invests ${rupees(emp.firstMonth)} a month. A mutual fund gets ${rupees(mf.firstMonth)} – about ${Math.round((emp.firstMonth / mf.firstMonth - 1) * 100)}% less on day one.`,
        );
      if (top.key === "npsOwn" || top.key === "npsEmp") {
        const share = result.premature ? "80%" : inputs.npsLumpPct === 80 ? "20%" : "40%";
        lines.push(`Keep in mind: NPS money is locked till 60, and ${share} must buy a taxable pension (about ${rupees(fv(top.exit.pension ?? 0))} a month before tax).`);
      } else if (top.key === "mf") {
        lines.push(`This assumes ${inputs.rMf}% a year from the market. Try the “Cautious” scenario to see how the ranking holds up.`);
      } else lines.push("This is a fixed-rate option, so the result depends less on market luck.");
    } else if (!same) {
      const post = result.routes.reduce((a, r) => a + r.exit.post, 0);
      const pension = result.routes.reduce((a, r) => a + (r.exit.pension ?? 0), 0);
      lines.push(
        `Your mix leaves you about ${rupeesShort(fv(post))} after tax at ${inputs.retireAge}${pension > 0 ? `, plus a pension of about ${rupees(fv(pension))} a month before tax` : ""}.`,
      );
      lines.push(`Deductions on this mix save about ${rupees(result.taxSavedYear1)} in tax this year and ${rupeesShort(result.taxSavedTotal)} over ${result.years} years.`);
    }
    return lines;
    // fv depends on todaysValue and result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, ranked, same, inputs, todaysValue]);

  const order = fillOrder(inputs.regime, inputs.employerNps || !same);

  const onPdf = async () => {
    setPdfState("busy");
    try {
      await downloadPdfReport({ inputs, result, insight, order, todaysValue });
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  };

  // Starting line (hero)
  const heroTotal = same ? inputs.amountMonthly : result.routes.reduce((a, r) => a + r.firstMonth, 0);

  return (
    <div className="space-y-10">
      {/* Starting line */}
      <section className="card px-6 py-6" aria-labelledby="starting-line">
        <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-display text-4xl text-accent tabular-nums md:text-5xl">{rupees(heroTotal)}</span>
          <h2 id="starting-line" className="font-display text-xl text-ink md:text-2xl">
            {same ? `of your gross salary, invested ${result.routes.length} ways` : "goes in every month in year one"}
          </h2>
          <p className="basis-full text-sm text-charcoal/60">
            {same
              ? "Some routes invest the full amount before tax. Others invest only what’s left after tax. That head start compounds for decades."
              : `Your deductions cut tax by ${rupees(result.taxSavedYear1 / 12)} a month this year${result.perqTaxYear1 > 0 ? `, but ${rupees(result.perqTaxYear1 / 12)} a month is taxed as salary` : ""}.`}
          </p>
        </div>
        <div className="space-y-2.5">
          {result.routes.map((r) => {
            const pct = heroTotal > 0 ? Math.min(100, (r.firstMonth / heroTotal) * 100) : 0;
            return (
              <div key={r.key} className="grid grid-cols-[minmax(110px,180px)_1fr_auto] items-center gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: ROUTE_COLORS[r.key] }} />
                  {r.name}
                </span>
                <div
                  className="relative h-6 overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                  role="img"
                  aria-label={`${r.name}: ${rupees(r.firstMonth)} of ${rupees(heroTotal)}`}
                >
                  <div className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-500" style={{ width: `${pct}%`, background: ROUTE_COLORS[r.key] }} />
                  {same && (
                    <div
                      className="absolute inset-y-0 right-0 transition-[width] duration-500"
                      style={{ width: `${100 - pct}%`, background: "repeating-linear-gradient(135deg, transparent 0 5px, rgba(180,71,43,.22) 5px 7px)" }}
                    />
                  )}
                </div>
                <span className="min-w-[84px] text-right text-sm font-semibold tabular-nums text-ink">
                  {rupees(r.firstMonth)}
                  <span className="block text-xs font-normal text-charcoal/50">{Math.round(pct)}% {same ? "invested" : "of total"}</span>
                </span>
              </div>
            );
          })}
        </div>
        {same && <p className="mt-3 text-xs text-charcoal/50">Striped part: income tax paid before the money is invested.</p>}
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="card space-y-5 px-5 py-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto print:hidden">
          <Group title="How do you want to compare?">
            <Segmented
              label="Comparison mode"
              value={inputs.mode}
              onChange={set("mode")}
              options={[
                { value: "same", label: "One amount, each option" },
                { value: "mix", label: "My own mix" },
              ]}
            />
          </Group>

          <Group title="You">
            <SliderField label="Age now" value={inputs.age} onChange={(v) => setInputs((p) => ({ ...p, age: v, retireAge: Math.max(p.retireAge, v + 1) }))} suffix="years" min={18} max={59} step={1} />
            <SliderField label="Retire at" value={inputs.retireAge} onChange={(v) => set("retireAge")(Math.max(v, inputs.age + 1))} suffix="years" min={40} max={70} step={1} />
            {inputs.retireAge < 60 && <p className="text-xs text-charcoal/50">Before 60, NPS early-exit rules apply.</p>}
            <SliderField label="Basic salary" value={inputs.basicMonthly} onChange={setBasic} suffix="₹ / month" min={10000} max={500000} step={1000} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Your EPF / month" prefix="₹" value={inputs.epfEmpMonthly} onChange={(v) => { setEpfTouched(true); set("epfEmpMonthly")(v); }} />
              <NumberInput label="Employer EPF / month" prefix="₹" value={inputs.epfErMonthly} onChange={(v) => { setEpfTouched(true); set("epfErMonthly")(v); }} />
            </div>
            <p className="text-xs text-charcoal/50">
              Defaults to 12% of basic. The employer figure leaves out the EPS (pension) share, worked out on the ₹25,000 wage ceiling. Check your EPF passbook.
            </p>
          </Group>

          <Group title="Tax">
            <Segmented label="Tax regime" value={inputs.regime} onChange={setRegime} options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]} />
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Your highest tax slab</p>
              <Chips label="Tax slab" value={inputs.slab} options={SLABS[inputs.regime]} onChange={set("slab")} />
              <p className="mt-1 text-xs text-charcoal/50">Plus 4% cess. Surcharge not included.</p>
            </div>
            {old && (
              <SliderField label="Other 80C items" value={inputs.other80C} onChange={set("other80C")} suffix="₹ / year" min={0} max={150000} step={5000} />
            )}
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Tax slab after you retire</p>
              <Chips label="Tax slab after retirement" value={inputs.retTax} options={SLABS[inputs.regime]} onChange={set("retTax")} />
              <p className="mt-1 text-xs text-charcoal/50">Applies to the taxable part of NPS and to pension income.</p>
            </div>
          </Group>

          {same ? (
            <Group title="Amount to compare">
              <SliderField label="From your gross salary" value={inputs.amountMonthly} onChange={set("amountMonthly")} suffix="₹ / month" min={1000} max={150000} step={500} />
              <Toggle label="My employer offers NPS in CTC" checked={inputs.employerNps} onChange={set("employerNps")} />
              <Segmented label="Mutual fund type" value={inputs.mfType} onChange={set("mfType")} options={[{ value: "equity", label: "Equity fund" }, { value: "elss", label: "ELSS (tax saver)" }]} />
            </Group>
          ) : (
            <Group title="Your monthly mix">
              <p className="text-xs text-charcoal/50">Your EPF from above is included. Enter what goes into each option every month.</p>
              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="VPF" prefix="₹" step={500} value={inputs.mix.vpf} onChange={setMix("vpf")} />
                <NumberInput label="PPF" prefix="₹" step={500} value={inputs.mix.ppf} onChange={setMix("ppf")} />
                <NumberInput label="NPS (yours)" prefix="₹" step={500} value={inputs.mix.npsOwn} onChange={setMix("npsOwn")} />
                <NumberInput label="NPS (employer)" prefix="₹" step={500} value={inputs.mix.npsEmp} onChange={setMix("npsEmp")} />
                <NumberInput label="Mutual fund SIP" prefix="₹" step={500} value={inputs.mix.mf} onChange={setMix("mf")} />
              </div>
              <Segmented label="Mutual fund type" value={inputs.mfType} onChange={set("mfType")} options={[{ value: "equity", label: "Equity fund" }, { value: "elss", label: "ELSS (tax saver)" }]} />
            </Group>
          )}

          <Group title="Growth assumptions">
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Market returns (NPS and mutual fund)</p>
              <Segmented<Scenario | "custom">
                label="Return scenario"
                value={scenario ?? "custom"}
                onChange={(v) => v !== "custom" && pickScenario(v)}
                options={(Object.keys(RATES.scenarios) as Scenario[]).map((k) => ({ value: k, label: RATES.scenarios[k].label }))}
              />
              <p className="mt-1 text-xs text-charcoal/50">Market returns are assumptions, not promises. Edit any rate below.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="EPF / VPF" suffix="%" step={0.05} value={inputs.rEpf} onChange={set("rEpf")} />
              <NumberInput label="PPF" suffix="%" step={0.05} value={inputs.rPpf} onChange={set("rPpf")} />
              <NumberInput label="NPS" suffix="%" step={0.25} value={inputs.rNps} onChange={(v) => { setScenario(null); set("rNps")(v); }} />
              <NumberInput label="Mutual fund" suffix="%" step={0.25} value={inputs.rMf} onChange={(v) => { setScenario(null); set("rMf")(v); }} />
              <NumberInput label="Yearly raise" suffix="%" step={0.5} value={inputs.stepUp} onChange={set("stepUp")} />
              <NumberInput label="Inflation" suffix="%" step={0.5} value={inputs.inflation} onChange={set("inflation")} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">NPS lump sum at exit</p>
              <Segmented<60 | 80> label="NPS lump sum" value={inputs.npsLumpPct} onChange={set("npsLumpPct")} options={[{ value: 60, label: "60%" }, { value: 80, label: "80%" }]} />
              <p className="mt-1 text-xs text-charcoal/50">The rest buys an annuity (pension).</p>
            </div>
            <SliderField label="Annuity rate" value={inputs.annuityRate} onChange={set("annuityRate")} suffix="%" min={4} max={8} step={0.25} />
          </Group>
        </div>

        {/* Results */}
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">
              What you keep at {inputs.retireAge}
              {todaysValue ? " (today’s money)" : ""}
            </h2>
            <div className="flex flex-wrap items-center gap-4 print:hidden">
              <Toggle label="In today’s money" checked={todaysValue} onChange={setTodaysValue} />
              <button
                type="button"
                onClick={onPdf}
                disabled={pdfState === "busy"}
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {pdfState === "busy" ? "Preparing PDF…" : "Download PDF report"}
              </button>
            </div>
          </div>
          {pdfState === "error" && (
            <p className="text-sm text-rust">The PDF couldn’t be created. Check your connection, or use your browser’s Print → Save as PDF.</p>
          )}

          <InsightBanner message={insight.join(" ")} />

          {same && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-charcoal/70">
              Your existing EPF keeps running alongside:{" "}
              <strong className="text-ink tabular-nums">{rupeesShort(fv(result.baseline.value))}</strong> at {inputs.retireAge}, tax-free. The options
              below are on top of this.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.routes.map((r) => (
              <RouteCard
                key={r.key}
                r={r}
                rank={same ? rankOf(r.key) : undefined}
                total={result.routes.length}
                retireAge={inputs.retireAge}
                fv={fv}
                sameMode={same}
                amount={inputs.amountMonthly}
              />
            ))}
          </div>

          <section className="card px-5 py-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl text-ink">How the money grows</h2>
              <div className="w-full sm:w-64">
                <Segmented
                  label="Chart values"
                  value={chartTax}
                  onChange={setChartTax}
                  options={[
                    { value: "before", label: "Before tax" },
                    { value: "after", label: "After tax" },
                  ]}
                />
              </div>
            </div>
            <p className="mb-4 text-xs text-charcoal/50">
              {todaysValue ? "In today’s money. " : ""}
              {chartTax === "after"
                ? "What you’d keep after exit tax if you withdrew at that age. NPS uses the exit rules for your retirement age, since it’s locked till then."
                : "Value before exit tax, by age."}
            </p>
            <GrowthChart
              routes={result.routes}
              baseline={same ? result.baseline.values : undefined}
              startAge={inputs.age}
              afterTax={chartTax === "after"}
              inflation={todaysValue ? inputs.inflation : 0}
            />
          </section>

          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((w) => (
                <div key={w} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
                  {w}
                </div>
              ))}
            </div>
          )}

          <section className="card px-5 py-5">
            <h2 className="mb-3 font-display text-xl text-ink">Smart order to fill (tax efficiency only)</h2>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-charcoal/80">
              {order.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-charcoal/50">This order looks only at tax. Your goals, time horizon and need for cash matter just as much.</p>
          </section>

          <p className="text-xs text-charcoal/50">
            Estimates only, based on rules as of November 2026 and the assumptions you set. Not financial or tax advice. Tax laws change; check with a
            qualified tax advisor before you decide.
          </p>
        </div>
      </div>
    </div>
  );
}
