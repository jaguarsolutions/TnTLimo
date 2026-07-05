import type { Booking } from "@/lib/booking/schema";
import {
  CHILD_SEAT_OPTIONS,
  PASSENGER_GROUPS,
} from "@/lib/booking/pricing/data";
import { AIRPORTS } from "@/lib/transportationLocations";

/**
 * A single label/value pair describing one facet of a booking.
 *
 * `internalOnly` rows (e.g. gratuity method the driver collects) are shown to
 * the operator — internal email + admin dashboard — but filtered out of the
 * customer-facing confirmation email.
 */
export interface BookingDetailRow {
  label: string;
  value: string;
  internalOnly?: boolean;
}

/**
 * Turn a persisted booking into an ordered list of human-readable detail rows,
 * branching on the service type. This is the single source of truth for "what
 * details does this booking have" — consumed by the confirmation email
 * templates and the admin dashboard so the three surfaces never drift.
 *
 * All trip data is read from `booking.payload`, which is the wizard's full
 * state snapshot (untyped jsonb). Every field is coerced defensively; a missing
 * or blank optional field renders as "Not provided" rather than a blank row,
 * matching the booking wizard's own review-step convention.
 */
export function describeBooking(booking: Booking): BookingDetailRow[] {
  const p = (booking.payload ?? {}) as Record<string, unknown>;
  const rows: BookingDetailRow[] = [];

  switch (booking.serviceCode) {
    case "airport-transfer":
      rows.push(...airportRows(p));
      break;
    case "point-to-point":
      rows.push(...pointToPointRows(p));
      break;
    case "hourly-charter":
      rows.push(...hourlyRows(p));
      break;
    default:
      // Unknown/legacy service — fall through to the common rows only.
      break;
  }

  rows.push(...commonRows(p));
  return rows;
}

/** The subset shown to the customer — drops operator-only rows. */
export function customerDetailRows(booking: Booking): BookingDetailRow[] {
  return describeBooking(booking).filter((r) => !r.internalOnly);
}

/* ── Per-service row builders ─────────────────────────────────────────────── */

function airportRows(p: Record<string, unknown>): BookingDetailRow[] {
  const rows: BookingDetailRow[] = [];
  const airport = airportDisplayName(str(p.airport));
  const address = str(p.otherAddress) || "Not provided";
  const direction = str(p.airportDirection); // "from-airport" | "to-airport"
  const roundTrip = bool(p.roundTrip);
  const arrival = direction === "from-airport";

  rows.push({
    label: "Trip type",
    value: roundTrip
      ? "Round trip (airport pickup + drop-off)"
      : arrival
        ? "Airport pickup (arrival)"
        : "Airport drop-off (departure)",
  });
  rows.push({ label: "Airport", value: airport });

  if (roundTrip) {
    rows.push({ label: "Hotel / address", value: address });
  } else if (arrival) {
    rows.push({ label: "Pickup", value: airport });
    rows.push({ label: "Drop-off", value: address });
  } else {
    rows.push({ label: "Pickup", value: address });
    rows.push({ label: "Drop-off", value: airport });
  }

  rows.push({ label: "Airline", value: str(p.airline) || "Not provided" });
  rows.push({ label: "Flight #", value: str(p.flightNumber) || "Not provided" });

  const flightLabel = roundTrip
    ? "Arrival flight time"
    : arrival
      ? "Flight arrival time"
      : "Flight departure time";
  rows.push({ label: flightLabel, value: formatLocalDateTime(str(p.flightTime)) });

  if (roundTrip) {
    rows.push({
      label: "Return flight departure",
      value: formatLocalDateTime(str(p.returnFlightTime)),
    });
  }

  // Meet & greet only applies when we're meeting an arriving passenger.
  if (arrival || roundTrip) {
    rows.push({ label: "Meet & greet", value: bool(p.meetAndGreet) ? "Yes" : "No" });
  }

  return rows;
}

function pointToPointRows(p: Record<string, unknown>): BookingDetailRow[] {
  return [
    { label: "Pickup", value: str(p.pickupAddress) || "Not provided" },
    { label: "Drop-off", value: str(p.dropoffAddress) || "Not provided" },
    { label: "Pickup date/time", value: formatLocalDateTime(str(p.pickupDateTime)) },
    {
      label: "Extra stop",
      value: bool(p.extraStop) ? str(p.extraStopDetails) || "Yes" : "No",
    },
  ];
}

function hourlyRows(p: Record<string, unknown>): BookingDetailRow[] {
  return [
    { label: "Pickup", value: str(p.pickupAddress) || "Not provided" },
    { label: "Pickup date/time", value: formatLocalDateTime(str(p.pickupDateTime)) },
    { label: "Hours booked", value: hoursValue(p.hours) },
    { label: "Planned stops / notes", value: str(p.plannedStops) || "Not provided" },
  ];
}

/** Rows shared by every service, appended after the service-specific rows. */
function commonRows(p: Record<string, unknown>): BookingDetailRow[] {
  const rows: BookingDetailRow[] = [
    { label: "Passengers", value: passengerGroupLabel(str(p.passengerGroup)) },
    { label: "Luggage", value: luggageValue(p.luggageCount) },
    { label: "Child seats", value: childSeatLabels(p.childSeats) },
  ];

  const notes = str(p.notes);
  if (notes) rows.push({ label: "Notes", value: notes });

  rows.push({
    label: "Gratuity",
    value: gratuityLabel(str(p.gratuity)),
    internalOnly: true,
  });

  return rows;
}

/* ── Value formatting helpers ─────────────────────────────────────────────── */

function airportDisplayName(code: string): string {
  if (!code) return "Not provided";
  return AIRPORTS.find((a) => a.name.includes(`(${code})`))?.name ?? code;
}

function passengerGroupLabel(value: string): string {
  if (!value) return "Not provided";
  return PASSENGER_GROUPS.find((g) => g.value === value)?.label ?? value;
}

function childSeatLabels(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "None";
  const labels = value.map((v) => {
    const match = CHILD_SEAT_OPTIONS.find((o) => o.value === v);
    return match ? match.label : String(v);
  });
  return labels.join(", ");
}

function gratuityLabel(value: string): string {
  if (!value) return "Not provided";
  if (value === "cash") return "Cash at pickup";
  return `${value}%`;
}

function luggageValue(value: unknown): string {
  const n = num(value);
  return n === null ? "Not provided" : String(n);
}

function hoursValue(value: unknown): string {
  const n = num(value);
  return n === null ? "Not provided" : `${n} ${n === 1 ? "hour" : "hours"}`;
}

/**
 * Format a wizard datetime-local string ("YYYY-MM-DDTHH:MM", browser wall-clock
 * time the customer picked as their LA-local pickup) for display. We parse the
 * components and format them verbatim in UTC so the wall-clock digits are
 * preserved regardless of the server's timezone (Netlify functions run UTC) —
 * i.e. "2:54 PM" always renders as "2:54 PM", never shifted.
 */
function formatLocalDateTime(local: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local);
  if (!m) return local || "Not provided";
  const dt = new Date(
    Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]))
  );
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(dt);
}

/* ── Defensive payload coercion (payload is untyped jsonb) ─────────────────── */

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function bool(v: unknown): boolean {
  return v === true;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}
