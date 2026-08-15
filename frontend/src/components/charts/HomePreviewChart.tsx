"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/format";

// Static sample numbers for the homepage preview (not live-calculated).
const sample = [
  { name: "Tucson", leftover: 1180, rating: "comfortable" },
  { name: "Glendale", leftover: 980, rating: "comfortable" },
  { name: "Phoenix", leftover: 640, rating: "moderate" },
  { name: "Mesa", leftover: 590, rating: "moderate" },
  { name: "Tempe", leftover: 210, rating: "tight" },
  { name: "Scottsdale", leftover: -180, rating: "difficult" },
];

const RATING_COLOR: Record<string, string> = {
  comfortable: "var(--color-comfortable)",
  moderate: "var(--color-moderate)",
  tight: "var(--color-tight)",
  difficult: "var(--color-difficult)",
};

export function HomePreviewChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sample} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sandstone)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted)" }} />
          <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} tick={{ fontSize: 12, fill: "var(--color-muted)" }} width={56} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--color-sandstone)", background: "white", color: "var(--color-text)" }}
          />
          <Bar dataKey="leftover" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {sample.map((entry) => (
              <Cell key={entry.name} fill={RATING_COLOR[entry.rating]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted">
        Sample data (estimated monthly leftover for a $5,000/mo income, 1BR apartment, one car).
      </p>
    </div>
  );
}
