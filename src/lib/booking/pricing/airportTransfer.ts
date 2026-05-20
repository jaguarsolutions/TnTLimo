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
 * to manual quote flow.
 */
export function calculateAirportTransferPrice(
  airport: string,
  passengerGroup: string,
  meetAndGreet: boolean,
  roundTrip: boolean,
  actualDistanceMiles?: number
): AirportTransferQuote | null {
  const airportConfig = AIRPORT_PRICING[airport as keyof typeof AIRPORT_PRICING];
  if (!airportConfig) return null;

  const rateKey = passengerGroup as keyof typeof airportConfig.rates;
  const baseRate = airportConfig.rates[rateKey] ?? null;
  if (baseRate === null) return null;

  let base = baseRate;
  if (
    typeof actualDistanceMiles === "number" &&
    Number.isFinite(actualDistanceMiles) &&
    actualDistanceMiles > airportConfig.distanceMiles
  ) {
    const extraMiles = actualDistanceMiles - airportConfig.distanceMiles;
    const perMile = airportConfig.perMileAfterBaseline[rateKey];
    base += Math.round(extraMiles * perMile);
  }

  const total = base * (roundTrip ? 2 : 1);
  const addOns = meetAndGreet ? ADD_ON_FEES.meetAndGreet : 0;
  return { base, total, addOns, roundTrip };
}
