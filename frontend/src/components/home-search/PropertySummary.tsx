"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowLeft,
  Bath,
  BedDouble,
  Check,
  Compass,
  Expand,
  Heart,
  House,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { searchSaleListings, generateAiPropertyOverview, ApiError, isApiConfigured, type SaleListing } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils/format";
import { getCityBySlug } from "@/lib/data/cities";
import type { HomeSearchAnswers } from "@/components/home-search/PreferenceWizard";

/**
 * When the user didn't pick a city in the quiz ("Not sure yet"), suggest one
 * from their other answers instead of defaulting silently to Phoenix. Simple,
 * transparent rules — not ML — matching the same spirit as the listings
 * ranking heuristic in the backend.
 */
function suggestCitySlug(answers: HomeSearchAnswers | null): string {
  if (!answers) return "phoenix";
  if (answers.citySlug) return answers.citySlug;

  const highBudget = answers.budget.includes("1.25M");
  if (answers.style === "Resort-style" || (highBudget && answers.priority !== "Low-water landscaping")) {
    return "scottsdale";
  }
  if (answers.rhythm === "Dining & design") return "tempe";
  if (answers.priority === "Low-water landscaping") return "tucson";
  return "phoenix";
}

/** "No preference" means don't apply the filter — undefined lets the search return everything. */
function parseBudgetLabel(label: string): number | undefined {
  if (label === "No preference") return undefined;
  // "Up to $750K" / "$750K to $1.25M" / "$1.25M+" -> upper bound in dollars
  const matches = label.match(/\$([\d.]+)([KM])/g);
  if (!matches || matches.length === 0) return undefined;
  const last = matches[matches.length - 1];
  const parsed = last.match(/\$([\d.]+)([KM])/);
  if (!parsed) return undefined;
  const [, num, unit] = parsed;
  const value = Number(num) * (unit === "M" ? 1_000_000 : 1_000);
  return label.includes("+") ? value * 1.4 : value;
}

const gallery = [
  ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85", "Desert modern home exterior"],
  ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85", "Main living room"],
  ["https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=85", "Modern kitchen"],
  ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85", "Master bedroom"],
  ["https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=900&q=85", "Backyard patio"],
] as const;

function estimateMonthlyPayment(price: number): number {
  // Simple 20%-down, 30-yr @ ~6.5% amortization estimate for the cost sidebar —
  // illustrative, not a mortgage quote.
  const loanAmount = price * 0.8;
  const monthlyRate = 0.065 / 12;
  const numPayments = 30 * 12;
  const mortgage = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
  return Math.round(mortgage);
}

type Status = "loading" | "empty" | "error" | "ready";

