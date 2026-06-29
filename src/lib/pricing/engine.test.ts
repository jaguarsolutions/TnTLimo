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
  it("Sedan 26 mi round-trip = one-way × 2", () => {
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 26, tripType: "roundtrip" });
    // one-way exact: 85 + (26-14)*3.0 = 121; round-trip = 121 * 2 = $242
    expect(q.oneWayFareExact).toBeCloseTo(121, 2);
    expect(q.base).toBe(242);
    expect(ROUND_TRIP_MULTIPLIER).toBe(2.0);
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

  it("round-trip doubles the fixed price", () => {
    const q = computeFixedRouteQuote({
      vehicle: sedan(),
      fixedRoutePrice: 100,
      routeLabel: "Test",
      tripType: "roundtrip",
    });
    expect(q.base).toBe(200);
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
  it("adds $5 per leg to the airport base fare (SNA-equivalent, 14 mi)", () => {
    // Sedan 14 mi → $75 airportBaseFare + $5 fee = $80 (boundary trip, no extra mileage)
    const q = computeAirportQuote({ vehicle: sedan(), miles: 14, tripType: "oneway" });
    expect(q.base).toBe(80);
  });

  it("LAX → Anaheim Sedan ~35 mi → $154", () => {
    // 75 + (35-14)*3.50 = 148.50; +$5 = 153.50 → $154 (rounded)
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway" });
    expect(q.base).toBe(154);
  });

  it("round-trip doubles the per-leg total (engine + fee)", () => {
    // one-way exact leg: 153.50; rt = 153.50 * 2 = $307
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "roundtrip" });
    expect(q.base).toBe(307);
  });

  it("meet & greet adds $30 once, regardless of trip type", () => {
    // 153.50 + 30 = 183.50 → $184 (the round happens on the combined base)
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway", meetGreet: true });
    expect(q.base).toBe(184);
    expect(MEET_GREET_FEE).toBe(30);
  });

  it("AIRPORT_SERVICE_FEE constant", () => {
    expect(AIRPORT_SERVICE_FEE).toBe(5);
  });

  it("can skip the airport fee for back-compat callers", () => {
    // 75 + (35-14)*3.50 = 148.50  (no airport fee) → $149
    const q = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway", includeAirportFee: false });
    expect(q.base).toBe(149);
  });

  it("SAN → Anaheim Sprinter ~95 mi → $595", () => {
    // 185 + (95-14)*5 = 590; +$5 = $595 (sprinter airport rates match P2P)
    const q = computeAirportQuote({ vehicle: sprinter(), miles: 95, tripType: "oneway" });
    expect(q.base).toBe(595);
  });

  it("SUV LAX ~35 mi uses airport-specific rates ($85 + $4/mi)", () => {
    // 85 + (35-14)*4 = 169; +$5 = $174
    const q = computeAirportQuote({ vehicle: suv(), miles: 35, tripType: "oneway" });
    expect(q.base).toBe(174);
  });
});

describe("computeHourlyQuote — floors at the vehicle's hourlyMinHours", () => {
  it("Sedan 2 hr → 3 hr × $75 = $225", () => {
    const q = computeHourlyQuote({ vehicle: sedan(), hours: 2 });
    expect(q.base).toBe(225);
    expect(q.billedHours).toBe(3);
  });
  it("Sedan 4 hr → 4 × $75 = $300", () => {
    const q = computeHourlyQuote({ vehicle: sedan(), hours: 4 });
    expect(q.base).toBe(300);
  });
  it("SUV 3 hr (min) → 3 × $85 = $255", () => {
    const q = computeHourlyQuote({ vehicle: suv(), hours: 3 });
    expect(q.base).toBe(255);
  });
  it("Sprinter 6 hr → 6 × $125 = $750", () => {
    const q = computeHourlyQuote({ vehicle: sprinter(), hours: 6 });
    expect(q.base).toBe(750);
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

/* ── Bug-fix regression tests (round-trip leak, distance stability, rounding) ── */

describe("regression: P2P (computeQuote) one-way vs round-trip", () => {
  it("Sedan 20.4 mi one-way → $104  (no implicit doubling)", () => {
    // 85 + (20.4 - 14) * 3.0 = 85 + 19.2 = 104.20 → $104
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 20.4, tripType: "oneway" });
    expect(q.base).toBe(104);
  });
  it("Sedan 20.4 mi round-trip = exactly 2 × one-way", () => {
    // exact one-way: 104.20; round-trip: 208.40 → $208
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 20.4, tripType: "roundtrip" });
    expect(q.base).toBe(208);
    expect(q.oneWayFareExact).toBeCloseTo(104.2, 2);
  });
});

