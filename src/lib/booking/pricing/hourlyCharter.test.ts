import { describe, expect, it } from "vitest";
import { calculateHourlyCharterPrice, minHoursFor } from "./hourlyCharter";

describe("calculateHourlyCharterPrice — uses vehicle's hourlyRate and floors at hourlyMinHours", () => {
  it("Sedan with 4 hr → 4 × $100 = $400", () => {
    const quote = calculateHourlyCharterPrice("sedan", 4);
    expect(quote).not.toBeNull();
    expect(quote?.rate).toBe(100);
    expect(quote?.total).toBe(400);
    expect(quote?.billedHours).toBe(4);
  });

  it("Sedan with 2 hr → bills 3-hr minimum × $100 = $300", () => {
    const quote = calculateHourlyCharterPrice("sedan", 2);
    expect(quote?.billedHours).toBe(3);
    expect(quote?.total).toBe(300);
  });

  it("SUV 3 hr (min) → 3 × $120 = $360", () => {
    const quote = calculateHourlyCharterPrice("suv", 3);
    expect(quote?.rate).toBe(120);
    expect(quote?.total).toBe(360);
  });

  it("Sprinter 4 hr → 4 × $185 = $740", () => {
    const quote = calculateHourlyCharterPrice("sprinter", 4);
    expect(quote?.rate).toBe(185);
    expect(quote?.total).toBe(740);
  });

  it("Sprinter 6 hr → 6 × $185 = $1110", () => {
    const quote = calculateHourlyCharterPrice("sprinter", 6);
    expect(quote?.total).toBe(1110);
  });

  it("Van enforces its 4-hr minimum", () => {
    expect(calculateHourlyCharterPrice("van", 2)?.billedHours).toBe(4);
  });

  it("returns null for unsupported passenger group", () => {
    expect(calculateHourlyCharterPrice("15+", 4)).toBeNull();
  });
});

describe("minHoursFor", () => {
  it("Sedan / SUV → 3 hr", () => {
    expect(minHoursFor("sedan")).toBe(3);
    expect(minHoursFor("suv")).toBe(3);
    expect(minHoursFor("1-4")).toBe(3);
    expect(minHoursFor("5-6")).toBe(3);
  });
  it("Van / Sprinter → 4 hr", () => {
    expect(minHoursFor("van")).toBe(4);
    expect(minHoursFor("sprinter")).toBe(4);
    expect(minHoursFor("7-10")).toBe(4);
    expect(minHoursFor("11-14")).toBe(4);
  });
});
