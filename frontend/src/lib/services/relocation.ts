// Converts a user's current, real-world monthly expenses in an outside city
// into an equivalent estimated budget in an Arizona city, using each city's
// cost-of-living index as a simple ratio, applied per expense category (not
// just one lump sum). This mirrors the category breakdown used by the
// "Build my budget" calculator (see lib/services/calculator.ts) so the two
// flows produce comparable, equally detailed results.
//
// TODO: replace the single blended cost-of-living-index ratio with a proper
// category-level cost-of-living API (housing/food/transport indices differ
// per category in reality; using one index per category is an MVP
// simplification, but still more granular than one lump-sum conversion).

import { getCityBySlug, type City } from "@/lib/data/cities";
import { getOutsideCityBySlug, type OutsideCity } from "@/lib/data/outsideCities";
import { getAffordabilityRating, type AffordabilityRating } from "@/lib/config/affordability";
import type { ExpenseBreakdown } from "@/lib/services/calculator";

export interface RelocationInput {
  // Personal
  monthlyIncome: number;
  // Household
  householdSize: number;
  roommates: number;
  // Housing
  currentRent: number; // what they actually pay today (total, before any split)
  // Transportation
  hasCar: boolean;
  monthlyCarPayment: number;
  // Food
  groceryBudget: number;
  diningBudget: number;
  // Utilities
  includeUtilities: boolean;
  currentUtilities: number; // what they actually pay today
  // Lifestyle
  lifestyleBudget: number;
  // Cities
  currentCitySlug: string; // slug into outsideCities
  targetCitySlug: string; // slug into lib/data/cities (Arizona)
}

export interface RelocationResult {
  currentCity: OutsideCity;
  targetCity: City;
  monthlyIncome: number;
  currentExpenses: ExpenseBreakdown;
  targetExpenses: ExpenseBreakdown;
  monthlySavings: number; // positive = cheaper in the AZ city
  percentChange: number; // fraction (e.g. -0.15 = -15%); negative = cost decreases moving to target
  estimatedLeftover: number;
  affordability: AffordabilityRating;
}

function costOfLivingRatio(currentCitySlug: string, targetCitySlug: string): number {
  const current = getOutsideCityBySlug(currentCitySlug);
  const target = getCityBySlug(targetCitySlug);
  if (!current || !target) return 1;
  return target.costOfLivingIndex / current.costOfLivingIndex;
}

/** Converts a single dollar figure using the blended cost-of-living ratio between two cities. */
export function convertCostOfLiving(
  amount: number,
  currentCitySlug: string,
  targetCitySlug: string
): number {
  return Math.round(amount * costOfLivingRatio(currentCitySlug, targetCitySlug));
}

function buildCurrentExpenses(input: RelocationInput): ExpenseBreakdown {
  const housing = Math.round(input.currentRent / Math.max(1, input.roommates + 1));
  const utilities = input.includeUtilities ? input.currentUtilities : 0;
  const transportation = input.hasCar ? input.monthlyCarPayment : 0;
  const groceries = Math.round(input.groceryBudget);
  const dining = Math.round(input.diningBudget);
  const lifestyle = Math.round(input.lifestyleBudget);
  const total = housing + utilities + transportation + groceries + dining + lifestyle;
  return { housing, utilities, transportation, groceries, dining, lifestyle, total };
}

function convertExpenses(expenses: ExpenseBreakdown, ratio: number): ExpenseBreakdown {
  const housing = Math.round(expenses.housing * ratio);
  const utilities = Math.round(expenses.utilities * ratio);
  const transportation = Math.round(expenses.transportation * ratio);
  const groceries = Math.round(expenses.groceries * ratio);
  const dining = Math.round(expenses.dining * ratio);
  const lifestyle = Math.round(expenses.lifestyle * ratio);
  const total = housing + utilities + transportation + groceries + dining + lifestyle;
  return { housing, utilities, transportation, groceries, dining, lifestyle, total };
}

export function calculateRelocation(input: RelocationInput): RelocationResult | null {
  const currentCity = getOutsideCityBySlug(input.currentCitySlug);
  const targetCity = getCityBySlug(input.targetCitySlug);
  if (!currentCity || !targetCity) return null;

  const currentExpenses = buildCurrentExpenses(input);
  const ratio = costOfLivingRatio(input.currentCitySlug, input.targetCitySlug);
  const targetExpenses = convertExpenses(currentExpenses, ratio);

  const monthlySavings = currentExpenses.total - targetExpenses.total;
  // Fraction (e.g. -0.153), matching lib/utils/format.ts's formatPercent convention.
  const percentChange =
    currentExpenses.total > 0 ? (targetExpenses.total - currentExpenses.total) / currentExpenses.total : 0;
  const estimatedLeftover = Math.round(input.monthlyIncome - targetExpenses.total);
  const affordability = getAffordabilityRating(estimatedLeftover, input.monthlyIncome);

  return {
    currentCity,
    targetCity,
    monthlyIncome: input.monthlyIncome,
    currentExpenses,
    targetExpenses,
    monthlySavings,
    percentChange,
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
