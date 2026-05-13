import { describe, expect, it } from "vitest";
import { ANCHORS, FIXED_ROUTES, lookupFixedRoute, matchAnchor } from "./fixedRoutes";

const DISNEYLAND_HOTEL = { lat: 33.8088, lng: -117.9211 }; // inside Disneyland-area anchor
const LAX = { lat: 33.9416, lng: -118.4085 };
const SAN_DIEGO = { lat: 32.7157, lng: -117.1611 };
const KNOTTS = { lat: 33.8442, lng: -117.9988 }; // outside Disneyland-area anchor

describe("anchor matching", () => {
  it("matches Disneyland Hotel coords to the anaheim-disneyland anchor", () => {
    const anchor = matchAnchor({ placeId: "test_disneyland_hotel", location: DISNEYLAND_HOTEL });
    expect(anchor?.id).toBe("anaheim-disneyland");
  });

  it("matches LAX coords to the lax anchor", () => {
    const anchor = matchAnchor({ placeId: "test_lax", location: LAX });
    expect(anchor?.id).toBe("lax");
  });

  it("returns null for Knott's Berry Farm (outside any anchor radius)", () => {
    const anchor = matchAnchor({ placeId: "test_knotts", location: KNOTTS });
    expect(anchor).toBeNull();
  });

  it("returns null for San Diego", () => {
    const anchor = matchAnchor({ placeId: "test_sd", location: SAN_DIEGO });
    expect(anchor).toBeNull();
  });
});

describe("lookupFixedRoute (verification step #7)", () => {
  it("Disneyland → LAX returns anaheim-lax @ $225", () => {
    const route = lookupFixedRoute({
      pickupPlaceId: "test_disney",
      pickupLocation: DISNEYLAND_HOTEL,
      dropoffPlaceId: "test_lax",
      dropoffLocation: LAX,
    });
    expect(route?.id).toBe("anaheim-lax");
    expect(route?.price).toBe(225);
  });

  it("LAX → Disneyland (reverse direction) also matches anaheim-lax", () => {
    const route = lookupFixedRoute({
      pickupPlaceId: "test_lax",
      pickupLocation: LAX,
      dropoffPlaceId: "test_disney",
      dropoffLocation: DISNEYLAND_HOTEL,
    });
    expect(route?.id).toBe("anaheim-lax");
  });

  it("Disneyland → Knott's returns null (not a fixed route)", () => {
    const route = lookupFixedRoute({
      pickupPlaceId: "test_disney",
      pickupLocation: DISNEYLAND_HOTEL,
      dropoffPlaceId: "test_knotts",
      dropoffLocation: KNOTTS,
    });
    expect(route).toBeNull();
  });
});

describe("config integrity", () => {
  it("loads the 5 expected anchors", () => {
    const ids = ANCHORS.map((a) => a.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "anaheim-disneyland",
        "lax",
        "sna",
        "universal-studios",
        "downtown-la",
      ])
    );
  });

  it("loads the 4 expected routes", () => {
    expect(FIXED_ROUTES).toHaveLength(4);
    expect(FIXED_ROUTES.find((r) => r.id === "anaheim-lax")?.price).toBe(225);
    expect(FIXED_ROUTES.find((r) => r.id === "anaheim-sna")?.price).toBe(95);
    expect(FIXED_ROUTES.find((r) => r.id === "anaheim-universal")?.price).toBe(120);
    expect(FIXED_ROUTES.find((r) => r.id === "anaheim-downtown-la")?.price).toBe(150);
  });
});
