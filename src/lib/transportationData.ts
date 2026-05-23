import { SITE_IMAGES } from "@/lib/siteImages";

/**
 * Re-exports of tenant-agnostic pricing primitives. These now live in
 * `@/lib/booking/pricing` so the server can recompute prices authoritatively
 * (the wizard's client-side `priceSummary` still imports them via this file
 * for backwards compat).
 */
export {
  AIRPORT_OPTIONS,
  AIRPORT_PRICING,
  CHILD_SEAT_OPTIONS,
  GRATUITY_OPTIONS,
  HOURLY_RATES,
  HOURLY_VEHICLE_RATES,
  PASSENGER_GROUPS,
  POINT_TO_POINT_FIXED_ROUTES,
  SERVICE_LABELS,
  calculateAirportTransferPrice,
  calculateHourlyCharterPrice,
  calculatePointToPointPrice,
  formatCurrency,
  shouldShowGroupQuoteMessage,
  type BookableServiceCode,
} from "@/lib/booking/pricing";

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
    highlight: "Arrive relaxed with meet & greet support plus free child seats on request.",
    image: SITE_IMAGES.waltDisneyConcertHall,
    imageAlt: "Airport transfer shuttle arriving at hotel lobby",
    href: "/transportation/airport-transfer",
  },
  {
    code: "point-to-point" as const,
    title: "Point-to-Point Transportation",
    description:
      "Direct private rides across Anaheim and Greater LA, including Disneyland-area hotels, airports, attractions, and event venues.",
    highlight: "One-way convenience with a friendly local driver and free child seats on request.",
    image: SITE_IMAGES.griffithObservatoryDay,
    imageAlt: "Point-to-point transportation in Los Angeles",
    href: "/transportation/point-to-point",
  },
  {
    code: "hourly-charter" as const,
    title: "Hourly Charter",
    description:
      "Reserve a private vehicle and driver by the hour for events, shopping, sightseeing, business travel, or multiple stops.",
    highlight: "Custom timing, private vehicles, and free child seats on request.",
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

import { BOOKABLE_SERVICE_CODES, type BookableServiceCode } from "@/lib/booking/pricing/data";

export const BOOKABLE_TRANSPORTATION_SERVICES = TRANSPORTATION_SERVICES.filter(
  (svc): svc is typeof svc & { code: BookableServiceCode } =>
    (BOOKABLE_SERVICE_CODES as readonly string[]).includes(svc.code)
);

export const SELECTION_STEPS = [
  "Select service",
  "Route & trip details",
  "Passenger details",
  "Customer information",
  "Review summary",
] as const;

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
      "Direct private transportation for any one-way trip in Anaheim and Greater LA, including Disneyland-area hotels and airport transfers.",
    bullets: [
      "Fixed route pricing for Anaheim to LAX, SNA, Universal Studios, and Downtown LA.",
      "Optional extra stop helps keep travel flexible.",
      "Ideal for transfers, meetings, hotel-to-park rides, and airport connections.",
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
