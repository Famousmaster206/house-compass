import { getHousingCost } from "@/lib/services/housing";
import { estimateMonthlyGas } from "@/lib/services/gas";
import { estimateGroceryCost, estimateDiningCost } from "@/lib/services/costOfLiving";
import { getCityBySlug } from "@/lib/data/cities";
import { getCityCostFactors } from "@/lib/data/costs";
import {
  getAffordabilityRating,
  type AffordabilityRating,
} from "@/lib/config/affordability";

export interface CalculatorInput {
  // Personal
  monthlyIncome: number; // net/take-home, see taxes.ts TODO
  // Household
  householdSize: number; // total people including the user
  roommates: number; // additional roommates sharing rent (0 = alone)
  // Housing
  bedrooms: 1 | 3;
  userProvidedRent?: number;
  // Transportation
  hasCar: boolean;
  monthlyCarPayment: number;
  // Food
  diningBudget: number; // user's own baseline monthly dining-out budget
  // Utilities
  includeUtilities: boolean;
  // Lifestyle
  lifestyleBudget: number; // entertainment/misc monthly budget
  // City selection
  citySlug: string;
  compareCitySlugs?: string[];
}

export interface ExpenseBreakdown {
  housing: number;
  utilities: number;
  transportation: number;
  groceries: number;
  dining: number;
  lifestyle: number;
  total: number;
}

export interface CalculationResult {
  citySlug: string;
  cityName: string;
  monthlyIncome: number;
  expenses: ExpenseBreakdown;
  totalExpenses: number;
  leftover: number;
  affordability: AffordabilityRating;
}

export function calculateMonthlyExpenses(
  input: CalculatorInput,
  citySlug: string = input.citySlug
): ExpenseBreakdown {
  const city = getCityBySlug(citySlug);
  const factors = getCityCostFactors(citySlug);

  const housing = getHousingCost(citySlug, {
    bedrooms: input.bedrooms,
    roommates: input.roommates,
    userProvidedRent: input.userProvidedRent,
  });

  const utilities = input.includeUtilities
    ? Math.round((city?.avgUtilities ?? 200) / Math.max(1, input.roommates + 1))
    : 0;

  const transportation = input.hasCar
    ? estimateMonthlyGas(citySlug, true) +
      input.monthlyCarPayment +
      factors.avgMonthlyCarInsurance
    : city
      ? Math.round(city.avgTransportation * 0.4) // public transit / rideshare fallback estimate
      : 100;

  const groceries = estimateGroceryCost(citySlug, input.householdSize);
  const dining = estimateDiningCost(citySlug, input.diningBudget);
  const lifestyle = Math.round(input.lifestyleBudget);

  const total = housing + utilities + transportation + groceries + dining + lifestyle;

  return { housing, utilities, transportation, groceries, dining, lifestyle, total };
}

export function calculateAffordability(
  input: CalculatorInput,
  citySlug: string = input.citySlug
): CalculationResult {
  const city = getCityBySlug(citySlug);
  const expenses = calculateMonthlyExpenses(input, citySlug);
  const leftover = Math.round(input.monthlyIncome - expenses.total);
  const affordability = getAffordabilityRating(leftover, input.monthlyIncome);

  return {
    citySlug,
    cityName: city?.name ?? citySlug,
    monthlyIncome: input.monthlyIncome,
    expenses,
    totalExpenses: expenses.total,
    leftover,
    affordability,
  };
}

export function compareCities(
  input: CalculatorInput,
  citySlugs: string[]
): CalculationResult[] {
  return citySlugs.map((slug) => calculateAffordability(input, slug));
}

/**
 * Runs a what-if scenario by shallow-merging overrides onto a base input
 * and recalculating affordability for the (possibly overridden) city.
 */
export function runWhatIfScenario(
  baseInput: CalculatorInput,
  overrides: Partial<CalculatorInput>
): CalculationResult {
  const merged: CalculatorInput = { ...baseInput, ...overrides };
  return calculateAffordability(merged, merged.citySlug);
}
