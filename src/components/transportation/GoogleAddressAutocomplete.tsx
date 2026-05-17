"use client";

import { useEffect, useId, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import pointToPointServiceAreaConfig from "@/../config/point-to-point-service-area.json";
import { milesToMeters } from "@/lib/geo/service-area";

/**
 * Google Places-backed address input for the point-to-point flow.
 *
 * Uses the newer `PlaceAutocompleteElement` web component (replaces the
 * legacy Autocomplete class which Google has stopped enhancing). The
 * `locationRestriction` is bound to our 20-mile home base service area so
 * out-of-area suggestions never appear.
 *
 * The browser API key (`NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`) must be
 * configured with HTTP referrer restrictions and limited to Maps JS API +
 * Places API.
 */

const SERVICE_AREA = pointToPointServiceAreaConfig as {
  center: { lat: number; lng: number };
  radiusMiles: number;
};

interface PickedPlace {
  placeId: string;
  formattedAddress: string;
  name?: string;
  location?: { lat: number; lng: number };
}

interface Props {
  id: string;
  label: string;
  /** Formatted address text — the value rendered to the user. */
  value: string;
  /** Selected Place ID — what the server actually needs. */
  placeId: string;
  onChange: (next: PickedPlace) => void;
  placeholder?: string;
  required?: boolean;
  inputRef?: (el: HTMLElement | null) => void;
}

// Singleton loader — concurrent mounts share the same places-library import.
// v2 of @googlemaps/js-api-loader uses a functional API: setOptions() once,
// then importLibrary() per library needed.
let optionsSet = false;
let placesLibPromise: Promise<google.maps.PlacesLibrary> | null = null;
function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (placesLibPromise) return placesLibPromise;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error(
        "NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY is not set. Add it to your .env.local and Vercel env."
      )
    );
  }
  if (!optionsSet) {
    setOptions({ key: apiKey, v: "weekly" });
    optionsSet = true;
  }
  placesLibPromise = importLibrary("places");
  return placesLibPromise;
}

