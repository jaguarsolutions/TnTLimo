import {
  AIRPORT_SERVICE_FEE,
  INCLUDED_MILES,
  MEET_GREET_FEE,
  ROUND_TRIP_MULTIPLIER,
  getVehicle,
  type Vehicle,
} from "@/lib/pricing/engine";
import { AIRPORT_PRICING, vehicleCategoryFromPassengerGroup, type VehicleCategory } from "./data";

export interface AirportTransferQuote {
  /** One-way base fare (includes per-leg airport service fee), in USD. */
  base: number;
  /** Base × 2 for round trip (with 5% RT discount), else base. Excludes add-ons. */
  total: number;
  /** Add-on fees (meet & greet), in USD. */
  addOns: number;
  roundTrip: boolean;
}

const round$ = (n: number) => Math.round(n);

/**
 * Pure pricing function for airport transfers. Distance-based using the same
 * engine that powers Point-to-Point — published baseline miles in
 * AIRPORT_PRICING provide the default when no live Routes-API distance is
 * supplied. Returns `null` when the airport or vehicle is unknown.
 *
 *   one-way leg = base + perMile × max(0, miles − INCLUDED_MILES) + AIRPORT_SERVICE_FEE
 *   round trip  = one-way × ROUND_TRIP_MULTIPLIER (1.9, i.e. 5% discount vs 2×)
 *   add-ons     = meetGreet ? $30 : $0
 */
export function calculateAirportTransferPrice(
  airport: string,
  vehicleIdOrPassengerGroup: string,
  meetAndGreet: boolean,
  roundTrip: boolean,
  actualDistanceMiles?: number
): AirportTransferQuote | null {
  const airportConfig = AIRPORT_PRICING[airport as keyof typeof AIRPORT_PRICING];
  if (!airportConfig) return null;

  // Resolve the engine vehicle. Accepts either a vehicle id ("sedan"...) or a
  // passenger-group code ("1-4"...). Returns null for "15+" / unknown.
  const vehicleId: VehicleCategory | null =
    isVehicleCategory(vehicleIdOrPassengerGroup)
      ? vehicleIdOrPassengerGroup
      : vehicleCategoryFromPassengerGroup(vehicleIdOrPassengerGroup);
  if (!vehicleId) return null;
  const vehicle = getVehicle(vehicleId);
  if (!vehicle) return null;

  const miles =
    typeof actualDistanceMiles === "number" && Number.isFinite(actualDistanceMiles) && actualDistanceMiles >= 0
      ? actualDistanceMiles
      : airportConfig.distanceMiles;

  const base = oneWayLeg(vehicle, miles);
  const total = roundTrip ? round$(base * ROUND_TRIP_MULTIPLIER) : base;
  const addOns = meetAndGreet ? MEET_GREET_FEE : 0;
  return { base, total, addOns, roundTrip };
}

function oneWayLeg(vehicle: Vehicle, miles: number): number {
  const extraMiles = Math.max(0, miles - INCLUDED_MILES);
  const distanceFare = vehicle.airportBaseFare + vehicle.airportPerMile * extraMiles;
  return round$(distanceFare + AIRPORT_SERVICE_FEE);
}

function isVehicleCategory(v: string): v is VehicleCategory {
  return v === "sedan" || v === "suv" || v === "van" || v === "sprinter";
}
