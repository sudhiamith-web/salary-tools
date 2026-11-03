"use client";

// Year-by-year growth, before or after exit tax.

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RouteResult } from "@/lib/calculators/savingsCompare";
import { ROUTE_COLORS, rupeesShort } from "./format";

interface Props {
  routes: RouteResult[];
  baseline?: number[];
  startAge: number;
  afterTax: boolean;
  inflation: number; // % — 0 shows future rupees
}

export default function GrowthChart({ routes, baseline, startAge, afterTax, inflation }: Props) {
  const years = routes[0]?.values.length ?? 0;
  const deflate = (v: number, i: number) => (inflation > 0 ? v / Math.pow(1 + inflation / 100, i + 1) : v);
  const data = Array.from({ length: years }, (_, i) => {
    const row: Record<string, number> = { age: startAge + i + 1 };
    routes.forEach((r) => {
      row[r.key] = Math.round(deflate(afterTax ? r.postValues[i] : r.values[i], i));
    });
    if (baseline) row.baseline = Math.round(deflate(baseline[i], i));
    return row;
  });
  const names: Record<string, string> = Object.fromEntries(routes.map((r) => [r.key, r.name]));
  names.baseline = "Existing EPF";

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: "#CBD5E1" }} />
          <YAxis tickFormatter={(v: number) => rupeesShort(v)} tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} width={78} />
          <Tooltip
            formatter={(value: number, key: string) => [rupeesShort(value), names[key] ?? key]}
            labelFormatter={(age: number) => `Age ${age}`}
            contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 13 }}
          />
          <Legend formatter={(key: string) => names[key] ?? key} wrapperStyle={{ fontSize: 13 }} iconType="plainline" />
          {routes.map((r) => (
            <Line key={r.key} type="monotone" dataKey={r.key} stroke={ROUTE_COLORS[r.key]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          ))}
          {baseline && <Line type="monotone" dataKey="baseline" stroke="#94A3B8" strokeDasharray="5 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
