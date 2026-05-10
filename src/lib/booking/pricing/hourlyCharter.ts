import { HOURLY_CHARTER_MIN_HOURS, HOURLY_RATES } from "./data";

export interface HourlyCharterQuote {
  /** Hourly rate matched to the passenger group, in USD. */
  rate: number;
  /** Rate × hours, in USD. */
  total: number;
}

/**
 * Pure pricing function for hourly charters. Returns `null` when no rate
 * exists for the passenger group, or when `hours` is below the minimum.
 */
export function calculateHourlyCharterPrice(
  passengerGroup: string,
  hours: number
): HourlyCharterQuote | null {
  const rate = (HOURLY_RATES as Record<string, number>)[passengerGroup];
  if (!rate || hours < HOURLY_CHARTER_MIN_HOURS) return null;
  return { rate, total: rate * hours };
}
