import { metersToMiles } from "@/lib/geo/service-area";

/**
 * Server-side Google Routes API (Compute Routes) client.
 *
 * Replaces the legacy Directions API. We request the cheapest field mask
 * possible — just `routes.distanceMeters` — so each call hits the "Compute
 * Routes Essentials" SKU on the free tier.
 *
 * Docs: https://developers.google.com/maps/documentation/routes/compute_route_directions
 *
 * NOTE: We do NOT set `departureTime`, so traffic isn't considered. The quote
 * is a static distance quote — predictable, cache-friendly, and the price
 * stays stable regardless of when the customer revisits the page.
 */

const ROUTES_V2_ENDPOINT = "https://routes.googleapis.com/directions/v2:computeRoutes";

interface ComputeRoutesResponse {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
  }>;
}

function getServerKey(): string {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_SERVER_KEY is not set.");
  }
  return key;
}

/* ── In-memory cache ─────────────────────────────────────────────────────
 *
 * Keyed by an order-independent hash of the two place IDs so A→B and B→A
 * share a cache entry. TTL is 24h — driving distances change rarely.
 *
 * Per-process Map. In a serverless / Vercel deployment each lambda instance
 * has its own cache; cold starts pay for the call. For our volume that's
 * fine. If it becomes a problem we can hoist to Redis later.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
interface CacheEntry {
  miles: number;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

function cacheKey(a: string, b: string): string {
  return [a, b].sort().join("→");
}

/* ── Public API ──────────────────────────────────────────────────────────── */

export interface RouteDistance {
  miles: number;
  /** Was this result served from the in-memory cache? */
  cached: boolean;
}

/**
 * Compute driving distance (in miles) between two Place IDs.
 */
export async function computeDriveDistanceMiles(
  pickupPlaceId: string,
  dropoffPlaceId: string
): Promise<RouteDistance> {
  if (!pickupPlaceId || !dropoffPlaceId) {
    throw new Error("Both pickup and dropoff Place IDs are required");
  }

  const key = cacheKey(pickupPlaceId, dropoffPlaceId);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return { miles: hit.miles, cached: true };
  }

  const res = await fetch(ROUTES_V2_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getServerKey(),
      // Field mask — keep this tight so every request stays on the Essentials SKU.
      "X-Goog-FieldMask": "routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: { placeId: pickupPlaceId },
      destination: { placeId: dropoffPlaceId },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Routes API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as ComputeRoutesResponse;
  const meters = data.routes?.[0]?.distanceMeters;
  if (typeof meters !== "number" || meters <= 0) {
    throw new Error("Routes API returned no usable distance");
  }

  const miles = metersToMiles(meters);
  cache.set(key, { miles, expiresAt: Date.now() + CACHE_TTL_MS });
  return { miles, cached: false };
}

/** Test-only — clear the cache between scenarios. */
export function _clearRouteCache(): void {
  cache.clear();
}
