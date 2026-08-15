/**
 * Thin client for the separate backend (Flask app at repo root: app.py).
 *
 * The backend currently exposes no JSON API; it only renders a static
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
 * local static data. The calculator must keep working with no backend present.
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
