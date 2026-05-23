/**
 * Pricing data tables — kept tenant-agnostic in shape. When the platform goes
 * multi-tenant these structures (or close kin) move to per-tenant config rows.
 *
 * All values are whole-dollar USD. Conversion to cents happens at the
 * boundary (Stripe / DB writes) so the math stays readable here.
 */

import type { LatLng } from "@/lib/geo/service-area";

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
  distanceMiles: number;
  location: LatLng;
  rates: Record<VehicleCategory, number>;
  perMileAfterBaseline: Record<VehicleCategory, number>;
};

export const AIRPORT_PRICING: Record<(typeof AIRPORT_OPTIONS)[number], AirportPricingConfig> = {
  SNA: {
    distanceMiles: 14,
    location: { lat: 33.6757, lng: -117.8682 },
    rates: { sedan: 85, suv: 110, van: 145, sprinter: 185 },
    perMileAfterBaseline: { sedan: 5, suv: 6, van: 8, sprinter: 10 },
  },
  LAX: {
    distanceMiles: 34,
    location: { lat: 33.9416, lng: -118.4085 },
    rates: { sedan: 175, suv: 195, van: 220, sprinter: 320 },
    perMileAfterBaseline: { sedan: 5, suv: 6, van: 8, sprinter: 10 },
  },
  LGB: {
    distanceMiles: 18,
    location: { lat: 33.8178, lng: -118.1528 },
    rates: { sedan: 95, suv: 120, van: 140, sprinter: 220 },
    perMileAfterBaseline: { sedan: 5, suv: 6, van: 8, sprinter: 10 },
  },
  BUR: {
    distanceMiles: 38,
    location: { lat: 34.2007, lng: -118.3587 },
    rates: { sedan: 185, suv: 195, van: 235, sprinter: 335 },
    perMileAfterBaseline: { sedan: 5, suv: 6, van: 8, sprinter: 10 },
  },
  ONT: {
    distanceMiles: 40,
    location: { lat: 34.0553, lng: -117.6009 },
    rates: { sedan: 185, suv: 195, van: 235, sprinter: 335 },
    perMileAfterBaseline: { sedan: 5, suv: 6, van: 8, sprinter: 10 },
  },
  SAN: {
    distanceMiles: 90,
    location: { lat: 32.7338, lng: -117.1933 },
    rates: { sedan: 375, suv: 425, van: 495, sprinter: 595 },
    perMileAfterBaseline: { sedan: 5, suv: 6, van: 8, sprinter: 10 },
  },
};

export const HOURLY_VEHICLE_RATES: Record<VehicleCategory, number> = {
  sedan: 95,
  suv: 115,
  van: 155,
  sprinter: 175,
};

export const HOURLY_RATES = {
  "1-4": 95,
  "5-6": 115,
  "7-10": 155,
  "11-14": 175,
} as const;

export const POINT_TO_POINT_FIXED_ROUTES: Record<string, number> = {
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
