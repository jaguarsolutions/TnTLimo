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

function towncar() {
  const v = getVehicle("towncar");
  if (!v) throw new Error("towncar not configured");
  return v;
}
function suv() {
  const v = getVehicle("suv");
  if (!v) throw new Error("suv not configured");
  return v;
}

describe("vehicle catalog", () => {
  it("loads at least Town Car and SUV", () => {
    expect(VEHICLES.length).toBeGreaterThanOrEqual(2);
    expect(getVehicle("towncar")).toBeTruthy();
    expect(getVehicle("suv")).toBeTruthy();
  });

  it("returns null for an unknown id", () => {
    expect(getVehicle("limo-stretch-9000")).toBeNull();
  });
});

describe("vehiclesForPassengerCount", () => {
  it("includes Town Car for 1–3 passengers", () => {
    const ids = vehiclesForPassengerCount(2).map((v) => v.id);
    expect(ids).toContain("towncar");
    expect(ids).toContain("suv");
  });

  it("hides Town Car when 5 passengers requested (spec verification step #6)", () => {
    const ids = vehiclesForPassengerCount(5).map((v) => v.id);
    expect(ids).not.toContain("towncar");
    expect(ids).toContain("suv");
  });

  it("hides everything when more than the largest vehicle's capacity", () => {
    const ids = vehiclesForPassengerCount(20).map((v) => v.id);
    expect(ids).toEqual([]);
  });
});

describe("computeQuote — verification step #1: Town Car 26 mi one-way", () => {
  const q = computeQuote({
    vehicle: towncar(),
    distanceMiles: 26,
    tripType: "oneway",
  });

  it("base = $131 (rounded from $50 + $3.10×26 = $130.60)", () => {
    expect(q.base).toBe(131);
  });
  it("gratuity = $26 (20% of $130.60 ≈ $26.12 → rounds to $26)", () => {
    expect(q.gratuity).toBe(26);
  });
  it("total = base + gratuity = $157", () => {
    expect(q.total).toBe(157);
  });
});

describe("computeQuote — verification step #2: SUV 26 mi one-way", () => {
  const q = computeQuote({
    vehicle: suv(),
    distanceMiles: 26,
    tripType: "oneway",
  });

  it("base = $160 (rounded from $60 + $3.85×26 = $160.10)", () => {
    expect(q.base).toBe(160);
  });
  it("gratuity = $32 (20% of $160.10 ≈ $32.02)", () => {
    expect(q.gratuity).toBe(32);
  });
  it("total = $192", () => {
    expect(q.total).toBe(192);
  });
});

describe("computeQuote — verification step #3: minimum fare clamp", () => {
  it("Town Car 4 mi → $80 minimum (not $50 + $12.40 = $62.40)", () => {
    const q = computeQuote({
      vehicle: towncar(),
      distanceMiles: 4,
      tripType: "oneway",
    });
    expect(q.base).toBe(80);
  });

  it("breakdown shows 'Minimum fare' line when clamp engages", () => {
    const q = computeQuote({
      vehicle: towncar(),
      distanceMiles: 4,
      tripType: "oneway",
    });
    expect(q.breakdown.some((row) => row.label.toLowerCase().includes("minimum"))).toBe(true);
  });

  it("breakdown shows Base + Mileage when clamp does NOT engage", () => {
    const q = computeQuote({
      vehicle: towncar(),
      distanceMiles: 26,
      tripType: "oneway",
    });
    expect(q.breakdown.some((row) => row.label === "Base fare")).toBe(true);
    expect(q.breakdown.some((row) => row.label.startsWith("Mileage"))).toBe(true);
  });
});

describe("computeQuote — verification step #4: round-trip multiplier", () => {
  it("Town Car 26 mi round-trip = one-way × 1.9 = $248.14 → $248 base", () => {
    const q = computeQuote({
      vehicle: towncar(),
      distanceMiles: 26,
      tripType: "roundtrip",
    });
    // one-way exact = $130.60; round = $130.60 * 1.9 = $248.14
    expect(q.oneWayFareExact).toBeCloseTo(130.6, 2);
    expect(q.base).toBe(248);
    expect(ROUND_TRIP_MULTIPLIER).toBe(1.9);
  });
});

describe("computeQuote — verification step #5: extra-stop adds $20 before gratuity", () => {
  const without = computeQuote({
    vehicle: towncar(),
    distanceMiles: 26,
    tripType: "oneway",
    extraStop: false,
  });
  const withStop = computeQuote({
    vehicle: towncar(),
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
    expect(() => computeQuote({ vehicle: towncar(), distanceMiles: -1, tripType: "oneway" })).toThrow();
  });
  it("throws on non-finite distance", () => {
    expect(() => computeQuote({ vehicle: towncar(), distanceMiles: Number.NaN, tripType: "oneway" })).toThrow();
  });
});

describe("computeFixedRouteQuote", () => {
  it("Anaheim → LAX (published $225) one-way = base $225, gratuity $45, total $270", () => {
    const q = computeFixedRouteQuote({
      vehicle: towncar(),
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
      vehicle: towncar(),
      fixedRoutePrice: 95,
      routeLabel: "Anaheim → SNA",
      tripType: "oneway",
    });
    expect(q.base).toBe(95); // not clamped to $80 minimum
  });

  it("round-trip applies 1.9× to the fixed price", () => {
    const q = computeFixedRouteQuote({
      vehicle: towncar(),
      fixedRoutePrice: 100,
      routeLabel: "Test",
      tripType: "roundtrip",
    });
    expect(q.base).toBe(190);
  });

  it("extra stop adds $20", () => {
    const q = computeFixedRouteQuote({
      vehicle: towncar(),
      fixedRoutePrice: 100,
      routeLabel: "Test",
      tripType: "oneway",
      extraStop: true,
    });
    expect(q.base).toBe(120);
  });
});
