/**
 * Pure pricing module — safe to import from both server and client.
 *
 * The same functions power the wizard's live price summary (client) and the
 * server-side authoritative price computation that backs `/api/bookings/create`
 * (see {@link computeBookingPrice}). The server NEVER trusts the client's
 * computed total — it recomputes from the raw inputs the customer typed.
 */

export * from "./data";
export * from "./airportTransfer";
export * from "./pointToPoint";
export * from "./hourlyCharter";

import type { BookableServiceCode } from "./data";
import { calculateAirportTransferPrice } from "./airportTransfer";
import { calculatePointToPointPrice } from "./pointToPoint";
import { calculateHourlyCharterPrice } from "./hourlyCharter";

/* ── Public formatters ────────────────────────────────────────────────── */

export function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function shouldShowGroupQuoteMessage(passengerGroup: string): boolean {
  return passengerGroup === "15+";
}

/* ── Server-side authoritative price computation ──────────────────────── */

/**
 * Raw inputs the server needs from the wizard. Optional fields apply only to
 * specific services; we validate per-service inside {@link computeBookingPrice}.
 */
export interface PricingInput {
  service: BookableServiceCode;
  passengerGroup: string;
  /** "15" | "20" | "25" | "cash" — see GRATUITY_OPTIONS. */
  gratuity: string;
  // airport-transfer
  airport?: string;
  meetAndGreet?: boolean;
  roundTrip?: boolean;
  // point-to-point
  pickupAddress?: string;
  dropoffAddress?: string;
  extraStop?: boolean;
  // hourly-charter
  hours?: number;
}

export type ComputedPrice =
  | {
      kind: "computed";
      subtotalCents: number;
      gratuityCents: number;
      totalCents: number;
    }
  | {
      kind: "manual-quote";
      reason: string;
    };

/**
 * Authoritative server-side price. Returns `manual-quote` when this booking
 * needs a human (15+ passenger group, unknown point-to-point route, missing
 * inputs, etc.). The API route translates `manual-quote` into a 400 so the
 * client falls back to the email-quote path.
 */
export function computeBookingPrice(input: PricingInput): ComputedPrice {
  if (input.passengerGroup === "15+") {
    return { kind: "manual-quote", reason: "Groups over 14 passengers require a custom quote." };
  }

  if (input.service === "airport-transfer") {
    if (!input.airport) {
      return { kind: "manual-quote", reason: "Airport selection is required." };
    }
    const quote = calculateAirportTransferPrice(
      input.airport,
      input.passengerGroup,
      input.meetAndGreet ?? false,
      input.roundTrip ?? false
    );
    if (!quote) {
      return {
        kind: "manual-quote",
        reason: "No published rate for that airport / passenger combo.",
      };
    }
    return finalize(quote.total + quote.addOns, input.gratuity);
  }

  if (input.service === "point-to-point") {
    if (!input.pickupAddress || !input.dropoffAddress) {
      return { kind: "manual-quote", reason: "Pickup and drop-off addresses are required." };
    }
    const quote = calculatePointToPointPrice(
      input.pickupAddress,
      input.dropoffAddress,
      input.passengerGroup,
      input.extraStop ?? false
    );
    if (quote.total === null) {
      return {
        kind: "manual-quote",
        reason: "Route is outside our fixed-rate set — we quote these manually.",
      };
    }
    return finalize(quote.total, input.gratuity);
  }

  // hourly-charter
  const quote = calculateHourlyCharterPrice(input.passengerGroup, input.hours ?? 0);
  if (!quote) {
    return {
      kind: "manual-quote",
      reason: "Hourly charter has a 4-hour minimum and requires a valid passenger group.",
    };
  }
  return finalize(quote.total, input.gratuity);
}

function finalize(subtotalUsd: number, gratuityValue: string): ComputedPrice {
  const subtotalCents = Math.round(subtotalUsd * 100);
  // "cash" => 0 cents on file; customer hands gratuity to the driver directly.
  const gratuityPercent = gratuityValue === "cash" ? 0 : Number(gratuityValue);
  const gratuityCents = Number.isFinite(gratuityPercent)
    ? Math.round((subtotalCents * gratuityPercent) / 100)
    : 0;
  return {
    kind: "computed",
    subtotalCents,
    gratuityCents,
    totalCents: subtotalCents + gratuityCents,
  };
}
