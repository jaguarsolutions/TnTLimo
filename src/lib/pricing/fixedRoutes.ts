import fixedRoutesConfig from "@/../config/fixed-routes.json";
import { haversineMeters, type LatLng } from "@/lib/geo/service-area";

/**
 * Fixed-route lookup for the four published anchor pairs.
 *
 * Matching uses two strategies:
 *   1. Place ID — exact match against the `placeIds` array on each anchor
 *      (populated lazily as we discover them in production).
 *   2. Geographic proximity — falls back to a haversine check against the
 *      anchor's `center` within `matchRadiusMeters`. This is what makes the
 *      config maintainable without having to hand-curate Place IDs for every
 *      hotel that counts as "Disneyland area".
 *
 * Direction-insensitive: Anaheim → LAX and LAX → Anaheim both match the same
 * `anaheim-lax` route.
 */

export interface FixedRouteAnchor {
  id: string;
  label: string;
  center: LatLng;
  matchRadiusMeters: number;
  placeIds: string[];
}

export interface FixedRoute {
  id: string;
  label: string;
  from: string; // anchor id
  to: string; // anchor id
  price: number;
}

interface RawConfig {
  anchors: Record<string, Omit<FixedRouteAnchor, "id">>;
  routes: FixedRoute[];
}

const config = fixedRoutesConfig as RawConfig;

export const ANCHORS: FixedRouteAnchor[] = Object.entries(config.anchors).map(
  ([id, value]) => ({ id, ...value })
);

export const FIXED_ROUTES: FixedRoute[] = config.routes;

/** Identify which (if any) anchor a resolved place belongs to. */
export function matchAnchor(args: {
  placeId: string;
  location: LatLng;
}): FixedRouteAnchor | null {
  const { placeId, location } = args;

  // Strategy 1 — exact Place ID match
  for (const anchor of ANCHORS) {
    if (anchor.placeIds.includes(placeId)) return anchor;
  }

  // Strategy 2 — proximity to anchor center
  let best: { anchor: FixedRouteAnchor; meters: number } | null = null;
  for (const anchor of ANCHORS) {
    const meters = haversineMeters(location, anchor.center);
    if (meters <= anchor.matchRadiusMeters) {
      if (!best || meters < best.meters) best = { anchor, meters };
    }
  }
  return best?.anchor ?? null;
}

/**
 * Look up a fixed route given pickup + dropoff resolved places. Returns null
 * if either endpoint isn't recognized as an anchor or no matching route exists.
 */
export function lookupFixedRoute(args: {
  pickupPlaceId: string;
  pickupLocation: LatLng;
  dropoffPlaceId: string;
  dropoffLocation: LatLng;
}): FixedRoute | null {
  const pickup = matchAnchor({
    placeId: args.pickupPlaceId,
    location: args.pickupLocation,
  });
  const dropoff = matchAnchor({
    placeId: args.dropoffPlaceId,
    location: args.dropoffLocation,
  });
  if (!pickup || !dropoff) return null;

  for (const route of FIXED_ROUTES) {
    const direct = route.from === pickup.id && route.to === dropoff.id;
    const reverse = route.from === dropoff.id && route.to === pickup.id;
    if (direct || reverse) return route;
  }
  return null;
}
