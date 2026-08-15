"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowLeft,
  Bath,
  BedDouble,
  Calculator,
  Check,
  Compass,
  Heart,
  House,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { generateAiPropertyOverview } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils/format";

// Sample/demo listing — hardcoded rather than pulled live from RentCast.
// TODO: swap back to the live searchSaleListings() call once the RentCast
// account has an active subscription (it currently returns 403
// billing/subscription-inactive on every request).
const SAMPLE_LISTING = {
  address: "3305 E Cashman Dr, Phoenix, AZ 85050",
  city: "Phoenix",
  state: "AZ",
  citySlug: "phoenix",
  price: 749000,
  bedrooms: 4,
  bathrooms: 3,
  squareFootage: 2620,
  propertyType: "Single Family",
  daysOnMarket: 14,
};

function estimateMonthlyPayment(price: number): number {
  // Simple 20%-down, 30-yr @ ~6.5% amortization estimate for the cost sidebar —
  // illustrative, not a mortgage quote.
  const loanAmount = price * 0.8;
  const monthlyRate = 0.065 / 12;
  const numPayments = 30 * 12;
  const mortgage = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
  return Math.round(mortgage);
}

export function PropertySummary({ onRestart }: { onRestart: () => void }) {
  const router = useRouter();
  const listing = SAMPLE_LISTING;
  const price = listing.price;
  const monthlyPayment = estimateMonthlyPayment(price);
  const costs = [
    { name: "Mortgage", value: monthlyPayment, color: "#d66732" },
    { name: "Summer AC", value: 360, color: "#e9ad58" },
    { name: "Taxes & insurance", value: Math.round((price * 0.014) / 12), color: "#8ba18b" },
  ];
  const homeFacts: { icon: LucideIcon; label: string }[] = [
    { icon: BedDouble, label: `${listing.bedrooms} beds` },
    { icon: Bath, label: `${listing.bathrooms} baths` },
    { icon: House, label: `${listing.squareFootage.toLocaleString()} sq ft` },
  ];

  function goToCalculator() {
    // Seeds the calculator's rent field with this property's estimated
    // monthly payment via URL params — the user still walks through the
    // rest of the form (income, household, etc.) themselves.
    const params = new URLSearchParams({
      rent: String(monthlyPayment),
      city: listing.citySlug,
      address: listing.address,
    });
    router.push(`/calculate?${params.toString()}`);
  }

  return (
    <section className="bg-[#faf8f4] pb-20">
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <button onClick={onRestart} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#637166] transition hover:text-[#263c30]">
          <ArrowLeft size={17} />Start a new search
        </button>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e9f0e5] px-4 py-2 text-sm font-extrabold text-[#35543d]">
            <Compass size={16} />Your House Compass match
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-[#dcd6cb] bg-white px-4 py-2 text-sm font-bold text-[#4e5e53] transition hover:border-[#d66732] hover:text-[#c65f2e]">
            <Heart size={17} />Save home
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#c15e2e]">
              <MapPin size={16} />{listing.city}, {listing.state}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] text-[#253a2e] sm:text-5xl">
              {listing.address}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#68736a]">
              Sample listing for this demo, on the market for {listing.daysOnMarket} days.
            </p>

            <PropertyAiOverview listing={listing} monthlyPayment={monthlyPayment} />

            <div className="mt-7 flex flex-wrap gap-3">
              {homeFacts.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#3a4e40] shadow-sm ring-1 ring-[#e4ddd1]">
                  <Icon size={18} className="text-[#d66732]" />{label}
                </span>
              ))}
            </div>

            <button
              onClick={goToCalculator}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#243b2f] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#345342]"
            >
              <Calculator size={18} aria-hidden="true" /> Calculate my costs for this home
            </button>
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
            <button
              onClick={goToCalculator}
              className="mt-7 w-full rounded-full bg-[#ec8240] py-3.5 font-extrabold transition hover:bg-[#f0965d]"
            >
              Calculate my costs
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

function PropertyAiOverview({
  listing,
  monthlyPayment,
}: {
  listing: typeof SAMPLE_LISTING;
  monthlyPayment: number;
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
        address: listing.address,
        price: listing.price,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFootage: listing.squareFootage,
        propertyType: listing.propertyType,
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
    <div className="mt-5 rounded-3xl border border-[#e4ddd1] bg-white p-6">
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
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#3a4e40]">
          {overview.split("\n").filter(Boolean).map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
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
