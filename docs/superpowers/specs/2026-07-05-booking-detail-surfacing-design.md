# Booking Detail Surfacing — Design

**Date:** 2026-07-05
**Status:** Approved (design), pending implementation plan

## Problem

Booking confirmation emails and the admin dashboard show only a 4-field summary
(Confirmation / Service / Pickup / Total). Operators can't see which airport,
flight time, pickup/drop-off address, passenger count, etc. without opening the
raw manage page, and customers get a confirmation that omits the trip specifics
they need to sanity-check.

Crucially, **the data already exists**. Every booking persists the wizard's full
state snapshot to `bookings.payload` (jsonb) at creation time
([create/route.ts](../../../src/app/api/bookings/create/route.ts) line ~177).
The captured fields include: `service`, `airportDirection`, `airport`,
`otherAddress`, `roundTrip`, `pickupAddress`, `dropoffAddress`, `airline`,
`flightNumber`, `flightTime`, `returnFlightTime`, `meetAndGreet`, `extraStop`,
`extraStopDetails`, `pickupDateTime`, `hours`, `plannedStops`, `passengerGroup`,
`luggageCount`, `childSeats`, `notes`, `gratuity`.

This is therefore a **presentation** problem, not a data-capture one. No schema
change, no migration, no wizard change.

## Goal

Surface full, service-appropriate reservation details in three places, for all
three bookable services (airport transfer, point-to-point, hourly charter):

1. **Customer confirmation email** — curated trip details + name/email echo.
2. **Operator ("info@") confirmation email** — full details incl. gratuity method.
3. **Admin dashboard** — full details per reservation, on demand.

## Approach: one shared formatter, three thin consumers

The per-service field selection and labelling logic must live in exactly one
place. Today the wizard's `buildSubmissionPayload()`
([TransportationBookingWizard.tsx](../../../src/components/transportation/TransportationBookingWizard.tsx)
~line 1166) already encodes this shape for the legacy email-quote path; we move
that shape server-side and type it safely against the untyped jsonb.

### New module: `src/lib/booking/describeBooking.ts`

```
export interface DetailRow {
  label: string;
  value: string;          // already human-formatted; "Not provided" for empties
  internalOnly?: boolean; // hidden from the customer email
}

export interface DetailGroup {
  title?: string;         // e.g. "Leg 2 · Return"; omitted for a flat list
  rows: DetailRow[];
}

export function describeBooking(booking: Booking): DetailGroup[];
```

- Pure function. Reads `booking.payload` (untyped) + typed booking columns.
- Branches on `booking.serviceCode`.
- Safely coerces every payload field (payload is `unknown`); a missing/blank
  optional field renders `"Not provided"` rather than producing a blank row,
  matching the wizard's existing convention.
- Date/time values formatted in the tenant timezone (America/Los_Angeles) via
  the existing `formatPickup`-style helpers.

**Rows per service:**

- **Airport transfer:** Trip type (arrival / departure / round trip) · Airport
  (full display name) · Airline · Flight # · Flight time (arrival or departure
  per direction) · Return flight time (round trip only) · Pickup location ·
  Drop-off location (both resolved from `airportDirection`/`otherAddress`) ·
  Meet & greet · Passengers · Luggage · Child seats · Notes ·
  Gratuity method *(internalOnly)*.
- **Point-to-point:** Pickup · Drop-off · Pickup date/time · Extra stop ·
  Passengers · Luggage · Child seats · Notes · Gratuity method *(internalOnly)*.
- **Hourly charter:** Pickup · Pickup date/time · Hours · Planned stops ·
  Passengers · Luggage · Child seats · Notes · Gratuity method *(internalOnly)*.

### Consumer 1 — customer email

[templates/confirmation.ts](../../../src/lib/booking/email/templates/confirmation.ts):
render a details table from `describeBooking(booking)`, **excluding**
`internalOnly` rows. Keep the existing Confirmation / Service / Pickup / Total
summary at top. Echo the customer's **full name + email** in the details.
Add a smart pickup note:

- Airport **arrival** bookings: "We track your flight and will call to confirm
  your exact pickup time."
- All bookings: a general "Call us anytime to confirm details" line
  (using `tenant.supportPhone`).

### Consumer 2 — operator email

Same template's `internalBody`: render the full `describeBooking` table
**including** `internalOnly` rows (gratuity method shown). Keep the existing
name / email / phone header line.

### Consumer 3 — admin dashboard

[admin/bookings/page.tsx](../../../src/app/admin/bookings/page.tsx) is a server
component; expand/collapse needs client state. Extract each row into a new
client component **`src/components/booking/AdminBookingRow.tsx`** that renders
the existing summary cells and, when expanded, a details panel built from
`describeBooking(booking)` (all rows, including gratuity). The server page passes
the already-computed detail groups (or the booking) down as props so no data
fetching moves to the client.

## Out of scope (YAGNI)

- No DB/schema migration — data already persisted.
- No new admin route (expandable row, not a detail page).
- No changes to the booking wizard, pricing, or Stripe flow.
- No changes to the cancellation email.

## Testing

Unit tests for `describeBooking` — the risky part, since `payload` is untyped
jsonb:

- Airport one-way arrival, one-way departure, and round trip.
- Point-to-point with and without extra stop.
- Hourly charter.
- Sparse payload (optional fields blank) → "Not provided", no crashes.
- `internalOnly` rows present in full output; a helper/filter drops them for the
  customer view.
```
