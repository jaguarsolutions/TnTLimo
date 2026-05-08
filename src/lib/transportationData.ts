import { SITE_IMAGES } from "@/lib/siteImages";

export type TransportationServiceCode =
  | "airport-transfer"
  | "disneyland-transportation"
  | "point-to-point"
  | "hourly-charter";

export const TRANSPORTATION_SERVICES = [
  {
    code: "airport-transfer" as const,
    title: "Airport Transfers",
    description:
      "Reliable private airport transportation to and from Anaheim, Disneyland-area hotels, and major Southern California airports including LAX, SNA, Long Beach, Burbank, Ontario, and San Diego.",
    highlight: "Arrive relaxed with meet & greet support.",
    image: SITE_IMAGES.waltDisneyConcertHall,
    imageAlt: "Airport transfer shuttle arriving at hotel lobby",
    href: "/transportation/airport-transfer",
  },
  {
    code: "disneyland-transportation" as const,
    title: "Disneyland & Hotel Transportation",
    description:
      "Comfortable private transportation for families and groups traveling between hotels, airports, Disneyland, Universal Studios, and popular Southern California destinations.",
    highlight: "Family-friendly vehicles with luggage room and child seats on request.",
    image: SITE_IMAGES.universalGlobe,
    imageAlt: "Family transportation around Disneyland and Anaheim",
    href: "/transportation/disneyland-transportation",
  },
  {
    code: "point-to-point" as const,
    title: "Point-to-Point Transportation",
    description:
      "Private transportation between hotels, attractions, airports, restaurants, event venues, and other destinations across Anaheim and Los Angeles.",
    highlight: "One-way convenience with a friendly local driver.",
    image: SITE_IMAGES.griffithObservatoryDay,
    imageAlt: "Point-to-point transportation in Los Angeles",
    href: "/transportation/point-to-point",
  },
  {
    code: "hourly-charter" as const,
    title: "Hourly Charter",
    description:
      "Reserve a private vehicle and driver by the hour for events, shopping, sightseeing, business travel, or multiple stops.",
    highlight: "Custom timing, planned stops, and a private vehicle for your group.",
    image: SITE_IMAGES.santaMonicaPalms,
    imageAlt: "Hourly charter service with scenic California palm trees",
    href: "/transportation/hourly-charter",
  },
];

export const TRANSPORTATION_OVERVIEW_CARDS = [
  {
    title: "Local Anaheim experts",
    description:
      "Based right next to the Disneyland Resort, we know the hotels, the gates, the convention center, and the freeways inside out.",
    badge: "Local team",
  },
  {
    title: "Family-friendly vehicles",
    description:
      "Clean, comfortable, climate-controlled rides with luggage room and complimentary child seats on request.",
    badge: "Family ready",
  },
  {
    title: "One trusted brand",
    description:
      "Tours, airport transfers, Disneyland transportation, charters — handled by the same friendly local team you already trust.",
    badge: "Tours + Transportation",
  },
];

export const AIRPORT_OPTIONS = ["SNA", "LAX", "LGB", "BUR", "ONT", "SAN"] as const;

export const PASSENGER_GROUPS = [
  { label: "1-4 passengers", value: "1-4" },
  { label: "5-6 passengers", value: "5-6" },
  { label: "7-8 passengers", value: "7-8" },
  { label: "9-10 passengers", value: "9-10" },
  { label: "11-14 passengers", value: "11-14" },
  { label: "More than 14 passengers", value: "15+" },
] as const;

export const CHILD_SEAT_OPTIONS = [
  { label: "Infant seat", value: "infant" },
  { label: "Rear-facing", value: "rear-facing" },
  { label: "Forward-facing", value: "forward-facing" },
  { label: "Booster", value: "booster" },
  { label: "High-back booster", value: "high-back-booster" },
] as const;

export const GRATUITY_OPTIONS = [
  { label: "15%", value: "15" },
  { label: "20%", value: "20" },
  { label: "25%", value: "25" },
  { label: "Cash at pickup", value: "cash" },
] as const;

export const AIRPORT_PRICING = {
  SNA: { "1-4": 85, "5-6": 110, "7-8": 145, "9-10": 165, "11-14": 185 },
  LAX: { "1-4": 175, "5-6": 195, "7-8": 220, "9-10": 260, "11-14": 320 },
  LGB: { "1-4": 95, "5-6": 120, "7-8": 140, "9-10": 180, "11-14": 220 },
  BUR: { "1-4": 185, "5-6": 210, "7-8": 245, "9-10": 285, "11-14": 325 },
  ONT: { "1-4": 185, "5-6": 195, "7-8": 235, "9-10": 295, "11-14": 335 },
  SAN: { "1-4": 375, "5-6": 425, "7-8": 495, "9-10": 550, "11-14": 595 },
} as const;

export const HOURLY_RATES = {
  "1-4": 95,
  "5-6": 115,
  "7-8": 135,
  "9-10": 155,
  "11-14": 175,
} as const;

export const POINT_TO_POINT_FIXED_ROUTES: Record<string, number> = {
  "Anaheim to LAX": 225,
  "Anaheim to SNA": 95,
  "Anaheim to Universal Studios": 120,
  "Anaheim to Downtown LA": 150,
};

