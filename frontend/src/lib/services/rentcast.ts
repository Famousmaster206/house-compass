// Live rent data, sourced from RentCast via the Flask backend (backend/app.py
// -> backend/rentcast.py). The RentCast API key stays server-side; this
// module only ever talks to our own backend, never RentCast directly.
//
// This is additive/display-only: it enriches city pages with a "live rent"
// callout alongside the existing static estimates. The core calculation
// engine (lib/services/calculator.ts) intentionally stays synchronous and
// unaffected, so results/what-if/compare keep working instantly with zero
// network dependency.

import { apiGet, isApiConfigured, ApiError } from "@/lib/api/client";

export interface LiveRentData {
  citySlug: string;
  zipCode: string;
  source: "rentcast";
  averageRent: number | null;
  medianRent: number | null;
  rentByBedrooms: Record<string, number>;
  lastUpdatedDate: string | null;
}

export async function getLiveRentForCity(citySlug: string): Promise<LiveRentData | null> {
  if (!isApiConfigured()) return null;
  try {
    return await apiGet<LiveRentData>(`/api/rentcast/city/${citySlug}`);
  } catch (err) {
    if (err instanceof ApiError) return null; // backend not configured or RentCast unreachable. Degrade quietly
    throw err;
  }
}
