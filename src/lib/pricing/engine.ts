import vehiclesConfig from "@/../config/vehicles.json";

/**
 * Pure pricing engine — no I/O. Used by both `/api/quote` and the
 * authoritative `/api/bookings/create` validation.
 *
 * Edit `config/vehicles.json` to tune rates; tests in `engine.test.ts` will
 * fail if the formulas drift away from the published reference rows.
 *
 * Pricing formula (unified across Point-to-Point, Airport, Hourly):
 *
 *   point-to-point one-way: base + perMile × max(0, miles - INCLUDED_MILES)
 *   airport one-way:        point-to-point + AIRPORT_SERVICE_FEE
 *   hourly:                 hourlyRate × max(hourlyMinHours, hours)
 */

export interface Vehicle {
  id: string;
  name: string;
  description?: string;
  maxPassengers: number;
  maxLuggage: number;
  /** Point-to-point base fare (includes the first INCLUDED_MILES). */
  baseFare: number;
  /** Point-to-point per-mile rate after INCLUDED_MILES. */
  perMile: number;
  /** Airport-leg base fare (includes the first INCLUDED_MILES). Diverges from P2P for sedan & SUV. */
  airportBaseFare: number;
  /** Airport-leg per-mile rate after INCLUDED_MILES. */
  airportPerMile: number;
  /** Retained for backward compatibility with older configs. New formula doesn't need a clamp — base IS the minimum. */
  minimumFare: number;
  hourlyRate: number;
  hourlyMinHours: number;
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

/** Miles included in the vehicle's base fare — extra miles bill at `perMile`. */
export const INCLUDED_MILES = 14;
/** Outer service radius (miles from home base). Used for quote eligibility. */
export const SERVICE_RADIUS_MILES = 150;
/** Flat per-leg fee added to every airport transfer leg. */
export const AIRPORT_SERVICE_FEE = 5;
/** Meet & Greet add-on for airport pickups. */
export const MEET_GREET_FEE = 30;
export const EXTRA_STOP_FEE = 20;
export const GRATUITY_RATE = 0.2;
/** Round-trip fare = one_way × 2 (each component literally doubled — no
 *  implicit discount, so the breakdown can show "Base × 2 / Mileage × 2 /
 *  Airport fee × 2" and have the numbers add up). */
export const ROUND_TRIP_MULTIPLIER = 2.0;

/* ── Core math ─────────────────────────────────────────────────────────── */

/**
 * Pre-add-on one-way fare. First INCLUDED_MILES are bundled into the base;
 * anything beyond is billed at the vehicle's per-mile rate.
 */
function oneWayFare(vehicle: Vehicle, distanceMiles: number): number {
  const extraMiles = Math.max(0, distanceMiles - INCLUDED_MILES);
  return (vehicle.baseFare + vehicle.perMile * extraMiles) * vehicle.suvMultiplier;
}

/**
 * Airport-leg one-way fare. Mirrors `oneWayFare` but uses the vehicle's
 * airport-specific base and per-mile rates so the airport flow can quote
 * different numbers from P2P without forcing the two to share a config row.
 */
function oneWayAirportFare(vehicle: Vehicle, distanceMiles: number): number {
  const extraMiles = Math.max(0, distanceMiles - INCLUDED_MILES);
  return (vehicle.airportBaseFare + vehicle.airportPerMile * extraMiles) * vehicle.suvMultiplier;
}

/**
 * Run a quote through the engine.
 *
 *   one_way_fare = base + perMile * max(0, distanceMiles - INCLUDED_MILES)
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

  const breakdown: QuoteLine[] = [];
  const extraMiles = Math.max(0, distanceMiles - INCLUDED_MILES);

  if (tripType === "roundtrip") {
    breakdown.push({ label: `Round trip (${vehicle.name}, ${distanceMiles.toFixed(1)} mi)`, amount: round(trip) });
  } else if (extraMiles === 0) {
    breakdown.push({ label: `Base (${vehicle.name}, up to ${INCLUDED_MILES} mi)`, amount: vehicle.baseFare });
  } else {
    breakdown.push({ label: `Base (${vehicle.name}, up to ${INCLUDED_MILES} mi)`, amount: vehicle.baseFare });
    breakdown.push({
      label: `Mileage (${extraMiles.toFixed(1)} mi × $${vehicle.perMile.toFixed(2)})`,
      amount: round(vehicle.perMile * extraMiles),
    });
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

/* ── Airport-transfer helpers ─────────────────────────────────────────── */

export interface AirportQuoteInput {
  vehicle: Vehicle;
  miles: number;
  tripType: TripType;
  meetGreet?: boolean;
  includeAirportFee?: boolean;
}

/**
 * Airport-transfer base fare. Uses the same distance formula as P2P, plus a
 * flat per-leg `AIRPORT_SERVICE_FEE`. Round trip multiplies the per-leg
 * fare; Meet & Greet is a one-time add-on regardless of trip type.
 */
export function computeAirportQuote(input: AirportQuoteInput): Quote {
  const { vehicle, miles, tripType, meetGreet = false, includeAirportFee = true } = input;
  if (!Number.isFinite(miles) || miles < 0) {
    throw new Error("miles must be a non-negative finite number");
  }

  const oneWay = oneWayAirportFare(vehicle, miles) + (includeAirportFee ? AIRPORT_SERVICE_FEE : 0);
  const trip = tripType === "roundtrip" ? oneWay * ROUND_TRIP_MULTIPLIER : oneWay;
  const meetGreetFee = meetGreet ? MEET_GREET_FEE : 0;
  const baseExact = trip + meetGreetFee;

  const breakdown: QuoteLine[] = [];
  breakdown.push({
    label:
      tripType === "roundtrip"
        ? `Round trip airport (${vehicle.name}, ${miles.toFixed(1)} mi)`
        : `Airport transfer (${vehicle.name}, ${miles.toFixed(1)} mi)`,
    amount: round(trip),
  });
  if (meetGreet) {
    breakdown.push({ label: "Meet & greet", amount: MEET_GREET_FEE });
  }

  const base = round(baseExact);
  const gratuity = round(baseExact * GRATUITY_RATE);
  return {
    base,
    gratuity,
    total: base + gratuity,
    breakdown,
    oneWayFareExact: oneWay,
  };
}

/* ── Hourly-charter helpers ───────────────────────────────────────────── */

export interface HourlyQuoteInput {
  vehicle: Vehicle;
  hours: number;
}

export interface HourlyQuote extends Quote {
  /** The hours actually billed (floored at vehicle.hourlyMinHours). */
  billedHours: number;
}

/**
 * Hourly-charter base fare. Floors `hours` at the vehicle's
 * `hourlyMinHours` so a 2-hr request on a sedan still bills the 3-hr min.
 */
export function computeHourlyQuote(input: HourlyQuoteInput): HourlyQuote {
  const { vehicle, hours } = input;
  if (!Number.isFinite(hours) || hours < 0) {
    throw new Error("hours must be a non-negative finite number");
  }

  const billedHours = Math.max(vehicle.hourlyMinHours, Math.floor(hours));
  const baseExact = billedHours * vehicle.hourlyRate;

  const breakdown: QuoteLine[] = [
    {
      label: `${vehicle.name} · ${billedHours} hr × $${vehicle.hourlyRate}/hr`,
      amount: baseExact,
    },
  ];

  const base = round(baseExact);
  const gratuity = round(baseExact * GRATUITY_RATE);
  return {
    base,
    gratuity,
    total: base + gratuity,
    breakdown,
    oneWayFareExact: baseExact,
    billedHours,
  };
}

/* ── Service area helper ──────────────────────────────────────────────── */

export function isWithinServiceRadius(miles: number): boolean {
  return Number.isFinite(miles) && miles >= 0 && miles <= SERVICE_RADIUS_MILES;
}

function round(value: number): number {
  return Math.round(value);
}
