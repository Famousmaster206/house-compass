"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AffordabilityBadge } from "@/components/ui/Badge";
import { AnimatedNumber } from "@/components/effects/AnimatedNumber";
import { ScrollReveal, ScrollRevealGroup } from "@/components/effects/ScrollReveal";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { cities } from "@/lib/data/cities";
import {
  compareRelocationAcrossCities,
  type RelocationInput,
  type RelocationResult,
} from "@/lib/services/relocation";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

const STORAGE_KEY = "house-compass-relocation-input";

const CATEGORY_LABELS: Record<string, string> = {
  housing: "Housing",
  utilities: "Utilities",
  transportation: "Transportation",
  groceries: "Groceries",
  dining: "Dining",
  lifestyle: "Lifestyle",
};

function readStoredInput(): RelocationInput | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RelocationInput;
  } catch {
    return null;
  }
}

export function RelocationResultsView() {
  const router = useRouter();
  const [input] = useState<RelocationInput | null>(readStoredInput);

  if (input === null) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <AlertCircle className="text-primary" size={40} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-text">No conversion found yet</h1>
        <p className="mt-2 text-muted">
          Tell us what you currently spend and we&apos;ll convert it into an Arizona budget.
        </p>
        <Link href="/calculate/relocate" className="mt-6">
          <Button>Convert my cost of living</Button>
        </Link>
      </div>
    );
  }

  const allSlugs = cities.map((c) => c.slug);
  const { targetCitySlug, ...baseInput } = input;
  const results: RelocationResult[] = compareRelocationAcrossCities(baseInput, allSlugs);
  const primary = results.find((r) => r.targetCity.slug === targetCitySlug) ?? results[0];
  const sorted = [...results].sort((a, b) => b.estimatedLeftover - a.estimatedLeftover);
  const cheaper = primary.monthlySavings > 0;

  const biggestCategory = (Object.entries(primary.targetExpenses) as [string, number][])
    .filter(([key]) => key !== "total")
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-text">Your cost-of-living conversion</h1>
          <p className="mt-1 text-sm text-muted">
            Moving from {primary.currentCity.name}, {primary.currentCity.state} to {primary.targetCity.name}, AZ
          </p>
        </div>
        <Link href="/calculate/relocate" className="text-sm font-semibold text-primary hover:underline">
          Edit inputs
        </Link>
      </div>

      <ScrollRevealGroup className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted">Estimated monthly leftover in</p>
              <h2 className="text-2xl font-bold text-text">{primary.targetCity.name}</h2>
            </div>
            <AffordabilityBadge rating={primary.affordability.rating} label={primary.affordability.label} />
          </div>
          <p className="mt-4 text-5xl font-bold tabular-nums" style={{ color: primary.affordability.color }}>
            <AnimatedNumber value={primary.estimatedLeftover} format="currency" />
          </p>
          <p className="mt-1 text-sm text-muted">per month, after your converted expenses</p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-sandstone/50 pt-4 text-sm">
            <div>
              <p className="text-muted">Monthly income</p>
              <p className="font-bold text-text tabular-nums">{formatCurrency(primary.monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-muted">Converted expenses</p>
              <p className="font-bold text-text tabular-nums">
                <AnimatedNumber value={primary.targetExpenses.total} format="currency" />
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-muted">Where your converted money goes</p>
          <ExpenseChart expenses={primary.targetExpenses} />
        </Card>
      </ScrollRevealGroup>

      <ScrollReveal>
        <Card className="mt-8">
          <p className="text-sm font-semibold text-muted">What you spend now vs. what it costs there, by category</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sandstone/50 text-muted">
                  <th className="py-2 pr-4 font-semibold">Category</th>
                  <th className="py-2 pr-4 font-semibold">{primary.currentCity.name} today</th>
                  <th className="py-2 pr-4 font-semibold">{primary.targetCity.name} (converted)</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map((key) => (
                  <tr key={key} className="border-b border-sandstone/30">
                    <td className="py-2.5 pr-4 font-semibold text-text">{CATEGORY_LABELS[key]}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-text">
                      {formatCurrency(primary.currentExpenses[key as keyof typeof primary.currentExpenses])}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-text">
                      {formatCurrency(primary.targetExpenses[key as keyof typeof primary.targetExpenses])}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold text-text">
                  <td className="py-2.5 pr-4">Total</td>
                  <td className="py-2.5 pr-4 tabular-nums">{formatCurrency(primary.currentExpenses.total)}</td>
                  <td className="py-2.5 pr-4 tabular-nums">{formatCurrency(primary.targetExpenses.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-sandstone/50 px-4 py-3">
            {cheaper ? (
              <TrendingDown className="text-comfortable" size={20} aria-hidden="true" />
            ) : (
              <TrendingUp className="text-difficult" size={20} aria-hidden="true" />
            )}
            <p className="text-sm text-text">
              <span className="font-bold">{formatCurrency(Math.abs(primary.monthlySavings))}/month</span>{" "}
              {cheaper ? "less" : "more"} than {primary.currentCity.name} ({formatPercent(Math.abs(primary.percentChange))}
              {cheaper ? " cheaper" : " more expensive"}). Your biggest expense in {primary.targetCity.name} would be{" "}
              <span className="font-bold capitalize">{CATEGORY_LABELS[biggestCategory[0]] ?? biggestCategory[0]}</span>.
            </p>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="mt-8">
          <p className="text-sm font-semibold text-muted">How every Arizona city compares</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sandstone/50 text-muted">
                  <th className="py-2 pr-4 font-semibold">City</th>
                  <th className="py-2 pr-4 font-semibold">Converted cost</th>
                  <th className="py-2 pr-4 font-semibold">Est. leftover</th>
                  <th className="py-2 pr-4 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.targetCity.slug}
                    className="cursor-pointer border-b border-sandstone/30 transition-colors hover:bg-sandstone-light/50"
                    onClick={() => router.push(`/cities/${r.targetCity.slug}`)}
                  >
                    <td className="py-2.5 pr-4 font-semibold text-text">{r.targetCity.name}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-text">{formatCurrency(r.targetExpenses.total)}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-text">{formatCurrency(r.estimatedLeftover)}</td>
                    <td className="py-2.5 pr-4">
                      <AffordabilityBadge rating={r.affordability.rating} label={r.affordability.label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">
            Each category is converted using the overall cost-of-living index between your current city and
            the Arizona city — a simplified, single-factor-per-category conversion, not a true category-level
            market model. Treat these as directional estimates, not exact figures.
          </p>
        </Card>
      </ScrollReveal>

      <div className="mt-10 flex justify-center gap-4">
        <Link href="/what-if">
          <Button size="lg">Try What-If scenarios</Button>
        </Link>
        <Link href={`/cities/${primary.targetCity.slug}`}>
          <Button size="lg" variant="outline">
            View {primary.targetCity.name}
          </Button>
        </Link>
      </div>
    </div>
  );
}