describe("regression: 14-mile threshold boundary (no mileage charge at or below 14)", () => {
  it.each([
    ["sedan", sedan, 85],
    ["suv", suv, 95],
    ["van", van, 120],
    ["sprinter", sprinter, 185],
  ] as const)("%s 14 mi (boundary) → base only ($%i)", (_label, v, expected) => {
    const q = computeQuote({ vehicle: v(), distanceMiles: 14, tripType: "oneway" });
    expect(q.base).toBe(expected);
  });
  it.each([
    ["sedan", sedan, 85],
    ["suv", suv, 95],
    ["van", van, 120],
    ["sprinter", sprinter, 185],
  ] as const)("%s 13.99 mi (just under) → base only ($%i)", (_label, v, expected) => {
    const q = computeQuote({ vehicle: v(), distanceMiles: 13.99, tripType: "oneway" });
    expect(q.base).toBe(expected);
  });
  it("Sedan 14.1 mi → mileage line kicks in", () => {
    // 85 + 0.1 * 3.0 = $85.30 → $85
    const q = computeQuote({ vehicle: sedan(), distanceMiles: 14.1, tripType: "oneway" });
    expect(q.base).toBe(85);
    expect(q.breakdown.some((r) => r.label.startsWith("Mileage"))).toBe(true);
  });
});

describe("regression: mileage rounding is deterministic for the displayed distance", () => {
  // Bug 3: 20.4 × $3.50 = 71.40 was displaying as $72 because the underlying
  // distance had higher precision than the "20.4" we showed. The wizard now
  // rounds the cached distance to 1 decimal at the source, so the engine
  // math run against THAT same rounded value must agree with what a customer
  // sees on the breakdown line.
  it.each([
    ["sedan",    sedan,    20.4, 104, "20.4 × 3.0 = 19.2; base 85 + 19.2 = 104.2 → 104"],
    ["suv",      suv,      20.4, 117, "20.4 - 14 = 6.4; 6.4 × 3.5 = 22.4; base 95 + 22.4 = 117.4 → 117"],
    ["van",      van,      20.4, 146, "6.4 × 4.0 = 25.6; base 120 + 25.6 = 145.6 → 146"],
    ["sprinter", sprinter, 20.4, 217, "6.4 × 5.0 = 32; base 185 + 32 = 217"],
  ] as const)("%s @ 20.4 mi P2P one-way → $%i (%s)", (_label, v, miles, expected) => {
    const q = computeQuote({ vehicle: v(), distanceMiles: miles, tripType: "oneway" });
    expect(q.base).toBe(expected);
  });

  it("airport SUV @ 20.4 mi (Bug 3 specific) — line matches total", () => {
    // 85 (airport SUV base) + 6.4 × 4.00 (airport perMile) + 5 fee = 115.6 → $116
    const q = computeAirportQuote({ vehicle: suv(), miles: 20.4, tripType: "oneway" });
    expect(q.base).toBe(116);
  });
});

describe("regression: hourly is unaffected by round-trip flag", () => {
  // Bug 1 corollary — service-switching should reset roundTrip on the
  // wizard side, but the engine's hourly path doesn't read tripType at all.
  // Lock that behavior in.
  it("Sedan 4 hr → 4 × $75 = $300 (no doubling)", () => {
    const q = computeHourlyQuote({ vehicle: sedan(), hours: 4 });
    expect(q.base).toBe(300);
  });
});

describe("regression: round-trip applies the multiplier consistently per service", () => {
  it("P2P sedan 35 mi: round-trip is 2 × the EXACT one-way (not the rounded display)", () => {
    // exact one-way: 85 + 21 × 3.0 = 148  (already integer)
    const ow = computeQuote({ vehicle: sedan(), distanceMiles: 35, tripType: "oneway" });
    const rt = computeQuote({ vehicle: sedan(), distanceMiles: 35, tripType: "roundtrip" });
    expect(ow.base).toBe(148);
    expect(rt.base).toBe(296); // = 148 × 2 exactly
    expect(rt.oneWayFareExact).toBeCloseTo(ow.oneWayFareExact, 2);
  });
  it("Airport sedan 35 mi: round-trip is 2 × the EXACT one-way (allow ±1 from display rounding)", () => {
    // exact one-way leg: 75 + 21 × 3.5 + 5 = 153.5; rounded display = $154.
    // round-trip is 153.5 × 2 = 307, which is the rounded display value $308 − 1
    // because the engine rounds AFTER multiplying. Locked-in expected values.
    const ow = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "oneway" });
    const rt = computeAirportQuote({ vehicle: sedan(), miles: 35, tripType: "roundtrip" });
    expect(ow.base).toBe(154);
    expect(rt.base).toBe(307);
    // Display rounding may differ by up to 1, but never doubles the displayed value.
    expect(Math.abs(rt.base - ow.base * 2)).toBeLessThanOrEqual(1);
  });
});
