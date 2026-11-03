// EPF vs VPF vs PPF vs NPS vs Mutual Fund: after-tax comparison.
// Pure logic, no React. Rates and rules verified November 2026 for FY 2026-27.
//
// Sources:
// - EPF/VPF 8.25% for FY 2025-26: EPFO circular INV-11/2/2021-INV/E-41960/2519 (ratified June 2026).
// - PPF 7.1% for Oct–Dec 2026: Ministry of Finance (DEA) OM F.No.1/4/2019-NS dated 30.09.2026.
// - NPS exit: PFRDA (Exits and Withdrawals under NPS) Amendment Regulations, Dec 2025 (up to 80% lump
//   sum for non-government subscribers; the income-tax exemption is still 60%).
// - Employer NPS deduction 14% (new regime) / 10% (old regime, private sector); ₹7.5 lakh aggregate
//   cap on employer EPF + NPS + superannuation.
// - EPF wage ceiling ₹25,000 (Gazette S.O. 5109(E), 17 Sep 2026), used only for the default EPS split.
// Re-verify every rate here after each Union Budget and each quarterly small-savings notification.

export type Regime = "new" | "old";
export type Mode = "same" | "mix";
export type MfType = "equity" | "elss";
export type RouteKey = "epfEmp" | "epfEr" | "vpf" | "ppf" | "npsOwn" | "npsEmp" | "mf";

export const RATES = {
  epf: 8.25,
  ppf: 7.1,
  scenarios: {
    low: { label: "Cautious", nps: 8, mf: 9 },
    mid: { label: "Middle", nps: 10, mf: 12 },
    high: { label: "Hopeful", nps: 12, mf: 14 },
  },
} as const;
export type Scenario = keyof typeof RATES.scenarios;

export const LIMITS = {
  sec80C: 150000,
  nps1B: 50000,
  ppfMax: 150000,
  epfInterestFree: 250000, // employee EPF + VPF contributions a year
  employerAggregate: 750000, // employer EPF + NPS + superannuation a year
  npsEmployerPctNew: 0.14,
  npsEmployerPctOld: 0.1,
  npsTaxFreeShare: 0.6,
  npsPrematureLump: 0.2,
  ltcgExempt: 125000,
  ltcgRate: 0.125,
  cess: 0.04,
  epfWageCeiling: 25000,
  epsRate: 0.0833,
} as const;

export const SLABS: Record<Regime, number[]> = { new: [0, 5, 10, 15, 20, 25, 30], old: [0, 5, 20, 30] };

export interface MixInputs {
  vpf: number;
  ppf: number;
  npsOwn: number;
  npsEmp: number;
  mf: number;
}

export interface SavingsInputs {
  mode: Mode;
  regime: Regime;
  slab: number; // %
  retTax: number; // % slab after retirement
  age: number;
  retireAge: number;
  basicMonthly: number;
  epfEmpMonthly: number;
  epfErMonthly: number; // to the EPF account, excluding EPS
  other80C: number; // per year, old regime only
  amountMonthly: number; // "same" mode, from gross salary
  employerNps: boolean;
  mfType: MfType;
  mix: MixInputs;
  rEpf: number; // %
  rPpf: number;
  rNps: number;
  rMf: number;
  stepUp: number; // % a year
  inflation: number; // %
  npsLumpPct: 60 | 80;
  annuityRate: number; // %
}

export function defaultEmployeeEpf(basic: number): number {
  return Math.round(basic * 0.12);
}

export function defaultEmployerEpf(basic: number): number {
  const eps = Math.min(basic, LIMITS.epfWageCeiling) * LIMITS.epsRate;
  return Math.max(0, Math.round(basic * 0.12 - eps));
}

export const DEFAULT_INPUTS: SavingsInputs = {
  mode: "same",
  regime: "new",
  slab: 30,
  retTax: 20,
  age: 30,
  retireAge: 60,
  basicMonthly: 50000,
  epfEmpMonthly: defaultEmployeeEpf(50000),
  epfErMonthly: defaultEmployerEpf(50000),
  other80C: 0,
  amountMonthly: 10000,
  employerNps: true,
  mfType: "equity",
  mix: { vpf: 0, ppf: 5000, npsOwn: 0, npsEmp: 0, mf: 10000 },
  rEpf: RATES.epf,
  rPpf: RATES.ppf,
  rNps: RATES.scenarios.mid.nps,
  rMf: RATES.scenarios.mid.mf,
  stepUp: 5,
  inflation: 6,
  npsLumpPct: 80,
  annuityRate: 6,
};

