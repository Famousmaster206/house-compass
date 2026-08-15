"use client";

import { useState } from "react";
import { CityMultiSelect } from "@/components/cities/CityMultiSelect";
import { CityComparisonChart } from "@/components/charts/CityComparisonChart";
import { AffordabilityCard } from "@/components/results/AffordabilityCard";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { compareCities, type CalculatorInput } from "@/lib/services/calculator";
import { getAllCitySlugs } from "@/lib/data/cities";
import { ScrollReveal, ScrollRevealGroup } from "@/components/effects/ScrollReveal";

export interface CompareViewProps {
  initialCitySlugs: string[];
}

const validSlugs = new Set(getAllCitySlugs());

export function CompareView({ initialCitySlugs }: CompareViewProps) {
  const cleanInitial = initialCitySlugs.filter((s) => validSlugs.has(s)).slice(0, 4);
  const [selected, setSelected] = useState<string[]>(
    cleanInitial.length >= 2 ? cleanInitial : ["phoenix", "tucson"]
  );
  const [income, setIncome] = useState(5000);
  const [rent, setRent] = useState<number | undefined>(undefined);
  const [roommates, setRoommates] = useState(0);

  const baseInput: CalculatorInput = {
    monthlyIncome: income,
    householdSize: 1,
    roommates,
    bedrooms: 1,
    userProvidedRent: rent,
    hasCar: true,
    monthlyCarPayment: 300,
    diningBudget: 200,
    includeUtilities: true,
    lifestyleBudget: 200,
    citySlug: selected[0] ?? "phoenix",
  };

  const results = selected.length >= 2 ? compareCities(baseInput, selected) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-text">Compare Cities</h1>
      <p className="mt-2 text-muted">Pick 2-4 Arizona cities and a simplified budget to see how they stack up.</p>

      <Card className="mt-8">
        <CityMultiSelect selected={selected} onChange={setSelected} />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Input label="Monthly income" type="number" min={0} value={income} onChange={(e) => setIncome(Number(e.target.value))} />
          <Input
            label="Rent override (optional)"
            type="number"
            min={0}
            value={rent ?? ""}
            onChange={(e) => setRent(e.target.value ? Number(e.target.value) : undefined)}
            hint="Blank uses each city's estimated rent."
          />
          <Input label="Roommates" type="number" min={0} value={roommates} onChange={(e) => setRoommates(Number(e.target.value))} />
        </div>
      </Card>

      {selected.length < 2 ? (
        <p className="mt-8 text-center text-muted">Select at least 2 cities to compare.</p>
      ) : (
        <>
          <ScrollReveal>
            <Card className="mt-8">
              <p className="text-sm font-semibold text-muted">Estimated monthly leftover</p>
              <CityComparisonChart results={results} />
            </Card>
          </ScrollReveal>

          <ScrollRevealGroup className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {results.map((r) => (
              <AffordabilityCard key={r.citySlug} result={r} />
            ))}
          </ScrollRevealGroup>
        </>
      )}
    </div>
  );
}
