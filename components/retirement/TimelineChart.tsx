"use client";

// Stacked area chart: how EPF, NPS and accrued gratuity build up by age.

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimelinePoint } from "@/lib/calculators/retirementBenefits";
import { rupees, rupeesShort } from "./format";

export function TimelineChart({
  data,
  deflator,
  todaysValue,
  yearsToRetirement,
}: {
  data: TimelinePoint[];
  deflator: number;
  todaysValue: boolean;
  yearsToRetirement: number;
}) {
  // When showing today's value, deflate each year by inflation up to that year.
  const annualInflation =
    yearsToRetirement > 0 ? Math.pow(deflator, 1 / yearsToRetirement) - 1 : 0;
  const startAge = data[0]?.age ?? 0;
  const rows = data.map((p) => {
    const factor = todaysValue ? Math.pow(1 + annualInflation, p.age - startAge) : 1;
    return {
      age: p.age,
      EPF: Math.round(p.epf / factor),
      NPS: Math.round(p.nps / factor),
      Gratuity: Math.round(p.gratuity / factor),
    };
  });

  if (rows.length < 2) {
    return <p className="text-sm text-slate-500">Set a retirement date in the future to see the timeline.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="age" tick={{ fontSize: 12 }} tickFormatter={(a) => `${Math.round(Number(a))}`} />
          <YAxis tick={{ fontSize: 12 }} width={72} tickFormatter={(v) => rupeesShort(Number(v))} />
          <Tooltip
            formatter={(v) => rupees(Number(v))}
            labelFormatter={(a) => `Age ${a}`}
          />
          <Legend />
          <Area type="monotone" dataKey="EPF" stackId="1" stroke="#334155" fill="#94a3b8" />
          <Area type="monotone" dataKey="NPS" stackId="1" stroke="#1e3a8a" fill="#93c5fd" />
          <Area type="monotone" dataKey="Gratuity" stackId="1" stroke="#78350f" fill="#fcd34d" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
