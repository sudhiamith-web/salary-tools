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
    slug: "tds-calculator",
    name: "TDS on Salary Calculator",
    shortDesc: "Estimate monthly TDS withheld from your salary.",
    category: "Salary & Tax",
  },
];

export function relatedTools(currentSlug: string, count = 3): ToolMeta[] {
  return tools.filter((t) => t.slug !== currentSlug).slice(0, count);
}
