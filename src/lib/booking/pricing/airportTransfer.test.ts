import { describe, expect, it } from "vitest";
import { calculateAirportTransferPrice } from "./airportTransfer";

describe("calculateAirportTransferPrice — distance-based + $10 service fee", () => {
  it("LAX → Anaheim (Sedan) using the published baseline distance", () => {
    // baseline LAX ≈ 34 mi → 85 + (34-14)*3 = 145; +$10 fee = $155
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, false);
    expect(quote).not.toBeNull();
    expect(quote?.base).toBe(155);
  });

  it("SNA → Anaheim (Sedan) — short trip returns base + fee only", () => {
    // SNA 14 mi → 85 + 0 = 85; +$10 = $95
    const quote = calculateAirportTransferPrice("SNA", "sedan", false, false);
    expect(quote?.base).toBe(95);
  });

  it("LAX (35 mi, Sedan) → $158", () => {
    // 85 + (35-14)*3 = 148; +$10 = $158
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, false, 35);
    expect(quote?.base).toBe(158);
  });

  it("LAX round trip applies the 1.9 multiplier to the one-way leg", () => {
    // one-way 158 → rt = 158 * 1.9 = 300.2 → $300
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, true, 35);
    expect(quote?.total).toBe(300);
  });

  it("LAX Sedan + meet & greet adds $30 to addOns", () => {
    const quote = calculateAirportTransferPrice("LAX", "sedan", true, false, 35);
    expect(quote?.base).toBe(158);
    expect(quote?.addOns).toBe(30);
  });

  it("SAN → Anaheim (Sprinter) ~95 mi", () => {
    // 185 + (95-14)*5 = 590; +$10 = $600
    const quote = calculateAirportTransferPrice("SAN", "sprinter", false, false, 95);
    expect(quote?.base).toBe(600);
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
