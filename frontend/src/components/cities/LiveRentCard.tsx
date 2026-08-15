"use client";

import { useEffect, useState } from "react";
import { Wifi, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getLiveRentForCity, type LiveRentData } from "@/lib/services/rentcast";
import { formatCurrency } from "@/lib/utils/format";

type Status = "loading" | "unavailable" | "ready";

/**
 * Client-side leaf component that fetches live RentCast rent data through
 * the Flask backend (see lib/services/rentcast.ts). Purely additive — sits
 * alongside the static estimate cards on the city detail page and degrades
 * to an "unavailable" state (not an error) if the backend/RentCast isn't
 * configured, so the rest of the page never depends on this succeeding.
 */
export function LiveRentCard({ citySlug }: { citySlug: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<LiveRentData | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLiveRentForCity(citySlug).then((result) => {
      if (cancelled) return;
      if (result) {
        setData(result);
        setStatus("ready");
      } else {
        setStatus("unavailable");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [citySlug]);

  if (status === "unavailable") return null;

  return (
    <Card className="mt-8">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-muted">
          {status === "loading" ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Wifi size={16} className="text-comfortable" aria-hidden="true" />
          )}
          Live rent data
        </p>
        {status === "ready" && (
          <span className="rounded-full bg-comfortable/10 px-2.5 py-1 text-[11px] font-semibold text-comfortable">
            Live via RentCast
          </span>
        )}
      </div>

      {status === "loading" && <p className="mt-3 text-sm text-muted">Fetching current market rent…</p>}

      {status === "ready" && data && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.averageRent != null && (
              <div>
                <p className="text-xs text-muted">Average rent</p>
                <p className="text-lg font-bold tabular-nums text-text">{formatCurrency(data.averageRent)}</p>
              </div>
            )}
            {data.medianRent != null && (
              <div>
                <p className="text-xs text-muted">Median rent</p>
                <p className="text-lg font-bold tabular-nums text-text">{formatCurrency(data.medianRent)}</p>
              </div>
            )}
            {Object.entries(data.rentByBedrooms)
              .sort(([a], [b]) => Number(a) - Number(b))
              .slice(0, 2)
              .map(([bedrooms, rent]) => (
                <div key={bedrooms}>
                  <p className="text-xs text-muted">{bedrooms}BR average</p>
                  <p className="text-lg font-bold tabular-nums text-text">{formatCurrency(rent)}</p>
                </div>
              ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            Zip {data.zipCode} · Sourced from RentCast
            {data.lastUpdatedDate ? ` · updated ${new Date(data.lastUpdatedDate).toLocaleDateString()}` : ""}. Not
            the same as the estimated figures elsewhere on this page.
          </p>
        </>
      )}
    </Card>
  );
}
