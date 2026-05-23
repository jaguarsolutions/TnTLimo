import { ADD_ON_FEES, AIRPORT_PRICING, vehicleCategoryFromPassengerGroup } from "./data";

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
 * exists for this airport / vehicle combo (caller should fall back
 * to manual quote flow.
 */
export function calculateAirportTransferPrice(
  airport: string,
  vehicleIdOrPassengerGroup: string,
  meetAndGreet: boolean,
  roundTrip: boolean,
  actualDistanceMiles?: number
): AirportTransferQuote | null {
  const airportConfig = AIRPORT_PRICING[airport as keyof typeof AIRPORT_PRICING];
  if (!airportConfig) return null;

  const vehicleId =
    airportConfig.rates[vehicleIdOrPassengerGroup as keyof typeof airportConfig.rates] !== undefined
      ? (vehicleIdOrPassengerGroup as keyof typeof airportConfig.rates)
      : vehicleCategoryFromPassengerGroup(vehicleIdOrPassengerGroup);

  if (!vehicleId) return null;
  const baseRate = airportConfig.rates[vehicleId];
  if (baseRate === null || baseRate === undefined) return null;

  let base = baseRate;
  if (
    typeof actualDistanceMiles === "number" &&
    Number.isFinite(actualDistanceMiles) &&
    actualDistanceMiles > airportConfig.distanceMiles
  ) {
    const extraMiles = actualDistanceMiles - airportConfig.distanceMiles;
    const perMile = airportConfig.perMileAfterBaseline[vehicleId];
    base += Math.round(extraMiles * perMile);
  }

  const total = base * (roundTrip ? 2 : 1);
  const addOns = meetAndGreet ? ADD_ON_FEES.meetAndGreet : 0;
  return { base, total, addOns, roundTrip };
}
