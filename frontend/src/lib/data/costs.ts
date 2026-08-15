// Static lookup tables with sample/estimated data
// TODO: replace grocery/dining multipliers with a live cost-of-living API
// TODO: replace gas price estimate with a live gas price API (e.g. AAA/EIA feed)
// TODO: replace car insurance estimate with a real insurance-rate API by city/zip

export interface CityCostFactors {
  slug: string;
  groceryMultiplier: number; // multiplier vs. national baseline grocery cost
  diningMultiplier: number; // multiplier vs. national baseline dining-out cost
  gasPricePerGallon: number; // estimated average price per gallon
  avgMonthlyCarInsurance: number; // estimated average monthly car insurance premium
}

export const cityCostFactors: CityCostFactors[] = [
  { slug: "phoenix", groceryMultiplier: 1.02, diningMultiplier: 1.05, gasPricePerGallon: 3.55, avgMonthlyCarInsurance: 145 },
  { slug: "tucson", groceryMultiplier: 0.95, diningMultiplier: 0.92, gasPricePerGallon: 3.5, avgMonthlyCarInsurance: 130 },
  { slug: "mesa", groceryMultiplier: 1.0, diningMultiplier: 0.98, gasPricePerGallon: 3.55, avgMonthlyCarInsurance: 138 },
  { slug: "chandler", groceryMultiplier: 1.04, diningMultiplier: 1.06, gasPricePerGallon: 3.55, avgMonthlyCarInsurance: 140 },
  { slug: "scottsdale", groceryMultiplier: 1.15, diningMultiplier: 1.25, gasPricePerGallon: 3.6, avgMonthlyCarInsurance: 155 },
  { slug: "tempe", groceryMultiplier: 1.05, diningMultiplier: 1.08, gasPricePerGallon: 3.55, avgMonthlyCarInsurance: 142 },
  { slug: "glendale", groceryMultiplier: 0.98, diningMultiplier: 0.95, gasPricePerGallon: 3.55, avgMonthlyCarInsurance: 136 },
  { slug: "flagstaff", groceryMultiplier: 1.1, diningMultiplier: 1.1, gasPricePerGallon: 3.75, avgMonthlyCarInsurance: 128 },
];

// National baseline estimates used with multipliers above (per adult, per month)
export const BASELINE_GROCERY_COST = 400;
export const BASELINE_DINING_COST = 250;

export function getCityCostFactors(citySlug: string): CityCostFactors {
  const found = cityCostFactors.find((c) => c.slug === citySlug);
  if (found) return found;
  // Fallback to national-average-like defaults if city not found
  return {
    slug: citySlug,
    groceryMultiplier: 1,
    diningMultiplier: 1,
    gasPricePerGallon: 3.5,
    avgMonthlyCarInsurance: 140,
  };
}
