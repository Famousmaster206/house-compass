import { getCityBySlug } from "@/lib/data/cities";

export interface HousingCostInput {
  bedrooms: 1 | 3; // simplified: 1BR vs 2-3BR
  roommates: number; // number of ADDITIONAL roommates (0 = living alone)
  userProvidedRent?: number; // optional override, total rent before splitting
}

/**
 * Estimates monthly housing cost for a city, splitting total rent across
 * the user + roommates. Falls back to city sample data if no override given.
 */
export function getHousingCost(
  citySlug: string,
  { bedrooms, roommates, userProvidedRent }: HousingCostInput
): number {
  const city = getCityBySlug(citySlug);
  const baseRent =
    userProvidedRent ??
    (bedrooms === 1 ? city?.rent1BR : city?.rent3BR) ??
    1300;

  const splitCount = Math.max(1, roommates + 1);
  return Math.round(baseRent / splitCount);
}
