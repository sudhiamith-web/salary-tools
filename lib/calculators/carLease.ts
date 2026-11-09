// Car Lease Tax Benefit, End-of-Lease Buy-back, and Buy vs Lease (cash / loan / lease).
// Pure logic, no React. Rules verified November 2026 for FY 2026-27.
//
// Sources:
// - Income-tax Rules, 2026 (notified by CBDT on 20 March 2026, in force from 1 April 2026),
//   Rule 15: motor car perquisite values. EVs fall in the "up to 1.6 litres" band.
//   KPMG GMS Flash Alert 2026-081 (30 March 2026) summarises the old vs new values.
// - Rule 15: transfer of an employer-owned car valued at cost less 20% a year on a reducing
//   balance for each completed year of use, less the price paid by the employee.
// - Specified-employee salary threshold ₹4 lakh (CBDT Notification 133/2025).
// - FY 2026-27 slabs: unchanged by Budget 2026. New regime: ₹75,000 standard deduction,
//   87A rebate up to ₹12 lakh taxable income with marginal relief. Old regime: ₹50,000
//   standard deduction, 87A rebate up to ₹5 lakh. Cess 4%. Surcharge not modelled (salary ≤ ₹50 lakh).
// Re-verify after every Union Budget and any amendment to Rule 15.

export type Regime = "new" | "old";
export type LeaseType = "company" | "companyEmp" | "own";
export type Usage = "official" | "mixed" | "personal";
export type Engine = "small" | "large"; // small = up to 1.6L or EV
export type Owner = "employer" | "lessor";
export type OptionKey = "cash" | "loan" | "lease";

export interface PerqRates {
  companySmall: number; // employer car, employer pays running (monthly)
  companyLarge: number;
  empPaysSmall: number; // employer car, employee pays running for personal use
  empPaysLarge: number;
  chauffeur: number;
}

export const RULE15_RATES: PerqRates = {
  companySmall: 5000,
  companyLarge: 7000,
  empPaysSmall: 2000,
  empPaysLarge: 3000,
  chauffeur: 3000,
};

// Income-tax Rules, 1962 (Rule 3), used only for the "what changed" comparison.
export const RULE3_OLD_RATES: PerqRates = {
  companySmall: 1800,
  companyLarge: 2400,
  empPaysSmall: 600,
  empPaysLarge: 900,
  chauffeur: 900,
};

export const LIMITS = {
  cess: 0.04,
  stdNew: 75000,
  stdOld: 50000,
  rebateNew: 1200000,
  rebateOld: 500000,
  transferDepreciation: 0.2,
  specifiedEmployee: 400000,
  maxSalary: 5000000, // surcharge starts above ₹50 lakh; not modelled
} as const;

const NEW_SLABS: [number, number][] = [
  [400000, 0], [800000, 0.05], [1200000, 0.1], [1600000, 0.15], [2000000, 0.2], [2400000, 0.25], [Infinity, 0.3],
];
const OLD_SLABS: [number, number][] = [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]];

function slabTax(ti: number, slabs: [number, number][]): number {
  let t = 0;
  let prev = 0;
  for (const [lim, r] of slabs) {
    if (ti > prev) t += (Math.min(ti, lim) - prev) * r;
    prev = lim;
  }
  return t;
}

/** Annual income tax incl. cess on gross salary (only the standard deduction is applied). */
export function incomeTax(gross: number, regime: Regime): number {
  if (regime === "new") {
    const ti = Math.max(0, gross - LIMITS.stdNew);
    if (ti <= LIMITS.rebateNew) return 0;
    const base = Math.min(slabTax(ti, NEW_SLABS), ti - LIMITS.rebateNew); // marginal relief
    return Math.round(base * (1 + LIMITS.cess));
  }
  const ti = Math.max(0, gross - LIMITS.stdOld);
  if (ti <= LIMITS.rebateOld) return 0;
  return Math.round(slabTax(ti, OLD_SLABS) * (1 + LIMITS.cess));
}

// ---------------------------------------------------------------------------
// Inputs shared by all three tabs
// ---------------------------------------------------------------------------

export interface CarLeaseInputs {
  // Tab 1
  leaseType: LeaseType;
  usage: Usage;
  engine: Engine;
  chauffeur: boolean;
  rentMonthly: number; // lease rental
  runMonthly: number; // fuel and upkeep
  driverMonthly: number;
  tenureMonths: number;
  salary: number; // annual gross, excluding employer PF
  regime: Regime;
  // Tab 2
  owner: Owner;
  carCost: number; // on-road price
  completedYears: number;
  buyPrice: number;
  // Tab 3
  resalePct: number;
  downPct: number;
  loanRate: number; // % a year
  loanMonths: number;
  leaseOffered: boolean;
  buyAtEnd: boolean;
  oppReturn: number; // % a year
}

export const DEFAULT_INPUTS: CarLeaseInputs = {
  leaseType: "company",
  usage: "mixed",
  engine: "small",
  chauffeur: false,
  rentMonthly: 32000,
  runMonthly: 10000,
  driverMonthly: 20000,
  tenureMonths: 36,
  salary: 3000000,
  regime: "new",
  owner: "employer",
  carCost: 1500000,
  completedYears: 3,
  buyPrice: 300000,
  resalePct: 55,
  downPct: 20,
  loanRate: 9,
  loanMonths: 36,
  leaseOffered: true,
  buyAtEnd: false,
  oppReturn: 7,
};

