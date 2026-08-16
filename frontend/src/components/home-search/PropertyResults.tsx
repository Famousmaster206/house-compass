"use client";

import { ArrowLeft, Bath, BedDouble, House, MapPin } from "lucide-react";
import { SAMPLE_LISTINGS, type SampleListing } from "@/components/home-search/PropertySummary";
import { formatCurrency } from "@/lib/utils/format";

export function PropertyResults({
  onSelect,
  onRestart,
}: {
  onSelect: (listing: SampleListing) => void;
  onRestart: () => void;
}) {
  return (
    <section className="bg-[#faf8f4] px-5 pb-20 pt-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <button onClick={onRestart} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#637166] transition hover:text-[#263c30]">
          <ArrowLeft size={17} />Start a new search
        </button>

        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#bd612f]">Your matches</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.045em] text-[#23382d] sm:text-5xl">
          {SAMPLE_LISTINGS.length} homes fit what you&apos;re looking for
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-7 text-[#697269]">
          Pick a home to see the full cost breakdown for your budget.
        </p>

        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_LISTINGS.map((listing) => (
            <button
              key={listing.address}
              onClick={() => onSelect(listing)}
              className="group flex flex-col rounded-3xl border-2 border-[#e5d9c9] bg-white p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-[#d66732] hover:shadow-lg hover:shadow-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d66732]"
            >
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#c15e2e]">
                <MapPin size={15} />{listing.city}, {listing.state}
              </p>
              <h2 className="mt-2 text-xl font-extrabold leading-snug tracking-[-0.02em] text-[#253a2e]">
                {listing.address}
              </h2>
              <p className="mt-4 text-2xl font-extrabold tracking-[-0.03em] text-[#243b2f]">
                {formatCurrency(listing.price)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf1e9] px-3 py-1.5 text-xs font-bold text-[#3a4e40]">
                  <BedDouble size={14} className="text-[#d66732]" />{listing.bedrooms} beds
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf1e9] px-3 py-1.5 text-xs font-bold text-[#3a4e40]">
                  <Bath size={14} className="text-[#d66732]" />{listing.bathrooms} baths
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf1e9] px-3 py-1.5 text-xs font-bold text-[#3a4e40]">
                  <House size={14} className="text-[#d66732]" />{listing.squareFootage.toLocaleString()} sq ft
                </span>
              </div>
              <p className="mt-4 text-sm text-[#8a9587]">
                On the market for {listing.daysOnMarket} days
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
