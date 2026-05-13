import serviceAreaConfig from "@/../config/service-area.json";

/** Earth's mean radius in miles. */
const EARTH_RADIUS_MILES = 3958.7613;
/** Earth's mean radius in meters. */
const EARTH_RADIUS_METERS = 6371000;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ServiceAreaConfig {
  center: LatLng & { label: string };
  radiusMiles: number;
}

export const SERVICE_AREA: ServiceAreaConfig = serviceAreaConfig as ServiceAreaConfig;

export const SERVICE_AREA_RADIUS_METERS = milesToMeters(SERVICE_AREA.radiusMiles);

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function milesToMeters(miles: number): number {
  return miles * 1609.344;
}

export function metersToMiles(meters: number): number {
  return meters / 1609.344;
}

/**
 * Great-circle distance between two lat/lng points using the haversine formula.
 * Returns kilometers... no, MILES (to match our pricing units).
 */
export function haversineMiles(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_MILES * c;
}

/** Same as haversineMiles but in meters — handy for fixed-route proximity matching. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Is the given point within the service area?
 * Default uses the configured Anaheim center + 50-mile radius.
 */
export function isWithinServiceArea(point: LatLng, config: ServiceAreaConfig = SERVICE_AREA): boolean {
  return haversineMiles(point, config.center) <= config.radiusMiles;
}
