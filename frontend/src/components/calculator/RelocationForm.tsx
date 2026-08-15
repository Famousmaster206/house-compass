"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { cities } from "@/lib/data/cities";
import { outsideCities } from "@/lib/data/outsideCities";
import type { RelocationInput } from "@/lib/services/relocation";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const STORAGE_KEY = "house-compass-relocation-input";

const STEPS = ["Personal", "Housing", "Transportation", "Food", "Utilities", "Lifestyle", "Cities"] as const;

const DEFAULTS: RelocationInput = {
  monthlyIncome: 6000,
  householdSize: 1,
  roommates: 0,
  currentRent: 2200,
  hasCar: true,
  monthlyCarPayment: 350,
  groceryBudget: 400,
  diningBudget: 200,
  includeUtilities: true,
  currentUtilities: 220,
  lifestyleBudget: 200,
  currentCitySlug: outsideCities[0].slug,
  targetCitySlug: cities[0].slug,
};

export function RelocationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [input, setInput] = useState<RelocationInput>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reducedMotion = usePrefersReducedMotion();

  function update<K extends keyof RelocationInput>(key: K, value: RelocationInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!input.monthlyIncome || input.monthlyIncome <= 0) errs.monthlyIncome = "Enter a monthly income greater than $0.";
      if (!input.householdSize || input.householdSize < 1) errs.householdSize = "Household size must be at least 1.";
    }
    if (step === 1) {
      if (input.roommates < 0) errs.roommates = "Roommates can't be negative.";
      if (!input.currentRent || input.currentRent <= 0) errs.currentRent = "Enter your current monthly rent.";
    }
    if (step === 2) {
      if (input.hasCar && input.monthlyCarPayment < 0) errs.monthlyCarPayment = "Car payment can't be negative.";
    }
    if (step === 3) {
      if (input.groceryBudget < 0) errs.groceryBudget = "Grocery budget can't be negative.";
      if (input.diningBudget < 0) errs.diningBudget = "Dining budget can't be negative.";
    }
    if (step === 4) {
      if (input.includeUtilities && input.currentUtilities < 0) errs.currentUtilities = "Utilities can't be negative.";
    }
    if (step === 5) {
      if (input.lifestyleBudget < 0) errs.lifestyleBudget = "Lifestyle budget can't be negative.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  }

  function handleSubmit() {
    if (!validateStep()) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    router.push("/calculate/relocate/results");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress indicator */}
      <ol className="mb-8 flex items-center justify-between" aria-label="Relocation calculator progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i < step
                  ? "bg-comfortable text-white"
                  : i === step
                    ? "bg-primary text-white"
                    : "bg-sandstone-light text-muted"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < step ? "bg-comfortable" : "bg-sandstone-light"}`} />
            )}
          </li>
        ))}
      </ol>
      <p className="mb-4 text-center text-sm font-semibold text-muted">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <Card className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            initial={reducedMotion ? false : { opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <Input
                  label="Monthly take-home income"
                  type="number"
                  min={0}
                  value={input.monthlyIncome}
                  onChange={(e) => update("monthlyIncome", Number(e.target.value))}
                  error={errors.monthlyIncome}
                  hint="Net income after taxes, in dollars per month."
                />
                <Input
                  label="Household size"
                  type="number"
                  min={1}
                  value={input.householdSize}
                  onChange={(e) => update("householdSize", Number(e.target.value))}
                  error={errors.householdSize}
                  hint="Total people in your household, including yourself."
                />
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <Input
                  label="Your current monthly rent"
                  type="number"
                  min={0}
                  value={input.currentRent}
                  onChange={(e) => update("currentRent", Number(e.target.value))}
                  error={errors.currentRent}
                  hint="Total rent for your current place, before any roommate split."
                />
                <Input
                  label="Roommates"
                  type="number"
                  min={0}
                  value={input.roommates}
                  onChange={(e) => update("roommates", Number(e.target.value))}
                  error={errors.roommates}
                  hint="Number of additional roommates splitting rent with you (0 = living alone)."
                />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-text">
                  <input
                    type="checkbox"
                    checked={input.hasCar}
                    onChange={(e) => update("hasCar", e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  I have a car
                </label>
                {input.hasCar && (
                  <Input
                    label="Current monthly car payment"
                    type="number"
                    min={0}
                    value={input.monthlyCarPayment}
                    onChange={(e) => update("monthlyCarPayment", Number(e.target.value))}
                    error={errors.monthlyCarPayment}
                    hint="$0 if your car is paid off. Include insurance/gas here too if you pay for them."
                  />
                )}
                {!input.hasCar && (
                  <p className="text-sm text-muted">
                    We&apos;ll estimate an equivalent transit / rideshare budget for you in Arizona.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <Input
                  label="Monthly grocery budget"
                  type="number"
                  min={0}
                  value={input.groceryBudget}
                  onChange={(e) => update("groceryBudget", Number(e.target.value))}
                  error={errors.groceryBudget}
                  hint="What you currently spend on groceries each month."
                />
                <Input
                  label="Monthly dining-out budget"
                  type="number"
                  min={0}
                  value={input.diningBudget}
                  onChange={(e) => update("diningBudget", Number(e.target.value))}
                  error={errors.diningBudget}
                  hint="Restaurants, takeout, coffee shops."
                />
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-text">
                  <input
                    type="checkbox"
                    checked={input.includeUtilities}
                    onChange={(e) => update("includeUtilities", e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  Include utilities (electric, water, gas, internet)
                </label>
                {input.includeUtilities && (
                  <Input
                    label="Current monthly utilities"
                    type="number"
                    min={0}
                    value={input.currentUtilities}
                    onChange={(e) => update("currentUtilities", Number(e.target.value))}
                    error={errors.currentUtilities}
                    hint="What you currently pay for electric, water, gas, and internet combined."
                  />
                )}
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-5">
                <Input
                  label="Monthly lifestyle & entertainment budget"
                  type="number"
                  min={0}
                  value={input.lifestyleBudget}
                  onChange={(e) => update("lifestyleBudget", Number(e.target.value))}
                  error={errors.lifestyleBudget}
                  hint="Gym, streaming, hobbies, misc. spending."
                />
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col gap-5">
                <Select
                  label="City you currently live in"
                  value={input.currentCitySlug}
                  onChange={(e) => update("currentCitySlug", e.target.value)}
                  options={outsideCities.map((c) => ({ value: c.slug, label: `${c.name}, ${c.state}` }))}
                />
                <Select
                  label="Arizona city to convert to"
                  value={input.targetCitySlug}
                  onChange={(e) => update("targetCitySlug", e.target.value)}
                  options={cities.map((c) => ({ value: c.slug, label: c.name }))}
                  hint="You'll see a comparison across all Arizona cities on the results page too."
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={step === 0} type="button">
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} type="button">
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} type="button">
              Convert my cost of living
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
