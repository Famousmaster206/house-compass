"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cities } from "@/lib/data/cities";
import { CityCard } from "@/components/cities/CityCard";
import { Select } from "@/components/ui/Select";

export interface CitiesExplorerProps {
  initialSort?: string;
  initialFilter?: string;
}

const sortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "cheapest", label: "Cheapest cost index" },
  { value: "priciest", label: "Highest cost index" },
  { value: "rent-low", label: "Lowest rent" },
];

const filterOptions = [
  { value: "all", label: "All cities" },
  { value: "budget", label: "Budget-friendly (index < 95)" },
  { value: "moderate", label: "Moderate (index 95-110)" },
  { value: "premium", label: "Premium (index > 110)" },
];

export function CitiesExplorer({ initialSort = "name", initialFilter = "all" }: CitiesExplorerProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(initialSort);
  const [filter, setFilter] = useState(initialFilter);

  const filtered = useMemo(() => {
    let list = cities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

    if (filter === "budget") list = list.filter((c) => c.costOfLivingIndex < 95);
    if (filter === "moderate") list = list.filter((c) => c.costOfLivingIndex >= 95 && c.costOfLivingIndex <= 110);
    if (filter === "premium") list = list.filter((c) => c.costOfLivingIndex > 110);

    switch (sort) {
      case "cheapest":
        return [...list].sort((a, b) => a.costOfLivingIndex - b.costOfLivingIndex);
      case "priciest":
        return [...list].sort((a, b) => b.costOfLivingIndex - a.costOfLivingIndex);
      case "rent-low":
        return [...list].sort((a, b) => a.rent1BR - b.rent1BR);
      default:
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [search, sort, filter]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="city-search" className="text-sm font-semibold text-text">
            Search cities
          </label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
            <input
              id="city-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Phoenix"
              className="w-full rounded-xl border border-sandstone bg-white py-2.5 pl-10 pr-4 text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>
        </div>
        <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} options={sortOptions} />
        <Select label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} options={filterOptions} />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-muted">No cities match your search.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((city) => (
            <CityCard key={city.slug} city={city} />
          ))}
        </div>
      )}
    </div>
  );
}
