// Labour Code salary structure check: Code on Wages, 2019, section 2(y)
// (mirrored in Code on Social Security, 2020, section 2(88)).
//
// "Wages" = all remuneration, including basic pay, DA and retaining allowance,
// minus eleven exclusions, clauses (a)–(k). First proviso: if the payments under
// clauses (a) to (i) exceed one-half of all remuneration, the excess is deemed
// wages and added back. Clauses (j) gratuity and (k) retrenchment compensation
// sit outside that test.
//
// Interpretation note: allowances not named in the exclusion list (e.g. special
// allowance) are treated as wages by default. Users can re-tag any component.
// Verified November 2026. Re-check if the Central Government notifies a
// percentage other than 50%.

export const WAGE_TEST_SHARE = 0.5;
export const EPF_WAGE_CEILING = 25000; // Gazette S.O. 5109(E), 17 Sep 2026
export const PF_RATE = 0.12;
export const GRATUITY_DAYS = 15;
export const GRATUITY_DIVISOR = 26;

export type ComponentKind =
  | "basic"
  | "da"
  | "retaining"
  | "otherWage"
  | "bonus"
  | "amenity"
  | "employerContribution"
  | "conveyance"
  | "specialExpenses"
  | "hra"
  | "award"
  | "overtime"
  | "commission"
  | "gratuity"
  | "retrenchment";

interface KindInfo {
  label: string;
  clause: string;
  wages: boolean; // counts as wages as structured
  inTest: boolean; // part of the clause (a)–(i) pool for the 50% test
}

export const KINDS: Record<ComponentKind, KindInfo> = {
  basic: { label: "Basic pay", clause: "Included", wages: true, inTest: false },
  da: { label: "Dearness allowance", clause: "Included", wages: true, inTest: false },
  retaining: { label: "Retaining allowance", clause: "Included", wages: true, inTest: false },
  otherWage: { label: "Other allowance (e.g. special)", clause: "Not excluded", wages: true, inTest: false },
  bonus: { label: "Statutory bonus", clause: "Excl. (a)", wages: false, inTest: true },
  amenity: { label: "Accommodation, utilities, medical", clause: "Excl. (b)", wages: false, inTest: true },
  employerContribution: { label: "Employer PF / pension contribution", clause: "Excl. (c)", wages: false, inTest: true },
  conveyance: { label: "Conveyance / travel concession (incl. LTA)", clause: "Excl. (d)", wages: false, inTest: true },
  specialExpenses: { label: "Reimbursement of job expenses", clause: "Excl. (e)", wages: false, inTest: true },
  hra: { label: "House rent allowance", clause: "Excl. (f)", wages: false, inTest: true },
  award: { label: "Paid under an award or settlement", clause: "Excl. (g)", wages: false, inTest: true },
  overtime: { label: "Overtime allowance", clause: "Excl. (h)", wages: false, inTest: true },
  commission: { label: "Commission", clause: "Excl. (i)", wages: false, inTest: true },
  gratuity: { label: "Gratuity", clause: "Excl. (j), outside test", wages: false, inTest: false },
  retrenchment: { label: "Retrenchment compensation / ex gratia", clause: "Excl. (k), outside test", wages: false, inTest: false },
};

const MOVE_ORDER: ComponentKind[] = ["conveyance", "specialExpenses", "amenity", "award", "commission", "overtime", "bonus", "hra"];

export interface PayComponent {
  id: string;
  name: string;
  kind: ComponentKind;
  amount: number; // monthly
}

export type PfBasis = "ceiling" | "full";

export interface StructureResult {
  totalRemuneration: number;
  wagesStructured: number;
  exclusionsInTest: number;
  allowedExclusions: number;
  addBack: number;
  wagesForLaw: number;
  wageShare: number;
  compliant: boolean;
  gratuityPerYearNow: number;
  gratuityPerYearLaw: number;
  pfWageNow: number;
  pfWageLaw: number;
  employeePfNow: number;
  employeePfLaw: number;
  takeHomeChange: number; // monthly, negative = lower take-home
  suggestion: { from: string; amount: number; components: PayComponent[] } | null;
}

