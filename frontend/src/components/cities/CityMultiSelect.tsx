"use client";

import { cities } from "@/lib/data/cities";

export interface CityMultiSelectProps {
  selected: string[];
  onChange: (slugs: string[]) => void;
  max?: number;
}

export function CityMultiSelect({ selected, onChange, max = 4 }: CityMultiSelectProps) {
  function toggle(slug: string) {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else if (selected.length < max) {
      onChange([...selected, slug]);
    }
  }

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-text">Choose 2-{max} cities to compare</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {cities.map((city) => {
          const active = selected.includes(city.slug);
          const disabled = !active && selected.length >= max;
          return (
            <button
              key={city.slug}
              type="button"
              disabled={disabled}
              onClick={() => toggle(city.slug)}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-sandstone text-text hover:bg-sandstone-light disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
