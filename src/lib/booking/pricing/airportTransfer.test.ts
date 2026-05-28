import { describe, expect, it } from "vitest";
import { calculateAirportTransferPrice } from "./airportTransfer";

describe("calculateAirportTransferPrice — distance-based + $10 service fee", () => {
  it("LAX → Anaheim (Sedan) using the published baseline distance", () => {
    // baseline LAX ≈ 34 mi → 95 + (34-25)*2.5 = 117.5 → $118; +$10 fee = $128
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, false);
    expect(quote).not.toBeNull();
    expect(quote?.base).toBe(128);
  });

  it("SNA → Anaheim (Sedan) — short trip returns base + fee only", () => {
    // SNA 14 mi → 95 + 0 = 95; +$10 = $105
    const quote = calculateAirportTransferPrice("SNA", "sedan", false, false);
    expect(quote?.base).toBe(105);
  });

  it("LAX (35 mi, Sedan) → $130", () => {
    // 95 + (35-25)*2.5 = 120; +$10 = $130
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, false, 35);
    expect(quote?.base).toBe(130);
  });

  it("LAX round trip applies the 1.9 multiplier to the one-way leg", () => {
    // one-way 130 → rt = 130 * 1.9 = 247
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, true, 35);
    expect(quote?.total).toBe(247);
  });

  it("LAX Sedan + meet & greet adds $30 to addOns", () => {
    const quote = calculateAirportTransferPrice("LAX", "sedan", true, false, 35);
    expect(quote?.base).toBe(130);
    expect(quote?.addOns).toBe(30);
  });

  it("SAN → Anaheim (Sprinter) ~95 mi", () => {
    // 185 + (95-25)*5 = 535; +$10 = $545
    const quote = calculateAirportTransferPrice("SAN", "sprinter", false, false, 95);
    expect(quote?.base).toBe(545);
  });

  it("legacy passenger-group input still resolves vehicle", () => {
    const a = calculateAirportTransferPrice("LAX", "1-4", false, false);
    const b = calculateAirportTransferPrice("LAX", "sedan", false, false);
    expect(a?.base).toBe(b?.base);
  });

  it("returns null for unknown airports", () => {
    expect(calculateAirportTransferPrice("XYZ", "sedan", false, false)).toBeNull();
  });

  it("returns null for passenger groups outside the published vehicles", () => {
    expect(calculateAirportTransferPrice("LAX", "15+", false, false)).toBeNull();
  });
});
