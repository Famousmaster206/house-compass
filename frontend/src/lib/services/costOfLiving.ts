import { getCityBySlug } from "@/lib/data/cities";
import { getCityCostFactors, BASELINE_GROCERY_COST } from "@/lib/data/costs";

// TODO: replace with a real aggregated cost-of-living API (e.g. C2ER, Numbeo,
// or BLS regional CPI data) — this orchestrator currently composes our own
// static sample tables in lib/data/*.

export interface CityCostSummary {
  citySlug: string;
  cityName: string;
  costOfLivingIndex: number;
  baseRent1BR: number;
  baseRent3BR: number;
  avgUtilities: number;
  avgTransportation: number;
  groceryMultiplier: number;
  diningMultiplier: number;
}

/**
 * Orchestrates city + cost-factor data into a single summary object.
 */
export function getCityCost(citySlug: string): CityCostSummary | null {
  const city = getCityBySlug(citySlug);
  if (!city) return null;
  const factors = getCityCostFactors(citySlug);

  return {
    citySlug: city.slug,
    cityName: city.name,
    costOfLivingIndex: city.costOfLivingIndex,
    baseRent1BR: city.rent1BR,
    baseRent3BR: city.rent3BR,
    avgUtilities: city.avgUtilities,
    avgTransportation: city.avgTransportation,
    groceryMultiplier: factors.groceryMultiplier,
    diningMultiplier: factors.diningMultiplier,
  };
}

/** Estimated monthly grocery cost for a household in a given city. */
export function estimateGroceryCost(citySlug: string, householdSize: number): number {
  const { groceryMultiplier } = getCityCostFactors(citySlug);
  return Math.round(BASELINE_GROCERY_COST * groceryMultiplier * Math.max(1, householdSize) * 0.85);
  // 0.85 = simple economies-of-scale discount per additional household member
}

/** Estimated monthly dining-out cost given a user-selected dining budget tier. */
export function estimateDiningCost(citySlug: string, baseDiningBudget: number): number {
  const { diningMultiplier } = getCityCostFactors(citySlug);
  return Math.round(baseDiningBudget * diningMultiplier);
}
