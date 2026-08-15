// Single source of truth for affordability thresholds.
// All other modules MUST import from here; never hardcode thresholds elsewhere.

export const COMFORTABLE_THRESHOLD = 0.3; // leftover > 30% of income
export const MODERATE_THRESHOLD = 0.15; // leftover > 15% of income
export const TIGHT_THRESHOLD = 0.05; // leftover > 5% of income
// Anything below TIGHT_THRESHOLD (including negative leftover) is "difficult".

export type AffordabilityRatingId =
  | "comfortable"
  | "moderate"
  | "tight"
  | "difficult";

export interface AffordabilityRating {
  rating: AffordabilityRatingId;
  label: string;
  color: string; // CSS variable reference
}

/**
 * Rates affordability based on leftover money as a fraction of monthly income.
 * Never rely on color alone in the UI; always pair with the label/icon.
 */
export function getAffordabilityRating(
  leftover: number,
  monthlyIncome: number
): AffordabilityRating {
  const ratio = monthlyIncome > 0 ? leftover / monthlyIncome : -1;

  if (ratio >= COMFORTABLE_THRESHOLD) {
    return {
      rating: "comfortable",
      label: "Comfortable",
      color: "var(--color-comfortable)",
    };
  }
  if (ratio >= MODERATE_THRESHOLD) {
    return {
      rating: "moderate",
      label: "Moderate",
      color: "var(--color-moderate)",
    };
  }
  if (ratio >= TIGHT_THRESHOLD) {
    return {
      rating: "tight",
      label: "Tight",
      color: "var(--color-tight)",
    };
  }
  return {
    rating: "difficult",
    label: "Difficult",
    color: "var(--color-difficult)",
  };
}
