import { getVehicle } from "@/lib/pricing/engine";
import { vehicleCategoryFromPassengerGroup, type VehicleCategory } from "./data";

export interface HourlyCharterQuote {
  /** Hourly rate matched to the vehicle type, in USD. */
  rate: number;
  /** Rate × billed hours, in USD. Hours are floored at the tier's min. */
  total: number;
  /** Hours actually billed (max of requested hours and the tier's hourlyMinHours). */
  billedHours: number;
  /** Minimum hours for the resolved vehicle tier. */
  minHours: number;
}

/**
 * Pure pricing function for hourly charters. Hours below the tier's
 * minimum are floored to that minimum (so a 2-hr request on a Sedan still
 * bills the 3-hr minimum). Returns `null` when the vehicle is unknown.
 */
export function calculateHourlyCharterPrice(
  vehicleIdOrPassengerGroup: string,
  hours: number
): HourlyCharterQuote | null {
  const vehicleId: VehicleCategory | null = isVehicleCategory(vehicleIdOrPassengerGroup)
    ? vehicleIdOrPassengerGroup
    : vehicleCategoryFromPassengerGroup(vehicleIdOrPassengerGroup);
  if (!vehicleId) return null;
  const vehicle = getVehicle(vehicleId);
  if (!vehicle) return null;
  if (!Number.isFinite(hours) || hours < 0) return null;

  const minHours = vehicle.hourlyMinHours;
  const billedHours = Math.max(minHours, Math.floor(hours));
  return {
    rate: vehicle.hourlyRate,
    total: vehicle.hourlyRate * billedHours,
    billedHours,
    minHours,
  };
}

/** Look up the tier's minimum-hours by vehicle id or passenger group. */
export function minHoursFor(vehicleIdOrPassengerGroup: string): number {
  const vehicleId: VehicleCategory | null = isVehicleCategory(vehicleIdOrPassengerGroup)
    ? vehicleIdOrPassengerGroup
    : vehicleCategoryFromPassengerGroup(vehicleIdOrPassengerGroup);
  const vehicle = vehicleId ? getVehicle(vehicleId) : null;
  return vehicle?.hourlyMinHours ?? 3;
}

function isVehicleCategory(v: string): v is VehicleCategory {
  return v === "sedan" || v === "suv" || v === "van" || v === "sprinter";
}
