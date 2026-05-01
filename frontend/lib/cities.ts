/** City market data for SEO landing pages */

export interface CityData {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  tagline: string;
  heroImage: string;
  avgRent: string;
  population: string;
  marketHighlight: string;
  seoContent: string;
}

export const CITIES: Record<string, CityData> = {
  "atlanta-ga": {
    slug: "atlanta-ga",
    name: "Atlanta",
    state: "Georgia",
    stateCode: "GA",
    tagline: "Southern charm, city energy, affordable living.",
    heroImage: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1600&q=80",
    avgRent: "$1,150",
    population: "6.1M metro",
    marketHighlight: "One of the most affordable large metros in the Southeast",
    seoContent: `Atlanta is one of the most affordable major cities in the US for renters. With a thriving job market anchored by Fortune 500 headquarters, world-class dining, and neighborhoods ranging from the historic charm of Grant Park to the modern energy of Midtown, Atlanta offers something for every budget.\n\nHasker & Co. Realty Group maintains a curated inventory of affordable rental homes and apartments across Atlanta's most desirable neighborhoods — including Buckhead, East Atlanta Village, Decatur, Sandy Springs, and Marietta. Our listings start from around $950/month for one-bedroom apartments, with family-sized homes available from $1,400/month.\n\nAtlanta's cost of living is approximately 5% below the national average, making it an ideal destination for families, young professionals, and anyone relocating to the Southeast. With MARTA public transit, Hartsfield-Jackson International Airport, and a rapidly expanding BeltLine trail system, Atlanta combines big-city amenities with Southern affordability.`,
  },
  "charlotte-nc": {
    slug: "charlotte-nc",
    name: "Charlotte",
    state: "North Carolina",
    stateCode: "NC",
    tagline: "The Queen City — fast-growing and family-friendly.",
    heroImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80",
    avgRent: "$1,100",
    population: "2.7M metro",
    marketHighlight: "Fast-growing metro with competitive rental prices",
    seoContent: `Charlotte is one of the fastest-growing cities in the United States, yet it remains one of the most affordable major metros on the East Coast. As the second-largest banking center in the US, Charlotte offers strong employment opportunities alongside a lower cost of living than comparable cities.\n\nHasker & Co. Realty Group serves the greater Charlotte area with affordable rentals in neighborhoods like South End, NoDa, Plaza Midwood, University City, and Ballantyne. Studio apartments start from around $850/month, and family homes are available from $1,300/month.\n\nCharlotte's combination of mild climate, excellent schools, professional sports teams, and proximity to both the Blue Ridge Mountains and Atlantic beaches makes it a top relocation destination. The LYNX light rail connects key neighborhoods, and the cost of living sits about 4% below the national average.`,
  },
  "houston-tx": {
    slug: "houston-tx",
    name: "Houston",
    state: "Texas",
    stateCode: "TX",
    tagline: "Space City — big opportunities, affordable homes.",
    heroImage: "https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=1600&q=80",
    avgRent: "$1,050",
    population: "7.1M metro",
    marketHighlight: "Largest affordable housing supply in Texas",
    seoContent: `Houston offers one of the largest supplies of affordable rental housing among major US cities. With no state income tax, a diverse economy spanning energy, healthcare, aerospace, and technology, and a cost of living well below coastal metros, Houston is a top choice for budget-conscious renters.\n\nHasker & Co. Realty Group maintains extensive listings across Houston's sprawling metro — from the cultural richness of Montrose and the Heights to family-friendly suburbs like Katy, Sugar Land, and Pearland. One-bedroom apartments start from around $900/month, with spacious family homes from $1,350/month.\n\nHouston's lack of zoning laws creates a unique rental market with diverse housing options at every price point. The Texas Medical Center, NASA's Johnson Space Center, and the Port of Houston drive steady employment, while the city's world-renowned food scene and 640+ parks provide quality of life that rivals cities twice the cost.`,
  },
  "dallas-tx": {
    slug: "dallas-tx",
    name: "Dallas",
    state: "Texas",
    stateCode: "TX",
    tagline: "Where ambition meets affordability.",
    heroImage: "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=1600&q=80",
    avgRent: "$1,100",
    population: "7.6M metro",
    marketHighlight: "Strong job market with competitive apartment pricing",
    seoContent: `The Dallas-Fort Worth metroplex is the fourth-largest metro area in the United States and one of the most affordable. With no state income tax, a booming technology sector, and corporate headquarters for AT&T, Southwest Airlines, and dozens of Fortune 500 companies, Dallas offers exceptional economic opportunity at a fraction of coastal city prices.\n\nHasker & Co. Realty Group serves the greater Dallas area including Uptown, Deep Ellum, Oak Lawn, Plano, Frisco, and Arlington. Apartments start from around $950/month, and family homes are available from $1,400/month across the metroplex.\n\nDallas combines a thriving arts and dining scene with family-friendly suburbs, excellent highway connectivity, and DART public transit. The cost of living is approximately 2% below the national average, and the rental market offers a wide range of options from modern downtown lofts to suburban single-family homes.`,
  },
  "nashville-tn": {
    slug: "nashville-tn",
    name: "Nashville",
    state: "Tennessee",
    stateCode: "TN",
    tagline: "Music City — where culture meets community.",
    heroImage: "https://images.unsplash.com/photo-1587162146766-e06b1189b907?w=1600&q=80",
    avgRent: "$1,200",
    population: "2.0M metro",
    marketHighlight: "Growing market with affordable options outside downtown",
    seoContent: `Nashville has experienced tremendous growth over the past decade, yet affordable rental options remain available throughout the metro — particularly in neighborhoods just outside the downtown core. With no state income tax on wages, a booming healthcare and music industry, and a vibrant cultural scene, Nashville attracts renters from across the country.\n\nHasker & Co. Realty Group offers affordable rentals across Nashville including East Nashville, Germantown, Berry Hill, Antioch, and Murfreesboro. One-bedroom apartments are available from around $1,000/month, and family homes start from $1,450/month.\n\nNashville's economy is anchored by healthcare giants like HCA and Vanderbilt, a thriving music and entertainment industry, and a rapidly growing tech sector. The city's walkable neighborhoods, excellent food scene, and strong sense of community make it an increasingly popular choice for families and young professionals seeking affordable Southern living.`,
  },
  "phoenix-az": {
    slug: "phoenix-az",
    name: "Phoenix",
    state: "Arizona",
    stateCode: "AZ",
    tagline: "Valley of the Sun — sunshine and savings.",
    heroImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80",
    avgRent: "$1,100",
    population: "4.9M metro",
    marketHighlight: "Strong affordable housing stock in a warm desert climate",
    seoContent: `Phoenix is the fifth-largest city in the United States and one of the most affordable major metros in the Sun Belt. With over 300 days of sunshine per year, a growing technology and healthcare sector, and rental prices significantly below California and Pacific Northwest competitors, Phoenix is ideal for budget-conscious renters seeking warm-weather living.\n\nHasker & Co. Realty Group serves the greater Phoenix metro including Scottsdale, Tempe, Mesa, Chandler, Gilbert, and Glendale. Apartments start from around $950/month, with family homes available from $1,400/month across the Valley.\n\nPhoenix's cost of living is approximately 3% below the national average, with particular savings in housing. The metro's extensive freeway system, growing light rail network, and proximity to outdoor recreation — from Camelback Mountain to Sedona day trips — provide a quality of life that makes Phoenix one of the fastest-growing cities in America.`,
  },
  "austin-tx": {
    slug: "austin-tx",
    name: "Austin",
    state: "Texas",
    stateCode: "TX",
    tagline: "Keep it affordable — tech hub with Texas prices.",
    heroImage: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1600&q=80",
    avgRent: "$1,250",
    population: "2.3M metro",
    marketHighlight: "Tech hub affordability outside the central zone",
    seoContent: `Austin is a top-tier technology hub with a cost of living that remains well below Silicon Valley, Seattle, or New York. While central Austin has seen price increases, affordable rental options are abundant in surrounding areas — and Hasker & Co. Realty Group specializes in finding them.\n\nOur Austin-area listings span neighborhoods like East Austin, Mueller, Pflugerville, Round Rock, Cedar Park, and Kyle. One-bedroom apartments start from around $1,050/month, and family homes are available from $1,500/month.\n\nAustin's economy is powered by major employers including Tesla, Apple, Google, Dell, and the University of Texas. Combined with no state income tax, a world-famous live music scene, excellent outdoor recreation along Lady Bird Lake and the Barton Creek Greenbelt, and consistently mild winters, Austin offers an exceptional quality-to-cost ratio for renters willing to explore beyond the downtown core.`,
  },
  "miami-fl": {
    slug: "miami-fl",
    name: "Miami",
    state: "Florida",
    stateCode: "FL",
    tagline: "Gateway to the Americas — tropical living within reach.",
    heroImage: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1600&q=80",
    avgRent: "$1,350",
    population: "6.1M metro",
    marketHighlight: "Targeted affordable options in the metro area",
    seoContent: `Miami is known for its beaches, international culture, and vibrant nightlife — but it also has pockets of genuinely affordable housing throughout the greater metro area. With no state income tax, a growing tech and finance sector, and year-round tropical weather, Miami attracts renters from across the globe.\n\nHasker & Co. Realty Group focuses on affordable Miami-area rentals in neighborhoods like Little Havana, Hialeah, Kendall, Homestead, North Miami, and Doral. One-bedroom apartments start from around $1,100/month, and family homes are available from $1,600/month.\n\nWhile South Beach and Brickell command premium prices, the greater Miami metro offers a wide range of budget-friendly options with easy access to the beach, diverse cuisine, and a thriving cultural scene. Miami's Metrorail and Metrobus systems connect affordable neighborhoods to employment centers, making it possible to enjoy Miami living without Miami Beach prices.`,
  },
};

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES[slug];
}

