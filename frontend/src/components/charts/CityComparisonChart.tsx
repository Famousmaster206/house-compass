"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import type { CalculationResult } from "@/lib/services/calculator";
import { formatCurrencyCompact, formatCurrency } from "@/lib/utils/format";

export interface CityComparisonChartProps {
  results: CalculationResult[];
  metric?: "leftover" | "totalExpenses";
}

const RATING_COLOR: Record<string, string> = {
  comfortable: "var(--color-comfortable)",
  moderate: "var(--color-moderate)",
  tight: "var(--color-tight)",
  difficult: "var(--color-difficult)",
};

export function CityComparisonChart({ results, metric = "leftover" }: CityComparisonChartProps) {
  const data = results.map((r) => ({
    name: r.cityName,
    value: metric === "leftover" ? r.leftover : r.totalExpenses,
    rating: r.affordability.rating,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sandstone)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted)" }} />
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
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={RATING_COLOR[entry.rating] ?? "var(--chart-1)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted">
        Bar color reflects affordability rating (see legend on results).
      </p>
    </div>
  );
}
