import type { LatLng } from "@/lib/geo/service-area";

/**
 * Server-side Place Details lookup using Google Places API (New).
 *
 * Uses the v1 endpoint with a Field Mask so we only ever pay for the
 * "Essentials SKU" (location + display name + place ID).
 *
 * Docs: https://developers.google.com/maps/documentation/places/web-service/place-details
 */

const PLACES_V1_BASE = "https://places.googleapis.com/v1/places";

interface PlaceDetailsResponse {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
}

export interface ResolvedPlace {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: LatLng;
}

function getServerKey(): string {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_MAPS_SERVER_KEY is not set. Configure it in Vercel env (and .env.local for dev)."
    );
  }
  return key;
}

/**
 * Resolve a Place ID to its coordinates and display name. Throws on HTTP errors
 * or missing location data — the caller should surface a friendly message.
 */
export async function resolvePlace(placeId: string): Promise<ResolvedPlace> {
  if (!placeId) throw new Error("placeId is required");

  const url = `${PLACES_V1_BASE}/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": getServerKey(),
      // Field mask — Essentials SKU only. Required by the v1 API.
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
    },
    // Server-side, no caching from Next's fetch (we manage our own cache for Routes calls).
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Places API ${res.status} for ${placeId}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as PlaceDetailsResponse;
  if (!data.location) {
    throw new Error(`Place ${placeId} returned no location`);
  }

  return {
    placeId: data.id ?? placeId,
    name: data.displayName?.text ?? data.formattedAddress ?? "Unknown",
    formattedAddress: data.formattedAddress ?? data.displayName?.text ?? "",
    location: { lat: data.location.latitude, lng: data.location.longitude },
  };
}
