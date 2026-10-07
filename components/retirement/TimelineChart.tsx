"use client";

// Stacked area chart: how EPF, NPS and accrued gratuity build up by age.
// Colours follow the site palette (accent, accentLight, gold); see
// docs/07-design-system.md if the palette changes.

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimelinePoint } from "@/lib/calculators/retirementBenefits";
import { formatINR, rupeesShort } from "./format";

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
  // For today's value, deflate each point by inflation up to that age.
  const annualInflation = yearsToRetirement > 0 ? Math.pow(deflator, 1 / yearsToRetirement) - 1 : 0;
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
    return <p className="text-sm text-charcoal/60">Set a retirement date in the future to see the timeline.</p>;
  }

  return (
    <div className="h-72 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" strokeOpacity={0.6} vertical={false} />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(a) => `${Math.round(Number(a))}`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={64}
            tickFormatter={(v) => rupeesShort(Number(v))}
          />
          <Tooltip
            formatter={(v) => formatINR(Number(v))}
            labelFormatter={(a) => `Age ${a}`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(22,40,58,0.15)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="EPF" stackId="1" stroke="#6D28D9" fill="#6D28D9" fillOpacity={0.35} />
          <Area type="monotone" dataKey="NPS" stackId="1" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.35} />
          <Area type="monotone" dataKey="Gratuity" stackId="1" stroke="#C27803" fill="#C27803" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
