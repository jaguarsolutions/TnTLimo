import { ADD_ON_FEES, AIRPORT_PRICING } from "./data";

export interface AirportTransferQuote {
  /** One-way base fare, in USD. */
  base: number;
  /** Base × 2 for round trip, else base. */
  total: number;
  /** Add-on fees (meet & greet), in USD. */
  addOns: number;
  roundTrip: boolean;
}

/**
 * Pure pricing function for airport transfers. Returns `null` when no rate
 * exists for this airport / passenger group combo (caller should fall back
 * to manual quote flow).
 */
export function calculateAirportTransferPrice(
  airport: string,
  passengerGroup: string,
  meetAndGreet: boolean,
  roundTrip: boolean
): AirportTransferQuote | null {
  const airportRates = (AIRPORT_PRICING as Record<string, Record<string, number>>)[airport];
  const base = airportRates?.[passengerGroup] ?? null;
  if (base === null) return null;
  const total = base * (roundTrip ? 2 : 1);
  const addOns = meetAndGreet ? ADD_ON_FEES.meetAndGreet : 0;
  return { base, total, addOns, roundTrip };
}