export function checkStructure(components: PayComponent[], pfBasis: PfBasis): StructureResult {
  const amt = (c: PayComponent) => (Number.isFinite(c.amount) ? Math.max(0, c.amount) : 0);
  const counted = components.filter((c) => KINDS[c.kind].wages || KINDS[c.kind].inTest);
  const totalRemuneration = counted.reduce((s, c) => s + amt(c), 0);
  const wagesStructured = components.filter((c) => KINDS[c.kind].wages).reduce((s, c) => s + amt(c), 0);
  const exclusionsInTest = components.filter((c) => KINDS[c.kind].inTest).reduce((s, c) => s + amt(c), 0);
  const allowedExclusions = totalRemuneration * WAGE_TEST_SHARE;
  const addBack = Math.max(0, exclusionsInTest - allowedExclusions);
  const wagesForLaw = wagesStructured + addBack;
  const pfWage = (w: number) => (pfBasis === "ceiling" ? Math.min(w, EPF_WAGE_CEILING) : w);
  const pfWageNow = pfWage(wagesStructured);
  const pfWageLaw = pfWage(wagesForLaw);

  // Suggested fix: move the add-back into basic pay, taking it first from
  // conveyance/travel and other allowances, and from HRA last (HRA carries a
  // tax exemption in the old regime). The employer contribution is never moved.
  let suggestion: StructureResult["suggestion"] = null;
  if (addBack > 0.5) {
    const movable = components
      .filter((c) => KINDS[c.kind].inTest && c.kind !== "employerContribution" && amt(c) > 0)
      .sort((a, b) => MOVE_ORDER.indexOf(a.kind) - MOVE_ORDER.indexOf(b.kind) || amt(b) - amt(a));
    if (movable.length) {
      let left = Math.ceil(addBack);
      const next = components.map((c) => ({ ...c }));
      const names: string[] = [];
      for (const m of movable) {
        if (left <= 0) break;
        const take = Math.min(left, amt(m));
        const target = next.find((c) => c.id === m.id)!;
        target.amount = amt(m) - take;
        left -= take;
        names.push(m.name);
      }
      const basic = next.find((c) => c.kind === "basic");
      const moved = Math.ceil(addBack) - left;
      if (basic) basic.amount = amt(basic) + moved;
      else next.unshift({ id: "basic-new", name: "Basic pay", kind: "basic", amount: moved });
      suggestion = { from: names.join(" and "), amount: moved, components: next };
    }
  }

  return {
    totalRemuneration,
    wagesStructured,
    exclusionsInTest,
    allowedExclusions,
    addBack,
    wagesForLaw,
    wageShare: totalRemuneration > 0 ? wagesStructured / totalRemuneration : 0,
    compliant: addBack <= 0.5,
    gratuityPerYearNow: (wagesStructured * GRATUITY_DAYS) / GRATUITY_DIVISOR,
    gratuityPerYearLaw: (wagesForLaw * GRATUITY_DAYS) / GRATUITY_DIVISOR,
    pfWageNow,
    pfWageLaw,
    employeePfNow: pfWageNow * PF_RATE,
    employeePfLaw: pfWageLaw * PF_RATE,
    takeHomeChange: -(pfWageLaw - pfWageNow) * PF_RATE,
    suggestion,
  };
}

export const DEFAULT_COMPONENTS: PayComponent[] = [
  { id: "c1", name: "Basic + DA", kind: "basic", amount: 30000 },
  { id: "c2", name: "HRA", kind: "hra", amount: 20000 },
  { id: "c3", name: "Conveyance", kind: "conveyance", amount: 15000 },
  { id: "c4", name: "LTA", kind: "conveyance", amount: 5000 },
];

// ---- bulk CSV ----
// One column per clause group. All amounts monthly.
export const BULK_HEADERS = [
  "employee_id",
  "basic_da",
  "other_wage_allowances",
  "hra",
  "conveyance_travel",
  "employer_pf_pension",
  "statutory_bonus",
  "overtime",
  "commission",
  "other_exclusions",
];
export const BULK_SAMPLE = [
  ["EMP-001", "30000", "0", "20000", "20000", "0", "0", "0", "0", "0"],
  ["EMP-002", "28000", "10000", "11200", "2800", "0", "0", "0", "0", "0"],
];
const BULK_KIND: Record<string, ComponentKind> = {
  basic_da: "basic",
  other_wage_allowances: "otherWage",
  hra: "hra",
  conveyance_travel: "conveyance",
  employer_pf_pension: "employerContribution",
  statutory_bonus: "bonus",
  overtime: "overtime",
  commission: "commission",
  other_exclusions: "amenity",
};

export function bulkRowToComponents(row: Record<string, string>, toNumber: (s: string | undefined) => number): PayComponent[] | string {
  const out: PayComponent[] = [];
  for (const [col, kind] of Object.entries(BULK_KIND)) {
    const raw = row[col];
    if (raw === undefined || raw === "") continue;
    const n = toNumber(raw);
    if (!Number.isFinite(n) || n < 0) return `“${col}” isn’t a valid amount (“${raw}”)`;
    out.push({ id: col, name: col, kind, amount: n });
  }
  if (!out.some((c) => c.kind === "basic" && c.amount > 0)) return "basic_da is empty";
  return out;
}
