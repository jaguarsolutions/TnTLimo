/**
 * Curated address suggestions for the transportation booking wizard.
 *
 * Powers the in-house autocomplete (no Google API). Use this as the source
 * of truth for the service area. Free text is still allowed in the form;
 * matches here just appear as suggestions.
 */

export type LocationCategory =
  | "airport"
  | "theme-park"
  | "hotel"
  | "convention"
  | "city"
  | "attraction";

export interface Location {
  /** Display name shown in the suggestion list and final field. */
  name: string;
  category: LocationCategory;
  /** Short context line shown beneath the name (e.g. "Anaheim · Hotel"). */
  area?: string;
  /** Extra search aliases (lowercased substrings) so users can match by acronym/short name. */
  aliases?: string[];
}

const CATEGORY_LABEL: Record<LocationCategory, string> = {
  airport: "Airport",
  "theme-park": "Theme park",
  hotel: "Hotel / Resort",
  convention: "Convention center",
  city: "City",
  attraction: "Attraction",
};

export function categoryLabel(category: LocationCategory) {
  return CATEGORY_LABEL[category];
}

/* ── Airports ────────────────────────────────────────── */
export const AIRPORTS: Location[] = [
  { name: "Los Angeles International Airport (LAX)", category: "airport", area: "Los Angeles", aliases: ["lax", "los angeles intl", "los angeles airport"] },
  { name: "John Wayne Airport (SNA)", category: "airport", area: "Santa Ana, OC", aliases: ["sna", "john wayne", "orange county airport"] },
  { name: "Long Beach Airport (LGB)", category: "airport", area: "Long Beach", aliases: ["lgb", "long beach"] },
  { name: "Bob Hope / Burbank Airport (BUR)", category: "airport", area: "Burbank", aliases: ["bur", "burbank", "bob hope"] },
  { name: "Ontario International Airport (ONT)", category: "airport", area: "Ontario", aliases: ["ont", "ontario"] },
  { name: "San Diego International Airport (SAN)", category: "airport", area: "San Diego", aliases: ["san", "san diego"] },
];

/* ── Disneyland Resort & Theme parks ─────────────────── */
const THEME_PARKS: Location[] = [
  { name: "Disneyland Park", category: "theme-park", area: "Disneyland Resort, Anaheim", aliases: ["disneyland", "disney"] },
  { name: "Disney California Adventure", category: "theme-park", area: "Disneyland Resort, Anaheim", aliases: ["california adventure", "dca"] },
  { name: "Universal Studios Hollywood", category: "theme-park", area: "Universal City", aliases: ["universal", "uss"] },
  { name: "Knott's Berry Farm", category: "theme-park", area: "Buena Park", aliases: ["knotts", "knott"] },
  { name: "Six Flags Magic Mountain", category: "theme-park", area: "Valencia", aliases: ["magic mountain", "six flags"] },
  { name: "LEGOLAND California", category: "theme-park", area: "Carlsbad", aliases: ["legoland"] },
];

/* ── Disneyland-area hotels (most-booked first) ──────── */
const DISNEY_HOTELS: Location[] = [
  { name: "Disneyland Hotel", category: "hotel", area: "Disneyland Resort, Anaheim" },
  { name: "Disney's Grand Californian Hotel & Spa", category: "hotel", area: "Disneyland Resort, Anaheim", aliases: ["grand californian"] },
  { name: "Pixar Place Hotel", category: "hotel", area: "Disneyland Resort, Anaheim", aliases: ["pixar"] },
];

/* ── Anaheim convention / popular hotels ─────────────── */
const ANAHEIM_HOTELS: Location[] = [
  { name: "Anaheim Convention Center", category: "convention", area: "Anaheim", aliases: ["acc", "convention"] },
  { name: "Anaheim Marriott", category: "hotel", area: "Anaheim" },
  { name: "JW Marriott Anaheim Resort", category: "hotel", area: "Anaheim" },
  { name: "Westin Anaheim Resort", category: "hotel", area: "Anaheim" },
  { name: "Sheraton Park Hotel at the Anaheim Resort", category: "hotel", area: "Anaheim" },
  { name: "Hilton Anaheim", category: "hotel", area: "Anaheim" },
  { name: "Hyatt Regency Orange County", category: "hotel", area: "Garden Grove" },
  { name: "Howard Johnson Anaheim Hotel & Water Playground", category: "hotel", area: "Anaheim" },
  { name: "Courtyard by Marriott Anaheim Resort/Convention Center", category: "hotel", area: "Anaheim" },
  { name: "DoubleTree by Hilton Anaheim - Orange County", category: "hotel", area: "Orange" },
  { name: "Hyatt House at Anaheim Resort/Convention Center", category: "hotel", area: "Anaheim" },
  { name: "Marriott Suites Anaheim", category: "hotel", area: "Garden Grove" },
];

