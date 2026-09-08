import { ImprovementEntry } from "@/lib/calculators/property";

export default function ImprovementsInput({
  improvements,
  onChange,
  years,
}: {
  improvements: ImprovementEntry[];
  onChange: (next: ImprovementEntry[]) => void;
  years: string[];
}) {
  function add() {
    onChange([...improvements, { year: years[0], cost: 0 }]);
  }
  function update(index: number, field: "year" | "cost", value: string | number) {
    onChange(improvements.map((imp, i) => (i === index ? { ...imp, [field]: value } : imp)));
  }
  function remove(index: number) {
    onChange(improvements.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-ink">Cost of improvement (optional)</span>
        <button onClick={add} type="button" className="text-xs text-accent font-medium">
          + Add improvement
        </button>
      </div>
      <p className="text-xs text-charcoal/50 mb-2">
        Each renovation/addition is indexed from its OWN year, not your
        purchase year — add one entry per improvement.
      </p>
      {improvements.map((imp, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <select
            value={imp.year}
            onChange={(e) => update(i, "year", e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-ink"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <input
            type="number"
            value={imp.cost}
            step={10000}
            onChange={(e) => update(i, "cost", Number(e.target.value))}
            placeholder="Cost (₹)"
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-ink"
          />
          <button onClick={() => remove(i)} type="button" className="text-xs text-rust" aria-label="Remove">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