export interface ExitResult {
  exitTax: number;
  post: number;
  pension?: number; // monthly, before tax
  lumpSum?: number;
  annuityCorpus?: number;
}

export interface RouteResult {
  key: RouteKey;
  name: string;
  note: string;
  tags: string[];
  contributions: number[]; // invested per year
  values: number[]; // year-end value before exit tax
  postValues: number[]; // year-end value after exit tax, if withdrawn that year
  invested: number;
  firstMonth: number;
  value: number;
  exit: ExitResult;
  grossLost: number; // "same" mode: income tax paid before investing
}

export interface SavingsResult {
  years: number;
  routes: RouteResult[];
  baseline: { value: number; invested: number; values: number[] };
  warnings: string[];
  deflator: number; // divide future rupees by this for today's money
  premature: boolean;
  taxSavedYear1: number; // mix mode
  taxSavedTotal: number; // mix mode
  perqTaxYear1: number; // mix mode
}

const taxRate = (slabPct: number) => (slabPct / 100) * (1 + LIMITS.cess);
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const add = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] ?? 0));

// Interest worked out monthly, credited at year end (EPF, VPF, PPF).
function simYearlyCredit(contrib: number[], rate: number): number[] {
  let bal = 0;
  return contrib.map((c) => {
    let interest = 0;
    for (let m = 0; m < 12; m++) {
      bal += c / 12;
      interest += (bal * rate) / 12;
    }
    bal += interest;
    return bal;
  });
}

