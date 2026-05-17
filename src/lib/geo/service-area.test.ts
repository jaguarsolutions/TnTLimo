import { describe, expect, it } from "vitest";
import {
  haversineMiles,
  haversineMeters,
  isWithinServiceArea,
  milesToMeters,
  POINT_TO_POINT_SERVICE_AREA,
  SERVICE_AREA,
} from "./service-area";

const ANAHEIM = SERVICE_AREA.center;
const POINT_TO_POINT_HOME_BASE = POINT_TO_POINT_SERVICE_AREA.center;
const DOWNTOWN_LA = { lat: 34.0522, lng: -118.2437 };
const SANTA_MONICA = { lat: 34.0195, lng: -118.4912 };
const LAX = { lat: 33.9416, lng: -118.4085 };
const SAN_DIEGO = { lat: 32.7157, lng: -117.1611 };
const LAS_VEGAS = { lat: 36.1699, lng: -115.1398 };

describe("haversineMiles", () => {
  it("returns 0 for the same point", () => {
    expect(haversineMiles(ANAHEIM, ANAHEIM)).toBeCloseTo(0, 3);
  });

  it("computes Anaheim → LAX in the right ballpark (straight-line ≠ driving)", () => {
    // Routes API returns ~26 driving miles for this leg, but haversine
    // measures straight-line — typically ~29 mi for Anaheim → LAX. The
    // important thing is the order of magnitude, not the exact value.
    const miles = haversineMiles(ANAHEIM, LAX);
    expect(miles).toBeGreaterThan(20);
    expect(miles).toBeLessThan(35);
  });

  it("is symmetric", () => {
    expect(haversineMiles(ANAHEIM, LAX)).toBeCloseTo(haversineMiles(LAX, ANAHEIM), 6);
  });

  it("converts to meters consistently", () => {
    const miles = haversineMiles(ANAHEIM, LAX);
    const meters = haversineMeters(ANAHEIM, LAX);
    expect(meters / 1609.344).toBeCloseTo(miles, 3);
  });
});

describe("milesToMeters", () => {
  it("converts 50 miles to ~80467 meters", () => {
    expect(milesToMeters(50)).toBeCloseTo(80467.2, 0);
  });
});

describe("isWithinServiceArea (50-mile Anaheim)", () => {
  it("accepts Anaheim center itself", () => {
    expect(isWithinServiceArea(ANAHEIM)).toBe(true);
  });

  it("accepts LAX (within 26 mi)", () => {
    expect(isWithinServiceArea(LAX)).toBe(true);
  });

  it("rejects San Diego (~80 mi)", () => {
    expect(isWithinServiceArea(SAN_DIEGO)).toBe(false);
  });

  it("rejects Las Vegas (~225 mi)", () => {
    expect(isWithinServiceArea(LAS_VEGAS)).toBe(false);
  });
});

describe("isWithinServiceArea (20-mile point-to-point home base)", () => {
  it("accepts downtown Los Angeles inside 20 miles", () => {
    expect(isWithinServiceArea(DOWNTOWN_LA, POINT_TO_POINT_SERVICE_AREA)).toBe(true);
  });

  it("rejects Santa Monica outside 20 miles", () => {
    expect(isWithinServiceArea(SANTA_MONICA, POINT_TO_POINT_SERVICE_AREA)).toBe(false);
  });
});
