import { describe, expect, it } from "vitest";
import {
  VEHICLES,
  getVehicle,
  vehiclesForPassengerCount,
  computeQuote,
  computeFixedRouteQuote,
  computeAirportQuote,
  computeHourlyQuote,
  isWithinServiceRadius,
  ROUND_TRIP_MULTIPLIER,
  EXTRA_STOP_FEE,
  AIRPORT_SERVICE_FEE,
  MEET_GREET_FEE,
  INCLUDED_MILES,
  SERVICE_RADIUS_MILES,
} from "./engine";

function sedan() {
  const v = getVehicle("sedan");
  if (!v) throw new Error("sedan not configured");
  return v;
}
function suv() {
  const v = getVehicle("suv");
  if (!v) throw new Error("suv not configured");
  return v;
}
function van() {
  const v = getVehicle("van");
  if (!v) throw new Error("van not configured");
  return v;
}
function sprinter() {
  const v = getVehicle("sprinter");
  if (!v) throw new Error("sprinter not configured");
  return v;
}

describe("vehicle catalog", () => {
  it("loads all four vehicle classes", () => {
    expect(VEHICLES).toHaveLength(4);
    expect(getVehicle("sedan")).toBeTruthy();
    expect(getVehicle("suv")).toBeTruthy();
    expect(getVehicle("van")).toBeTruthy();
    expect(getVehicle("sprinter")).toBeTruthy();
  });

  it("returns null for an unknown id", () => {
    expect(getVehicle("limo-stretch-9000")).toBeNull();
  });

  it("each vehicle has an hourly rate + minimum-hours config", () => {
    for (const v of VEHICLES) {
      expect(v.hourlyRate).toBeGreaterThan(0);
      expect(v.hourlyMinHours).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("vehiclesForPassengerCount", () => {
  it("includes Sedan for 1–4 passengers", () => {
    const ids = vehiclesForPassengerCount(2).map((v) => v.id);
    expect(ids).toContain("sedan");
    expect(ids).toContain("suv");
  });

  it("hides Sedan when 5 passengers requested", () => {
    const ids = vehiclesForPassengerCount(5).map((v) => v.id);
    expect(ids).not.toContain("sedan");
    expect(ids).toContain("suv");
  });

  it("hides everything when more than the largest vehicle's capacity", () => {
    const ids = vehiclesForPassengerCount(20).map((v) => v.id);
    expect(ids).toEqual([]);
  });
});

describe("computeQuote — P2P short trips return base only", () => {
  it("Sedan 7 mi → $95 base (no mileage)", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 7, tripType: "oneway" });
    expect(q.base).toBe(95);
  });
  it("Sedan 25 mi (boundary) → $95 base", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 25, tripType: "oneway" });
    expect(q.base).toBe(95);
  });
  it("Sprinter 14 mi → $185 base", () => {
    const q = computeQuote({ vehicle: sprinter(), distanceMiles: 14, tripType: "oneway" });
    expect(q.base).toBe(185);
  });
  it("breakdown for short trip shows base line only (no mileage)", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 7, tripType: "oneway" });
    expect(q.breakdown).toHaveLength(1);
    expect(q.breakdown[0].amount).toBe(95);
  });
});

describe("computeQuote — long-haul matches the published target prices", () => {
  it("Sedan 120 mi → $333", () => {
    expect(computeQuote({ vehicle: sedan(), distanceMiles: 120, tripType: "oneway" }).base).toBe(333);
  });
  it("SUV 120 mi → $395", () => {
    expect(computeQuote({ vehicle: suv(), distanceMiles: 120, tripType: "oneway" }).base).toBe(395);
  });
  it("Van 120 mi → $525", () => {
    expect(computeQuote({ vehicle: van(), distanceMiles: 120, tripType: "oneway" }).base).toBe(525);
  });
  it("Sprinter 120 mi → $660", () => {
    expect(computeQuote({ vehicle: sprinter(), distanceMiles: 120, tripType: "oneway" }).base).toBe(660);
  });
  it("breakdown shows Base + Mileage when extra miles apply", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 120, tripType: "oneway" });
    expect(q.breakdown.some((row) => row.label.startsWith("Base"))).toBe(true);
    expect(q.breakdown.some((row) => row.label.startsWith("Mileage"))).toBe(true);
  });
});

describe("computeQuote — round trip multiplier", () => {
  it("Sedan 26 mi round-trip = one-way × 1.9", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 26, tripType: "roundtrip" });
    // one-way exact: 95 + (26-25)*2.5 = 97.5; round = 97.5 * 1.9 = 185.25 → $185
    expect(q.oneWayFareExact).toBeCloseTo(97.5, 2);
    expect(q.base).toBe(185);
    expect(ROUND_TRIP_MULTIPLIER).toBe(1.9);
  });
});

describe("computeQuote — extra-stop adds $20 before gratuity", () => {
  const without = computeQuote({ vehicle: sedan(), distanceMiles: 26, tripType: "oneway", extraStop: false });
  const withStop = computeQuote({ vehicle: sedan(), distanceMiles: 26, tripType: "oneway", extraStop: true });

  it("base increases by exactly $20", () => {
    expect(withStop.base - without.base).toBe(EXTRA_STOP_FEE);
  });
  it("gratuity is recomputed on the new base", () => {
    expect(withStop.gratuity - without.gratuity).toBe(4);
  });
  it("breakdown includes 'Extra stop' line", () => {
    expect(withStop.breakdown.find((r) => r.label === "Extra stop")?.amount).toBe(20);
  });
});

