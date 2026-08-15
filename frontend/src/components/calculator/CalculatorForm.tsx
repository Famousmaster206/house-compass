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
import type { CalculatorInput } from "@/lib/services/calculator";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const STEPS = ["Personal", "Housing", "Transportation", "Food", "Utilities", "Lifestyle", "City"] as const;

const DEFAULTS: CalculatorInput = {
  monthlyIncome: 5000,
  householdSize: 1,
  roommates: 0,
  bedrooms: 1,
  hasCar: true,
  monthlyCarPayment: 350,
  diningBudget: 200,
  includeUtilities: true,
  lifestyleBudget: 200,
  citySlug: "phoenix",
};

export function CalculatorForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [input, setInput] = useState<CalculatorInput>(DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reducedMotion = usePrefersReducedMotion();

  function update<K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) {
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
    }
    if (step === 2) {
      if (input.hasCar && input.monthlyCarPayment < 0) errs.monthlyCarPayment = "Car payment can't be negative.";
    }
    if (step === 3) {
      if (input.diningBudget < 0) errs.diningBudget = "Dining budget can't be negative.";
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
    // Simplest robust way to pass the finished CalculatorInput to /results
    // without a backend: stash it in sessionStorage and read it back there.
    sessionStorage.setItem("az-living-calculator-input", JSON.stringify(input));
    router.push("/results");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress indicator */}
      <ol className="mb-8 flex items-center justify-between" aria-label="Calculator progress">
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
            <Select
              label="Apartment size"
              value={String(input.bedrooms)}
              onChange={(e) => update("bedrooms", Number(e.target.value) as 1 | 3)}
              options={[
                { value: "1", label: "1 bedroom" },
                { value: "3", label: "2-3 bedrooms" },
              ]}
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
            <Input
              label="Estimated rent override (optional)"
              type="number"
              min={0}
              value={input.userProvidedRent ?? ""}
              onChange={(e) =>
                update("userProvidedRent", e.target.value ? Number(e.target.value) : undefined)
              }
              hint="Leave blank to use our estimated rent for your chosen city."
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
                label="Monthly car payment"
                type="number"
                min={0}
                value={input.monthlyCarPayment}
                onChange={(e) => update("monthlyCarPayment", Number(e.target.value))}
                error={errors.monthlyCarPayment}
                hint="$0 if your car is paid off. Gas & insurance are estimated automatically."
              />
            )}
            {!input.hasCar && (
              <p className="text-sm text-muted">
                We&apos;ll estimate a public transit / rideshare budget for you instead.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <Input
              label="Monthly dining-out budget"
              type="number"
              min={0}
              value={input.diningBudget}
              onChange={(e) => update("diningBudget", Number(e.target.value))}
              error={errors.diningBudget}
              hint="Restaurants, takeout, coffee shops. Groceries are estimated separately."
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
              Include estimated utilities (electric, water, gas, internet)
            </label>
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
              label="Primary city"
              value={input.citySlug}
              onChange={(e) => update("citySlug", e.target.value)}
              options={cities.map((c) => ({ value: c.slug, label: c.name }))}
              hint="You can compare more cities later on the Compare page."
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
              See my results
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
