import vehiclesConfig from "@/../config/vehicles.json";

/**
 * Pure pricing engine — no I/O. Used by both `/api/quote` and the
 * authoritative `/api/bookings/create` validation.
 *
 * Edit `config/vehicles.json` to tune rates; tests in `engine.test.ts` will
 * fail if the formulas drift away from the published reference rows.
 */

export interface Vehicle {
  id: string;
  name: string;
  description?: string;
  maxPassengers: number;
  maxLuggage: number;
  baseFare: number;
  perMile: number;
  minimumFare: number;
  /** Reserved for future SUV-class surcharges. Set to 1.0 to disable. */
  suvMultiplier: number;
}

export const VEHICLES: Vehicle[] = vehiclesConfig as Vehicle[];

export function getVehicle(id: string): Vehicle | null {
  return VEHICLES.find((v) => v.id === id) ?? null;
}

/** Hide vehicle types whose capacity is less than the requested passenger count. */
export function vehiclesForPassengerCount(passengers: number): Vehicle[] {
  if (!Number.isFinite(passengers) || passengers < 1) return VEHICLES;
  return VEHICLES.filter((v) => v.maxPassengers >= passengers);
}

/* ── Inputs / outputs ─────────────────────────────────────────────────── */

export type TripType = "oneway" | "roundtrip";

export interface QuoteInput {
  vehicle: Vehicle;
  distanceMiles: number;
  tripType: TripType;
  extraStop?: boolean;
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface Quote {
  /** Pre-gratuity total (base fare + mileage + add-ons), rounded. */
  base: number;
  gratuity: number;
  total: number;
  breakdown: QuoteLine[];
  /** Pre-rounding precise value, exposed for the breakdown line math. */
  oneWayFareExact: number;
}

/* ── Constants ─────────────────────────────────────────────────────────── */

export const EXTRA_STOP_FEE = 20;
export const GRATUITY_RATE = 0.2;
/** 5% round-trip discount: round_trip_fare = one_way * 1.9 (instead of 2.0) */
export const ROUND_TRIP_MULTIPLIER = 1.9;

/* ── Core math ─────────────────────────────────────────────────────────── */

/** Pre-add-on one-way fare with mileage and minimum-fare floor applied. */
function oneWayFare(vehicle: Vehicle, distanceMiles: number): number {
  const rawDistanceFare = vehicle.baseFare + vehicle.perMile * distanceMiles;
  return Math.max(vehicle.minimumFare, rawDistanceFare) * vehicle.suvMultiplier;
}

/**
 * Run a quote through the engine.
 *
 *   one_way_fare = max(minimumFare, baseFare + perMile * distanceMiles)
 *   round_trip_fare = one_way_fare * 1.9   (5% discount vs. 2x)
 *   add_on_total = extraStop ? 20 : 0
 *   base = (round_trip_fare or one_way_fare) + add_on_total
 *   gratuity = round(base * 0.20)
 *   total = round(base) + gratuity
 */
export function computeQuote(input: QuoteInput): Quote {
  const { vehicle, distanceMiles, tripType, extraStop = false } = input;

  if (!Number.isFinite(distanceMiles) || distanceMiles < 0) {
    throw new Error("distanceMiles must be a non-negative finite number");
  }

  const oneWay = oneWayFare(vehicle, distanceMiles);
  const trip = tripType === "roundtrip" ? oneWay * ROUND_TRIP_MULTIPLIER : oneWay;
  const addOns = extraStop ? EXTRA_STOP_FEE : 0;
  const baseExact = trip + addOns;

  // Build a human-readable breakdown that always reconciles to the rounded base.
  const breakdown: QuoteLine[] = [];

  if (tripType === "roundtrip") {
    breakdown.push({ label: `Round trip (${vehicle.name}, ${distanceMiles.toFixed(1)} mi)`, amount: round(trip) });
  } else {
    if (oneWay > vehicle.baseFare + vehicle.perMile * distanceMiles) {
      // Minimum fare clamp engaged
      breakdown.push({ label: `Minimum fare (${vehicle.name})`, amount: round(oneWay) });
    } else {
      breakdown.push({ label: "Base fare", amount: vehicle.baseFare });
      breakdown.push({
        label: `Mileage (${distanceMiles.toFixed(1)} mi × $${vehicle.perMile.toFixed(2)})`,
        amount: round(vehicle.perMile * distanceMiles),
      });
    }
  }

  if (extraStop) {
    breakdown.push({ label: "Extra stop", amount: EXTRA_STOP_FEE });
  }

  const base = round(baseExact);
  const gratuity = round(baseExact * GRATUITY_RATE);
  const total = base + gratuity;

  return {
    base,
    gratuity,
    total,
    breakdown,
    oneWayFareExact: oneWay,
  };
}

/**
 * Compute a quote for a route that matches one of the published fixed-price
 * routes. The published price IS the base — no engine math, no minimum, no
 * mileage. Add-ons and gratuity still apply on top.
 */
export function computeFixedRouteQuote(args: {
  vehicle: Vehicle;
  fixedRoutePrice: number;
  routeLabel: string;
  tripType: TripType;
  extraStop?: boolean;
}): Quote {
  const { vehicle, fixedRoutePrice, routeLabel, tripType, extraStop = false } = args;

  const tripPrice = tripType === "roundtrip" ? fixedRoutePrice * ROUND_TRIP_MULTIPLIER : fixedRoutePrice;
  const addOns = extraStop ? EXTRA_STOP_FEE : 0;
  const baseExact = tripPrice + addOns;

  const breakdown: QuoteLine[] = [];
  breakdown.push({
    label: tripType === "roundtrip" ? `${routeLabel} (round trip)` : routeLabel,
    amount: round(tripPrice),
  });
  if (extraStop) {
    breakdown.push({ label: "Extra stop", amount: EXTRA_STOP_FEE });
  }

  const base = round(baseExact);
  const gratuity = round(baseExact * GRATUITY_RATE);
  void vehicle; // vehicle currently unused in fixed-route pricing — reserved for future SUV variants

  return {
    base,
    gratuity,
    total: base + gratuity,
    breakdown,
    oneWayFareExact: fixedRoutePrice,
  };
}

function round(value: number): number {
  return Math.round(value);
}
