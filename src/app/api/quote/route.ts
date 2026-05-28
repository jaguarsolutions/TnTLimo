import { NextResponse } from "next/server";
import { z } from "zod";
import { isWithinServiceArea, POINT_TO_POINT_SERVICE_AREA, SERVICE_AREA } from "@/lib/geo/service-area";
import { resolvePlace, type ResolvedPlace } from "@/lib/maps/places";
import {
  computeDriveDistanceMiles,
  computeDriveDistanceMilesFromLocations,
} from "@/lib/maps/routes";
import {
  computeFixedRouteQuote,
  computeQuote,
  getVehicle,
  type Quote,
} from "@/lib/pricing/engine";
import {
  AIRPORT_PRICING,
  calculateAirportTransferPrice,
} from "@/lib/booking/pricing";
import { lookupFixedRoute } from "@/lib/pricing/fixedRoutes";
import { SITE_CONTACT } from "@/lib/siteContact";
export const runtime = "nodejs";

/**
 * Live quote endpoint for the point-to-point booking flow.
 *
 *   POST /api/quote
 *
 * Flow:
 *   1. Validate payload (zod).
 *   2. Resolve both Place IDs to lat/lng via Places API.
 *   3. Reject if either point is outside the home base service area (see config/*-service-area.json).
 *   4. If both endpoints match one of the four published anchor pairs,
 *      return the fixed price (skip Routes API).
 *   5. Otherwise call Routes API, run distance through the pricing engine.
 *   6. Apply trip-type multiplier, add-ons, 20% gratuity.
 *
 * Errors surface a stable `error` string plus a human `message`. The wizard
 * UI keys on `error` to render the right inline state.
 */

const PointToPointQuoteSchema = z.object({
  service: z.literal("point-to-point"),
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

const AirportTransferQuoteSchema = z.object({
  service: z.literal("airport-transfer"),
  airport: z.string().min(1, "Airport is required"),
  otherAddressPlaceId: z.string().min(1, "Address place is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  passengerGroup: z.string().min(1, "Passenger group is required"),
  tripType: z.enum(["oneway", "roundtrip"]),
  addOns: z
    .object({
      meetAndGreet: z.boolean().optional(),
    })
    .optional(),
});

const QuoteSchema = z.union([PointToPointQuoteSchema, AirportTransferQuoteSchema]);

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

  if (payload.service === "point-to-point") {
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

    /* ── 3. Service area check ──────────────────────────────────────────────
     * Point-to-point pickups and drop-offs must sit inside our published
     * service radius (see config/*-service-area.json — currently 150 mi).
     * ──────────────────────────────────────────────────────────────────── */
    const pickupInArea = isWithinServiceArea(pickup.location, POINT_TO_POINT_SERVICE_AREA);
    const dropoffInArea = isWithinServiceArea(dropoff.location, SERVICE_AREA);
    if (!pickupInArea || !dropoffInArea) {
      const offending =
        !pickupInArea && !dropoffInArea ? "both" : !pickupInArea ? "pickup" : "dropoff";
      const radius = POINT_TO_POINT_SERVICE_AREA.radiusMiles;
      const message =
        offending === "pickup"
          ? `Point-to-point pickups need to start within ${radius} miles of our Anaheim home base. Please call ${SITE_CONTACT.phoneDisplay} — we may still be able to accommodate your pickup.`
          : offending === "dropoff"
            ? `That drop-off is outside the area we cover for point-to-point rides. Please call ${SITE_CONTACT.phoneDisplay} — we may be able to accommodate your trip.`
            : `That trip is outside the area we cover for point-to-point rides. Please call ${SITE_CONTACT.phoneDisplay} — we may be able to accommodate it.`;
      return NextResponse.json(
        { error: "OUTSIDE_SERVICE_AREA", offending, message },
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

    /* ── 5. Custom route — Routes API + engine ────────────────────────── */
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

  if (payload.service === "airport-transfer") {
    const airportConfig = AIRPORT_PRICING[payload.airport as keyof typeof AIRPORT_PRICING];
    if (!airportConfig) {
      return NextResponse.json(
        { error: "UNKNOWN_AIRPORT", message: `Unknown airport "${payload.airport}"` },
        { status: 400 }
      );
    }

    let other: ResolvedPlace;
    try {
      other = await resolvePlace(payload.otherAddressPlaceId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Place lookup failed";
      console.error("[/api/quote] airport place resolution failed:", message);
      return NextResponse.json(
        { error: "PLACE_LOOKUP_FAILED", message: "We couldn't look up that address. Please re-pick it." },
        { status: 502 }
      );
    }

    let distanceMiles: number;
    try {
      const result = await computeDriveDistanceMilesFromLocations(
        airportConfig.location,
        other.location
      );
      distanceMiles = result.miles;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Routes lookup failed";
      console.error("[/api/quote] airport Routes API failed:", message);
      return NextResponse.json(
        {
          error: "ROUTE_LOOKUP_FAILED",
          message: "We couldn't compute driving distance. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    const quote = calculateAirportTransferPrice(
      payload.airport,
      payload.vehicleId,
      payload.addOns?.meetAndGreet ?? false,
      payload.tripType === "roundtrip",
      distanceMiles
    );

    if (!quote) {
      return NextResponse.json(
        { error: "UNKNOWN_RATE", message: "No published rate for that airport / passenger combo." },
        { status: 400 }
      );
    }

    const base = quote.total;
    const gratuity = Math.round(base * 0.2);
    const total = base + gratuity;

    return NextResponse.json({
      service: "airport-transfer",
      distanceMiles,
      vehicle: { id: "airport-transfer", name: "Airport transfer" },
      matchedFixedRoute: null,
      breakdown: [
        { label: payload.tripType === "roundtrip" ? `${payload.airport} round trip` : payload.airport, amount: base },
      ],
      base,
      gratuity,
      total,
      pickup: {
        placeId: other.placeId,
        name: other.name,
        formattedAddress: other.formattedAddress,
      },
      dropoff: {
        placeId: airportConfig.location ? payload.otherAddressPlaceId : payload.otherAddressPlaceId,
        name: airportConfig.location ? payload.airport : payload.airport,
        formattedAddress: airportConfig.location ? payload.airport : payload.airport,
      },
    });
  }

  return NextResponse.json(
    { error: "INVALID_SERVICE", message: "Unsupported quote service." },
    { status: 400 }
  );
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
    service: "point-to-point",
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
