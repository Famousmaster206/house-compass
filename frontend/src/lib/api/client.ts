/**
 * Thin client for the separate backend (Flask app at repo root: app.py).
 *
 * The backend currently exposes no JSON API — it only renders a static
 * placeholder page. This client exists so the data/service layer
 * (lib/data/*, lib/services/*) has one place to swap from local static
 * data to real HTTP calls later, without touching call sites elsewhere
 * in the app.
 *
 * Configure the backend origin via NEXT_PUBLIC_API_BASE_URL. Left unset,
 * isApiConfigured() returns false and callers should fall back to local
 * sample data.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch JSON from the backend. Throws ApiError on non-2xx or network failure.
 * Callers (lib/data/*, lib/services/*) should catch this and fall back to
 * local static data — the calculator must keep working with no backend present.
 */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("Backend API is not configured (NEXT_PUBLIC_API_BASE_URL unset)");
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new ApiError(`Backend request failed: ${res.status} ${res.statusText}`, res.status);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("Backend API is not configured (NEXT_PUBLIC_API_BASE_URL unset)");
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(`Backend request failed: ${res.status} ${res.statusText}`, res.status);
  }
  return res.json() as Promise<T>;
}

export async function generateAiOverview(data: {
  cityName: string;
  monthlyIncome: number;
  expenses: { housing: number; utilities: number; transportation: number; groceries: number; dining: number; lifestyle: number; total: number };
  leftover: number;
  affordabilityRating: string;
  householdSize: number;
  roommates: number;
  hasCar: boolean;
  bedrooms: number;
}): Promise<{ overview: string; success: boolean }> {
  return apiPost<{ overview: string; success: boolean }>("/api/ai-overview", data);
}

export interface AddressEstimate {
  address: string;
  source: "rentcast";
  saleValue?: { price: number | null; priceRangeLow: number | null; priceRangeHigh: number | null };
  rentEstimate?: { rent: number | null; rentRangeLow: number | null; rentRangeHigh: number | null };
  subjectProperty?: {
    formattedAddress: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    propertyType: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFootage: number | null;
    yearBuilt: number | null;
    lastSaleDate: string | null;
    lastSalePrice: number | null;
  } | null;
  errors?: Record<string, string>;
}

/** Address-based sale value + rent estimate, for the calculator's "target address" option. */
export async function getAddressEstimate(address: string): Promise<AddressEstimate> {
  return apiGet<AddressEstimate>(`/api/rentcast/address-estimate?address=${encodeURIComponent(address)}`);
}

export interface SaleListing {
  id: string;
  formattedAddress: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFootage: number | null;
  propertyType: string | null;
  daysOnMarket: number | null;
  listedDate: string | null;
}

/** Ranked active for-sale listings for a city, filtered/sorted by budget + bedroom preference. */
export async function searchSaleListings(params: {
  city?: string;
  state?: string;
  zipCode?: string;
  maxBudget?: number;
  bedrooms?: number;
  limit?: number;
}): Promise<{ listings: SaleListing[]; count: number; source: "rentcast" }> {
  const query = new URLSearchParams();
  if (params.city) query.set("city", params.city);
  if (params.state) query.set("state", params.state);
  if (params.zipCode) query.set("zipCode", params.zipCode);
  if (params.maxBudget) query.set("maxBudget", String(params.maxBudget));
  if (params.bedrooms) query.set("bedrooms", String(params.bedrooms));
  if (params.limit) query.set("limit", String(params.limit));
  return apiGet(`/api/rentcast/listings/search?${query.toString()}`);
}

/** AI-generated overview of a specific for-sale property listing (Gemini, via backend). */
export async function generateAiPropertyOverview(data: {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  daysOnMarket?: number | null;
  monthlyIncome?: number;
  estimatedMonthlyPayment?: number;
}): Promise<{ overview: string; success: boolean }> {
  return apiPost<{ overview: string; success: boolean }>("/api/ai-property-overview", data);
}
