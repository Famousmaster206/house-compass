import { getCityCostFactors } from "@/lib/data/costs";

// TODO: replace with a live gas price API (e.g. AAA or EIA regional feed)
// and real commute-distance estimation.

const ASSUMED_MONTHLY_MILES = 800;
const ASSUMED_MPG = 25;

/**
 * Simple estimate of monthly gas spend for a city, if the user has a car.
 */
export function estimateMonthlyGas(
  citySlug: string,
  hasCarUsage: boolean
): number {
  if (!hasCarUsage) return 0;
  const { gasPricePerGallon } = getCityCostFactors(citySlug);
  const gallonsPerMonth = ASSUMED_MONTHLY_MILES / ASSUMED_MPG;
  return Math.round(gallonsPerMonth * gasPricePerGallon);
}
