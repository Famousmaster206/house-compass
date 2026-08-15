import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users, TrendingUp } from "lucide-react";
import { cities, getAllCitySlugs, getCityBySlug } from "@/lib/data/cities";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IncomeNeededChart } from "@/components/charts/IncomeNeededChart";
import { formatCurrency } from "@/lib/utils/format";

export function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

export default async function CityDetailPage({ params }: PageProps<"/cities/[city]">) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) notFound();

  const others = cities.filter((c) => c.slug !== city.slug).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1 text-sm text-muted">
            <MapPin size={14} aria-hidden="true" /> {city.region}
          </p>
          <h1 className="mt-1 text-4xl font-extrabold text-text">{city.name}</h1>
          <p className="mt-2 max-w-2xl text-muted">{city.description}</p>
        </div>
        <Link href={`/calculate`}>
          <Button>Calculate for {city.name}</Button>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-muted">1BR rent (est.)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text">{formatCurrency(city.rent1BR)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">2-3BR rent (est.)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text">{formatCurrency(city.rent3BR)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Avg utilities (est.)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text">{formatCurrency(city.avgUtilities)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Cost of living index</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text">{city.costOfLivingIndex}</p>
          <p className="text-xs text-muted">100 = national average</p>
        </Card>
      </div>

      <Card className="mt-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-muted">
          <TrendingUp size={16} aria-hidden="true" /> How much do you need to earn?
        </p>
        <IncomeNeededChart citySlug={city.slug} />
      </Card>

      <Card className="mt-8">
        <p className="text-sm font-semibold text-muted">The vibe</p>
        <p className="mt-2 text-lg text-text">{city.vibe}</p>
        <p className="mt-3 flex items-center gap-1 text-xs text-muted">
          <Users size={12} aria-hidden="true" /> ~{city.population.toLocaleString()} residents (sample data)
        </p>
        <p className="mt-2 text-xs text-muted">
          All figures on this page are estimates from sample cost-of-living data — not live pricing.
        </p>
      </Card>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-text">Compare with other cities</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/compare?cities=${city.slug},${c.slug}`}
              className="rounded-full border border-sandstone px-4 py-2 text-sm font-semibold text-text hover:bg-sandstone-light"
            >
              {city.name} vs {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
