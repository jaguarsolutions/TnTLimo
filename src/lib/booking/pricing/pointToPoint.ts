import { ADD_ON_FEES, POINT_TO_POINT_FIXED_ROUTES } from "./data";

export interface PointToPointQuote {
  /** Matched fixed-route label, or `null` if no match (manual quote needed). */
  routeMatch: string | null;
  /** Base fare for the matched route, in USD. `null` when no match. */
  base: number | null;
  /** Total (base + add-ons) in USD, or `null` when no route match. */
  total: number | null;
  /** Add-on fees (extra stop), in USD. */
  addOns: number;
}

export function calculatePointToPointPrice(
  pickup: string,
  dropoff: string,
  _passengerGroup: string,
  extraStop: boolean
): PointToPointQuote {
  const routeMatch = inferPointToPointRoute(pickup, dropoff);
  const base = routeMatch ? POINT_TO_POINT_FIXED_ROUTES[routeMatch] : null;
  const addOns = extraStop ? ADD_ON_FEES.extraStop : 0;
  const total = base === null ? null : base + addOns;
  return { routeMatch, base, total, addOns };
}

/**
 * Loose substring match to map a free-form pickup/dropoff pair onto one of
 * the fixed-route labels. Anything that doesn't match returns `null`, which
 * is the signal upstream that this booking requires a manual quote.
 */
function inferPointToPointRoute(pickup: string, dropoff: string): string | null {
  const from = pickup.toLowerCase();
  const to = dropoff.toLowerCase();
  const has = (haystack: string, needle: string) => haystack.includes(needle);

  const routeVariants: Array<[string[], string[], string]> = [
    [["anaheim"], ["lax", "los angeles international airport"], "Anaheim to LAX"],
    [["anaheim"], ["sna", "john wayne", "john wayne airport"], "Anaheim to SNA"],
    [["anaheim"], ["universal", "universal studios"], "Anaheim to Universal Studios"],
    [["anaheim"], ["downtown", "dtla", "los angeles"], "Anaheim to Downtown LA"],
  ];

  for (const [fromKeys, toKeys, route] of routeVariants) {
    const fromMatch = fromKeys.some((term) => has(from, term)) || toKeys.some((term) => has(from, term));
    const toMatch = toKeys.some((term) => has(to, term)) || fromKeys.some((term) => has(to, term));
    if (fromMatch && toMatch) {
      return route;
    }
  }

  return null;
}
