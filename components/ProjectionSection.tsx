"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatINR } from "@/lib/calculators/salary";

export interface ProjectionPoint {
  label: string; // x-axis label, e.g. "5 yrs" or "₹10L"
  value: number; // the primary figure being projected
}

export default function ProjectionSection({
  title,
  data,
  columnLabel,
  valueLabel,
}: {
  title: string;
  data: ProjectionPoint[];
  columnLabel: string;
  valueLabel: string;
}) {
  return (
    <div>
      <h3 className="text-xl mb-1">{title}</h3>
      <div className="h-64 mt-4 mb-6 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F6F54" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#1F6F54" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#16283A" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#1C2321", opacity: 0.6 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#1C2321", opacity: 0.6 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
              width={48}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), valueLabel]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(22,40,58,0.15)" }}
            />
            <Area type="monotone" dataKey="value" stroke="#1F6F54" strokeWidth={2} fill="url(#projectionFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-ink/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paperDark/60 text-left">
              <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase tracking-wide">
                {columnLabel}
              </th>
              <th className="px-4 py-2 font-medium text-charcoal/60 text-xs uppercase tracking-wide text-right">
                {valueLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((point, i) => (
              <tr key={i} className="border-t border-ink/5">
                <td className="px-4 py-2 text-charcoal/70">{point.label}</td>
                <td className="px-4 py-2 text-right font-mono text-ink">{formatINR(point.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
