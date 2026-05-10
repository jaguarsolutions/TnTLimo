/**
 * Cancellation policy helpers. Tenant-agnostic: each helper takes the policy
 * window as a parameter so per-tenant policies are trivial to slot in later.
 */

import { getTenant } from "@/lib/tenant";

export function isWithinFreeCancelWindow(
  pickupAt: Date,
  windowHours: number = getTenant().cancellationWindowHours,
  now: Date = new Date()
): boolean {
  const msUntilPickup = pickupAt.getTime() - now.getTime();
  return msUntilPickup >= windowHours * 60 * 60 * 1000;
}

export function hoursUntilPickup(pickupAt: Date, now: Date = new Date()): number {
  return (pickupAt.getTime() - now.getTime()) / (60 * 60 * 1000);
}