export const SERVICE_LABELS: Record<TransportationServiceCode, string> = {
  "airport-transfer": "Airport Transfer",
  "disneyland-transportation": "Disneyland & Hotel Transportation",
  "point-to-point": "Point-to-Point Transportation",
  "hourly-charter": "Hourly Charter Service",
};

/**
 * Codes the booking wizard currently has pricing logic for.
 * "disneyland-transportation" is a marketing category that maps to
 * point-to-point or hourly-charter at booking time, so it isn't its own
 * wizard step yet.
 */
export type BookableServiceCode =
  | "airport-transfer"
  | "point-to-point"
  | "hourly-charter";

export const BOOKABLE_TRANSPORTATION_SERVICES = TRANSPORTATION_SERVICES.filter(
  (svc): svc is typeof svc & { code: BookableServiceCode } =>
    svc.code !== "disneyland-transportation"
);

export const SELECTION_STEPS = [
  "Select service",
  "Route & trip details",
  "Passenger details",
  "Customer information",
  "Review summary",
] as const;

export const formatCurrency = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export function calculateAirportTransferPrice(
  airport: string,
  passengerGroup: string,
  meetAndGreet: boolean,
  roundTrip: boolean
) {
  const airportRates = (AIRPORT_PRICING as Record<string, Record<string, number>>)[airport];
  const base = airportRates?.[passengerGroup] ?? null;
  if (base === null) return null;
  const total = base * (roundTrip ? 2 : 1);
  const addOns = meetAndGreet ? 30 : 0;
  return { base, total, addOns, roundTrip };
}

export function calculatePointToPointPrice(
  pickup: string,
  dropoff: string,
  passengerGroup: string,
  extraStop: boolean
) {
  const routeMatch = inferPointToPointRoute(pickup, dropoff);
  const base = routeMatch ? POINT_TO_POINT_FIXED_ROUTES[routeMatch] : null;
  const addOns = extraStop ? 20 : 0;
  const price = base === null ? null : base + addOns;
  return { routeMatch, base, total: price, addOns };
}

function inferPointToPointRoute(pickup: string, dropoff: string) {
  const normalized = (value: string) => value.toLowerCase();
  const from = normalized(pickup);
  const to = normalized(dropoff);
  const has = (haystack: string, needle: string) => haystack.includes(needle);

  const routeVariants: Array<[string[], string[], string]> = [
    [["anaheim"], ["lax", "los angeles international airport"], "Anaheim to LAX"],
    [["anaheim"], ["sna", "john wayne", "john wayne airport"], "Anaheim to SNA"],
    [["anaheim"], ["universal", "universal studios"], "Anaheim to Universal Studios"],
    [["anaheim"], ["downtown", "dtla", "los angeles"], "Anaheim to Downtown LA"],
  ];

  for (const [fromKeys, toKeys, route] of routeVariants) {
    const fromMatch = fromKeys.some((term) => has(from, term)) || toKeys.some((term) => has(from, term));
    const toMatch = toKeys.some((term) => has(to, term)) || fromKeys.some((term) => has(to, term));
    if (fromMatch && toMatch) {
      return route;
    }
  }

  return null;
}

export function calculateHourlyCharterPrice(
  passengerGroup: string,
  hours: number
) {
  const rate = (HOURLY_RATES as Record<string, number>)[passengerGroup];
  if (!rate || hours < 4) return null;
  const total = rate * hours;
  return { rate, total };
}

export function shouldShowGroupQuoteMessage(passengerGroup: string) {
  return passengerGroup === "15+";
}

export const TRANSPORTATION_SERVICE_DETAILS = {
  "airport-transfer": {
    title: "Airport Transfers",
    shortDescription:
      "Trusted private transportation for airport arrivals and departures across Orange County, Los Angeles, and San Diego airports.",
    bullets: [
      "Pickup and drop-off from hotel, airport, or private address.",
      "Meet & greet service available for smooth arrivals.",
      "Round-trip routes supported for most airports.",
      "Perfect for families, groups, and convention travel.",
    ],
  },
  "disneyland-transportation": {
    title: "Disneyland & Hotel Transportation",
    shortDescription:
      "Comfortable private transportation for families and groups traveling between hotels, airports, Disneyland, Universal Studios, and popular Southern California destinations.",
    bullets: [
      "Door-to-door service between Disneyland-area hotels and the parks.",
      "Family-friendly vehicles with luggage room and child seats on request.",
      "Hotel-to-airport transfers for SNA, LAX, Long Beach, Burbank, Ontario, and San Diego.",
      "Great for convention groups and multi-stop family days.",
    ],
  },
  "point-to-point": {
    title: "Point-to-Point Transportation",
    shortDescription:
      "Direct, single-stop transportation for any one-way trip in the Anaheim area and Greater LA.",
    bullets: [
      "Fixed route pricing for Anaheim to LAX, SNA, Universal Studios, and Downtown LA.",
      "Optional extra stop helps keep travel flexible.",
      "Ideal for transfers, meetings, and hotel-to-venue rides.",
      "Passenger groups from 1 to 14 plus custom quotes for larger parties.",
    ],
  },
  "hourly-charter": {
    title: "Hourly Charter Service",
    shortDescription:
      "Private hourly transportation for events, group outings, and custom local schedules.",
    bullets: [
      "Minimum 4 hours with professional driver and private vehicle.",
      "Flexible stops and itinerary planning available.",
      "Great for conventions, weddings, and family days out.",
      "Child seats are available at no extra charge.",
    ],
  },
};