export function getAllCitySlugs(): string[] {
  return Object.keys(CITIES);
}

// ── DB-derived city stats ─────────────────────────────────────────────────────

export interface CityStats {
  city: string;
  state: string;
  slug: string;
  count: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  listing_types: string[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com";

/**
 * Fetches distinct cities with published rental listings from the API.
 * Safe to call at build time — never throws, returns [] on any error.
 */
export async function fetchAllCities(): Promise<CityStats[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/properties/cities/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Builds a CityData object from DB stats for cities not in the CITIES constant.
 */
export function buildGenericCityData(stats: CityStats): CityData {
  const avgRent = stats.avg_price
    ? `$${Math.round(stats.avg_price).toLocaleString()}`
    : "Contact us";
  return {
    slug: stats.slug,
    name: stats.city,
    state: stats.state,
    stateCode: stats.state,
    tagline: `Explore affordable rental homes in ${stats.city}, ${stats.state}.`,
    heroImage:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&q=80",
    avgRent,
    population: "N/A",
    marketHighlight: `${stats.count} active rental listing${stats.count !== 1 ? "s" : ""}`,
    seoContent: `Hasker & Co. Realty Group offers verified rental listings in ${stats.city}, ${stats.state}. Browse our current inventory of ${stats.count} available propert${stats.count !== 1 ? "ies" : "y"} — no hidden fees, decisions within 24 hours.\n\nOur ${stats.city} listings span a range of bedroom counts and property types to fit any budget. Apply online in under 10 minutes and receive a decision the same business day.`,
  };
}

/**
 * Resolves a city slug to CityData — checks hardcoded CITIES first, then DB.
 * Returns null if the slug doesn't exist in either source.
 */
export async function resolveCityData(slug: string): Promise<CityData | null> {
  const hardcoded = getCityBySlug(slug);
  if (hardcoded) return hardcoded;
  const dbCities = await fetchAllCities();
  const stats = dbCities.find((c) => c.slug === slug);
  return stats ? buildGenericCityData(stats) : null;
}
