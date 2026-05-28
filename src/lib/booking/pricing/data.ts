/**
 * Pricing data tables — kept tenant-agnostic in shape. When the platform goes
 * multi-tenant these structures (or close kin) move to per-tenant config rows.
 *
 * All values are whole-dollar USD. Conversion to cents happens at the
 * boundary (Stripe / DB writes) so the math stays readable here.
 *
 * The vehicle pricing is now sourced from `@/lib/pricing/engine` (which loads
 * `config/vehicles.json`). The per-airport tables here only carry baseline
 * distance + lat/lng for the Routes-API distance lookup.
 */

import type { LatLng } from "@/lib/geo/service-area";
import { VEHICLES } from "@/lib/pricing/engine";

export const BOOKABLE_SERVICE_CODES = [
  "airport-transfer",
  "point-to-point",
  "hourly-charter",
] as const;

export type BookableServiceCode = (typeof BOOKABLE_SERVICE_CODES)[number];

export const VEHICLE_CATEGORIES = ["sedan", "suv", "van", "sprinter"] as const;
export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];

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

export type ChildSeatOption = (typeof CHILD_SEAT_OPTIONS)[number];

export const GRATUITY_OPTIONS = [
  { label: "15%", value: "15" },
  { label: "20%", value: "20" },
  { label: "25%", value: "25" },
  { label: "Cash at pickup", value: "cash" },
] as const;

export const AIRPORT_OPTIONS = ["SNA", "LAX", "LGB", "BUR", "ONT", "SAN"] as const;

export type AirportPricingConfig = {
  /** Default driving distance from the airport to Anaheim home base. Used when Routes API is unavailable. */
  distanceMiles: number;
  location: LatLng;
};

export const AIRPORT_PRICING: Record<(typeof AIRPORT_OPTIONS)[number], AirportPricingConfig> = {
  SNA: { distanceMiles: 14, location: { lat: 33.6757, lng: -117.8682 } },
  LAX: { distanceMiles: 34, location: { lat: 33.9416, lng: -118.4085 } },
  LGB: { distanceMiles: 18, location: { lat: 33.8178, lng: -118.1528 } },
  BUR: { distanceMiles: 45, location: { lat: 34.2007, lng: -118.3587 } },
  ONT: { distanceMiles: 35, location: { lat: 34.0553, lng: -117.6009 } },
  SAN: { distanceMiles: 95, location: { lat: 32.7338, lng: -117.1933 } },
};

/** Hourly rates exposed for the Hourly Charter rates card. Sourced from engine vehicle config. */
export const HOURLY_VEHICLE_RATES: Record<VehicleCategory, number> = {
  sedan: vehicleRate("sedan"),
  suv: vehicleRate("suv"),
  van: vehicleRate("van"),
  sprinter: vehicleRate("sprinter"),
};

export const HOURLY_RATES = {
  "1-4": vehicleRate("sedan"),
  "5-6": vehicleRate("suv"),
  "7-10": vehicleRate("van"),
  "11-14": vehicleRate("sprinter"),
} as const;

export const POINT_TO_POINT_FIXED_ROUTES: Record<string, number> = {
  "Anaheim to SNA": 105,
  "Anaheim to Universal Studios": 120,
  "Anaheim to Downtown LA": 150,
};

/** Add-on fees in USD. */
export const ADD_ON_FEES = {
  meetAndGreet: 30,
  extraStop: 20,
} as const;

export const PASSENGER_GROUP_TO_VEHICLE_ID = {
  "1-4": "sedan",
  "5-6": "suv",
  "7-10": "van",
  "11-14": "sprinter",
} as const;

export function vehicleCategoryFromPassengerGroup(group: string): VehicleCategory | null {
  return (PASSENGER_GROUP_TO_VEHICLE_ID as Record<string, VehicleCategory>)[group] ?? null;
}

export const SERVICE_LABELS: Record<BookableServiceCode | "disneyland-transportation", string> = {
  "airport-transfer": "Airport Transfer",
  "disneyland-transportation": "Disneyland & Hotel Transportation",
  "point-to-point": "Point-to-Point Transportation",
  "hourly-charter": "Hourly Charter Service",
};

function vehicleRate(id: VehicleCategory): number {
  const v = VEHICLES.find((x) => x.id === id);
  return v?.hourlyRate ?? 0;
}
