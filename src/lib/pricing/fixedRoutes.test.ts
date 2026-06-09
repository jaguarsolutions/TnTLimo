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

describe("lookupFixedRoute (no flat overrides — engine handles all routes)", () => {
  // The published anchor pairs no longer have flat-price overrides; every
  // route resolves through the engine so prices vary by vehicle. Anchor
  // matching itself is still exercised above so the data is ready when /
  // if a per-route override is reintroduced.
  it("Disneyland → LAX returns null (no flat override)", () => {
    const route = lookupFixedRoute({
      pickupPlaceId: "test_disney",
      pickupLocation: DISNEYLAND_HOTEL,
      dropoffPlaceId: "test_lax",
      dropoffLocation: LAX,
    });
    expect(route).toBeNull();
  });

  it("Disneyland → Knott's returns null (not an anchor pair)", () => {
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

  it("ships with no flat-price route overrides — all trips quote through the engine", () => {
    expect(FIXED_ROUTES).toHaveLength(0);
  });
});
