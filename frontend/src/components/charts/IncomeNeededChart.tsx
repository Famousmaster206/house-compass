"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { calculateAffordability, type CalculatorInput } from "@/lib/services/calculator";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/format";

const INCOME_BUCKETS = [40000, 50000, 60000, 75000, 100000];

const RATING_COLOR: Record<string, string> = {
  comfortable: "var(--color-comfortable)",
  moderate: "var(--color-moderate)",
  tight: "var(--color-tight)",
  difficult: "var(--color-difficult)",
};

export function IncomeNeededChart({ citySlug }: { citySlug: string }) {
  const baseInput: Omit<CalculatorInput, "monthlyIncome"> = {
    householdSize: 1,
    roommates: 0,
    bedrooms: 1,
    hasCar: true,
    monthlyCarPayment: 300,
    diningBudget: 200,
    includeUtilities: true,
    lifestyleBudget: 200,
    citySlug,
  };

  const data = INCOME_BUCKETS.map((annual) => {
    const result = calculateAffordability({ ...baseInput, monthlyIncome: annual / 12 });
    return {
      name: `$${annual / 1000}k/yr`,
      leftover: result.leftover,
      rating: result.affordability.rating,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sandstone)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted)" }} />
          <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} tick={{ fontSize: 12, fill: "var(--color-muted)" }} width={56} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--color-sandstone)", background: "white", color: "var(--color-text)" }}
          />
          <Bar dataKey="leftover" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={RATING_COLOR[entry.rating]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted">
        Estimated monthly leftover by annual income, assuming a single renter with one car (1BR apartment).
      </p>
    </div>
  );
}