describe("computeQuote — guards", () => {
  it("throws on negative distance", () => {
    expect(() => computeQuote({ vehicle: sedan(), distanceMiles: -1, tripType: "oneway" })).toThrow();
  });
  it("throws on non-finite distance", () => {
    expect(() => computeQuote({ vehicle: sedan(), distanceMiles: Number.NaN, tripType: "oneway" })).toThrow();
  });
});

describe("computeFixedRouteQuote", () => {
  it("Anaheim → LAX (published $225) one-way", () => {
    const q = computeFixedRouteQuote({
      vehicle: sedan(),
      fixedRoutePrice: 225,
      routeLabel: "Anaheim → LAX",
      tripType: "oneway",
    });
    expect(q.base).toBe(225);
    expect(q.gratuity).toBe(45);
    expect(q.total).toBe(270);
  });

  it("doesn't call the engine — fixed price stays fixed even for short distances", () => {
    const q = computeFixedRouteQuote({
      vehicle: sedan(),
      fixedRoutePrice: 95,
      routeLabel: "Anaheim → SNA",
      tripType: "oneway",
    });
    expect(q.base).toBe(95);
  });

  it("round-trip applies 1.9× to the fixed price", () => {
    const q = computeFixedRouteQuote({
      vehicle: sedan(),
      fixedRoutePrice: 100,
      routeLabel: "Test",
      tripType: "roundtrip",
    });
    expect(q.base).toBe(190);
  });

  it("extra stop adds $20", () => {
    const q = computeFixedRouteQuote({
      vehicle: sedan(),
      fixedRoutePrice: 100,
      routeLabel: "Test",
      tripType: "oneway",
      extraStop: true,
    });
    expect(q.base).toBe(120);
  });
});

describe("computeAirportQuote", () => {
  it("adds $10 per leg to the base distance fare", () => {
    // Sedan 14 mi → $95 base + $10 fee = $105
    const q = computeAirportQuote({ vehicle: sedan(), miles: 14, tripType: "oneway" });
    expect(q.base).toBe(105);
  });

  it("LAX → Anaheim Sedan ~35 mi → $130", () => {
    // 95 + (35-25)*2.5 = 120; +$10 = $130
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway" });
    expect(q.base).toBe(130);
  });

  it("round-trip multiplies the per-leg total (engine + fee)", () => {
    // one-way leg: 130; rt = 130 * 1.9 = $247
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "roundtrip" });
    expect(q.base).toBe(247);
  });

  it("meet & greet adds $30 once, regardless of trip type", () => {
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway", meetGreet: true });
    expect(q.base).toBe(160);
    expect(MEET_GREET_FEE).toBe(30);
  });

  it("AIRPORT_SERVICE_FEE constant", () => {
    expect(AIRPORT_SERVICE_FEE).toBe(10);
  });

  it("can skip the airport fee for back-compat callers", () => {
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway", includeAirportFee: false });
    expect(q.base).toBe(120);
  });
});

describe("computeHourlyQuote — floors at the vehicle's hourlyMinHours", () => {
  it("Sedan 2 hr → 3 hr × $100 = $300", () => {
    const q = computeHourlyQuote({ vehicle: sedan(), hours: 2 });
    expect(q.base).toBe(300);
    expect(q.billedHours).toBe(3);
  });
  it("Sedan 4 hr → 4 × $100 = $400", () => {
    const q = computeHourlyQuote({ vehicle: sedan(), hours: 4 });
    expect(q.base).toBe(400);
  });
  it("SUV 3 hr (min) → 3 × $120 = $360", () => {
    const q = computeHourlyQuote({ vehicle: suv(), hours: 3 });
    expect(q.base).toBe(360);
  });
  it("Sprinter 6 hr → 6 × $185 = $1110", () => {
    const q = computeHourlyQuote({ vehicle: sprinter(), hours: 6 });
    expect(q.base).toBe(1110);
  });
  it("Van honours its 4-hr minimum", () => {
    const q = computeHourlyQuote({ vehicle: van(), hours: 2 });
    expect(q.billedHours).toBe(4);
  });
});

describe("isWithinServiceRadius", () => {
  it(`accepts 0 … ${SERVICE_RADIUS_MILES} mi`, () => {
    expect(isWithinServiceRadius(0)).toBe(true);
    expect(isWithinServiceRadius(SERVICE_RADIUS_MILES)).toBe(true);
  });
  it("rejects mileage past the radius", () => {
    expect(isWithinServiceRadius(SERVICE_RADIUS_MILES + 0.1)).toBe(false);
  });
  it("rejects negative or NaN", () => {
    expect(isWithinServiceRadius(-1)).toBe(false);
    expect(isWithinServiceRadius(Number.NaN)).toBe(false);
  });
});

describe("INCLUDED_MILES constant", () => {
  it("is 25", () => {
    expect(INCLUDED_MILES).toBe(25);
  });
});
