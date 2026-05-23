import { describe, expect, it } from "vitest";
import { calculateHourlyCharterPrice } from "./hourlyCharter";

describe("calculateHourlyCharterPrice", () => {
  it("uses the selected vehicle type for hourly pricing", () => {
    const quote = calculateHourlyCharterPrice("sedan", 4);
    expect(quote).not.toBeNull();
    expect(quote?.rate).toBe(95);
    expect(quote?.total).toBe(380);
  });

  it("returns null for an unsupported passenger group when no vehicle is provided", () => {
    expect(calculateHourlyCharterPrice("15+", 4)).toBeNull();
  });
});