// ---------------------------------------------------------------------------
// Tab 1: tax saving
// ---------------------------------------------------------------------------

export interface TaxSavingResult {
  restructured: number; // moved out of taxable cash salary, a year
  perquisite: number; // added back as perquisite, a year
  taxBefore: number;
  taxAfter: number;
  saving: number; // a year
  taxableAfter: number; // gross salary after restructuring + perquisite
}

export interface TaxSavingArgs {
  leaseType: LeaseType;
  usage: Usage;
  engine: Engine;
  chauffeur: boolean;
  rentMonthly: number;
  runMonthly: number;
  driverMonthly: number;
  salary: number;
  regime: Regime;
}

export function annualPerquisite(a: TaxSavingArgs, restructured: number, rates: PerqRates = RULE15_RATES): number {
  if (a.usage === "official") return 0;
  if (a.usage === "personal") return restructured; // full cost to employer, nothing recovered
  const big = a.engine === "large";
  const ch = a.chauffeur ? rates.chauffeur : 0;
  if (a.leaseType === "company") return ((big ? rates.companyLarge : rates.companySmall) + ch) * 12;
  if (a.leaseType === "companyEmp") return ((big ? rates.empPaysLarge : rates.empPaysSmall) + ch) * 12;
  // Own car, employer reimburses: reimbursement less the deemed official-use amount.
  return Math.max(0, restructured - ((big ? rates.companyLarge : rates.companySmall) + ch) * 12);
}

export function restructuredAmount(a: TaxSavingArgs): number {
  const L = a.leaseType === "own" ? 0 : a.rentMonthly * 12;
  const R = a.leaseType === "companyEmp" ? 0 : a.runMonthly * 12;
  const C = a.chauffeur ? a.driverMonthly * 12 : 0;
  return L + R + C;
}

export function calculateTaxSaving(a: TaxSavingArgs, rates: PerqRates = RULE15_RATES): TaxSavingResult {
  const restructured = Math.min(restructuredAmount(a), a.salary);
  const perquisite = annualPerquisite(a, restructured, rates);
  const taxableAfter = Math.max(0, a.salary - restructured + perquisite);
  const taxBefore = incomeTax(a.salary, a.regime);
  const taxAfter = incomeTax(taxableAfter, a.regime);
  return { restructured, perquisite, taxBefore, taxAfter, saving: Math.max(0, taxBefore - taxAfter), taxableAfter };
}

export function usageComparison(a: TaxSavingArgs): { usage: Usage; saving: number }[] {
  return (["official", "mixed", "personal"] as Usage[]).map((usage) => ({
    usage,
    saving: calculateTaxSaving({ ...a, usage }).saving,
  }));
}

// ---------------------------------------------------------------------------
// Tab 2: buying the car at the end of the lease
// ---------------------------------------------------------------------------

export interface BuyBackResult {
  schedule: { year: number; depreciation: number; value: number }[];
  depreciatedValue: number;
  perquisite: number;
  extraTax: number;
  leaseSavingTotal: number; // Tab 1 saving × completed years
  netSaving: number;
}

/** Tax on the transfer, given the salary already in the tax computation that year. */
export function buyBackTax(owner: Owner, carCost: number, years: number, price: number, taxableSalary: number, regime: Regime) {
  let v = carCost;
  const schedule: BuyBackResult["schedule"] = [];
  for (let y = 1; y <= years; y++) {
    const d = v * LIMITS.transferDepreciation;
    v -= d;
    schedule.push({ year: y, depreciation: d, value: v });
  }
  const perquisite = owner === "employer" ? Math.max(0, v - price) : 0;
  const extraTax = incomeTax(taxableSalary + perquisite, regime) - incomeTax(taxableSalary, regime);
  return { schedule, depreciatedValue: v, perquisite, extraTax };
}

export function calculateBuyBack(inp: CarLeaseInputs): BuyBackResult {
  const t1 = calculateTaxSaving(inp);
  const b = buyBackTax(inp.owner, inp.carCost, inp.completedYears, Math.min(inp.buyPrice, inp.carCost), t1.taxableAfter, inp.regime);
  const leaseSavingTotal = t1.saving * inp.completedYears;
  return { ...b, leaseSavingTotal, netSaving: leaseSavingTotal - b.extraTax };
}

// ---------------------------------------------------------------------------
// Tab 3: buy with cash, buy with a loan, or company lease
// ---------------------------------------------------------------------------