// Monthly compounding (NPS, mutual funds).
function simMonthly(contrib: number[], rate: number): number[] {
  const i = Math.pow(1 + rate, 1 / 12) - 1;
  let bal = 0;
  return contrib.map((c) => {
    for (let m = 0; m < 12; m++) bal = (bal + c / 12) * (1 + i);
    return bal;
  });
}

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function calculateSavings(inp: SavingsInputs): SavingsResult {
  const N = Math.max(1, inp.retireAge - inp.age);
  const t = taxRate(inp.slab);
  const tr = taxRate(inp.retTax);
  const old = inp.regime === "old";
  const step = inp.stepUp / 100;
  const rE = inp.rEpf / 100;
  const rP = inp.rPpf / 100;
  const rN = inp.rNps / 100;
  const rM = inp.rMf / 100;
  const premature = inp.retireAge < 60;
  const yrs = Array.from({ length: N }, (_, y) => y);
  const gf = yrs.map((y) => Math.pow(1 + step, y));
  const basicA = gf.map((f) => inp.basicMonthly * 12 * f);
  const empA = gf.map((f) => inp.epfEmpMonthly * 12 * f);
  const erA = gf.map((f) => inp.epfErMonthly * 12 * f);
  const other80C = old ? inp.other80C : 0;
  const room80C = yrs.map((y) => (old ? Math.max(0, LIMITS.sec80C - empA[y] - other80C) : 0));
  const npsPct = old ? LIMITS.npsEmployerPctOld : LIMITS.npsEmployerPctNew;
  const npsCap = yrs.map((y) => Math.min(basicA[y] * npsPct, Math.max(0, LIMITS.employerAggregate - erA[y])));
  const deflator = Math.pow(1 + inp.inflation / 100, N);
  const elss = inp.mfType === "elss";

  const exitNps = (V: number): ExitResult => {
    const lp = premature ? LIMITS.npsPrematureLump : inp.npsLumpPct / 100;
    const lumpSum = V * lp;
    const free = Math.min(lumpSum, LIMITS.npsTaxFreeShare * V);
    const lumpTax = (lumpSum - free) * tr;
    const annuityCorpus = V - lumpSum;
    return {
      exitTax: lumpTax + annuityCorpus * tr,
      post: V - lumpTax - annuityCorpus * tr,
      pension: (annuityCorpus * inp.annuityRate) / 100 / 12,
      lumpSum,
      annuityCorpus,
    };
  };
  const exitMf = (V: number, cost: number): ExitResult => {
    const gain = Math.max(0, V - cost);
    const tax = Math.max(0, gain - LIMITS.ltcgExempt) * LIMITS.ltcgRate * (1 + LIMITS.cess);
    return { exitTax: tax, post: V - tax };
  };
  const taxFree = (V: number): ExitResult => ({ exitTax: 0, post: V });

  const makeRoute = (
    key: RouteKey,
    name: string,
    contributions: number[],
    values: number[],
    note: string,
    tags: string[],
    grossLost = 0,
  ): RouteResult => {
    const exitFor = (v: number, cost: number) =>
      key === "npsOwn" || key === "npsEmp" ? exitNps(v) : key === "mf" ? exitMf(v, cost) : taxFree(v);
    let cost = 0;
    const postValues = values.map((v, i) => {
      cost += contributions[i];
      return exitFor(v, cost).post;
    });
    const value = values[N - 1];
    return {
      key,
      name,
      note,
      tags,
      contributions,
      values,
      postValues,
      invested: sum(contributions),
      firstMonth: contributions[0] / 12,
      value,
      exit: exitFor(value, sum(contributions)),
      grossLost,
    };
  };

  // Existing EPF (your share + employer share)
  const eTaxedBase = empA.map((x) => Math.max(0, x - LIMITS.epfInterestFree));
  const baseValues = add(
    add(simYearlyCredit(empA.map((x, i) => x - eTaxedBase[i]), rE), simYearlyCredit(eTaxedBase, rE * (1 - t))),
    simYearlyCredit(erA, rE),
  );
  const baseline = { value: baseValues[N - 1], invested: sum(empA) + sum(erA), values: baseValues };

  const warnings: string[] = [];
  if (premature)
    warnings.push(
      "You retire before 60, so NPS counts as an early exit: only 20% can be taken as a lump sum and at least 80% must buy a pension.",
    );
  if (N < 15)
    warnings.push(
      `PPF matures after 15 years. With ${N} years to retirement, only partial withdrawals would be possible before maturity.`,
    );

  const routes: RouteResult[] = [];
  let taxSavedYear1 = 0;
  let taxSavedTotal = 0;
  let perqTaxYear1 = 0;

  if (inp.mode === "same") {
    const G = gf.map((f) => inp.amountMonthly * 12 * f);
    const totalGross = sum(G);
    const afterTax = (g: number, ded: number) => ded + (g - ded) * (1 - t);

    // VPF
    {
      const inv: number[] = [];
      const normal: number[] = [];
      const taxed: number[] = [];
      yrs.forEach((y) => {
        const ded = old ? Math.min(G[y], room80C[y]) : 0;
        const i = afterTax(G[y], ded);
        const over = Math.max(0, empA[y] + i - LIMITS.epfInterestFree);
        const tx = Math.min(i, over);
        inv.push(i);
        taxed.push(tx);
        normal.push(i - tx);
      });
      const values = add(simYearlyCredit(normal, rE), simYearlyCredit(taxed, rE * (1 - t)));
      routes.push(
        makeRoute("vpf", "VPF", inv, values, "Extra money into your EPF account", ["Low risk", "Locked till retirement"], totalGross - sum(inv)),
      );
      if (sum(taxed) > 0.01 * sum(inv))
        warnings.push(
          "Your EPF plus VPF crosses ₹2.5 lakh a year, so interest on the extra is taxed every year. That lowers the VPF return.",
        );
    }
    // PPF
    {
      let capped = false;
      const inv = yrs.map((y) => {
        const ded = old ? Math.min(G[y], room80C[y]) : 0;
        let i = afterTax(G[y], ded);
        if (i > LIMITS.ppfMax) {
          capped = true;
          i = LIMITS.ppfMax;
        }
        return i;
      });
      routes.push(
        makeRoute("ppf", "PPF", inv, simYearlyCredit(inv, rP), "Government-backed, fully tax-free", ["Low risk", "15-year lock-in"], totalGross - sum(inv)),
      );
      if (capped)
        warnings.push("PPF allows only ₹1.5 lakh a year. Money above that can’t go into PPF, so the PPF figure is capped.");
    }
    // NPS (your contribution)
    {
      const inv = yrs.map((y) => afterTax(G[y], old ? Math.min(G[y], room80C[y] + LIMITS.nps1B) : 0));
      routes.push(
        makeRoute(
          "npsOwn",
          "NPS (your contribution)",
          inv,
          simMonthly(inv, rN),
          old ? "80C + extra ₹50,000 deduction" : "No deduction in the new regime",
          ["Market-linked", "Locked till 60"],
          totalGross - sum(inv),
        ),
      );
    }
    // NPS (through employer)
    if (inp.employerNps) {
      const inv = yrs.map((y) => afterTax(G[y], Math.min(G[y], npsCap[y])));
      routes.push(
        makeRoute(
          "npsEmp",
          "NPS (through employer)",
          inv,
          simMonthly(inv, rN),
          "Part of your CTC paid into NPS before tax",
          ["Market-linked", "Locked till 60"],
          totalGross - sum(inv),
        ),
      );
      if (G[0] > npsCap[0])
        warnings.push(
          `Employer NPS is tax-free only up to ${old ? "10%" : "14%"} of basic (${fmt(npsCap[0] / 12)} a month for you, within the ₹7.5 lakh employer cap). Anything above that is taxed as salary.`,
        );
    }
    // Mutual fund
    {
      const inv = yrs.map((y) => afterTax(G[y], old && elss ? Math.min(G[y], room80C[y]) : 0));
      routes.push(
        makeRoute(
          "mf",
          elss ? "ELSS mutual fund" : "Equity mutual fund",
          inv,
          simMonthly(inv, rM),
          elss ? (old ? "80C deduction, 3-year lock-in" : "No deduction in the new regime") : "Invested from take-home pay",
          ["Market-linked", elss ? "3-year lock-in" : "Withdraw any time"],
          totalGross - sum(inv),
        ),
      );
    }
    if (old && room80C[0] <= 0)
      warnings.push("Your EPF and other 80C items already use the full ₹1.5 lakh. Extra VPF, PPF or ELSS gets no deduction here.");
    if (!old && elss)
      warnings.push("ELSS gives a deduction only in the old regime. In the new regime it’s a regular equity fund with a 3-year lock-in.");
  } else {
    const m = inp.mix;
    const c: Record<keyof MixInputs, number[]> = { vpf: [], ppf: [], npsOwn: [], npsEmp: [], mf: [] };
    const vT: number[] = [];
    const vN: number[] = [];
    const eT: number[] = [];
    const eN: number[] = [];
    let ppfCap = false;
    let npsOver = false;
    let erOver = false;
    let over25 = false;
    yrs.forEach((y) => {
      const f = gf[y];
      const v = m.vpf * 12 * f;
      let p = m.ppf * 12 * f;
      if (p > LIMITS.ppfMax) {
        p = LIMITS.ppfMax;
        ppfCap = true;
      }
      const no = m.npsOwn * 12 * f;
      const ne = m.npsEmp * 12 * f;
      const mf = m.mf * 12 * f;
      c.vpf.push(v);
      c.ppf.push(p);
      c.npsOwn.push(no);
      c.npsEmp.push(ne);
      c.mf.push(mf);

      // Deductions share the 80C room in a fixed order: EPF, VPF, PPF, ELSS, then NPS.
      let room = old ? Math.max(0, LIMITS.sec80C - other80C) : 0;
      let ded = 0;
      const take = (x: number) => {
        const q = Math.min(x, room);
        room -= q;
        return q;
      };
      if (old) {
        ded += take(empA[y]);
        ded += take(v);
        ded += take(p);
        if (elss) ded += take(mf);
        const d1 = take(no);
        ded += d1 + Math.min(no - d1, LIMITS.nps1B);
      }
      const capE = Math.min(basicA[y] * npsPct, Math.max(0, LIMITS.employerAggregate - erA[y]));
      const dE = Math.min(ne, capE);
      if (ne > capE) npsOver = true;
      if (erA[y] + ne > LIMITS.employerAggregate) erOver = true;
      const saved = (ded + dE) * t;
      const perq = (ne - dE) * t;
      taxSavedTotal += saved;
      if (y === 0) {
        taxSavedYear1 = saved;
        perqTaxYear1 = perq;
      }

      // ₹2.5 lakh rule on your EPF + VPF, attributed to VPF first.
      const over = Math.max(0, empA[y] + v - LIMITS.epfInterestFree);
      if (over > 0) over25 = true;
      const vt = Math.min(v, over);
      const et = Math.min(empA[y], over - vt);
      vT.push(vt);
      vN.push(v - vt);
      eT.push(et);
      eN.push(empA[y] - et);
    });

    routes.push(
      makeRoute("epfEmp", "EPF (your share)", empA, add(simYearlyCredit(eN, rE), simYearlyCredit(eT, rE * (1 - t))), "12% of basic from your salary", ["Low risk"]),
    );
    routes.push(makeRoute("epfEr", "EPF (employer share)", erA, simYearlyCredit(erA, rE), "Paid by your employer, tax-free", ["Low risk"]));
    if (sum(c.vpf) > 0)
      routes.push(makeRoute("vpf", "VPF", c.vpf, add(simYearlyCredit(vN, rE), simYearlyCredit(vT, rE * (1 - t))), "Extra into your EPF account", ["Low risk"]));
    if (sum(c.ppf) > 0) routes.push(makeRoute("ppf", "PPF", c.ppf, simYearlyCredit(c.ppf, rP), "Tax-free", ["15-year lock-in"]));
    if (sum(c.npsOwn) > 0)
      routes.push(makeRoute("npsOwn", "NPS (yours)", c.npsOwn, simMonthly(c.npsOwn, rN), "Your own contribution", ["Market-linked"]));
    if (sum(c.npsEmp) > 0)
      routes.push(makeRoute("npsEmp", "NPS (employer)", c.npsEmp, simMonthly(c.npsEmp, rN), "Through your CTC", ["Market-linked"]));
    if (sum(c.mf) > 0)
      routes.push(makeRoute("mf", elss ? "ELSS mutual fund" : "Equity mutual fund", c.mf, simMonthly(c.mf, rM), "SIP from take-home pay", ["Market-linked"]));

    if (ppfCap) warnings.push("PPF allows only ₹1.5 lakh a year (₹12,500 a month). We capped your PPF at that limit.");
    if (npsOver) warnings.push(`Employer NPS above ${old ? "10%" : "14%"} of basic is taxed as salary. We’ve counted that tax.`);
    if (erOver) warnings.push("Employer EPF + NPS crosses ₹7.5 lakh a year. The extra is a taxable perquisite.");
    if (over25) warnings.push("Your EPF plus VPF crosses ₹2.5 lakh a year, so interest on the extra is taxed every year.");
    if (!old && (m.npsOwn > 0 || m.vpf > 0 || m.ppf > 0))
      warnings.push("In the new regime, your own EPF, VPF, PPF and NPS contributions get no deduction. Only employer NPS lowers your tax.");
  }

  return { years: N, routes, baseline, warnings, deflator, premature, taxSavedYear1, taxSavedTotal, perqTaxYear1 };
}

// Tax-efficiency order for the explainer list. Looks at tax only; not investment advice.
export function fillOrder(regime: Regime, employerNps: boolean): string[] {
  return regime === "new"
    ? [
        employerNps
          ? "Employer NPS, up to 14% of basic – the only deduction left in the new regime. Ask HR if your CTC can be restructured."
          : "Ask HR whether employer NPS is available. It’s the only deduction left in the new regime.",
        "VPF, up to the point where your EPF + VPF reaches ₹2.5 lakh a year. The interest stays tax-free and fixed.",
        "PPF, up to ₹1.5 lakh a year, if you want another fully tax-free, fixed-rate bucket.",
        "Mutual funds for everything above that – no limits, and you can withdraw when you need to.",
      ]
    : [
        "Employer NPS, up to 10% of basic, if your employer offers it.",
        "Fill the ₹1.5 lakh 80C limit. Your EPF already uses part of it. Top up with VPF, PPF or ELSS.",
        "Your own NPS, up to ₹50,000 a year, for the extra 80CCD(1B) deduction.",
        "Beyond that, compare VPF (until EPF + VPF reaches ₹2.5 lakh) and mutual funds.",
      ];
}
