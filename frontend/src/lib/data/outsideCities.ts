// Sample/estimated data for non-Arizona reference cities, used only to convert
// a user's current cost of living into an equivalent Arizona budget.
// TODO: replace with a live cost-of-living index API (e.g. C2ER, Numbeo, BLS).

export interface OutsideCity {
  slug: string;
  name: string;
  state: string;
  costOfLivingIndex: number; // same 100-based scale as lib/data/cities.ts
  rent1BR: number; // estimated median monthly rent, 1BR (reference display only)
}

export const outsideCities: OutsideCity[] = [
  { slug: "los-angeles", name: "Los Angeles", state: "CA", costOfLivingIndex: 173, rent1BR: 2350 },
  { slug: "san-francisco", name: "San Francisco", state: "CA", costOfLivingIndex: 205, rent1BR: 3100 },
  { slug: "chicago", name: "Chicago", state: "IL", costOfLivingIndex: 122, rent1BR: 1900 },
  { slug: "new-york", name: "New York", state: "NY", costOfLivingIndex: 228, rent1BR: 3400 },
];

export function getOutsideCityBySlug(slug: string): OutsideCity | undefined {
  return outsideCities.find((c) => c.slug === slug);
}
