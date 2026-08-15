"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AffordabilityBadge } from "@/components/ui/Badge";
import { AffordabilityCard } from "@/components/results/AffordabilityCard";
import { AiOverview } from "@/components/results/AiOverview";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { CityComparisonChart } from "@/components/charts/CityComparisonChart";
import { cities } from "@/lib/data/cities";
import { compareCities, type CalculatorInput, type CalculationResult } from "@/lib/services/calculator";
import { formatCurrency } from "@/lib/utils/format";
import { ScrollReveal, ScrollRevealGroup } from "@/components/effects/ScrollReveal";

// Results are handed off from /calculate via sessionStorage (see CalculatorForm) —
// simplest robust approach for a purely client-side MVP with no backend to persist
// in-flight calculator state. Read lazily via useState's initializer (not an
// effect) so there's no extra render/setState cycle and no lint issues around
// setState-in-effect.
const STORAGE_KEY = "house-compass-calculator-input";

function readStoredInput(): CalculatorInput | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CalculatorInput;
  } catch {
    return null;
  }
}

export function ResultsView() {
  const router = useRouter();
  // Lazy initializer avoids reading sessionStorage during SSR/module eval;
  // on the client it runs once during the first render.
  const [input] = useState<CalculatorInput | null>(readStoredInput);

  if (input === null) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <AlertCircle className="text-primary" size={40} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-text">No calculation found yet</h1>
        <p className="mt-2 text-muted">
          Run the calculator first and we&apos;ll show your personalized affordability breakdown here.
        </p>
        <Link href="/calculate" className="mt-6">
          <Button>Go to calculator</Button>
        </Link>
      </div>
    );
  }

  const otherCitySlugs = cities.map((c) => c.slug).filter((s) => s !== input.citySlug);
  const allResults: CalculationResult[] = compareCities(input, [input.citySlug, ...otherCitySlugs]);
  const primary = allResults[0];
  const sorted = [...allResults].sort((a, b) => b.leftover - a.leftover);

  const biggestCategory = (Object.entries(primary.expenses) as [string, number][])
    .filter(([key]) => key !== "total")
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-text">Your results</h1>
        <Link href="/calculate" className="text-sm font-semibold text-primary hover:underline">
          Edit inputs
        </Link>
      </div>

      <ScrollRevealGroup className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AffordabilityCard result={primary} />
        <Card>
          <p className="text-sm font-semibold text-muted">Where your money goes</p>
          <ExpenseChart expenses={primary.expenses} />
        </Card>
      </ScrollRevealGroup>

      <ScrollReveal>
        <Card className="mt-8">
          <p className="text-sm font-semibold text-muted">What affects your cost most</p>
          <p className="mt-2 text-lg text-text">
            Your biggest expense in {primary.cityName} is{" "}
            <span className="font-bold capitalize">{biggestCategory[0]}</span> at{" "}
            <span className="font-bold">{formatCurrency(biggestCategory[1])}</span>/month. Try adjusting
            roommates or car ownership on the{" "}
            <Link href="/what-if" className="font-semibold text-primary hover:underline">
              What-If page
            </Link>{" "}
            to see the impact.
          </p>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="mt-8">
          <p className="text-sm font-semibold text-muted">How your city compares</p>
          <CityComparisonChart results={allResults} />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sandstone/50 text-muted">
                  <th className="py-2 pr-4 font-semibold">City</th>
                  <th className="py-2 pr-4 font-semibold">Est. leftover</th>
                  <th className="py-2 pr-4 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.citySlug}
                    className="cursor-pointer border-b border-sandstone/30 transition-colors hover:bg-sandstone-light/50"
                    onClick={() => router.push(`/cities/${r.citySlug}`)}
                  >
                    <td className="py-2.5 pr-4 font-semibold text-text">{r.cityName}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-text">{formatCurrency(r.leftover)}</td>
                    <td className="py-2.5 pr-4">
                      <AffordabilityBadge rating={r.affordability.rating} label={r.affordability.label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="mt-8">
          <p className="text-sm font-semibold text-muted">Plain-language recommendation</p>
          <p className="mt-2 text-text">
            {primary.affordability.rating === "comfortable" &&
              `Based on your inputs, ${primary.cityName} looks comfortably affordable — you'd have healthy room left over each month.`}
            {primary.affordability.rating === "moderate" &&
              `${primary.cityName} looks moderately affordable for you — manageable, but consider a budget cushion for surprises.`}
            {primary.affordability.rating === "tight" &&
              `Your budget in ${primary.cityName} is tight. Consider a roommate, a smaller apartment, or cutting discretionary spending.`}
            {primary.affordability.rating === "difficult" &&
              `Based on your current inputs, ${primary.cityName} may be difficult to afford. Try the What-If tool to see what changes would help.`}
          </p>
          <p className="mt-2 text-xs text-muted">
            This is an estimate for informational purposes only — not financial advice.
          </p>
        </Card>
      </ScrollReveal>

      <AiOverview input={input} result={primary} />

      <div className="mt-10 flex justify-center">
        <Link href="/what-if">
          <Button size="lg">Try What-If scenarios</Button>
        </Link>
      </div>
    </div>
  );
}
