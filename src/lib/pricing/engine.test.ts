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
  it("Sedan 7 mi → $85 base (no mileage)", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 7, tripType: "oneway" });
    expect(q.base).toBe(85);
  });
  it("Sedan 14 mi (boundary) → $85 base", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 14, tripType: "oneway" });
    expect(q.base).toBe(85);
  });
  it("Sprinter 14 mi (boundary) → $185 base", () => {
    const q = computeQuote({ vehicle: sprinter(), distanceMiles: 14, tripType: "oneway" });
    expect(q.base).toBe(185);
  });
  it("breakdown for short trip shows base line only (no mileage)", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 7, tripType: "oneway" });
    expect(q.breakdown).toHaveLength(1);
    expect(q.breakdown[0].amount).toBe(85);
  });
});

describe("computeQuote — long-haul matches the published target prices", () => {
  it("Sedan 120 mi → $403", () => {
    // 85 + (120-14)*3.0 = 85 + 318 = 403
    expect(computeQuote({ vehicle: sedan(), distanceMiles: 120, tripType: "oneway" }).base).toBe(403);
  });
  it("SUV 120 mi → $466", () => {
    // 95 + (120-14)*3.5 = 95 + 371 = 466
    expect(computeQuote({ vehicle: suv(), distanceMiles: 120, tripType: "oneway" }).base).toBe(466);
  });
  it("Van 120 mi → $544", () => {
    // 120 + (120-14)*4.0 = 120 + 424 = 544
    expect(computeQuote({ vehicle: van(), distanceMiles: 120, tripType: "oneway" }).base).toBe(544);
  });
  it("Sprinter 120 mi → $715", () => {
    // 185 + (120-14)*5.0 = 185 + 530 = 715
    expect(computeQuote({ vehicle: sprinter(), distanceMiles: 120, tripType: "oneway" }).base).toBe(715);
  });
  it("Sedan 35 mi → $148", () => {
    // 85 + (35-14)*3.0 = 85 + 63 = 148  (LAX-equivalent P2P without airport fee)
    expect(computeQuote({ vehicle: sedan(), distanceMiles: 35, tripType: "oneway" }).base).toBe(148);
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
    // one-way exact: 85 + (26-14)*3.0 = 121; round = 121 * 1.9 = 229.9 → $230
    expect(q.oneWayFareExact).toBeCloseTo(121, 2);
    expect(q.base).toBe(230);
    expect(ROUND_TRIP_MULTIPLIER).toBe(1.9);
  });
});

describe("computeQuote — extra-stop adds $20 before gratuity", () => {
  // 26 mi sedan one-way = 85 + (26-14)*3 = $121; with stop = $141.
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
  it("adds $10 per leg to the base distance fare (SNA-equivalent, 14 mi)", () => {
    // Sedan 14 mi → $85 base + $10 fee = $95 (boundary trip, no extra mileage)
    const q = computeAirportQuote({ vehicle: sedan(), miles: 14, tripType: "oneway" });
    expect(q.base).toBe(95);
  });

  it("LAX → Anaheim Sedan ~35 mi → $158", () => {
    // 85 + (35-14)*3 = 148; +$10 = $158
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway" });
    expect(q.base).toBe(158);
  });

  it("round-trip multiplies the per-leg total (engine + fee)", () => {
    // one-way leg: 158; rt = 158 * 1.9 = 300.2 → $300
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "roundtrip" });
    expect(q.base).toBe(300);
  });

  it("meet & greet adds $30 once, regardless of trip type", () => {
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway", meetGreet: true });
    expect(q.base).toBe(188);
    expect(MEET_GREET_FEE).toBe(30);
  });

  it("AIRPORT_SERVICE_FEE constant", () => {
    expect(AIRPORT_SERVICE_FEE).toBe(10);
  });

  it("can skip the airport fee for back-compat callers", () => {
    // 85 + (35-14)*3 = 148  (no airport fee)
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway", includeAirportFee: false });
    expect(q.base).toBe(148);
  });

  it("SAN → Anaheim Sprinter ~95 mi → $600", () => {
    // 185 + (95-14)*5 = 590; +$10 = $600
    const q = computeAirportQuote({ vehicle: sprinter(), miles: 95, tripType: "oneway" });
    expect(q.base).toBe(600);
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
  it("is 14", () => {
    expect(INCLUDED_MILES).toBe(14);
  });
});
