import { describe, expect, it } from "vitest";
import {
  VEHICLES,
  getVehicle,
  vehiclesForPassengerCount,
  computeQuote,
  computeFixedRouteQuote,
  ROUND_TRIP_MULTIPLIER,
  EXTRA_STOP_FEE,
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

describe("vehicle catalog", () => {
  it("loads at least Sedan and SUV", () => {
    expect(VEHICLES.length).toBeGreaterThanOrEqual(2);
    expect(getVehicle("sedan")).toBeTruthy();
    expect(getVehicle("suv")).toBeTruthy();
  });

  it("returns null for an unknown id", () => {
    expect(getVehicle("limo-stretch-9000")).toBeNull();
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

describe("computeQuote — verification step #1: Sedan 26 mi one-way", () => {
  const q = computeQuote({
    vehicle: sedan(),
    distanceMiles: 26,
    tripType: "oneway",
  });

  it("base = $180 (rounded from $50 + $5.00×26 = $180)", () => {
    expect(q.base).toBe(180);
  });
  it("gratuity = $36 (20% of $180 = $36)", () => {
    expect(q.gratuity).toBe(36);
  });
  it("total = base + gratuity = $216", () => {
    expect(q.total).toBe(216);
  });
});

describe("computeQuote — verification step #2: SUV 26 mi one-way", () => {
  const q = computeQuote({
    vehicle: suv(),
    distanceMiles: 26,
    tripType: "oneway",
  });

  it("base = $211 (rounded from $55 + $6.00×26 = $211)", () => {
    expect(q.base).toBe(211);
  });
  it("gratuity = $42 (20% of $211 = $42.2 → rounds to $42)", () => {
    expect(q.gratuity).toBe(42);
  });
  it("total = $253", () => {
    expect(q.total).toBe(253);
  });
});

describe("computeQuote — verification step #3: minimum fare clamp", () => {
  it("Sedan 4 mi → $95 minimum (not $50 + $20 = $70)", () => {
    const q = computeQuote({
      vehicle: sedan(),
      distanceMiles: 4,
      tripType: "oneway",
    });
    expect(q.base).toBe(95);
  });

  it("breakdown shows 'Minimum fare' line when clamp engages", () => {
    const q = computeQuote({
      vehicle: sedan(),
      distanceMiles: 4,
      tripType: "oneway",
    });
    expect(q.breakdown.some((row) => row.label.toLowerCase().includes("minimum"))).toBe(true);
  });

  it("breakdown shows Base + Mileage when clamp does NOT engage", () => {
    const q = computeQuote({
      vehicle: sedan(),
      distanceMiles: 26,
      tripType: "oneway",
    });
    expect(q.breakdown.some((row) => row.label === "Base fare")).toBe(true);
    expect(q.breakdown.some((row) => row.label.startsWith("Mileage"))).toBe(true);
  });
});

describe("computeQuote — verification step #4: round-trip multiplier", () => {
  it("Sedan 26 mi round-trip = one-way × 1.9 = $342 base", () => {
    const q = computeQuote({
      vehicle: sedan(),
      distanceMiles: 26,
      tripType: "roundtrip",
    });
    // one-way exact = $180; round = $180 * 1.9 = $342
    expect(q.oneWayFareExact).toBeCloseTo(180, 2);
    expect(q.base).toBe(342);
    expect(ROUND_TRIP_MULTIPLIER).toBe(1.9);
  });
});

describe("computeQuote — verification step #5: extra-stop adds $20 before gratuity", () => {
  const without = computeQuote({
    vehicle: sedan(),
    distanceMiles: 26,
    tripType: "oneway",
    extraStop: false,
  });
  const withStop = computeQuote({
    vehicle: sedan(),
    distanceMiles: 26,
    tripType: "oneway",
    extraStop: true,
  });

  it("base increases by exactly $20", () => {
    expect(withStop.base - without.base).toBe(EXTRA_STOP_FEE);
  });

  it("gratuity is recomputed on the new base (and is slightly higher)", () => {
    expect(withStop.gratuity).toBeGreaterThan(without.gratuity);
    // 20% of $20 = $4
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
  it("Anaheim → LAX (published $225) one-way = base $225, gratuity $45, total $270", () => {
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
    expect(q.base).toBe(95); // not clamped to $80 minimum
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
