"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { cities } from "@/lib/data/cities";
import { outsideCities } from "@/lib/data/outsideCities";
import type { RelocationInput } from "@/lib/services/relocation";

const STORAGE_KEY = "house-compass-relocation-input";

const DEFAULTS: RelocationInput = {
  monthlyIncome: 6000,
  currentCitySlug: outsideCities[0].slug,
  currentMonthlyExpenses: 3500,
  targetCitySlug: cities[0].slug,
};

export function RelocationForm() {
  const router = useRouter();
  const [input, setInput] = useState<RelocationInput>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof RelocationInput>(key: K, value: RelocationInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!input.monthlyIncome || input.monthlyIncome <= 0) {
      errs.monthlyIncome = "Enter a monthly income greater than $0.";
    }
    if (!input.currentMonthlyExpenses || input.currentMonthlyExpenses <= 0) {
      errs.currentMonthlyExpenses = "Enter your current monthly expenses.";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    router.push("/calculate/relocate/results");
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 text-primary">
        <ArrowRightLeft size={18} aria-hidden="true" />
        <p className="text-sm font-semibold">Convert your current cost of living</p>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <Input
          label="Monthly take-home income"
          type="number"
          min={0}
          value={input.monthlyIncome}
          onChange={(e) => update("monthlyIncome", Number(e.target.value))}
          error={errors.monthlyIncome}
          hint="Net income after taxes, in dollars per month."
        />

        <Select
          label="City you currently live in"
          value={input.currentCitySlug}
          onChange={(e) => update("currentCitySlug", e.target.value)}
          options={outsideCities.map((c) => ({ value: c.slug, label: `${c.name}, ${c.state}` }))}
        />

        <Input
          label="Your current total monthly expenses"
          type="number"
          min={0}
          value={input.currentMonthlyExpenses}
          onChange={(e) => update("currentMonthlyExpenses", Number(e.target.value))}
          error={errors.currentMonthlyExpenses}
          hint="Everything you spend monthly today: rent, food, transportation, bills, everything."
        />

        <Select
          label="Arizona city to convert to"
          value={input.targetCitySlug}
          onChange={(e) => update("targetCitySlug", e.target.value)}
          options={cities.map((c) => ({ value: c.slug, label: c.name }))}
          hint="You'll see a comparison across all Arizona cities on the results page too."
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} type="button">
          Convert my cost of living
        </Button>
      </div>
    </Card>
  );
}
