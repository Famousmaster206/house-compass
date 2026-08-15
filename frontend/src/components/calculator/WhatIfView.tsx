"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { AffordabilityBadge } from "@/components/ui/Badge";
import { WhatIfChart, type WhatIfScenarioPoint } from "@/components/charts/WhatIfChart";
import { cities } from "@/lib/data/cities";
import { calculateAffordability, runWhatIfScenario, type CalculatorInput } from "@/lib/services/calculator";
import { formatCurrency } from "@/lib/utils/format";

const BASE: CalculatorInput = {
  monthlyIncome: 5000,
  householdSize: 1,
  roommates: 0,
  bedrooms: 1,
  hasCar: true,
  monthlyCarPayment: 300,
  diningBudget: 200,
  includeUtilities: true,
  lifestyleBudget: 200,
  citySlug: "phoenix",
};

export function WhatIfView() {
  const [citySlug, setCitySlug] = useState(BASE.citySlug);
  const [income, setIncome] = useState(BASE.monthlyIncome);
  const [rent, setRent] = useState<number | undefined>(undefined);
  const [roommates, setRoommates] = useState(BASE.roommates);
  const [hasCar, setHasCar] = useState(BASE.hasCar);
  const [diningBudget, setDiningBudget] = useState(BASE.diningBudget);

  const currentInput: CalculatorInput = {
    ...BASE,
    citySlug,
    monthlyIncome: income,
    userProvidedRent: rent,
    roommates,
    hasCar,
    diningBudget,
  };

  const baselineResult = useMemo(() => calculateAffordability(BASE), []);
  const currentResult = calculateAffordability(currentInput);
  const diff = currentResult.leftover - baselineResult.leftover;

  const scenarios: WhatIfScenarioPoint[] = useMemo(() => {
    const named: { name: string; overrides: Partial<CalculatorInput> }[] = [
      { name: "Current", overrides: {} },
      { name: "1 roommate", overrides: { roommates: 1 } },
      { name: "2 roommates", overrides: { roommates: 2 } },
      { name: "No car", overrides: { hasCar: false } },
      { name: "Lower dining", overrides: { diningBudget: Math.max(0, diningBudget - 100) } },
    ];
    return named.map(({ name, overrides }) => ({
      name,
      leftover: runWhatIfScenario(currentInput, overrides).leftover,
      isCurrent: name === "Current",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citySlug, income, rent, roommates, hasCar, diningBudget]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-text">What-If Scenarios</h1>
      <p className="mt-2 text-muted">Drag the sliders and watch your estimated leftover money change live.</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <div className="flex flex-col gap-6">
            <Select
              label="City"
              value={citySlug}
              onChange={(e) => setCitySlug(e.target.value)}
              options={cities.map((c) => ({ value: c.slug, label: c.name }))}
            />
            <Slider
              label="Monthly income"
              value={income}
              min={2000}
              max={15000}
              step={100}
              onChange={setIncome}
              formatValue={formatCurrency}
            />
            <Slider
              label="Rent override"
              value={rent ?? 0}
              min={0}
              max={3000}
              step={50}
              onChange={(v) => setRent(v === 0 ? undefined : v)}
              formatValue={(v) => (v === 0 ? "Use city estimate" : formatCurrency(v))}
            />
            <Slider label="Roommates" value={roommates} min={0} max={4} step={1} onChange={setRoommates} />
            <label className="flex items-center gap-2 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={hasCar}
                onChange={(e) => setHasCar(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              I have a car
            </label>
            <Slider
              label="Dining budget"
              value={diningBudget}
              min={0}
              max={800}
              step={25}
              onChange={setDiningBudget}
              formatValue={formatCurrency}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-semibold text-muted">Baseline</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-text">{formatCurrency(baselineResult.leftover)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">New scenario</p>
                <p className="mt-1 text-xl font-bold tabular-nums" style={{ color: currentResult.affordability.color }}>
                  {formatCurrency(currentResult.leftover)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">Difference</p>
                <p className={`mt-1 text-xl font-bold tabular-nums ${diff >= 0 ? "text-comfortable" : "text-difficult"}`}>
                  {diff >= 0 ? "+" : ""}
                  {formatCurrency(diff)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <AffordabilityBadge rating={currentResult.affordability.rating} label={currentResult.affordability.label} />
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-muted">Leftover money across named scenarios</p>
            <WhatIfChart scenarios={scenarios} />
          </Card>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Baseline compares against a default profile ($5,000/mo income, Phoenix, 1BR, no roommates, one car).
        All figures are estimates.
      </p>
    </div>
  );
}
