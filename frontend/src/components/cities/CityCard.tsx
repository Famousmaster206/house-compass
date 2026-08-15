import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import type { City } from "@/lib/data/cities";
import { getCityImageUrl } from "@/lib/data/cities";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/format";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

export function CityCard({ city }: { city: City }) {
  const tier =
    city.costOfLivingIndex < 95
      ? "Budget-friendly"
      : city.costOfLivingIndex < 110
        ? "Moderate"
        : "Premium";

  return (
    <Link href={`/cities/${city.slug}`} className="group block h-full">
      <SpotlightCard className="h-full rounded-3xl">
        <Card className="h-full overflow-hidden p-0">
          <div className="relative h-36 w-full overflow-hidden">
            <Image
              src={getCityImageUrl(city, 600)}
              alt={city.imageAlt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
            <div className="absolute right-3 top-3">
              <Badge>{tier}</Badge>
            </div>
            <p className="absolute bottom-2 left-3 text-[10px] font-medium text-white/70">Photo: Unsplash</p>
          </div>
          <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-text">{city.name}</h3>
              <p className="flex items-center gap-1 text-xs text-muted">
                <MapPin size={12} aria-hidden="true" /> {city.region}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">{city.vibe}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted">1BR rent (est.)</p>
              <p className="font-bold text-text tabular-nums">{formatCurrency(city.rent1BR)}</p>
            </div>
            <div>
              <p className="text-muted">Cost index</p>
              <p className="font-bold text-text tabular-nums">{city.costOfLivingIndex}</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs text-muted">
            <Users size={12} aria-hidden="true" /> ~{city.population.toLocaleString()} residents (sample data)
          </p>
          </div>
        </Card>
      </SpotlightCard>
    </Link>
  );
}
