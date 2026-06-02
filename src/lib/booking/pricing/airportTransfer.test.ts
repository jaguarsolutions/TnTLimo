import { describe, expect, it } from "vitest";
import { calculateAirportTransferPrice } from "./airportTransfer";

describe("calculateAirportTransferPrice — distance-based + $5 service fee", () => {
  it("LAX → Anaheim (Sedan) using the published baseline distance", () => {
    // baseline LAX ≈ 34 mi → 75 + (34-14)*3.50 = 145; +$5 fee = $150
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, false);
    expect(quote).not.toBeNull();
    expect(quote?.base).toBe(150);
  });

  it("SNA → Anaheim (Sedan) — short trip returns base + fee only", () => {
    // SNA 14 mi → 75 + 0 = 75; +$5 = $80
    const quote = calculateAirportTransferPrice("SNA", "sedan", false, false);
    expect(quote?.base).toBe(80);
  });

  it("LAX (35 mi, Sedan) → $154", () => {
    // 75 + (35-14)*3.50 = 148.50; +$5 = 153.50 → $154
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, false, 35);
    expect(quote?.base).toBe(154);
  });

  it("LAX round trip is exactly 2 × the one-way leg", () => {
    // one-way (rounded) 154 → rt = 154 * 2 = $308
    const quote = calculateAirportTransferPrice("LAX", "sedan", false, true, 35);
    expect(quote?.total).toBe(308);
  });

  it("LAX Sedan + meet & greet adds $30 to addOns", () => {
    const quote = calculateAirportTransferPrice("LAX", "sedan", true, false, 35);
    expect(quote?.base).toBe(154);
    expect(quote?.addOns).toBe(30);
  });

  it("SAN → Anaheim (Sprinter) ~95 mi", () => {
    // 185 + (95-14)*5 = 590; +$5 = $595 (sprinter unchanged)
    const quote = calculateAirportTransferPrice("SAN", "sprinter", false, false, 95);
    expect(quote?.base).toBe(595);
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