/* ── Greater LA / OC attractions guests ask for ──────── */
const ATTRACTIONS: Location[] = [
  { name: "Hollywood (Hollywood Boulevard)", category: "attraction", area: "Los Angeles", aliases: ["hollywood blvd", "walk of fame"] },
  { name: "Beverly Hills / Rodeo Drive", category: "attraction", area: "Beverly Hills", aliases: ["rodeo drive", "beverly hills"] },
  { name: "Santa Monica Pier", category: "attraction", area: "Santa Monica" },
  { name: "Downtown LA / L.A. Live", category: "attraction", area: "Los Angeles", aliases: ["dtla", "la live", "crypto"] },
  { name: "Crypto.com Arena", category: "attraction", area: "Los Angeles", aliases: ["staples center"] },
  { name: "Walt Disney Concert Hall", category: "attraction", area: "Los Angeles" },
  { name: "Griffith Observatory", category: "attraction", area: "Los Angeles" },
  { name: "Angel Stadium of Anaheim", category: "attraction", area: "Anaheim", aliases: ["angels"] },
  { name: "Honda Center", category: "attraction", area: "Anaheim", aliases: ["ducks"] },
];

/* ── OC & LA service-area cities ─────────────────────── */
const SERVICE_CITIES: Location[] = [
  "Aliso Viejo",
  "Anaheim",
  "Anaheim Hills",
  "Brea",
  "Buena Park",
  "Cerritos",
  "Corona Del Mar",
  "Costa Mesa",
  "Coto De Caza",
  "Cypress",
  "Dana Point",
  "Foothill Ranch",
  "Fountain Valley",
  "Fullerton",
  "Garden Grove",
  "Huntington Beach",
  "Irvine",
  "La Habra",
  "La Palma",
  "Ladera Ranch",
  "Laguna Beach",
  "Laguna Hills",
  "Laguna Niguel",
  "Laguna Woods",
  "Lake Forest",
  "Lakewood",
  "Long Beach",
  "Los Alamitos",
  "Mission Viejo",
  "Newport Beach",
  "Newport Coast",
  "Orange",
  "Placentia",
  "Rancho Santa Margarita",
  "San Clemente",
  "San Juan Capistrano",
  "Santa Ana",
  "Seal Beach",
  "Stanton",
  "Tustin",
  "Villa Park",
  "Westminster",
  "Whittier",
  "Yorba Linda",
].map<Location>((city) => ({ name: city, category: "city", area: "Orange County" }));

/* ── Composite list ──────────────────────────────────── */
export const LOCATIONS: Location[] = [
  ...AIRPORTS,
  ...THEME_PARKS,
  ...DISNEY_HOTELS,
  ...ANAHEIM_HOTELS,
  ...ATTRACTIONS,
  ...SERVICE_CITIES,
];

/**
 * Filter the curated locations by user query.
 * Optionally exclude/include certain categories (e.g. exclude "airport" from address
 * fields when the airport is already chosen separately).
 */
export function filterLocations(
  query: string,
  options: { exclude?: LocationCategory[]; include?: LocationCategory[]; limit?: number } = {},
): Location[] {
  const q = query.trim().toLowerCase();
  const exclude = new Set(options.exclude ?? []);
  const include = options.include ? new Set(options.include) : null;
  const limit = options.limit ?? 12;

  const candidates = LOCATIONS.filter((item) => {
    if (exclude.has(item.category)) return false;
    if (include && !include.has(item.category)) return false;
    return true;
  });

  if (!q) {
    /* No query — show a curated default set (airports + Disney hotels + parks). */
    const defaults = candidates.filter((item) =>
      item.category === "airport" ||
      item.category === "theme-park" ||
      (item.category === "hotel" && item.area?.includes("Disneyland Resort")),
    );
    return defaults.slice(0, limit);
  }

  const ranked = candidates
    .map((item) => {
      const haystacks = [item.name, item.area ?? "", ...(item.aliases ?? [])]
        .filter(Boolean)
        .map((s) => s.toLowerCase());
      let score = 0;
      for (const hay of haystacks) {
        if (hay === q) score += 100;
        else if (hay.startsWith(q)) score += 60;
        else if (hay.includes(q)) score += 30;
      }
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);

  return ranked;
}
