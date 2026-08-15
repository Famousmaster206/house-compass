// Converts a user's current, real-world monthly expenses in an outside city
// into an equivalent estimated budget in an Arizona city, using each city's
// cost-of-living index as a simple ratio. This is a rough conversion, not a
// category-by-category model — TODO: replace with a proper category-level
// cost-of-living API (housing/food/transport indices differ per category in
// reality; a single blended index is an MVP simplification).

import { getCityBySlug, type City } from "@/lib/data/cities";
import { getOutsideCityBySlug, type OutsideCity } from "@/lib/data/outsideCities";
import { getAffordabilityRating, type AffordabilityRating } from "@/lib/config/affordability";

export interface RelocationInput {
  monthlyIncome: number;
  currentCitySlug: string; // slug into outsideCities
  currentMonthlyExpenses: number; // user's total current monthly spend (rent + everything)
  targetCitySlug: string; // slug into lib/data/cities (Arizona)
}

export interface RelocationResult {
  currentCity: OutsideCity;
  targetCity: City;
  currentMonthlyExpenses: number;
  estimatedTargetExpenses: number;
  monthlySavings: number; // positive = cheaper in the AZ city
  percentChange: number; // fraction (e.g. -0.15 = -15%); negative = cost decreases moving to target
  monthlyIncome: number;
  estimatedLeftover: number;
  affordability: AffordabilityRating;
}

/**
 * Converts current-city expenses into an equivalent Arizona-city cost using
 * the ratio of cost-of-living indices between the two cities.
 */
export function convertCostOfLiving(
  currentMonthlyExpenses: number,
  currentCitySlug: string,
  targetCitySlug: string
): number {
  const current = getOutsideCityBySlug(currentCitySlug);
  const target = getCityBySlug(targetCitySlug);
  if (!current || !target) return currentMonthlyExpenses;

  const ratio = target.costOfLivingIndex / current.costOfLivingIndex;
  return Math.round(currentMonthlyExpenses * ratio);
}

export function calculateRelocation(input: RelocationInput): RelocationResult | null {
  const currentCity = getOutsideCityBySlug(input.currentCitySlug);
  const targetCity = getCityBySlug(input.targetCitySlug);
  if (!currentCity || !targetCity) return null;

  const estimatedTargetExpenses = convertCostOfLiving(
    input.currentMonthlyExpenses,
    input.currentCitySlug,
    input.targetCitySlug
  );
  const monthlySavings = input.currentMonthlyExpenses - estimatedTargetExpenses;
  // Fraction (e.g. -0.153), matching lib/utils/format.ts's formatPercent convention.
  const percentChange =
    input.currentMonthlyExpenses > 0
      ? (estimatedTargetExpenses - input.currentMonthlyExpenses) / input.currentMonthlyExpenses
      : 0;
  const estimatedLeftover = Math.round(input.monthlyIncome - estimatedTargetExpenses);
  const affordability = getAffordabilityRating(estimatedLeftover, input.monthlyIncome);

  return {
    currentCity,
    targetCity,
    currentMonthlyExpenses: input.currentMonthlyExpenses,
    estimatedTargetExpenses,
    monthlySavings,
    percentChange,
    monthlyIncome: input.monthlyIncome,
    estimatedLeftover,
    affordability,
  };
}

/** Runs the conversion against every Arizona city, for a full comparison table. */
export function compareRelocationAcrossCities(
  input: Omit<RelocationInput, "targetCitySlug">,
  targetCitySlugs: string[]
): RelocationResult[] {
  return targetCitySlugs
    .map((slug) => calculateRelocation({ ...input, targetCitySlug: slug }))
    .filter((r): r is RelocationResult => r !== null);
}