export function PropertySummary({
  answers,
  onRestart,
}: {
  answers: HomeSearchAnswers | null;
  onRestart: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [listings, setListings] = useState<SaleListing[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const suggestedSlug = suggestCitySlug(answers);
  const suggestedCity = getCityBySlug(suggestedSlug);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!isApiConfigured()) {
        setStatus("error");
        setErrorMessage("The listings search isn't configured right now.");
        return;
      }
      setStatus("loading");
      try {
        const maxBudget = answers ? parseBudgetLabel(answers.budget) : undefined;
        const result = await searchSaleListings({
          city: suggestedCity?.name ?? "Phoenix",
          state: "AZ",
          maxBudget,
          limit: 20,
        });
        if (cancelled) return;
        if (result.listings.length === 0) {
          setStatus("empty");
        } else {
          setListings(result.listings);
          setSelectedIndex(0);
          setStatus("ready");
        }
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof ApiError ? err.message : "Couldn't load listings right now.");
        setStatus("error");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [answers, suggestedCity?.name]);

  const listing = listings[selectedIndex] ?? null;

  if (status === "loading") {
    return (
      <section className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-[#faf8f4]">
        <div className="flex flex-col items-center gap-3 text-[#4e5e53]">
          <Loader2 size={28} className="animate-spin text-[#d66732]" aria-hidden="true" />
          <p className="text-sm font-semibold">Finding your match...</p>
        </div>
      </section>
    );
  }

  if (status === "error" || status === "empty") {
    return (
      <section className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-[#faf8f4] px-5 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          {status === "empty" ? (
            <Search size={36} className="text-[#8a9587]" aria-hidden="true" />
          ) : (
            <AlertCircle size={36} className="text-[#c15e2e]" aria-hidden="true" />
          )}
          <h1 className="mt-4 text-2xl font-bold text-[#253a2e]">
            {status === "empty" ? "No matches found right now" : "Couldn't load listings"}
          </h1>
          <p className="mt-2 text-[#68756b]">
            {status === "empty"
              ? "We couldn't find an active listing matching your budget. Try a wider range."
              : errorMessage}
          </p>
          <button
            onClick={onRestart}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#243b2f] px-6 py-3 font-bold text-white transition hover:bg-[#345342]"
          >
            <ArrowLeft size={17} aria-hidden="true" /> Start a new search
          </button>
        </div>
      </section>
    );
  }

  if (!listing) return null;

  const price = listing.price ?? 0;
  const monthlyPayment = estimateMonthlyPayment(price);
  const costs = [
    { name: "Mortgage", value: monthlyPayment, color: "#d66732" },
    { name: "Summer AC", value: 360, color: "#e9ad58" },
    { name: "Taxes & insurance", value: Math.round(price * 0.014 / 12), color: "#8ba18b" },
  ];
  const homeFacts: { icon: LucideIcon; label: string }[] = [
    { icon: BedDouble, label: `${listing.bedrooms ?? "—"} beds` },
    { icon: Bath, label: `${listing.bathrooms ?? "—"} baths` },
    { icon: House, label: listing.squareFootage ? `${listing.squareFootage.toLocaleString()} sq ft` : "Size unavailable" },
  ];

  return (
    <section className="bg-[#faf8f4] pb-20">
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <button onClick={onRestart} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#637166] transition hover:text-[#263c30]">
          <ArrowLeft size={17} />Start a new search
        </button>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e9f0e5] px-4 py-2 text-sm font-extrabold text-[#35543d]">
              <Compass size={16} />
              {listings.length > 1 ? `${listings.length} matches found` : "Your House Compass match"}
            </div>
            {answers && !answers.citySlug && suggestedCity && (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fbeee0] px-4 py-2 text-sm font-semibold text-[#a5581f]">
                <MapPin size={14} />We suggested {suggestedCity.name} based on your answers
              </div>
            )}
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-[#dcd6cb] bg-white px-4 py-2 text-sm font-bold text-[#4e5e53] transition hover:border-[#d66732] hover:text-[#c65f2e]">
            <Heart size={17} />Save home
          </button>
        </div>

        <div className="relative grid h-[440px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[2rem] bg-[#ded7ca] sm:h-[540px] sm:gap-3">
          <div className="relative col-span-4 row-span-1 sm:col-span-2 sm:row-span-2">
            <Image src={gallery[0][0]} alt={gallery[0][1]} fill priority sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          </div>
          {gallery.slice(1).map(([src, alt]) => (
            <div className="relative col-span-2 overflow-hidden sm:col-span-1" key={src}>
              <Image src={src} alt={alt} fill sizes="25vw" className="object-cover transition duration-500 hover:scale-105" />
            </div>
          ))}
          <button className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-[#243b2f] shadow-lg backdrop-blur">
            <Expand size={16} />Photos are for reference, not this exact home
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#c15e2e]">
              <MapPin size={16} />{listing.city ?? "Arizona"}, {listing.state ?? "AZ"}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] text-[#253a2e] sm:text-5xl">
              {listing.formattedAddress ?? "A home worth a closer look."}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#68736a]">
              {listing.daysOnMarket != null
                ? `An active listing pulled from RentCast, on the market for ${listing.daysOnMarket} day${listing.daysOnMarket === 1 ? "" : "s"}.`
                : "An active listing pulled from RentCast."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {homeFacts.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#3a4e40] shadow-sm ring-1 ring-[#e4ddd1]">
                  <Icon size={18} className="text-[#d66732]" />{label}
                </span>
              ))}
            </div>

            <PropertyAiOverview listing={listing} monthlyPayment={monthlyPayment} citySlug={suggestedSlug} />
          </div>

          <aside className="rounded-[2rem] bg-[#243b2f] p-7 text-white shadow-xl shadow-[#243b2f]/15">
            <p className="text-sm font-bold text-[#f1b06d]">Listed at</p>
            <p className="mt-1 text-4xl font-extrabold tracking-[-0.05em]">{formatCurrency(price)}</p>
            <p className="mt-2 text-sm text-white/70">Estimated payment based on 20% down</p>
            <div className="my-7 h-px bg-white/15" />
            <p className="text-sm font-bold text-white/80">Estimated monthly cost</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costs} dataKey="value" innerRadius={52} outerRadius={76} paddingAngle={3} stroke="none">
                    {costs.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}/mo`} contentStyle={{ borderRadius: 14, border: "none", color: "#243b2f" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="-mt-3 flex flex-col gap-2">
              {costs.map((item) => (
                <div className="flex items-center justify-between text-sm" key={item.name}>
                  <span className="flex items-center gap-2 text-white/75">
                    <i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.name}
                  </span>
                  <strong>${item.value.toLocaleString()}</strong>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/50">
              Rough estimate assuming 20% down on a 30-year loan at 6.5%. Not an actual loan quote.
            </p>
            <button className="mt-7 w-full rounded-full bg-[#ec8240] py-3.5 font-extrabold transition hover:bg-[#f0965d]">
              Schedule a tour
            </button>
          </aside>
        </div>

        {listings.length > 1 && (
          <div className="mt-14">
            <h2 className="text-xl font-extrabold text-[#253a2e]">Other matches in this search</h2>
            <p className="mt-1 text-sm text-[#68756b]">
              Active listings pulled live from RentCast for {suggestedCity?.name ?? "your"} search, ranked
              against the budget you set.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    index === selectedIndex
                      ? "border-[#d66732] bg-[#fffaf3] shadow-md shadow-[#d66732]/10"
                      : "border-[#e5d9c9] bg-white hover:border-[#bdc8b8] hover:shadow-sm"
                  }`}
                >
                  <p className="font-bold text-[#253a2e]">{formatCurrency(item.price ?? 0)}</p>
                  <p className="mt-1 truncate text-sm text-[#68756b]">{item.formattedAddress ?? "Address unavailable"}</p>
                  <p className="mt-2 text-xs text-[#8a9587]">
                    {item.bedrooms ?? "—"} bd · {item.bathrooms ?? "—"} ba
                    {item.squareFootage ? ` · ${item.squareFootage.toLocaleString()} sq ft` : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PropertyAiOverview({
  listing,
  monthlyPayment,
  citySlug,
}: {
  listing: SaleListing;
  monthlyPayment: number;
  citySlug: string;
}) {
  const [overview, setOverview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRequested, setHasRequested] = useState(false);

  async function fetchOverview() {
    setLoading(true);
    setError("");
    setHasRequested(true);
    try {
      const response = await generateAiPropertyOverview({
        address: listing.formattedAddress ?? "this property",
        price: listing.price ?? 0,
        bedrooms: listing.bedrooms ?? 0,
        bathrooms: listing.bathrooms ?? 0,
        squareFootage: listing.squareFootage ?? 0,
        propertyType: listing.propertyType ?? "home",
        daysOnMarket: listing.daysOnMarket,
        estimatedMonthlyPayment: monthlyPayment,
      });
      if (response.success) {
        setOverview(response.overview);
      } else {
        setError("Failed to generate overview. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating the overview.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-3xl border border-[#e4ddd1] bg-white p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-[#d66732]" aria-hidden="true" />
        <p className="text-sm font-bold text-[#4e5e53]">AI-Powered Overview</p>
      </div>

      {!hasRequested && !overview && (
        <p className="mt-4 text-sm text-[#3a4e40]">
          Get a quick read on this property: what stands out, what to check before you commit, and whether it fits your budget.
        </p>
      )}

      {hasRequested && loading && (
        <div className="mt-4 flex items-center gap-2 text-[#68756b]">
          <Loader2 className="animate-spin text-[#d66732]" size={18} aria-hidden="true" />
          <p className="text-sm">Generating personalized insights...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {overview && !loading && (
        <>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#3a4e40]">
            {overview.split("\n").filter(Boolean).map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={`/what-if?city=${citySlug}&rent=${monthlyPayment}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#d66732] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#e17840]"
          >
            <SlidersHorizontal size={16} aria-hidden="true" /> See full cost breakdown
          </Link>
        </>
      )}

      {!hasRequested && (
        <button
          onClick={fetchOverview}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#243b2f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#345342] disabled:opacity-50"
        >
          <Check size={16} aria-hidden="true" /> Generate AI Overview
        </button>
      )}

      {overview && !loading && (
        <button
          onClick={fetchOverview}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#dcd6cb] px-5 py-2.5 text-sm font-bold text-[#4e5e53] transition hover:border-[#d66732] hover:text-[#c65f2e] disabled:opacity-50"
        >
          Regenerate
        </button>
      )}

      <p className="mt-3 text-xs text-[#8a9587]">
        This AI-generated overview is for informational purposes and should not be considered financial advice.
      </p>
    </div>
  );
}
