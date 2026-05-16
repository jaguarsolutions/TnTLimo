/**
 * Pricing data tables — kept tenant-agnostic in shape. When the platform goes
 * multi-tenant these structures (or close kin) move to per-tenant config rows.
 *
 * All values are whole-dollar USD. Conversion to cents happens at the
 * boundary (Stripe / DB writes) so the math stays readable here.
 */

export const BOOKABLE_SERVICE_CODES = [
  "airport-transfer",
  "point-to-point",
  "hourly-charter",
] as const;

export type BookableServiceCode = (typeof BOOKABLE_SERVICE_CODES)[number];

export const PASSENGER_GROUPS = [
  { label: "1-4 passengers", value: "1-4" },
  { label: "5-6 passengers", value: "5-6" },
  { label: "7-10 passengers", value: "7-10" },
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

export const AIRPORT_OPTIONS = ["SNA", "LAX", "LGB", "BUR", "ONT", "SAN"] as const;

export const AIRPORT_PRICING = {
  SNA: { "1-4": 85, "5-6": 110, "7-10": 165, "11-14": 185 },
  LAX: { "1-4": 175, "5-6": 195, "7-10": 260, "11-14": 320 },
  LGB: { "1-4": 95, "5-6": 120, "7-10": 180, "11-14": 220 },
  BUR: { "1-4": 185, "5-6": 210, "7-10": 285, "11-14": 325 },
  ONT: { "1-4": 185, "5-6": 195, "7-10": 295, "11-14": 335 },
  SAN: { "1-4": 375, "5-6": 425, "7-10": 550, "11-14": 595 },
} as const;

export const HOURLY_RATES = {
  "1-4": 95,
  "5-6": 115,
  "7-10": 155,
  "11-14": 175,
} as const;

export const POINT_TO_POINT_FIXED_ROUTES: Record<string, number> = {
  "Anaheim to LAX": 225,
  "Anaheim to SNA": 95,
  "Anaheim to Universal Studios": 120,
  "Anaheim to Downtown LA": 150,
};

/** Add-on fees in USD. */
export const ADD_ON_FEES = {
  meetAndGreet: 30,
  extraStop: 20,
} as const;

/** Minimum bookable hours for an hourly charter. */
export const HOURLY_CHARTER_MIN_HOURS = 4;

export const SERVICE_LABELS: Record<BookableServiceCode | "disneyland-transportation", string> = {
  "airport-transfer": "Airport Transfer",
  "disneyland-transportation": "Disneyland & Hotel Transportation",
  "point-to-point": "Point-to-Point Transportation",
  "hourly-charter": "Hourly Charter Service",
};
