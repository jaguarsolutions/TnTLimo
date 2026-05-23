import { HOURLY_CHARTER_MIN_HOURS, HOURLY_RATES, HOURLY_VEHICLE_RATES, vehicleCategoryFromPassengerGroup } from "./data";

export interface HourlyCharterQuote {
  /** Hourly rate matched to the vehicle type, in USD. */
  rate: number;
  /** Rate × hours, in USD. */
  total: number;
}

/**
 * Pure pricing function for hourly charters. Returns `null` when no rate
 * exists for the selected vehicle, or when `hours` is below the minimum.
 */
export function calculateHourlyCharterPrice(
  vehicleIdOrPassengerGroup: string,
  hours: number
): HourlyCharterQuote | null {
  const vehicleId =
    HOURLY_VEHICLE_RATES[vehicleIdOrPassengerGroup as keyof typeof HOURLY_VEHICLE_RATES] !== undefined
      ? (vehicleIdOrPassengerGroup as keyof typeof HOURLY_VEHICLE_RATES)
      : vehicleCategoryFromPassengerGroup(vehicleIdOrPassengerGroup);

  if (!vehicleId) return null;
  const rate = HOURLY_VEHICLE_RATES[vehicleId];
  if (!rate || hours < HOURLY_CHARTER_MIN_HOURS) return null;
  return { rate, total: rate * hours };
}
