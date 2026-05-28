/**
 * Pure pricing module — safe to import from both server and client.
 *
 * The same functions power the wizard's live price summary (client) and the
 * server-side authoritative price computation that backs `/api/bookings/create`
 * (see {@link computeBookingPrice}). The server NEVER trusts the client's
 * computed total — it recomputes from the raw inputs the customer typed.
 */

export * from "./data";
export * from "./airportTransfer";
export * from "./pointToPoint";
export * from "./hourlyCharter";

import type { BookableServiceCode } from "./data";
import { AIRPORT_PRICING } from "./data";
import { calculateAirportTransferPrice } from "./airportTransfer";
import { calculatePointToPointPrice } from "./pointToPoint";
import { calculateHourlyCharterPrice } from "./hourlyCharter";
import { resolvePlace } from "@/lib/maps/places";
import {
  computeDriveDistanceMiles,
  computeDriveDistanceMilesFromLocations,
} from "@/lib/maps/routes";
import { isWithinServiceArea, POINT_TO_POINT_SERVICE_AREA, SERVICE_AREA } from "@/lib/geo/service-area";
import { lookupFixedRoute } from "@/lib/pricing/fixedRoutes";
import {
  computeFixedRouteQuote,
  computeQuote as computeEngineQuote,
  getVehicle as getEngineVehicle,
} from "@/lib/pricing/engine";

/* ── Public formatters ────────────────────────────────────────────────── */

export function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function shouldShowGroupQuoteMessage(passengerGroup: string): boolean {
  return passengerGroup === "15+";
}

/* ── Server-side authoritative price computation ──────────────────────── */

/**
 * Raw inputs the server needs from the wizard. Optional fields apply only to
 * specific services; we validate per-service inside {@link computeBookingPrice}.
 */
export interface PricingInput {
  service: BookableServiceCode;
  passengerGroup: string;
  /** "15" | "20" | "25" | "cash" — see GRATUITY_OPTIONS. */
  gratuity: string;
  // airport-transfer
  airport?: string;
  meetAndGreet?: boolean;
  roundTrip?: boolean;
  // point-to-point
  pickupAddress?: string;
  dropoffAddress?: string;
  /** Google Place IDs — when present, server can compute custom-route quotes. */
  pickupPlaceId?: string;
  dropoffPlaceId?: string;
  /** Place ID for the non-airport address in an airport transfer. */
  otherAddressPlaceId?: string;
  /** Engine vehicle id (towncar, suv) — only used for custom point-to-point routes. */
  vehicleId?: string;
  extraStop?: boolean;
  // hourly-charter
  hours?: number;
}

export type ComputedPrice =
  | {
      kind: "computed";
      subtotalCents: number;
      gratuityCents: number;
      totalCents: number;
    }
  | {
      kind: "manual-quote";
      reason: string;
    };

/**
 * Authoritative server-side price. Returns `manual-quote` when this booking
 * needs a human (15+ passenger group, unknown point-to-point route, missing
 * inputs, etc.). The API route translates `manual-quote` into a 400 so the
 * client falls back to the email-quote path.
 */
export function computeBookingPrice(input: PricingInput): ComputedPrice {
  if (input.passengerGroup === "15+") {
    return { kind: "manual-quote", reason: "Groups over 14 passengers require a custom quote." };
  }

  if (input.service === "airport-transfer") {
    if (!input.airport) {
      return { kind: "manual-quote", reason: "Airport selection is required." };
    }
    const quote = calculateAirportTransferPrice(
      input.airport,
      input.vehicleId ?? input.passengerGroup,
      input.meetAndGreet ?? false,
      input.roundTrip ?? false
    );
    if (!quote) {
      return {
        kind: "manual-quote",
        reason: "No published rate for that airport / passenger combo.",
      };
    }
    return finalize(quote.total + quote.addOns, input.gratuity);
  }

  if (input.service === "point-to-point") {
    if (!input.pickupAddress || !input.dropoffAddress) {
      return { kind: "manual-quote", reason: "Pickup and drop-off addresses are required." };
    }
    const quote = calculatePointToPointPrice(
      input.pickupAddress,
      input.dropoffAddress,
      input.vehicleId ?? input.passengerGroup,
      input.extraStop ?? false
    );
    if (quote.total === null) {
      return {
        kind: "manual-quote",
        reason: "Route is outside our fixed-rate set — we quote these manually.",
      };
    }
    return finalize(quote.total, input.gratuity);
  }

  // hourly-charter
  const quote = calculateHourlyCharterPrice(input.vehicleId ?? input.passengerGroup, input.hours ?? 0);
  if (!quote) {
    return {
      kind: "manual-quote",
      reason: "Hourly charter requires a valid passenger group and a non-negative hours value.",
    };
  }
  return finalize(quote.total, input.gratuity);
}

function finalize(subtotalUsd: number, gratuityValue: string): ComputedPrice {
  const subtotalCents = Math.round(subtotalUsd * 100);
  // "cash" => 0 cents on file; customer hands gratuity to the driver directly.
  const gratuityPercent = gratuityValue === "cash" ? 0 : Number(gratuityValue);
  const gratuityCents = Number.isFinite(gratuityPercent)
    ? Math.round((subtotalCents * gratuityPercent) / 100)
    : 0;
  return {
    kind: "computed",
    subtotalCents,
    gratuityCents,
    totalCents: subtotalCents + gratuityCents,
  };
}