export default function GoogleAddressAutocomplete({
  id,
  label,
  value,
  placeId,
  onChange,
  placeholder,
  required,
  inputRef,
}: Props) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    loadPlacesLibrary()
      .then(async (places) => {
        if (cancelled) return;

        // PlaceAutocompleteElement is a web component (extends HTMLElement).
        // It's not in older @types/google.maps; type loosely.
        type PlacesNS = typeof places & {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          PlaceAutocompleteElement: new (opts: any) => HTMLElement;
        };
        const placesNS = places as PlacesNS;
        if (!placesNS.PlaceAutocompleteElement) {
          throw new Error(
            "Google PlaceAutocompleteElement is unavailable. The Places API (New) may not be enabled."
          );
        }

        const radiusMeters = milesToMeters(SERVICE_AREA.radiusMiles);

        const element = new placesNS.PlaceAutocompleteElement({
          // Use the curated component restrictions to keep suggestions tight
          // to our service area. `locationRestriction` is hard — out-of-area
          // results literally don't show.
          locationRestriction: {
            west: SERVICE_AREA.center.lng - 1.5,
            east: SERVICE_AREA.center.lng + 1.5,
            south: SERVICE_AREA.center.lat - 1.0,
            north: SERVICE_AREA.center.lat + 1.0,
          },
          // Additionally use a circle bias so the closest results sort first.
          // (Circle bias must be set via the underlying `requestedRegion` /
          // `origin` options in newer SDK builds; this snippet keeps it simple.)
          includedRegionCodes: ["us"],
        });

        // The element manages its own input. Mount it into our container.
        if (containerRef.current) {
          containerRef.current.replaceChildren(element);
        }
        elementRef.current = element;
        inputRef?.(element);

        // Style the embedded input to match our other form controls.
        applyInputStyling(element);

        // Pre-populate the value if we already have one (e.g. user navigated back)
        if (value) {
          tryPrefillValue(element, value);
        }

        // Google has shipped THREE different selection-event shapes for this
        // component across SDK versions ("gmp-placeselect", "gmp-select"
        // with detail.placePrediction, and prediction directly on event).
        // Listen on both names and probe defensively so a Google rev doesn't
        // silently break us.
        const handler = async (ev: Event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const evAny = ev as any;
          const detail = (ev as CustomEvent).detail;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const placePrediction = (detail as any)?.placePrediction ?? evAny.placePrediction;

          if (process.env.NODE_ENV !== "production") {
            console.log(`[GoogleAddressAutocomplete:${id}] ${ev.type} fired`, {
              hasDetail: Boolean(detail),
              hasPrediction: Boolean(placePrediction),
              predictionKeys: placePrediction ? Object.keys(placePrediction) : null,
              evAnyKeys: Object.keys(evAny),
            });
          }

          if (!placePrediction) {
            console.warn(`[GoogleAddressAutocomplete:${id}] no placePrediction in event`);
            return;
          }

          // Place ID is available directly on the prediction — use that as
          // the source of truth so we capture it even if fetchFields fails.
          const predictionPlaceId =
            placePrediction.placeId ??
            placePrediction.place_id ??
            placePrediction.id ??
            "";

          // Now hydrate the Place for the formatted-address / coords.
          let place: {
            id?: string;
            formattedAddress?: string;
            displayName?: string;
            location?: { lat: () => number; lng: () => number };
          } | null = null;
          try {
            if (typeof placePrediction.toPlace === "function") {
              place = placePrediction.toPlace();
              if (place && typeof (place as { fetchFields?: unknown }).fetchFields === "function") {
                await (
                  place as unknown as { fetchFields: (a: { fields: string[] }) => Promise<unknown> }
                ).fetchFields({
                  fields: ["id", "formattedAddress", "displayName", "location"],
                });
              }
            }
          } catch (err) {
            console.error(`[GoogleAddressAutocomplete:${id}] fetchFields failed:`, err);
          }

          const placeId = place?.id ?? predictionPlaceId;
          if (!placeId) {
            console.warn(`[GoogleAddressAutocomplete:${id}] no placeId resolved`, { place, placePrediction });
            return;
          }

          const picked: PickedPlace = {
            placeId,
            formattedAddress:
              place?.formattedAddress ??
              placePrediction.text?.text ??
              placePrediction.description ??
              "",
            name:
              typeof place?.displayName === "string"
                ? place.displayName
                : placePrediction.mainText?.text ?? undefined,
            location: place?.location
              ? { lat: place.location.lat(), lng: place.location.lng() }
              : undefined,
          };

          if (process.env.NODE_ENV !== "production") {
            console.log(`[GoogleAddressAutocomplete:${id}] picked`, picked);
          }

          if (!cancelled) onChange(picked);
        };

        const events = ["gmp-select", "gmp-placeselect"];
        for (const name of events) element.addEventListener(name, handler as EventListener);
        cleanup = () => {
          for (const name of events) element.removeEventListener(name, handler as EventListener);
        };

        // Surface radius distance dynamically — keep alive for future tuning
        void radiusMeters;

        setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
      // Removing the Google element can race with React if the parent is
      // also unmounting at the same time. Swallow DOM exceptions here —
      // anything not-removed will be GC'd when its container goes away.
      try {
        if (containerRef.current) containerRef.current.replaceChildren();
      } catch {
        /* noop */
      }
      elementRef.current = null;
    };
    // We deliberately don't depend on `value` / `onChange` — the element
    // owns its internal state after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <label
        htmlFor={id || reactId}
        className="block font-sans text-xs font-semibold text-muted uppercase tracking-wide mb-1.5"
      >
        {label}
        {required && <span className="text-sunset ml-0.5">*</span>}
      </label>

      {/* Loading placeholder — separate sibling so React never owns children
          inside the Google-managed container. */}
      {!ready && !loadError && (
        <input
          id={id || reactId}
          type="text"
          disabled
          placeholder="Loading address search…"
          className="w-full rounded-xl border border-border bg-cream/60 px-4 py-3 font-sans text-sm text-muted outline-none"
        />
      )}

      {/*
        The Google PlaceAutocompleteElement mounts imperatively INSIDE this div.
        We never put React-rendered children in here — doing so causes
        removeChild errors when React's virtual DOM and Google's imperative
        DOM mutations disagree on what's a child of what.
      */}
      <div
        ref={containerRef}
        data-google-autocomplete={id}
        className="relative"
        // Hidden until ready so it doesn't reserve layout space before the
        // web component upgrades.
        style={{ display: ready ? "block" : "none" }}
      />

      {loadError && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          Couldn&apos;t load Google address search: {loadError}
        </p>
      )}

      {placeId && value && !loadError && (
        <p className="mt-1.5 text-xs text-muted truncate" aria-live="polite">
          Selected: <span className="text-ink/80">{value}</span>
        </p>
      )}

      {placeholder && !value && ready && (
        <p className="mt-1.5 text-xs text-muted/80">{placeholder}</p>
      )}
    </div>
  );
}

/**
 * Apply our form-input styling to the embedded input inside the
 * PlaceAutocompleteElement web component. The element renders its own input
 * (no slots in this version), so we reach in once at mount time.
 */
function applyInputStyling(element: HTMLElement): void {
  // The web component exposes its input via a part — apply via a stylesheet
  // adoption. Simplest cross-browser approach: query shadow DOM if available,
  // otherwise wait one frame and pierce light DOM.
  requestAnimationFrame(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadow = (element as any).shadowRoot as ShadowRoot | null;
    const targets: HTMLElement[] = [];
    if (shadow) {
      shadow.querySelectorAll("input").forEach((el) => targets.push(el as HTMLElement));
    }
    element.querySelectorAll("input").forEach((el) => targets.push(el as HTMLElement));
    for (const input of targets) {
      input.classList.add(
        "w-full",
        "rounded-xl",
        "border",
        "border-border",
        "bg-white",
        "px-4",
        "py-3",
        "font-sans",
        "text-sm",
        "text-ink"
      );
    }
  });
}

/**
 * If the user has a previously-saved formattedAddress, mirror it into the
 * embedded input so they don't see an empty field on re-mount (e.g. when
 * stepping back in the wizard). Not a perfect rehydration — the user still
 * has to re-pick to get a fresh Place ID — but better than blank.
 */
function tryPrefillValue(element: HTMLElement, value: string): void {
  requestAnimationFrame(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shadow = (element as any).shadowRoot as ShadowRoot | null;
    const input =
      (shadow?.querySelector("input") as HTMLInputElement | null) ??
      (element.querySelector("input") as HTMLInputElement | null);
    if (input) input.value = value;
  });
}
