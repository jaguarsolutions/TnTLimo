import { describe, expect, it } from "vitest";
import { calculateAirportTransferPrice } from "./airportTransfer";

describe("calculateAirportTransferPrice", () => {
  it("returns the published baseline when no actual distance is supplied", () => {
    const quote = calculateAirportTransferPrice("LAX", "1-4", false, false);
    expect(quote).not.toBeNull();
    expect(quote?.base).toBe(175);
  });

  it("adds mileage above the published route baseline", () => {
    const quote = calculateAirportTransferPrice("LAX", "1-4", false, false, 36);
    expect(quote).not.toBeNull();
    expect(quote?.base).toBe(185);
  });

  it("returns null for passenger groups outside the published airport pricing table", () => {
    expect(calculateAirportTransferPrice("LAX", "15+", false, false)).toBeNull();
  });
});
