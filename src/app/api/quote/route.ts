import { NextResponse } from "next/server";
import { z } from "zod";
import { isWithinServiceArea, POINT_TO_POINT_SERVICE_AREA } from "@/lib/geo/service-area";
import { resolvePlace, type ResolvedPlace } from "@/lib/maps/places";
import { computeDriveDistanceMiles } from "@/lib/maps/routes";
import {
  computeFixedRouteQuote,
  computeQuote,
  getVehicle,
  type Quote,
} from "@/lib/pricing/engine";
import { lookupFixedRoute } from "@/lib/pricing/fixedRoutes";

export const runtime = "nodejs";

/**
 * Live quote endpoint for the point-to-point booking flow.
 *
 *   POST /api/quote
 *
 * Flow:
 *   1. Validate payload (zod).
 *   2. Resolve both Place IDs to lat/lng via Places API.
 *   3. Reject if either point is outside the 20-mile home base service area.
 *   4. If both endpoints match one of the four published anchor pairs,
 *      return the fixed price (skip Routes API).
 *   5. Otherwise call Routes API, run distance through the pricing engine.
 *   6. Apply trip-type multiplier, add-ons, 20% gratuity.
 *
 * Errors surface a stable `error` string plus a human `message`. The wizard
 * UI keys on `error` to render the right inline state.
 */

const QuoteSchema = z.object({
  pickupPlaceId: z.string().min(1, "Pickup place is required"),
  dropoffPlaceId: z.string().min(1, "Drop-off place is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripType: z.enum(["oneway", "roundtrip"]),
  passengers: z.number().int().min(1).max(20),
  addOns: z
    .object({
      extraStop: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  let payload: z.infer<typeof QuoteSchema>;
  try {
    const body = await request.json();
    payload = QuoteSchema.parse(body);
  } catch (err) {
    const issues =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
        : "Invalid JSON body";
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: issues },
      { status: 400 }
    );
  }

  const vehicle = getVehicle(payload.vehicleId);
  if (!vehicle) {
    return NextResponse.json(
      { error: "UNKNOWN_VEHICLE", message: `Unknown vehicle "${payload.vehicleId}"` },
      { status: 400 }
    );
  }
  if (vehicle.maxPassengers < payload.passengers) {
    return NextResponse.json(
      {
        error: "VEHICLE_TOO_SMALL",
        message: `${vehicle.name} seats ${vehicle.maxPassengers}; you need ${payload.passengers}.`,
      },
      { status: 400 }
    );
  }

  /* ── 2. Resolve places ──────────────────────────────────────────────── */
  let pickup: ResolvedPlace;
  let dropoff: ResolvedPlace;
  try {
    [pickup, dropoff] = await Promise.all([
      resolvePlace(payload.pickupPlaceId),
      resolvePlace(payload.dropoffPlaceId),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Place lookup failed";
    console.error("[/api/quote] place resolution failed:", message);
    return NextResponse.json(
      { error: "PLACE_LOOKUP_FAILED", message: "We couldn't look up those addresses. Please re-pick them." },
      { status: 502 }
    );
  }

  /* ── 3. Service area check ──────────────────────────────────────────── */
  const pickupInArea = isWithinServiceArea(pickup.location, POINT_TO_POINT_SERVICE_AREA);
  const dropoffInArea = isWithinServiceArea(dropoff.location, POINT_TO_POINT_SERVICE_AREA);
  if (!pickupInArea || !dropoffInArea) {
    return NextResponse.json(
      {
        error: "OUTSIDE_SERVICE_AREA",
        offending:
          !pickupInArea && !dropoffInArea
            ? "both"
            : !pickupInArea
              ? "pickup"
              : "dropoff",
        message: "We currently only service point-to-point rides within 20 miles of our home base.",
      },
      { status: 400 }
    );
  }

  /* ── 4. Fixed-route fast path ───────────────────────────────────────── */
  const fixed = lookupFixedRoute({
    pickupPlaceId: pickup.placeId,
    pickupLocation: pickup.location,
    dropoffPlaceId: dropoff.placeId,
    dropoffLocation: dropoff.location,
  });

  if (fixed) {
    const quote = computeFixedRouteQuote({
      vehicle,
      fixedRoutePrice: fixed.price,
      routeLabel: fixed.label,
      tripType: payload.tripType,
      extraStop: payload.addOns?.extraStop ?? false,
    });
    return NextResponse.json(buildResponse(quote, {
      vehicle,
      matchedFixedRoute: fixed.id,
      distanceMiles: null,
      pickup,
      dropoff,
    }));
  }

  /* ── 5. Custom route — Routes API + engine ──────────────────────────── */
  let distanceMiles: number;
  try {
    const { miles } = await computeDriveDistanceMiles(pickup.placeId, dropoff.placeId);
    distanceMiles = miles;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Routes lookup failed";
    console.error("[/api/quote] Routes API failed:", message);
    return NextResponse.json(
      {
        error: "ROUTE_LOOKUP_FAILED",
        message: "We couldn't compute driving distance. Please try again in a moment.",
      },
      { status: 502 }
    );
  }

  const quote = computeQuote({
    vehicle,
    distanceMiles,
    tripType: payload.tripType,
    extraStop: payload.addOns?.extraStop ?? false,
  });

  return NextResponse.json(buildResponse(quote, {
    vehicle,
    matchedFixedRoute: null,
    distanceMiles,
    pickup,
    dropoff,
  }));
}

function buildResponse(
  quote: Quote,
  meta: {
    vehicle: { id: string; name: string };
    matchedFixedRoute: string | null;
    distanceMiles: number | null;
    pickup: ResolvedPlace;
    dropoff: ResolvedPlace;
  }
) {
  return {
    distanceMiles: meta.distanceMiles,
    vehicle: { id: meta.vehicle.id, name: meta.vehicle.name },
    matchedFixedRoute: meta.matchedFixedRoute,
    breakdown: quote.breakdown,
    base: quote.base,
    gratuity: quote.gratuity,
    total: quote.total,
    pickup: {
      placeId: meta.pickup.placeId,
      name: meta.pickup.name,
      formattedAddress: meta.pickup.formattedAddress,
    },
    dropoff: {
      placeId: meta.dropoff.placeId,
      name: meta.dropoff.name,
      formattedAddress: meta.dropoff.formattedAddress,
    },
  };
}
