import { CompareView } from "@/components/results/CompareView";

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const params = await searchParams;
  const citiesParam = typeof params.cities === "string" ? params.cities : "";
  const initialCitySlugs = citiesParam.split(",").map((s) => s.trim()).filter(Boolean);

  return <CompareView initialCitySlugs={initialCitySlugs} />;
}
