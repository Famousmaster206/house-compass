import { CitiesExplorer } from "@/components/cities/CitiesExplorer";

export default async function CitiesPage({ searchParams }: PageProps<"/cities">) {
  const params = await searchParams;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const filter = typeof params.filter === "string" ? params.filter : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-text">Arizona Cities</h1>
      <p className="mt-2 text-muted">
        Search and filter estimated cost of living across 8 Arizona cities.
      </p>
      <div className="mt-8">
        <CitiesExplorer initialSort={sort} initialFilter={filter} />
      </div>
    </div>
  );
}