export function emi(principal: number, ratePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = ratePct / 1200;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export interface OptionResult {
  key: OptionKey;
  netCost: number; // adjusted for the return your money could earn
  plainCost: number; // simple total, no return adjustment
  returnForgone: number;
  upfront: number;
  monthlyOutflow: number; // total of monthly payments over the period
  interest: number;
  taxSaved: number;
  buyBack: number; // lease: buy-back price + tax on it
  endValue: number; // resale value credited (0 if the car is returned)
}

export interface BuyVsLeaseResult {
  months: number;
  options: OptionResult[];
  ranked: OptionKey[];
  emi: number;
  downPayment: number;
  resale: number;
  leaseSavingYear: number;
  leaseBuyBackTax: number;
  breakEvenReturn: number | null; // % a year at which cash and loan cost the same
}

/** The lease option in Tab 3 uses Tab 1's usage, engine and lease type, without a chauffeur. */
function leaseArgs(inp: CarLeaseInputs): TaxSavingArgs {
  return { ...inp, leaseType: inp.leaseType === "own" ? "company" : inp.leaseType, chauffeur: false };
}

function compare(inp: CarLeaseInputs, oppPct: number): BuyVsLeaseResult {
  const n = inp.tenureMonths;
  const rm = oppPct / 1200;
  const fv = (amt: number, t: number) => amt * Math.pow(1 + rm, n - t);
  const resale = (inp.carCost * inp.resalePct) / 100;

  // Cash
  let cash = fv(inp.carCost, 0);
  for (let t = 1; t <= n; t++) cash += fv(inp.runMonthly, t);
  cash -= resale;
  const cashPlain = inp.carCost + inp.runMonthly * n - resale;

  // Loan (any balance still owed at the end is paid off from the resale)
  const down = (inp.carCost * inp.downPct) / 100;
  const P = inp.carCost - down;
  const e = emi(P, inp.loanRate, inp.loanMonths);
  const k = Math.min(n, inp.loanMonths);
  const r = inp.loanRate / 1200;
  const bal = inp.loanMonths > n && r > 0 ? P * Math.pow(1 + r, k) - (e * (Math.pow(1 + r, k) - 1)) / r : inp.loanMonths > n ? P - e * k : 0;
  let loan = fv(down, 0);
  for (let t = 1; t <= n; t++) loan += fv(inp.runMonthly + (t <= inp.loanMonths ? e : 0), t);
  loan += bal - resale;
  const loanPlain = down + e * k + bal + inp.runMonthly * n - resale;
  const interest = Math.max(0, e * k + bal - P);

  // Company lease: take-home falls by the restructured amount and rises by the tax saved.
  const la = leaseArgs(inp);
  const t1 = calculateTaxSaving(la);
  const ownRunning = la.leaseType === "companyEmp" ? inp.runMonthly : 0; // paid from take-home
  const monthlyLease = t1.restructured / 12 + ownRunning - t1.saving / 12;
  let lease = 0;
  for (let t = 1; t <= n; t++) lease += fv(monthlyLease, t);
  let leasePlain = monthlyLease * n;
  let bbPrice = 0;
  let bbTax = 0;
  if (inp.buyAtEnd) {
    bbPrice = Math.min(inp.buyPrice, inp.carCost);
    bbTax = buyBackTax(inp.owner, inp.carCost, Math.floor(n / 12), bbPrice, t1.taxableAfter, inp.regime).extraTax;
    lease += bbPrice + bbTax - resale;
    leasePlain += bbPrice + bbTax - resale;
  }

  const options: OptionResult[] = [
    { key: "cash", netCost: cash, plainCost: cashPlain, returnForgone: cash - cashPlain, upfront: inp.carCost, monthlyOutflow: inp.runMonthly * n, interest: 0, taxSaved: 0, buyBack: 0, endValue: resale },
    { key: "loan", netCost: loan, plainCost: loanPlain, returnForgone: loan - loanPlain, upfront: down, monthlyOutflow: e * k + inp.runMonthly * n, interest, taxSaved: 0, buyBack: 0, endValue: resale },
  ];
  if (inp.leaseOffered)
    options.push({
      key: "lease",
      netCost: lease,
      plainCost: leasePlain,
      returnForgone: lease - leasePlain,
      upfront: 0,
      monthlyOutflow: (t1.restructured / 12 + ownRunning) * n,
      interest: 0,
      taxSaved: (t1.saving * n) / 12,
      buyBack: bbPrice + bbTax,
      endValue: inp.buyAtEnd ? resale : 0,
    });

  const ranked = [...options].sort((a, b) => a.netCost - b.netCost).map((o) => o.key);
  return { months: n, options, ranked, emi: e, downPayment: down, resale, leaseSavingYear: t1.saving, leaseBuyBackTax: bbTax, breakEvenReturn: null };
}

export function calculateBuyVsLease(inp: CarLeaseInputs): BuyVsLeaseResult {
  const res = compare(inp, inp.oppReturn);
  const diff = (r: number) => {
    const o = compare(inp, r).options;
    return o[0].netCost - o[1].netCost; // cash − loan
  };
  let lo = 0;
  let hi = 30;
  if (diff(lo) * diff(hi) < 0) {
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (diff(lo) * diff(mid) <= 0) hi = mid;
      else lo = mid;
    }
    res.breakEvenReturn = (lo + hi) / 2;
  }
  return res;
}

export const OPTION_NAMES: Record<OptionKey, string> = { cash: "Pay full cash", loan: "Car loan", lease: "Company lease" };