/* ── Async variant: point-to-point with Google-resolved Place IDs ──────── */

/**
 * Server-side authoritative price computation, with one async escape hatch:
 * if the input is a point-to-point booking with Place IDs, we route the
 * computation through the live-quote engine (fixed-route match or Google
 * Routes API + custom-route engine).
 *
 * All other services + non-Place-ID point-to-point delegate to the synchronous
 * {@link computeBookingPrice}.
 */
export async function computeBookingPriceAsync(
  input: PricingInput
): Promise<ComputedPrice> {
  if (input.passengerGroup === "15+") {
    return { kind: "manual-quote", reason: "Groups over 14 passengers require a custom quote." };
  }

  // Airport-transfer with a hotel/place ID can also use Google Routes for
  // actual distance-based pricing, while still falling back to the published
  // baseline if the live lookup fails.
  if (
    input.service === "airport-transfer" &&
    input.airport &&
    input.otherAddressPlaceId
  ) {
    return computeAirportTransferFromPlaceIds(input);
  }

  // Only point-to-point with Place IDs takes the Google path.
  if (
    input.service === "point-to-point" &&
    input.pickupPlaceId &&
    input.dropoffPlaceId
  ) {
    return computePointToPointFromPlaceIds(input);
  }

  return computeBookingPrice(input);
}

async function computePointToPointFromPlaceIds(
  input: PricingInput
): Promise<ComputedPrice> {
  const vehicleId = input.vehicleId ?? "towncar";
  const vehicle = getEngineVehicle(vehicleId);
  if (!vehicle) {
    return { kind: "manual-quote", reason: `Unknown vehicle "${vehicleId}".` };
  }

  let pickup, dropoff;
  try {
    [pickup, dropoff] = await Promise.all([
      resolvePlace(input.pickupPlaceId!),
      resolvePlace(input.dropoffPlaceId!),
    ]);
  } catch (err) {
    console.error("[computeBookingPriceAsync] place resolution failed:", err);
    return { kind: "manual-quote", reason: "Couldn't resolve those addresses with Google." };
  }

  // Pickup must start within the published P2P service radius (see config/point-to-point-service-area.json).
  if (!isWithinServiceArea(pickup.location, POINT_TO_POINT_SERVICE_AREA)) {
    return {
      kind: "manual-quote",
      reason: `Pickup is outside our ${POINT_TO_POINT_SERVICE_AREA.radiusMiles}-mile point-to-point pickup area.`,
    };
  }
  if (!isWithinServiceArea(dropoff.location, SERVICE_AREA)) {
    return {
      kind: "manual-quote",
      reason: "Drop-off is outside our point-to-point service area.",
    };
  }

  const fixed = lookupFixedRoute({
    pickupPlaceId: pickup.placeId,
    pickupLocation: pickup.location,
    dropoffPlaceId: dropoff.placeId,
    dropoffLocation: dropoff.location,
  });

  if (fixed) {
    const q = computeFixedRouteQuote({
      vehicle,
      fixedRoutePrice: fixed.price,
      routeLabel: fixed.label,
      tripType: input.roundTrip ? "roundtrip" : "oneway",
      extraStop: input.extraStop ?? false,
    });
    return finalize(q.base, input.gratuity);
  }

  let distanceMiles: number;
  try {
    const { miles } = await computeDriveDistanceMiles(pickup.placeId, dropoff.placeId);
    distanceMiles = miles;
  } catch (err) {
    console.error("[computeBookingPriceAsync] Routes API failed:", err);
    return { kind: "manual-quote", reason: "Google Routes API didn't return a distance." };
  }

  const q = computeEngineQuote({
    vehicle,
    distanceMiles,
    tripType: input.roundTrip ? "roundtrip" : "oneway",
    extraStop: input.extraStop ?? false,
  });
  return finalize(q.base, input.gratuity);
}

async function computeAirportTransferFromPlaceIds(
  input: PricingInput
): Promise<ComputedPrice> {
  let actualDistanceMiles: number | undefined;
  const airportConfig = AIRPORT_PRICING[input.airport as keyof typeof AIRPORT_PRICING];

  if (airportConfig) {
    try {
      const other = await resolvePlace(input.otherAddressPlaceId!);
      const { miles } = await computeDriveDistanceMilesFromLocations(
        airportConfig.location,
        other.location
      );
      actualDistanceMiles = miles;
    } catch (err) {
      console.error("[computeBookingPriceAsync] airport distance lookup failed:", err);
    }
  }

  const quote = calculateAirportTransferPrice(
    input.airport!,
    input.vehicleId ?? input.passengerGroup,
    input.meetAndGreet ?? false,
    input.roundTrip ?? false,
    actualDistanceMiles
  );

  if (!quote) {
    return {
      kind: "manual-quote",
      reason: "No published rate for that airport / passenger combo.",
    };
  }

  return finalize(quote.total + quote.addOns, input.gratuity);
}
