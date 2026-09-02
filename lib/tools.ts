export interface ToolMeta {
  slug: string;
  name: string;
  shortDesc: string;
  category: "Salary & Tax";
}

// Only LIVE tools belong here. Unbuilt/planned tools are tracked
// internally (roadmap), never shown to visitors as placeholders.
export const tools: ToolMeta[] = [
  {
    slug: "in-hand-salary-calculator",
    name: "In-Hand Salary Calculator",
    shortDesc: "Turn your CTC into a real monthly payslip breakup.",
    category: "Salary & Tax",
  },
  {
    slug: "hra-exemption-calculator",
    name: "HRA Exemption Calculator",
    shortDesc: "How much of your HRA is actually tax-free.",
    category: "Salary & Tax",
  },
  {
    slug: "old-vs-new-regime-calculator",
    name: "Old vs New Tax Regime Calculator",
    shortDesc: "See your exact tax under both regimes, side by side.",
    category: "Salary & Tax",
  },
  {
    slug: "gratuity-calculator",
    name: "Gratuity Calculator",
    shortDesc: "What you're owed after 1-5+ years of service.",
    category: "Salary & Tax",
  },
  {
    slug: "advance-tax-calculator",
    name: "Advance Tax Calculator",
    shortDesc: "Check your quarterly installments and 234B/234C penalties.",
    category: "Salary & Tax",
  },
  {
    slug: "tds-calculator",
    name: "TDS on Salary Calculator",
    shortDesc: "Estimate monthly TDS withheld from your salary.",
    category: "Salary & Tax",
  },
  {
    slug: "section-80c-planner",
    name: "Section 80C Tax Planner",
    shortDesc: "Track your ₹1.5L limit and see real tax saved.",
    category: "Salary & Tax",
  },
  {
    slug: "section-80d-calculator",
    name: "Section 80D Health Insurance Calculator",
    shortDesc: "Self/family and parents brackets, tax saved.",
    category: "Salary & Tax",
  },
  {
    slug: "ltcg-calculator",
    name: "LTCG Calculator",
    shortDesc: "Long-term capital gains tax on equity, 12.5%.",
    category: "Salary & Tax",
  },
  {
    slug: "stcg-calculator",
    name: "STCG Calculator",
    shortDesc: "Short-term capital gains tax on equity, 20%.",
    category: "Salary & Tax",
  },
  {
    slug: "freelancer-tax-calculator",
    name: "Freelancer Tax Calculator (44ADA)",
    shortDesc: "Presumptive taxation for specified professionals.",
    category: "Salary & Tax",
  },
  {
    slug: "salary-vs-freelance-calculator",
    name: "Salary vs Freelance Tax Comparison",
    shortDesc: "Same amount, salaried CTC vs freelance take-home.",
    category: "Salary & Tax",
  },
  {
    slug: "property-capital-gains-calculator",
    name: "Property Capital Gains Tax Calculator",
    shortDesc: "Grandfathering choice, indexation, Section 54/54EC.",
    category: "Salary & Tax",
  },
  {
    slug: "esop-tax-calculator",
    name: "ESOP Tax Calculator",
    shortDesc: "Exercise perquisite plus capital gains at sale.",
    category: "Salary & Tax",
  },
  {
    slug: "salary-capital-gains-calculator",
    name: "Salary + Capital Gains Tax Calculator",
    shortDesc: "Combined tax across salary and equity gains.",
    category: "Salary & Tax",
  },
  {
    slug: "rsu-tax-calculator",
    name: "US Stocks & RSU Tax Calculator",
    shortDesc: "Foreign RSU vesting, forex rules, Schedule FA.",
    category: "Salary & Tax",
  },
];

export function relatedTools(currentSlug: string, count = 3): ToolMeta[] {
  return tools.filter((t) => t.slug !== currentSlug).slice(0, count);
}
