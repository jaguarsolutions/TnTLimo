import { describe, expect, it } from "vitest";
import { describeBooking, customerDetailRows, type BookingDetailRow } from "./describeBooking";
import type { Booking } from "./schema";

/** Build a Booking stub with just the fields describeBooking reads. */
function makeBooking(serviceCode: string, payload: Record<string, unknown>): Booking {
  return { serviceCode, payload } as unknown as Booking;
}

/** Look up a row's value by label (undefined if the row is absent). */
function value(rows: BookingDetailRow[], label: string): string | undefined {
  return rows.find((r) => r.label === label)?.value;
}

describe("describeBooking — airport transfer", () => {
  const arrivalPayload = {
    service: "airport-transfer",
    airportDirection: "from-airport",
    airport: "LAX",
    otherAddress: "Hilton Anaheim, 777 W Convention Way",
    roundTrip: false,
    airline: "Delta",
    flightNumber: "DL 123",
    flightTime: "2026-07-31T14:54",
    meetAndGreet: true,
    passengerGroup: "1-4",
    luggageCount: 3,
    childSeats: ["infant", "booster"],
    gratuity: "20",
    notes: "Please wait at baggage claim.",
  };

  it("one-way arrival: airport is the pickup, address is the drop-off", () => {
    const rows = describeBooking(makeBooking("airport-transfer", arrivalPayload));
    expect(value(rows, "Trip type")).toBe("Airport pickup (arrival)");
    expect(value(rows, "Airport")).toBe("Los Angeles International Airport (LAX)");
    expect(value(rows, "Pickup")).toBe("Los Angeles International Airport (LAX)");
    expect(value(rows, "Drop-off")).toBe("Hilton Anaheim, 777 W Convention Way");
    expect(value(rows, "Airline")).toBe("Delta");
    expect(value(rows, "Flight #")).toBe("DL 123");
    expect(value(rows, "Flight arrival time")).toBe("Fri, Jul 31, 2026, 2:54 PM");
    expect(value(rows, "Meet & greet")).toBe("Yes");
    expect(value(rows, "Passengers")).toBe("1-4 passengers");
    expect(value(rows, "Luggage")).toBe("3");
    expect(value(rows, "Child seats")).toBe("Infant seat, Booster");
    expect(value(rows, "Notes")).toBe("Please wait at baggage claim.");
  });

  it("one-way departure: address is the pickup, airport is the drop-off", () => {
    const rows = describeBooking(
      makeBooking("airport-transfer", {
        ...arrivalPayload,
        airportDirection: "to-airport",
      })
    );
    expect(value(rows, "Trip type")).toBe("Airport drop-off (departure)");
    expect(value(rows, "Pickup")).toBe("Hilton Anaheim, 777 W Convention Way");
    expect(value(rows, "Drop-off")).toBe("Los Angeles International Airport (LAX)");
    expect(value(rows, "Flight departure time")).toBe("Fri, Jul 31, 2026, 2:54 PM");
    // Meet & greet does not apply to a departure drop-off.
    expect(value(rows, "Meet & greet")).toBeUndefined();
  });

  it("round trip: shows hotel/address, both flight times, and meet & greet", () => {
    const rows = describeBooking(
      makeBooking("airport-transfer", {
        ...arrivalPayload,
        roundTrip: true,
        returnFlightTime: "2026-08-05T09:15",
      })
    );
    expect(value(rows, "Trip type")).toBe("Round trip (airport pickup + drop-off)");
    expect(value(rows, "Hotel / address")).toBe("Hilton Anaheim, 777 W Convention Way");
    expect(value(rows, "Arrival flight time")).toBe("Fri, Jul 31, 2026, 2:54 PM");
    expect(value(rows, "Return flight departure")).toBe("Wed, Aug 5, 2026, 9:15 AM");
    expect(value(rows, "Meet & greet")).toBe("Yes");
  });
});

describe("describeBooking — point-to-point", () => {
  it("renders pickup, drop-off, time and extra-stop detail", () => {
    const rows = describeBooking(
      makeBooking("point-to-point", {
        pickupAddress: "Disneyland Hotel",
        dropoffAddress: "LA Convention Center",
        pickupDateTime: "2026-09-01T08:00",
        extraStop: true,
        extraStopDetails: "Quick stop at Target",
        passengerGroup: "5-6",
        luggageCount: 2,
        childSeats: [],
        gratuity: "cash",
      })
    );
    expect(value(rows, "Pickup")).toBe("Disneyland Hotel");
    expect(value(rows, "Drop-off")).toBe("LA Convention Center");
    expect(value(rows, "Pickup date/time")).toBe("Tue, Sep 1, 2026, 8:00 AM");
    expect(value(rows, "Extra stop")).toBe("Quick stop at Target");
    expect(value(rows, "Passengers")).toBe("5-6 passengers");
    expect(value(rows, "Child seats")).toBe("None");
    expect(value(rows, "Gratuity")).toBe("Cash at pickup");
  });
});

describe("describeBooking — hourly charter", () => {
  it("renders pickup, hours, and planned stops", () => {
    const rows = describeBooking(
      makeBooking("hourly-charter", {
        pickupAddress: "Anaheim Marriott",
        pickupDateTime: "2026-10-10T18:30",
        hours: 1,
        plannedStops: "Dinner then Hollywood Bowl",
        passengerGroup: "7-10",
        luggageCount: 0,
        childSeats: [],
        gratuity: "25",
      })
    );
    expect(value(rows, "Pickup")).toBe("Anaheim Marriott");
    expect(value(rows, "Pickup date/time")).toBe("Sat, Oct 10, 2026, 6:30 PM");
    expect(value(rows, "Hours booked")).toBe("1 hour");
    expect(value(rows, "Planned stops / notes")).toBe("Dinner then Hollywood Bowl");
    expect(value(rows, "Passengers")).toBe("7-10 passengers");
  });
});

describe("describeBooking — sparse / missing data", () => {
  it("renders 'Not provided' for blank optional fields and never throws", () => {
    const rows = describeBooking(makeBooking("airport-transfer", {}));
    expect(value(rows, "Airport")).toBe("Not provided");
    expect(value(rows, "Airline")).toBe("Not provided");
    expect(value(rows, "Flight #")).toBe("Not provided");
    expect(value(rows, "Passengers")).toBe("Not provided");
    expect(value(rows, "Luggage")).toBe("Not provided");
    expect(value(rows, "Child seats")).toBe("None");
    // No notes row when notes are absent.
    expect(value(rows, "Notes")).toBeUndefined();
  });

  it("tolerates a null payload", () => {
    const booking = { serviceCode: "point-to-point", payload: null } as unknown as Booking;
    expect(() => describeBooking(booking)).not.toThrow();
  });
});

describe("customerDetailRows", () => {
  it("drops internalOnly rows (gratuity) from the customer view", () => {
    const booking = makeBooking("point-to-point", {
      pickupAddress: "A",
      dropoffAddress: "B",
      gratuity: "20",
    });
    const all = describeBooking(booking);
    const customer = customerDetailRows(booking);
    expect(all.some((r) => r.label === "Gratuity")).toBe(true);
    expect(customer.some((r) => r.label === "Gratuity")).toBe(false);
  });
});
