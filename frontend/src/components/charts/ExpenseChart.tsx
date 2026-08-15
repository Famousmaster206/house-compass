"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ExpenseBreakdown } from "@/lib/services/calculator";
import { formatCurrency } from "@/lib/utils/format";

// Categorical colors: validated all-pairs-safe triad + one extra adjacent-safe
// hue per the dataviz skill (see globals.css --chart-*).
const CATEGORY_COLORS: Record<string, string> = {
  Housing: "var(--chart-2)", // orange
  Utilities: "var(--chart-4)", // yellow
  Transportation: "var(--chart-1)", // blue
  Groceries: "var(--chart-3)", // aqua/green
  Dining: "var(--chart-5)", // magenta
  Lifestyle: "var(--chart-7)", // violet
};

export interface ExpenseChartProps {
  expenses: ExpenseBreakdown;
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const data = [
    { name: "Housing", value: expenses.housing },
    { name: "Utilities", value: expenses.utilities },
    { name: "Transportation", value: expenses.transportation },
    { name: "Groceries", value: expenses.groceries },
    { name: "Dining", value: expenses.dining },
    { name: "Lifestyle", value: expenses.lifestyle },
  ].filter((d) => d.value > 0);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            stroke="var(--background)"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-sandstone)",
              background: "white",
              color: "var(--color-text)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={48}
            iconType="circle"
            wrapperStyle={{ fontSize: 13, color: "var(--color-text)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
