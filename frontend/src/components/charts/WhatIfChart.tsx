"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/format";

export interface WhatIfScenarioPoint {
  name: string;
  leftover: number;
  isCurrent?: boolean;
}

export interface WhatIfChartProps {
  scenarios: WhatIfScenarioPoint[];
}

export function WhatIfChart({ scenarios }: WhatIfChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={scenarios} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sandstone)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted)" }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis
            tickFormatter={(v) => formatCurrencyCompact(v)}
            tick={{ fontSize: 12, fill: "var(--color-muted)" }}
            width={56}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-sandstone)",
              background: "white",
              color: "var(--color-text)",
            }}
          />
          <Bar
            dataKey="leftover"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            isAnimationActive
            animationDuration={350}
            animationEasing="ease-out"
          >
            {scenarios.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.isCurrent ? "var(--chart-1)" : "var(--chart-2)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
