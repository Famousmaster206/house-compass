// Sample/estimated data. TODO: replace with live cost-of-living API
// All figures are rough, illustrative estimates for MVP purposes only.
// When the separate backend (repo root app.py) exposes a cities endpoint,
// swap this for a call through lib/api/client.ts (see isApiConfigured()).

export interface City {
  slug: string;
  name: string;
  region: string; // county
  description: string;
  rent1BR: number; // estimated median monthly rent, 1BR
  rent3BR: number; // estimated median monthly rent, 2-3BR
  avgUtilities: number; // estimated monthly utilities (electric/water/gas/internet)
  avgTransportation: number; // estimated monthly transportation cost assumption
  costOfLivingIndex: number; // rough index vs. national average (100 = national avg)
  population: number; // approx, sample data
  vibe: string;
  // Free-to-use Unsplash photo (hotlinked via images.unsplash.com, no API key/
  // attribution required for this usage). Not the specific named city in every
  // case. TODO: swap for a licensed,
  // city-specific photo set when available.
  imageId: string;
  imageAlt: string;
}

export const cities: City[] = [
  {
    slug: "phoenix",
    name: "Phoenix",
    region: "Maricopa County",
    description:
      "Arizona's capital and largest city. A sprawling desert metro with big-city amenities and lower cost of living than most major U.S. cities.",
    rent1BR: 1350,
    rent3BR: 1950,
    avgUtilities: 220,
    avgTransportation: 380,
    costOfLivingIndex: 104,
    population: 1650000,
    vibe: "Big-city energy, endless sunshine, and a growing food & arts scene.",
    imageId: "1647929368246-193b86f4a3bc",
    imageAlt: "Desert landscape at sunset in Arizona",
  },
  {
    slug: "tucson",
    name: "Tucson",
    region: "Pima County",
    description:
      "A laid-back university town ringed by mountains, known for affordability and a strong food culture.",
    rent1BR: 1050,
    rent3BR: 1550,
    avgUtilities: 190,
    avgTransportation: 320,
    costOfLivingIndex: 92,
    population: 545000,
    vibe: "Relaxed, artsy, and one of the most affordable metros in the Southwest.",
    imageId: "1762572811448-6bd7e862682b",
    imageAlt: "Saguaro cacti on a rocky desert hillside near Tucson, Arizona",
  },
  {
    slug: "mesa",
    name: "Mesa",
    region: "Maricopa County",
    description:
      "One of the largest suburbs in the U.S., offering family-friendly neighborhoods within reach of downtown Phoenix.",
    rent1BR: 1250,
    rent3BR: 1750,
    avgUtilities: 210,
    avgTransportation: 360,
    costOfLivingIndex: 99,
    population: 510000,
    vibe: "Suburban comfort with easy freeway access to the whole Valley.",
    imageId: "1613574726650-d1ab2eea296a",
    imageAlt: "Red Mountain desert sunrise in Mesa, Arizona",
  },
  {
    slug: "chandler",
    name: "Chandler",
    region: "Maricopa County",
    description:
      "A tech-hub suburb in the East Valley with strong schools and a booming job market.",
    rent1BR: 1450,
    rent3BR: 2050,
    avgUtilities: 220,
    avgTransportation: 370,
    costOfLivingIndex: 108,
    population: 280000,
    vibe: "Tech jobs, new construction, and polished master-planned communities.",
    imageId: "1677214771149-62edd9a75078",
    imageAlt: "Waterfront and buildings in Chandler, Arizona",
  },
  {
    slug: "scottsdale",
    name: "Scottsdale",
    region: "Maricopa County",
    description:
      "Upscale desert living with resorts, golf courses, and vibrant nightlife. The priciest city on this list.",
    rent1BR: 1850,
    rent3BR: 2650,
    avgUtilities: 240,
    avgTransportation: 400,
    costOfLivingIndex: 128,
    population: 245000,
    vibe: "Resort-town polish, high-end shopping, and desert luxury.",
    imageId: "1743268089111-669fc11da1c7",
    imageAlt: "Desert golf course in Scottsdale, Arizona",
  },    
  {
    slug: "tempe",
    name: "Tempe",
    region: "Maricopa County",
    description:
      "Home to Arizona State University. Walkable, youthful, and dense by Valley standards.",
    rent1BR: 1500,
    rent3BR: 2000,
    avgUtilities: 210,
    avgTransportation: 340,
    costOfLivingIndex: 110,
    population: 195000,
    vibe: "College-town buzz with lakefront paths and a walkable downtown.",
    imageId: "1613773827290-e46feb750caf",
    imageAlt: "Aerial view of Tempe, Arizona near Arizona State University",
  },
  {
    slug: "glendale",
    name: "Glendale",
    region: "Maricopa County",
    description:
      "West Valley city known for sports venues, historic downtown, and relatively affordable housing.",
    rent1BR: 1150,
    rent3BR: 1650,
    avgUtilities: 205,
    avgTransportation: 350,
    costOfLivingIndex: 96,
    population: 250000,
    vibe: "Game-day energy and value-priced West Valley living.",
    imageId: "1575149536487-4c9ac49fc258",
    imageAlt: "Rock formations in the Arizona desert",
  },
  {
    slug: "flagstaff",
    name: "Flagstaff",
    region: "Coconino County",
    description:
      "A mountain college town at 7,000 feet with cooler climate, pine forests, and higher housing costs relative to income.",
    rent1BR: 1500,
    rent3BR: 2100,
    avgUtilities: 200,
    avgTransportation: 300,
    costOfLivingIndex: 115,
    population: 76000,
    vibe: "Four actual seasons, pine forests, and a tight rental market.",
    imageId: "1722280227003-2f574f6f4fe5",
    imageAlt: "Pine forest with mountain in the background near Flagstaff, Arizona",
  },
];

/** Builds an Unsplash CDN URL for a city's photo at the given render width. */
export function getCityImageUrl(city: Pick<City, "imageId">, width = 800): string {
  return `https://images.unsplash.com/photo-${city.imageId}?w=${width}&auto=format&fit=crop&q=80`;
}

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return cities.map((c) => c.slug);
}
