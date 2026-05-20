"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  AIRPORT_OPTIONS,
  BOOKABLE_TRANSPORTATION_SERVICES,
  CHILD_SEAT_OPTIONS,
  GRATUITY_OPTIONS,
  HOURLY_RATES,
  PASSENGER_GROUPS,
  POINT_TO_POINT_FIXED_ROUTES,
  SERVICE_LABELS,
  calculateAirportTransferPrice,
  calculateHourlyCharterPrice,
  calculatePointToPointPrice,
  formatCurrency,
  shouldShowGroupQuoteMessage,
  type BookableServiceCode,
} from "@/lib/transportationData";
import { AIRPORTS } from "@/lib/transportationLocations";
import { SITE_CONTACT } from "@/lib/siteContact";
import { FORM_SUBJECT_PREFIX } from "@/lib/siteEnv";
import { VEHICLES, vehiclesForPassengerCount } from "@/lib/pricing/engine";
import ChildSeatSelector from "./ChildSeatSelector";
import GoogleAddressAutocomplete from "./GoogleAddressAutocomplete";
import VehicleSelector from "./VehicleSelector";

const WEB3_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

const TOTAL_STEPS = 6;
const STEP_LABELS_SHORT = [
  "Service",
  "Trip",
  "Passengers",
  "Contact",
  "Review",
  "Confirm",
];

const inputBase =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60";

const labelClass =
  "block font-sans text-xs font-semibold text-muted uppercase tracking-wide mb-1.5";

const fieldGroup = "grid gap-4 sm:grid-cols-2";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition hover:bg-charcoal disabled:opacity-60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-cream";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-7 py-3 text-sm font-semibold text-ink transition hover:border-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-cream";

type ServiceCode = BookableServiceCode;

/** Which side of the airport trip the airport sits on. */
type AirportDirection = "from-airport" | "to-airport";

type WizardState = {
  service: ServiceCode | null;
  airportDirection: AirportDirection;
  airport: string;
  otherAddress: string;
  roundTrip: boolean;
  pickupAddress: string;
  dropoffAddress: string;
  airline: string;
  flightNumber: string;
  flightTime: string;
  /** Round-trip only: time of the return-leg flight (departure from local airport). */
  returnFlightTime: string;
  meetAndGreet: boolean;
  /** Point-to-point: Google Place IDs (separate from formatted display string). */
  pickupPlaceId: string;
  dropoffPlaceId: string;
  /** Airport transfer: Place ID for the hotel/address (the non-airport side). */
  otherAddressPlaceId: string;
  /** Point-to-point: vehicle catalog selection. Defaults to towncar. */
  vehicleId: string;
  extraStop: boolean;
  extraStopDetails: string;
  pickupDateTime: string;
  hours: number;
  plannedStops: string;
  passengerGroup: string;
  luggageCount: number;
  childSeats: string[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  gratuity: string;
};

const INITIAL_STATE: WizardState = {
  service: null,
  airportDirection: "from-airport",
  airport: "LAX",
  otherAddress: "",
  roundTrip: false,
  pickupAddress: "",
  dropoffAddress: "",
  airline: "",
  flightNumber: "",
  flightTime: "",
  returnFlightTime: "",
  meetAndGreet: false,
  pickupPlaceId: "",
  dropoffPlaceId: "",
  otherAddressPlaceId: "",
  vehicleId: VEHICLES[0]?.id ?? "",
  extraStop: false,
  extraStopDetails: "",
  pickupDateTime: "",
  hours: 4,
  plannedStops: "",
  passengerGroup: "1-4",
  luggageCount: 1,
  childSeats: [],
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  gratuity: "20",
};

function airportDisplayName(code: string) {
  return AIRPORTS.find((a) => a.name.includes(`(${code})`))?.name ?? code;
}

const SERVICE_ICONS: Record<ServiceCode, React.ReactNode> = {
  "airport-transfer": (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 19.5l19-7.5-7.5-2.5-3.5 2.5-2.5-2.5L2.5 19.5z" />
      <path d="M10.5 6.5l3 2-1 2" />
    </svg>
  ),
  "point-to-point": (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  "hourly-charter": (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
};

const CheckBadge = () => (
  <motion.span
    aria-hidden="true"
    initial={{ scale: 0.6, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 480, damping: 22 }}
    className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink shadow-sm"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  </motion.span>
);

function todayLocal() {
  // For datetime-local min — today's date at 00:00 local.
  const d = new Date();
  d.setSeconds(0, 0);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function formatHumanDateTime(iso: string) {
  if (!iso) return "Not provided";
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Upper-bound seat count for a PASSENGER_GROUPS value like "1-4" or "11-14". */
function passengersFromGroup(group: string): number {
  if (group === "15+") return 15;
  const match = group.match(/^(\d+)-(\d+)$/);
  return match ? Number(match[2]) : 1;
}

function isValidPhone(value: string) {
  // 7+ digits anywhere — keeps validation forgiving for international.
  return value.replace(/\D/g, "").length >= 7;
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.startsWith("1") ? digits.slice(1) : digits;
  if (normalized.length <= 3) return `(${normalized}`;
  if (normalized.length <= 6) return `(${normalized.slice(0, 3)}) ${normalized.slice(3)}`;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6, 10)}`;
}

const BOOKABLE_CODES: ReadonlySet<BookableServiceCode> = new Set([
  "airport-transfer",
  "point-to-point",
  "hourly-charter",
]);

function isBookableCode(value: string | null): value is BookableServiceCode {
  return value !== null && BOOKABLE_CODES.has(value as BookableServiceCode);
}

export default function TransportationBookingWizard() {
  const searchParams = useSearchParams();

  // Deep-link: a sub-page CTA can pass ?service=hourly-charter etc. to drop
  // the user straight into the trip-details step with the service preselected.
  // We honor "disneyland-transportation" as a marketing alias that maps to
  // point-to-point, the closest bookable type.
  const initialFromUrl = useMemo<{
    service: BookableServiceCode | null;
    step: number;
  }>(() => {
    const aliasMap: Record<string, BookableServiceCode> = {
      "disneyland-transportation": "point-to-point",
      "airport": "airport-transfer",
      "hourly": "hourly-charter",
    };

    const raw = searchParams.get("service")?.toLowerCase() ?? "";
    const alias = aliasMap[raw];
    if (alias) {
      return { service: alias, step: 2 };
    }
    if (isBookableCode(raw)) {
      return { service: raw, step: 2 };
    }
    return { service: null, step: 1 };
  }, [searchParams]);

  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(initialFromUrl.step);
  /** Direction of last step change (forward = 1, back = -1). Drives slide dir. */
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [highestStep, setHighestStep] = useState(initialFromUrl.step);
  const [state, setState] = useState<WizardState>(() => ({
    ...INITIAL_STATE,
    service: initialFromUrl.service,
  }));
  const [error, setError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const minDateTime = useMemo(() => todayLocal(), []);
  const stepHeaderRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLElement | null>(null);

  /* ── Live quote (point-to-point only) ────────────────────────────────
   *
   * Fires whenever pickup/dropoff Place IDs, vehicle, or extra-stop change.
   * Debounced 400ms so rapid edits coalesce into one request.
   */
  type LiveQuote = {
    distanceMiles: number | null;
    vehicle: { id: string; name: string };
    matchedFixedRoute: string | null;
    base: number;
    gratuity: number;
    total: number;
    breakdown: Array<{ label: string; amount: number }>;
  };
  type QuoteState =
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok"; data: LiveQuote }
    | { kind: "error"; message: string; offending?: "pickup" | "dropoff" | "both" };
  const [quote, setQuote] = useState<QuoteState>({ kind: "idle" });

  useEffect(() => {
    if (state.service !== "point-to-point") {
      setQuote({ kind: "idle" });
      return;
    }
    if (!state.pickupPlaceId || !state.dropoffPlaceId || !state.vehicleId) {
      setQuote({ kind: "idle" });
      return;
    }

    let cancelled = false;
    setQuote({ kind: "loading" });
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickupPlaceId: state.pickupPlaceId,
            dropoffPlaceId: state.dropoffPlaceId,
            vehicleId: state.vehicleId,
            tripType: "oneway",
            passengers: passengersFromGroup(state.passengerGroup),
            addOns: { extraStop: state.extraStop },
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setQuote({
            kind: "error",
            message: data.message ?? "Couldn't compute a quote.",
            offending: data.offending,
          });
          return;
        }
        setQuote({ kind: "ok", data });
      } catch (err) {
        if (cancelled) return;
        setQuote({
          kind: "error",
          message: err instanceof Error ? err.message : "Network error fetching quote.",
        });
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [
    state.service,
    state.pickupPlaceId,
    state.dropoffPlaceId,
    state.vehicleId,
    state.extraStop,
    state.passengerGroup,
  ]);

  useEffect(() => {
    const passengerCount = passengersFromGroup(state.passengerGroup);
    const eligibleVehicles = vehiclesForPassengerCount(passengerCount);
    const firstEligible = eligibleVehicles[0]?.id ?? "";
    if (!eligibleVehicles.some((v) => v.id === state.vehicleId)) {
      setState((current) => ({ ...current, vehicleId: firstEligible }));
    }
  }, [state.passengerGroup, state.vehicleId]);

  /* Focus management & scroll on step change */
  useEffect(() => {
    if (stepHeaderRef.current) {
      stepHeaderRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Defer focus so the new field exists in the DOM.
    const id = window.requestAnimationFrame(() => {
      if (firstFieldRef.current) firstFieldRef.current.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [step]);

  const priceSummary = useMemo(() => {
    if (!state.service) {
      return { basePrice: null as number | null, addOns: 0, gratuity: 0, total: null as number | null, pending: true, routeLabel: null as string | null };
    }

    if (state.service === "airport-transfer") {
      const pricing = calculateAirportTransferPrice(
        state.airport,
        state.passengerGroup,
        state.meetAndGreet,
        state.roundTrip,
      );
      if (!pricing) {
        return { basePrice: null, addOns: 0, gratuity: 0, total: null, pending: true, routeLabel: null };
      }
      const subtotal = pricing.total + pricing.addOns;
      const gratuityAmount =
        state.gratuity === "cash" ? 0 : Math.round((subtotal * Number(state.gratuity)) / 100);
      const fromLabel = state.airportDirection === "from-airport" ? state.airport : state.otherAddress || "Hotel/address";
      const toLabel = state.airportDirection === "from-airport" ? state.otherAddress || "Hotel/address" : state.airport;
      return {
        basePrice: pricing.total,
        addOns: pricing.addOns,
        gratuity: gratuityAmount,
        total: subtotal + gratuityAmount,
        pending: false,
        routeLabel: `${fromLabel} → ${toLabel}${state.roundTrip ? " (round trip)" : ""}`,
      };
    }

    if (state.service === "point-to-point") {
      // PRIMARY PATH — live quote from /api/quote (Google-backed). Used as
      // soon as both Place IDs are picked.
      if (quote.kind === "ok") {
        const matched = quote.data.matchedFixedRoute;
        const distance = quote.data.distanceMiles;
        const label = matched
          ? `Fixed route: ${matched.replace(/-/g, " → ")}`
          : distance != null
            ? `Custom route · ${distance.toFixed(1)} mi (${quote.data.vehicle.name})`
            : `Custom route (${quote.data.vehicle.name})`;
        return {
          basePrice: quote.data.base,
          addOns: state.extraStop ? 20 : 0,
          gratuity: quote.data.gratuity,
          total: quote.data.total,
          pending: false,
          routeLabel: label,
        };
      }
      if (quote.kind === "loading") {
        return {
          basePrice: null as number | null,
          addOns: 0,
          gratuity: 0,
          total: null as number | null,
          pending: true,
          routeLabel: "Calculating fare…",
        };
      }
      if (quote.kind === "error") {
        return {
          basePrice: null as number | null,
          addOns: 0,
          gratuity: 0,
          total: null as number | null,
          pending: true,
          routeLabel: null,
        };
      }

      // FALLBACK — no Place IDs picked yet, or service just landed on
      // point-to-point. Use the legacy substring matcher so the four fixed
      // routes still preview when the user types text directly.
      const pricing = calculatePointToPointPrice(
        state.pickupAddress,
        state.dropoffAddress,
        state.passengerGroup,
        state.extraStop,
      );
      const subtotal = pricing.total ?? 0;
      const gratuityAmount =
        state.gratuity === "cash" ? 0 : Math.round((subtotal * Number(state.gratuity)) / 100);
      return {
        basePrice: pricing.base,
        addOns: pricing.addOns,
        gratuity: gratuityAmount,
        total: pricing.total ? pricing.total + gratuityAmount : null,
        pending: pricing.base === null || state.passengerGroup === "15+",
        routeLabel: pricing.routeMatch ?? "Pick pickup and drop-off above for a quote.",
      };
    }

    const pricing = calculateHourlyCharterPrice(state.passengerGroup, state.hours);
    if (!pricing) {
      return { basePrice: null, addOns: 0, gratuity: 0, total: null, pending: true, routeLabel: "Hourly charter" };
    }
    const gratuityAmount =
      state.gratuity === "cash" ? 0 : Math.round((pricing.total * Number(state.gratuity)) / 100);
    return {
      basePrice: pricing.total,
      addOns: 0,
      gratuity: gratuityAmount,
      total: pricing.total + gratuityAmount,
      pending: false,
      routeLabel: `${state.hours}-hour charter`,
    };
  }, [state, quote]);

  const handleField = <K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    const nextValue = field === "phone" && typeof value === "string"
      ? (formatPhoneInput(value) as WizardState[K])
      : value;
    setState((current) => ({ ...current, [field]: nextValue }));
  };

  const goToStep = (target: number) => {
    setError("");
    if (target < 1 || target > TOTAL_STEPS) return;
    setStepDirection(target >= step ? 1 : -1);
    setStep(target);
    setHighestStep((current) => Math.max(current, target));
  };

  function validateStep(currentStep: number): string | null {
    if (currentStep === 1) {
      if (!state.service) return "Please choose a transportation service to continue.";
    }
    if (currentStep === 2) {
      if (state.service === "airport-transfer") {
        if (!state.airport || !state.otherAddress || !state.flightTime) {
          return "Please choose an airport, enter the hotel/address, and add the flight time.";
        }
        if (state.roundTrip && !state.returnFlightTime) {
          return "For a round trip, please add the return departure time too.";
        }
      }
      if (state.service === "point-to-point") {
        if (!state.pickupPlaceId || !state.dropoffPlaceId) {
          return "Please pick both a pickup and drop-off address from the suggestions.";
        }
        if (!state.pickupDateTime) {
          return "Please add a pickup date and time.";
        }
        if (!state.vehicleId) {
          return "Please pick a vehicle.";
        }
        if (quote.kind === "error") {
          return quote.message;
        }
        if (quote.kind === "loading") {
          return "Hang on — we're calculating your fare.";
        }
      }
      if (state.service === "hourly-charter") {
        if (!state.pickupAddress || !state.pickupDateTime) {
          return "Please add a pickup address and date/time.";
        }
        if (state.hours < 4) return "Hourly charter has a 4-hour minimum.";
      }
    }
    if (currentStep === 3) {
      if (!state.passengerGroup) return "Please choose a passenger group.";
      const passengerCount = passengersFromGroup(state.passengerGroup);
      const eligibleVehicles = vehiclesForPassengerCount(passengerCount);
      if (eligibleVehicles.length > 0 && !eligibleVehicles.some((v) => v.id === state.vehicleId)) {
        return "Please choose a vehicle.";
      }
      if (state.luggageCount < 0) return "Luggage count can’t be negative.";
    }
    if (currentStep === 4) {
      if (!state.firstName.trim() || !state.lastName.trim()) return "Please add your first and last name.";
      if (!isValidEmail(state.email)) return "Please enter a valid email address.";
      if (!isValidPhone(state.phone)) return "Please enter a valid phone number.";
    }
    return null;
  }

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    goToStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    if (step > 1) goToStep(step - 1);
  };

  function buildSubmissionPayload() {
    const lines: string[] = [];
    lines.push(`Service: ${state.service ? SERVICE_LABELS[state.service] : ""}`);
    if (priceSummary.routeLabel) lines.push(`Route: ${priceSummary.routeLabel}`);

    if (state.service === "airport-transfer") {
      const serviceTypeLabel = state.roundTrip
        ? "Round trip (airport pickup + drop-off)"
        : state.airportDirection === "from-airport"
          ? "Airport pickup (arrival)"
          : "Airport drop-off (departure)";
      lines.push(`Service type: ${serviceTypeLabel}`);
      lines.push(`Airport: ${airportDisplayName(state.airport)}`);
      lines.push(
        state.roundTrip
          ? `Hotel / address: ${state.otherAddress}`
          : state.airportDirection === "from-airport"
            ? `Drop-off address: ${state.otherAddress}`
            : `Pickup address: ${state.otherAddress}`,
      );
      lines.push(`Airline: ${state.airline || "Not provided"}`);
      lines.push(`Flight #: ${state.flightNumber || "Not provided"}`);
      lines.push(
        state.roundTrip
          ? `Arrival flight time: ${formatHumanDateTime(state.flightTime)}`
          : state.airportDirection === "from-airport"
            ? `Arrival time: ${formatHumanDateTime(state.flightTime)}`
            : `Departure time: ${formatHumanDateTime(state.flightTime)}`,
      );
      if (state.roundTrip) {
        lines.push(`Return departure time: ${formatHumanDateTime(state.returnFlightTime)}`);
      }
      if (state.airportDirection === "from-airport" || state.roundTrip) {
        lines.push(`Meet & greet: ${state.meetAndGreet ? "Yes (+$30)" : "No"}`);
      }
    }
    if (state.service === "point-to-point") {
      lines.push(`Pickup: ${state.pickupAddress}`);
      lines.push(`Drop-off: ${state.dropoffAddress}`);
      lines.push(`Pickup date/time: ${formatHumanDateTime(state.pickupDateTime)}`);
      lines.push(`Extra stop: ${state.extraStop ? state.extraStopDetails || "Yes" : "No"}`);
    }
    if (state.service === "hourly-charter") {
      lines.push(`Pickup: ${state.pickupAddress}`);
      lines.push(`Pickup date/time: ${formatHumanDateTime(state.pickupDateTime)}`);
      lines.push(`Hours: ${state.hours}`);
      lines.push(`Planned stops/notes: ${state.plannedStops || "Not provided"}`);
    }

    const passengerLabel = PASSENGER_GROUPS.find((p) => p.value === state.passengerGroup)?.label;
    lines.push(`Passengers: ${passengerLabel}`);
    lines.push(`Luggage: ${state.luggageCount}`);
    lines.push(`Child seats: ${state.childSeats.length ? state.childSeats.join(", ") : "None"}`);
    lines.push(`Gratuity: ${state.gratuity === "cash" ? "Cash at pickup" : `${state.gratuity}%`}`);

    if (priceSummary.total !== null) {
      lines.push(`Estimated total: ${formatCurrency(priceSummary.total)}`);
    } else {
      lines.push(`Estimated total: Quote pending`);
    }

    if (state.notes.trim()) {
      lines.push("");
      lines.push(`Notes: ${state.notes.trim()}`);
    }

    return {
      subject: `${FORM_SUBJECT_PREFIX}TNT Tours — Transportation booking · ${state.firstName} ${state.lastName}`,
      from_name: `${state.firstName} ${state.lastName}`,
      email: state.email,
      phone: state.phone,
      message: lines.join("\n"),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitStatus("sending");

    // If the total is null (group 15+ or unknown route), fall back to the email
    // quote flow — these aren't auto-bookable yet.
    if (priceSummary.total === null) {
      await submitEmailQuote();
      return;
    }

    // Standard flow: persist booking + redirect to Stripe Checkout.
    try {
      const pickupAtIso = computePickupIso();
      if (!pickupAtIso) {
        setError("Pickup date/time is missing.");
        setSubmitStatus("error");
        return;
      }

      const subtotalCents = Math.round((priceSummary.basePrice ?? 0 + priceSummary.addOns) * 100);
      const gratuityCents = Math.round((priceSummary.gratuity ?? 0) * 100);
      const totalCents = Math.round((priceSummary.total ?? 0) * 100);

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: state.service,
          pickupAtIso,
          customer: {
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email,
            phone: state.phone,
          },
          totals: {
            subtotalCents: subtotalCents > 0 ? subtotalCents : totalCents - gratuityCents,
            gratuityCents,
            totalCents,
          },
          payload: state,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          diagnosticId?: string;
          detail?: string;
        };
        const base = data.error ?? "Failed to create booking";
        const ref = data.diagnosticId ? ` (ref: ${data.diagnosticId})` : "";
        // `detail` is only included in non-production builds — surfaces the
        // underlying exception so local dev doesn't require checking the server
        // terminal to know why the call failed.
        const dev = data.detail ? `\nDetail: ${data.detail}` : "";
        throw new Error(`${base}${ref}${dev}`);
      }

      const { checkoutUrl } = (await res.json()) as { checkoutUrl: string };
      // Redirect to Stripe-hosted checkout. No success state in the wizard —
      // Stripe handles UI from here, and customers come back via /booking/success.
      window.location.href = checkoutUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Booking could not be started.";
      setError(message);
      setSubmitStatus("error");
    }
  }

  /** For legacy 15+ / custom-quote path — still uses Web3Forms/FormSubmit. */
  async function submitEmailQuote() {
    const payload = buildSubmissionPayload();
    try {
      if (WEB3_KEY) {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: WEB3_KEY, ...payload }),
        });
        const data = await res.json();
        if (!data.success) throw new Error("submission failed");
      } else {
        const res = await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(SITE_CONTACT.email)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              _subject: payload.subject,
              name: payload.from_name,
              email: payload.email,
              phone: payload.phone,
              message: payload.message,
            }),
          },
        );
        const data = await res.json();
        if (!data.success && data.success !== "true") throw new Error("submission failed");
      }
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  }

  /**
   * Convert datetime-local string to ISO. We interpret the value as the
   * customer's browser-local time. Confirmation emails always render in PT, so
   * customers booking from outside California should pick the LA-local pickup
   * time directly (the form copy reminds them).
   */
  function computePickupIso(): string | null {
    const local = state.pickupDateTime || state.flightTime;
    if (!local) return null;
    const date = new Date(local);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  /* ── Sub-renders ──────────────────────────────────────── */

  const ProgressBar = (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, idx) => {
          const idx1 = idx + 1;
          const reached = idx1 <= highestStep;
          const isCurrent = idx1 === step;
          const isComplete = idx1 < step;
          return (
            <li key={idx1} className="flex-1">
              <button
                type="button"
                disabled={!reached}
                onClick={() => reached && goToStep(idx1)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${idx1}: ${STEP_LABELS_SHORT[idx]}`}
                className={`group block w-full text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-lg ${
                  reached ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    isComplete
                      ? "bg-gold"
                      : isCurrent
                        ? "bg-gold/70"
                        : "bg-border"
                  }`}
                />
                <span
                  className={`mt-2 hidden sm:block text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                    isCurrent ? "text-ink" : reached ? "text-muted" : "text-muted/60"
                  }`}
                >
                  {STEP_LABELS_SHORT[idx]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs font-semibold text-muted sm:hidden">
        Step {step} of {TOTAL_STEPS} — <span className="text-ink">{STEP_LABELS_SHORT[step - 1]}</span>
      </p>
    </nav>
  );

  const PriceSummary = (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">Booking summary</p>
      <h3 className="mt-3 font-display text-xl font-semibold text-ink">
        {state.service ? SERVICE_LABELS[state.service] : "Choose a service to begin"}
      </h3>
      {priceSummary.routeLabel && (
        <>
          <p className="mt-1 text-sm text-muted">{priceSummary.routeLabel}</p>
          {(state.service === "point-to-point" || state.service === "hourly-charter") && state.pickupAddress && state.dropoffAddress && (
            <p className="mt-2 text-sm text-muted">
              {state.pickupAddress} → {state.dropoffAddress}
            </p>
          )}
          {state.service === "airport-transfer" && state.airport && state.otherAddress && (
            <p className="mt-2 text-sm text-muted">
              {airportDisplayName(state.airport)} ↔ {state.otherAddress}
            </p>
          )}
        </>
      )}

      <dl className="mt-5 space-y-2.5 text-sm text-ink">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Passengers</dt>
          <dd className="font-medium">
            {PASSENGER_GROUPS.find((p) => p.value === state.passengerGroup)?.label ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Base</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(priceSummary.basePrice)}</dd>
        </div>
        {priceSummary.addOns > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Add-ons</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(priceSummary.addOns)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-muted">
            Gratuity {state.gratuity !== "cash" ? `(${state.gratuity}%)` : ""}
          </dt>
          <dd className="font-medium tabular-nums">
            {state.gratuity === "cash" ? "Cash at pickup" : formatCurrency(priceSummary.gratuity)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-border pt-4 flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-ink">Total</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={priceSummary.total ?? "pending"}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -4, scale: 0.96 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="font-display text-2xl font-semibold text-ink tabular-nums"
          >
            {priceSummary.total !== null ? formatCurrency(priceSummary.total) : "—"}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Only show the "custom quote" message when the booking actually
          needs a manual quote — i.e. 15+ passengers. Generic "no quote yet"
          is communicated by the `Calculating…` routeLabel instead. */}
      {priceSummary.pending && state.passengerGroup === "15+" && (
        <p className="mt-3 rounded-xl border border-sunset/20 bg-sunset/10 px-3 py-2 text-xs text-ink">
          Custom or large group — we&apos;ll reply with a multi-vehicle quote within hours.
        </p>
      )}

      <p className="mt-4 text-xs text-muted leading-relaxed">
        Payment is securely processed by Stripe at booking. Full refund if you cancel at least 24 hours before pickup.
      </p>
    </div>
  );

  const ServiceCards = (
    <div role="radiogroup" aria-label="Choose a transportation service" className="grid gap-4 sm:grid-cols-3">
      {BOOKABLE_TRANSPORTATION_SERVICES.map((service, idx) => {
        const isSelected = state.service === service.code;
        return (
          <button
            key={service.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            ref={idx === 0 ? (el) => { firstFieldRef.current = el; } : undefined}
            onClick={() => {
              setState((current) => ({ ...current, service: service.code }));
              setError("");
              // Auto-advance gives a faster feel; small delay so the user sees their selection.
              window.setTimeout(() => goToStep(2), 250);
            }}
            className={`relative flex flex-col text-left p-6 rounded-2xl border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
              isSelected
                ? "border-gold bg-gold/5 shadow-md"
                : "border-border bg-white hover:border-ink/40 hover:shadow-sm"
            }`}
          >
            {isSelected && <CheckBadge />}
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
                isSelected ? "bg-gold text-ink" : "bg-cream text-ink"
              }`}
            >
              {SERVICE_ICONS[service.code]}
            </span>
            <span className="font-display text-lg font-semibold text-ink">{service.title}</span>
            <span className="mt-2 font-sans text-sm text-muted leading-relaxed">{service.description}</span>
          </button>
        );
      })}
    </div>
  );

  /* ── Step content ─────────────────────────────────────── */

  const StepHeader = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) => (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-sm text-muted leading-relaxed">{subtitle}</p>}
    </div>
  );

  const RequiredMark = () => <span className="text-sunset" aria-hidden="true">*</span>;

  const Step1 = (
    <>
      <StepHeader
        eyebrow="Step 1 of 6"
        title="What kind of ride do you need?"
        subtitle="Pick the option that matches your trip — we’ll only ask the questions that apply."
      />
      {ServiceCards}
    </>
  );

  const Step2 = (
    <>
      <StepHeader
        eyebrow="Step 2 of 6"
        title="Trip details"
        subtitle="The fields change with the service you picked. Required fields are marked with an asterisk."
      />

      {state.service === "airport-transfer" && (() => {
        // Derived "trip type" — collapses (airportDirection, roundTrip) into a
        // single mental model the customer picks at the top. Maps back to the
        // underlying state fields so pricing/server validation are unchanged.
        type TripType = "pickup" | "dropoff" | "round-trip";
        const tripType: TripType = state.roundTrip
          ? "round-trip"
          : state.airportDirection === "from-airport"
            ? "pickup"
            : "dropoff";
        const setTripType = (next: TripType) => {
          if (next === "pickup") {
            setState((s) => ({ ...s, airportDirection: "from-airport", roundTrip: false }));
          } else if (next === "dropoff") {
            setState((s) => ({ ...s, airportDirection: "to-airport", roundTrip: false }));
          } else {
            // Round trip — direction is "the first leg arrives", which is
            // typical for travellers visiting the area. Pricing treats both
            // legs the same.
            setState((s) => ({ ...s, airportDirection: "from-airport", roundTrip: true }));
          }
          setError("");
        };

        const tripOptions: Array<{
          value: TripType;
          title: string;
          hint: string;
          icon: React.ReactNode;
          priceLabel: string | null;
        }> = [
          {
            value: "pickup",
            title: "Airport Pickup",
            hint: "We meet you at the airport on arrival.",
            icon: (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5z" />
              </svg>
            ),
            priceLabel: priceSummary.basePrice && !state.roundTrip
              ? formatCurrency(priceSummary.basePrice)
              : priceSummary.basePrice && state.roundTrip
                ? formatCurrency(priceSummary.basePrice / 2)
                : null,
          },
          {
            value: "dropoff",
            title: "Airport Drop-off",
            hint: "We pick you up and take you to the airport.",
            icon: (
              <svg className="w-5 h-5 -scale-y-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5z" />
              </svg>
            ),
            priceLabel: priceSummary.basePrice && !state.roundTrip
              ? formatCurrency(priceSummary.basePrice)
              : priceSummary.basePrice && state.roundTrip
                ? formatCurrency(priceSummary.basePrice / 2)
                : null,
          },
          {
            value: "round-trip",
            title: "Round Trip",
            hint: "Both legs — arrival pickup AND return drop-off.",
            icon: (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            ),
            priceLabel: priceSummary.basePrice
              ? state.roundTrip
                ? formatCurrency(priceSummary.basePrice)
                : formatCurrency(priceSummary.basePrice * 2)
              : null,
          },
        ];

        // Field-label adaptation by trip type
        const addressLabel =
          tripType === "round-trip"
            ? "Your hotel or address"
            : tripType === "pickup"
              ? "Where are we taking you?"
              : "Where are we picking you up?";
        const addressPlaceholder =
          tripType === "round-trip"
            ? "Hotel for your whole stay (e.g. Disney's Grand Californian)"
            : "Hotel, resort, or street address";
        const flightTimeLabel =
          tripType === "round-trip"
            ? "Arrival flight time"
            : tripType === "pickup"
              ? "Flight arrival time"
              : "Flight departure time";
        const flightTimeHint =
          tripType === "round-trip"
            ? "When you arrive — we track delays automatically."
            : tripType === "pickup"
              ? "We track flight delays automatically and adjust pickup."
              : "We'll plan pickup so you arrive comfortably before departure.";

        return (
          <div className="space-y-6">
            {/* 1. Trip type — one decision at the top */}
            <div>
              <span className={labelClass}>What do you need? <RequiredMark /></span>
              <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Airport service type">
                {tripOptions.map((option, idx) => {
                  const selected = tripType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      ref={idx === 0 ? (el) => { firstFieldRef.current = el; } : undefined}
                      onClick={() => setTripType(option.value)}
                      className={`relative flex flex-col items-start gap-3 text-left p-4 rounded-2xl border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                        selected
                          ? "border-gold bg-gold/5 shadow-sm"
                          : "border-border bg-white hover:border-ink/40"
                      }`}
                    >
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          selected ? "bg-gold text-ink" : "bg-cream text-ink/70"
                        }`}
                      >
                        {option.icon}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">{option.title}</span>
                        <span className="block text-xs text-muted mt-0.5 leading-snug">{option.hint}</span>
                      </div>
                      {option.priceLabel && (
                        <span
                          className={`mt-1 font-display text-sm font-semibold tabular-nums ${
                            selected ? "text-ink" : "text-muted"
                          }`}
                        >
                          {option.priceLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Airport */}
            <div>
              <label htmlFor="airport" className={labelClass}>Airport <RequiredMark /></label>
              <select
                id="airport"
                value={state.airport}
                onChange={(e) => handleField("airport", e.target.value)}
                className={inputBase}
              >
                {AIRPORT_OPTIONS.map((code) => (
                  <option key={code} value={code}>{airportDisplayName(code)}</option>
                ))}
              </select>
            </div>

            {/* 3. Hotel / non-airport address — Google Places autocomplete
                so customers pick a real, validated address. Place ID is
                captured for future driver-routing use. */}
            <GoogleAddressAutocomplete
              id="airport-other-address"
              label={addressLabel}
              value={state.otherAddress}
              placeId={state.otherAddressPlaceId}
              placeholder={addressPlaceholder}
              required
              onChange={(picked) => {
                setState((s) => ({
                  ...s,
                  otherAddress: picked.formattedAddress || picked.name || "",
                  otherAddressPlaceId: picked.placeId,
                }));
              }}
            />

            {/* 4. Flight info — airline + flight number (optional helpful info) */}
            <div className={fieldGroup}>
              <div>
                <label htmlFor="airline" className={labelClass}>
                  Airline{tripType === "round-trip" && <span className="font-normal text-muted ml-1">(arrival)</span>}
                </label>
                <input
                  id="airline"
                  value={state.airline}
                  onChange={(e) => handleField("airline", e.target.value)}
                  placeholder="e.g. United, Delta, Southwest"
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="flight-number" className={labelClass}>
                  Flight number{tripType === "round-trip" && <span className="font-normal text-muted ml-1">(arrival)</span>}
                </label>
                <input
                  id="flight-number"
                  value={state.flightNumber}
                  onChange={(e) => handleField("flightNumber", e.target.value)}
                  placeholder="e.g. AA1234"
                  inputMode="text"
                  className={inputBase}
                />
              </div>
            </div>

            {/* 5. Primary flight time */}
            <div>
              <label htmlFor="flight-time" className={labelClass}>
                {flightTimeLabel} <RequiredMark />
              </label>
              <input
                id="flight-time"
                type="datetime-local"
                min={minDateTime}
                value={state.flightTime}
                onChange={(e) => handleField("flightTime", e.target.value)}
                className={inputBase}
              />
              <p className="mt-2 text-xs text-muted">{flightTimeHint}</p>
            </div>

            {/* 6. Return flight time — round trip only */}
            {tripType === "round-trip" && (
              <div>
                <label htmlFor="return-flight-time" className={labelClass}>
                  Return departure time <RequiredMark />
                </label>
                <input
                  id="return-flight-time"
                  type="datetime-local"
                  min={state.flightTime || minDateTime}
                  value={state.returnFlightTime}
                  onChange={(e) => handleField("returnFlightTime", e.target.value)}
                  className={inputBase}
                />
                <p className="mt-2 text-xs text-muted">
                  When you fly home — we&apos;ll pick you up and take you back to the airport.
                  Add your return flight number in the notes step if you&apos;d like.
                </p>
              </div>
            )}

            {/* 7. Meet & greet — only relevant when we're picking you up at the airport */}
            {(tripType === "pickup" || tripType === "round-trip") && (
              <ToggleRow
                id="meet-greet"
                label="Meet & greet"
                hint="Driver waits inside the terminal with a sign (+$30). Recommended for international arrivals and families."
                checked={state.meetAndGreet}
                onChange={(v) => handleField("meetAndGreet", v)}
              />
            )}
          </div>
        );
      })()}

      {state.service === "point-to-point" && (() => {
        const passengerCount = passengersFromGroup(state.passengerGroup);
        const eligibleVehicles = vehiclesForPassengerCount(passengerCount);
        return (
          <div className="space-y-6">
            {/* How many passengers — surfaced on Step 2 because it directly
                affects the live quote and which vehicles are eligible. Mirrors
                the same state.passengerGroup that Step 3 also edits. */}
            <div>
              <span className={labelClass}>How many passengers? <RequiredMark /></span>
              <div
                className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2"
                role="radiogroup"
                aria-label="Passenger group"
              >
                {PASSENGER_GROUPS.map((option) => {
                  const selected = state.passengerGroup === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleField("passengerGroup", option.value)}
                      className={`flex flex-col items-center justify-center px-2 py-3 min-h-[60px] rounded-xl border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                        selected
                          ? "border-gold bg-gold/10 text-ink"
                          : "border-border bg-white text-muted hover:border-ink/40"
                      }`}
                    >
                      <span className={`text-sm font-semibold leading-tight ${selected ? "text-ink" : "text-ink/85"}`}>
                        {option.label.replace(" passengers", "")}
                      </span>
                      <span className="mt-0.5 text-[10px] font-normal leading-tight text-muted">
                        passengers
                      </span>
                    </button>
                  );
                })}
              </div>
              {state.passengerGroup === "15+" && (
                <p className="mt-2 text-xs text-sunset" role="alert">
                  Groups of 15+ are quoted manually — finish the form and we&apos;ll reply with a multi-vehicle quote.
                </p>
              )}
            </div>


            <div className="grid gap-4">
              <div>
                <GoogleAddressAutocomplete
                  id="pickup-address-p2p"
                  label="Pickup address"
                  value={state.pickupAddress}
                  placeId={state.pickupPlaceId}
                  required
                  placeholder="Start typing — we'll only show locations within 20 miles of our home base."
                  inputRef={(el) => { firstFieldRef.current = el; }}
                  onChange={(picked) => {
                    setState((s) => ({
                      ...s,
                      pickupAddress: picked.formattedAddress || picked.name || "",
                      pickupPlaceId: picked.placeId,
                    }));
                  }}
                />
                {quote.kind === "error" && (quote.offending === "pickup" || quote.offending === "both") && (
                  <p className="mt-2 text-xs text-red-700" role="alert">{quote.message}</p>
                )}
              </div>
              <div>
                <GoogleAddressAutocomplete
                  id="dropoff-address-p2p"
                  label="Drop-off address"
                  value={state.dropoffAddress}
                  placeId={state.dropoffPlaceId}
                  required
                  placeholder="Destination — must also be within 20 miles of our home base."
                  onChange={(picked) => {
                    setState((s) => ({
                      ...s,
                      dropoffAddress: picked.formattedAddress || picked.name || "",
                      dropoffPlaceId: picked.placeId,
                    }));
                  }}
                />
                {quote.kind === "error" && (quote.offending === "dropoff" || quote.offending === "both") && (
                  <p className="mt-2 text-xs text-red-700" role="alert">{quote.message}</p>
                )}
              </div>
            </div>
            {quote.kind === "error" && (quote.offending === "pickup" || quote.offending === "dropoff" || quote.offending === "both") && (
              <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <p>{quote.message}</p>
                <a
                  href={SITE_CONTACT.phoneHref}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Call {SITE_CONTACT.phoneDisplay}
                </a>
              </div>
            )}

            <VehicleSelector
              label="Vehicle"
              description="Choose the vehicle for this trip."
              vehicles={eligibleVehicles}
              selectedId={state.vehicleId}
              onSelect={(vehicleId) => handleField("vehicleId", vehicleId)}
            />

            <div className={fieldGroup}>
              <div>
                <label htmlFor="pickup-time-p2p" className={labelClass}>Pickup date and time <RequiredMark /></label>
                <input
                  id="pickup-time-p2p"
                  type="datetime-local"
                  min={minDateTime}
                  value={state.pickupDateTime}
                  onChange={(e) => handleField("pickupDateTime", e.target.value)}
                  className={inputBase}
                />
              </div>
              <ToggleRow
                id="extra-stop"
                label="Add an extra stop"
                hint="Quick errand or pickup along the way (+$20)."
                checked={state.extraStop}
                onChange={(v) => handleField("extraStop", v)}
              />
            </div>

            {state.extraStop && (
              <div>
                <label htmlFor="extra-stop-details" className={labelClass}>Extra stop details</label>
                <input
                  id="extra-stop-details"
                  value={state.extraStopDetails}
                  onChange={(e) => handleField("extraStopDetails", e.target.value)}
                  placeholder="Address or instructions"
                  className={inputBase}
                />
              </div>
            )}

          </div>
        );
      })()}

      {state.service === "hourly-charter" && (
        <div className="space-y-6">
          <div className={fieldGroup}>
            {/* Pickup address — Google Places autocomplete so customers
                pick a real venue/hotel. Place ID is captured for driver routing. */}
            <GoogleAddressAutocomplete
              id="pickup-address-charter"
              label="Pickup address"
              value={state.pickupAddress}
              placeId={state.pickupPlaceId}
              placeholder="Hotel, event venue, or address"
              required
              inputRef={(el) => { firstFieldRef.current = el; }}
              onChange={(picked) => {
                setState((s) => ({
                  ...s,
                  pickupAddress: picked.formattedAddress || picked.name || "",
                  pickupPlaceId: picked.placeId,
                }));
              }}
            />
            <div>
              <label htmlFor="pickup-time-charter" className={labelClass}>Pickup date and time <RequiredMark /></label>
              <input
                id="pickup-time-charter"
                type="datetime-local"
                min={minDateTime}
                value={state.pickupDateTime}
                onChange={(e) => handleField("pickupDateTime", e.target.value)}
                className={inputBase}
              />
            </div>
          </div>

          <div className={fieldGroup}>
            <div>
              <span className={labelClass}>Hours <RequiredMark /></span>
              <NumberStepper
                value={state.hours}
                min={4}
                max={12}
                ariaLabel="Number of hours"
                onChange={(v) => handleField("hours", v)}
              />
              <p className="mt-2 text-xs text-muted">4-hour minimum. Longer days fine — we’ll plan stops with you.</p>
              <p className="mt-2 text-xs text-muted">
                {(() => {
                  const hourlyRate = HOURLY_RATES[state.passengerGroup as keyof typeof HOURLY_RATES] ?? 0;
                  return `$${hourlyRate}/hr × ${state.hours} hours = ${formatCurrency(
                    hourlyRate * state.hours
                  )}`;
                })()}
              </p>
            </div>
            <div>
              <label htmlFor="planned-stops" className={labelClass}>Planned stops or notes</label>
              <input
                id="planned-stops"
                value={state.plannedStops}
                onChange={(e) => handleField("plannedStops", e.target.value)}
                placeholder="e.g. Disneyland, beach, dinner reservation"
                className={inputBase}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-cream/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Hourly rates</p>
            <ul className="mt-3 grid gap-1.5 text-sm text-ink sm:grid-cols-2">
              {Object.entries(HOURLY_RATES).map(([group, rate]) => (
                <li key={group} className="flex justify-between gap-3">
                  <span>{group} passengers</span>
                  <span className="font-medium tabular-nums">{formatCurrency(rate)}/hr</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );

  const Step3 = (
    <>
      <StepHeader
        eyebrow="Step 3 of 6"
        title="Who’s riding?"
        subtitle="Helps us match the right vehicle and seats."
      />

      <div>
        <span className={labelClass}>Passenger group <RequiredMark /></span>
        <div
          className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2"
          role="radiogroup"
          aria-label="Passenger group"
        >
          {PASSENGER_GROUPS.map((option, idx) => {
            const selected = state.passengerGroup === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                ref={idx === 0 ? (el) => { firstFieldRef.current = el; } : undefined}
                onClick={() => handleField("passengerGroup", option.value)}
                className={`flex flex-col items-center justify-center px-2 py-3 min-h-[64px] rounded-xl border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  selected
                    ? "border-gold bg-gold/10 text-ink"
                    : "border-border bg-white text-muted hover:border-ink/40"
                }`}
              >
                <span className={`text-sm font-semibold leading-tight ${selected ? "text-ink" : "text-ink/85"}`}>
                  {option.label.replace(" passengers", "")}
                </span>
                <span className="mt-0.5 text-[10px] font-normal leading-tight text-muted">
                  passengers
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {shouldShowGroupQuoteMessage(state.passengerGroup) && (
        <div className="rounded-2xl border border-sunset/20 bg-sunset/10 p-4 text-sm text-ink">
          <p className="font-semibold">Groups over 14 passengers</p>
          <p className="mt-1 text-muted">
            Call <a href={SITE_CONTACT.phoneHref} className="text-gold underline">{SITE_CONTACT.phoneDisplay}</a> or finish the form and we’ll quote a multi-vehicle setup.
          </p>
        </div>
      )}

      {state.service !== "point-to-point" && (
        <VehicleSelector
          label="Vehicle"
          description="Choose the vehicle that best fits your group size and luggage."
          vehicles={vehiclesForPassengerCount(passengersFromGroup(state.passengerGroup))}
          selectedId={state.vehicleId}
          onSelect={(vehicleId) => handleField("vehicleId", vehicleId)}
        />
      )}

      <div className={fieldGroup}>
        <div>
          <span className={labelClass}>Luggage</span>
          <NumberStepper
            value={state.luggageCount}
            min={0}
            max={20}
            ariaLabel="Luggage count"
            onChange={(v) => handleField("luggageCount", v)}
          />
          <p className="mt-2 text-xs text-muted">Bags, suitcases, strollers — give us a ballpark.</p>
        </div>
      </div>

      <ChildSeatSelector
        selected={state.childSeats}
        onChange={(next) => handleField("childSeats", next)}
      />
    </>
  );

  const Step4 = (
    <>
      <StepHeader
        eyebrow="Step 4 of 6"
        title="Your contact info"
        subtitle="So we can reach you with confirmation and pickup details."
      />

      <div className={fieldGroup}>
        <div>
          <label htmlFor="firstName" className={labelClass}>First name <RequiredMark /></label>
          <input
            id="firstName"
            value={state.firstName}
            onChange={(e) => handleField("firstName", e.target.value)}
            autoComplete="given-name"
            className={inputBase}
            ref={(el) => { firstFieldRef.current = el; }}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last name <RequiredMark /></label>
          <input
            id="lastName"
            value={state.lastName}
            onChange={(e) => handleField("lastName", e.target.value)}
            autoComplete="family-name"
            className={inputBase}
          />
        </div>
      </div>

      <div className={fieldGroup}>
        <div>
          <label htmlFor="email" className={labelClass}>Email <RequiredMark /></label>
          <input
            id="email"
            type="email"
            value={state.email}
            onChange={(e) => handleField("email", e.target.value)}
            autoComplete="email"
            inputMode="email"
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone <RequiredMark /></label>
          <input
            id="phone"
            type="tel"
            value={state.phone}
            onChange={(e) => handleField("phone", e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+1 (714) 555-0100"
            className={inputBase}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Anything else we should know?</label>
        <textarea
          id="notes"
          value={state.notes}
          onChange={(e) => handleField("notes", e.target.value)}
          rows={4}
          placeholder="Pickup instructions, hotel name, mobility needs, special requests…"
          className={`${inputBase} resize-y min-h-[120px]`}
        />
      </div>
    </>
  );

  const Step5 = (
    <>
      <StepHeader
        eyebrow="Step 5 of 6"
        title="Review your booking"
        subtitle="Take a quick look. You can jump back to any step from the progress bar above."
      />

      <div className="grid gap-6">
        <ReviewBlock
          title="Service"
          onEdit={() => goToStep(1)}
          rows={[{ label: "Type", value: state.service ? SERVICE_LABELS[state.service] : "—" }]}
        />

        {state.service === "airport-transfer" && (
          <ReviewBlock
            title="Trip"
            onEdit={() => goToStep(2)}
            rows={[
              {
                label: "Service",
                value: state.roundTrip
                  ? "Round trip (pickup + drop-off)"
                  : state.airportDirection === "from-airport"
                    ? "Airport pickup (arrival)"
                    : "Airport drop-off (departure)",
              },
              { label: "Airport", value: airportDisplayName(state.airport) },
              {
                label: state.roundTrip
                  ? "Hotel / address"
                  : state.airportDirection === "from-airport"
                    ? "Drop-off"
                    : "Pickup",
                value: state.otherAddress || "—",
              },
              { label: "Flight", value: `${state.airline || "—"} · ${state.flightNumber || "—"}` },
              {
                label: state.roundTrip
                  ? "Arrival"
                  : state.airportDirection === "from-airport"
                    ? "Arrival"
                    : "Departure",
                value: formatHumanDateTime(state.flightTime),
              },
              ...(state.roundTrip
                ? [{ label: "Return departure", value: formatHumanDateTime(state.returnFlightTime) }]
                : []),
              ...(state.airportDirection === "from-airport" || state.roundTrip
                ? [{ label: "Meet & greet", value: state.meetAndGreet ? "Yes (+$30)" : "No" }]
                : []),
            ]}
          />
        )}
        {state.service === "point-to-point" && (
          <ReviewBlock
            title="Trip"
            onEdit={() => goToStep(2)}
            rows={[
              { label: "Pickup", value: state.pickupAddress || "—" },
              { label: "Drop-off", value: state.dropoffAddress || "—" },
              { label: "Pickup time", value: formatHumanDateTime(state.pickupDateTime) },
              { label: "Extra stop", value: state.extraStop ? state.extraStopDetails || "Yes" : "No" },
            ]}
          />
        )}
        {state.service === "hourly-charter" && (
          <ReviewBlock
            title="Trip"
            onEdit={() => goToStep(2)}
            rows={[
              { label: "Pickup", value: state.pickupAddress || "—" },
              { label: "Pickup time", value: formatHumanDateTime(state.pickupDateTime) },
              { label: "Hours", value: `${state.hours} hours` },
              { label: "Planned stops", value: state.plannedStops || "—" },
            ]}
          />
        )}

        <ReviewBlock
          title="Passengers"
          onEdit={() => goToStep(3)}
          rows={[
            { label: "Group", value: PASSENGER_GROUPS.find((p) => p.value === state.passengerGroup)?.label ?? "—" },
            { label: "Vehicle", value: VEHICLES.find((v) => v.id === state.vehicleId)?.name ?? "Standard" },
            { label: "Luggage", value: String(state.luggageCount) },
            {
              label: "Child seats",
              value: state.childSeats.length
                ? state.childSeats.map((s) => CHILD_SEAT_OPTIONS.find((o) => o.value === s)?.label ?? s).join(", ")
                : "None",
            },
          ]}
        />

        <ReviewBlock
          title="Contact"
          onEdit={() => goToStep(4)}
          rows={[
            { label: "Name", value: `${state.firstName} ${state.lastName}`.trim() || "—" },
            { label: "Email", value: state.email || "—" },
            { label: "Phone", value: state.phone || "—" },
            ...(state.notes ? [{ label: "Notes", value: state.notes }] : []),
          ]}
        />

        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-3">
            Gratuity
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Gratuity amount">
            {GRATUITY_OPTIONS.map((option) => {
              const selected = state.gratuity === option.value;
              // Live dollar preview for each tier — much clearer than just "20%".
              const subtotal =
                (priceSummary.basePrice ?? 0) + priceSummary.addOns;
              const previewCents =
                option.value === "cash"
                  ? null
                  : Math.round(subtotal * (Number(option.value) / 100) * 100);
              const previewLabel =
                option.value === "cash"
                  ? "Paid to driver"
                  : previewCents !== null && subtotal > 0
                    ? formatCurrency(previewCents / 100)
                    : null;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleField("gratuity", option.value)}
                  className={`relative flex flex-col items-center justify-center px-3 py-3 min-h-[68px] rounded-xl border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                    selected
                      ? "border-gold bg-gold/10"
                      : "border-border bg-white hover:border-ink/40"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      selected ? "text-ink" : "text-ink/85"
                    }`}
                  >
                    {option.label}
                  </span>
                  {previewLabel && (
                    <span
                      className={`mt-1 text-xs tabular-nums ${
                        selected ? "text-ink/70" : "text-muted"
                      }`}
                    >
                      {previewLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">
            Gratuity is included in your estimated total above (except &ldquo;cash at pickup&rdquo;, which you hand to the driver).
          </p>
        </div>
      </div>
    </>
  );

  const Step6 = (
    <>
      <StepHeader
        eyebrow="Last step"
        title="Confirm and pay"
        subtitle={
          priceSummary.total !== null
            ? "Review your booking, then continue to secure checkout. Card is charged in full at booking; full refund if you cancel up to 24 hours before pickup."
            : "Group sizes 15+ are quoted manually — we'll receive your details and reply with a quote, no card required at this step."
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.08)]">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Service</p>
              <p className="mt-1 font-display text-xl font-semibold text-ink leading-tight">
                {state.service ? SERVICE_LABELS[state.service] : "—"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {priceSummary.total !== null ? "Total" : "Estimated total"}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={priceSummary.total ?? "pending-step6"}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums"
                >
                  {priceSummary.total !== null ? formatCurrency(priceSummary.total) : "Quote pending"}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Key trip details — gives the customer a moment of certainty
              before they leave the page for Stripe. */}
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <SummaryRow
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path strokeLinecap="round" d="M3 9h18M8 3v4M16 3v4" />
                </svg>
              }
              label="Pickup"
              value={
                state.service === "airport-transfer"
                  ? formatHumanDateTime(state.flightTime)
                  : formatHumanDateTime(state.pickupDateTime)
              }
            />
            <SummaryRow
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Passengers"
              value={
                PASSENGER_GROUPS.find((p) => p.value === state.passengerGroup)?.label ?? "—"
              }
            />
            {priceSummary.routeLabel && (
              <SummaryRow
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                label="Route"
                value={priceSummary.routeLabel}
                wide
              />
            )}
            <SummaryRow
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v3m-2 0h4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
              label="Contact"
              value={`${state.firstName} ${state.lastName} · ${state.email}`}
              wide
            />
          </dl>

          <button
            type="button"
            onClick={() => goToStep(5)}
            className="mt-4 inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit details
          </button>
        </div>

        {submitStatus === "success" ? (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900"
            role="status"
          >
            <p className="font-semibold">Quote request received.</p>
            <p className="mt-1 text-green-800/90">
              Thank you, {state.firstName}! We&apos;ll reply shortly to <span className="font-medium">{state.email}</span> with
              a custom quote for your group.
            </p>
            <p className="mt-3 text-xs text-green-800/80">
              Need to reach us right now? Call{" "}
              <a className="underline" href={SITE_CONTACT.phoneHref}>{SITE_CONTACT.phoneDisplay}</a>.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.button
              type="submit"
              disabled={submitStatus === "sending"}
              whileTap={submitStatus === "idle" || submitStatus === "error" ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className={`${buttonPrimary} w-full sm:w-auto`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {submitStatus === "sending" ? (
                  <motion.span
                    key="sending"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {priceSummary.total !== null ? "Redirecting to checkout…" : "Sending…"}
                  </motion.span>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-2"
                  >
                    {priceSummary.total !== null
                      ? `Continue to secure checkout · ${formatCurrency(priceSummary.total)}`
                      : "Request a quote"}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            {priceSummary.total !== null && (
              <p className="text-xs text-muted leading-relaxed inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-muted/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Secure payment by Stripe. Full refund if cancelled at least 24 hours before pickup.
              </p>
            )}
            <AnimatePresence>
              {submitStatus === "error" && (
                <motion.p
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="rounded-2xl border border-sunset/20 bg-sunset/10 p-4 text-sm text-ink"
                  role="alert"
                >
                  {error || "Something went wrong. Please try again, or"} email{" "}
                  <a className="underline" href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a> or call{" "}
                  <a className="underline" href={SITE_CONTACT.phoneHref}>{SITE_CONTACT.phoneDisplay}</a>.
                </motion.p>
              )}
            </AnimatePresence>
            <p className="text-xs text-muted leading-relaxed">
              By continuing you agree to TNT Tours&apos; terms. Your card is processed securely by Stripe; we never store
              card details.
            </p>
          </>
        )}
      </form>
    </>
  );

  /* ── Layout ───────────────────────────────────────────── */

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-12 pb-32 sm:pb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          Transportation booking
        </span>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ink leading-tight">
          Book your ride in six quick steps.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
          Airport transfers, point-to-point trips, and hourly charters across Anaheim, Orange County, and Los Angeles.
        </p>
      </div>

      <div ref={stepHeaderRef} />

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-border bg-white shadow-sm p-5 sm:p-8">
          {ProgressBar}

          <AnimatePresence>
            {error && (
              <motion.div
                key={error}
                role="alert"
                aria-live="polite"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, x: 0 }}
                animate={
                  reducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, x: [0, -5, 5, -3, 3, 0] }
                }
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mb-5 flex items-start gap-3 rounded-xl border border-sunset/30 bg-sunset/10 p-4 text-sm text-ink"
              >
                <svg className="w-5 h-5 shrink-0 text-sunset mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={stepDirection} initial={false}>
              <motion.div
                key={step}
                custom={stepDirection}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: stepDirection * 28 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: stepDirection * -28 }}
                transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              >
                {step === 1 && Step1}
                {step === 2 && Step2}
                {step === 3 && Step3}
                {step === 4 && Step4}
                {step === 5 && Step5}
                {step === 6 && Step6}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop / inline navigation (hide on mobile — sticky bottom takes over) */}
          {step < TOTAL_STEPS && (
            <div className="mt-10 hidden sm:flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className={`${buttonSecondary} ${step === 1 ? "invisible" : ""}`}
              >
                ← Back
              </button>
              <button type="button" onClick={handleNext} className={buttonPrimary}>
                Continue →
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {step < TOTAL_STEPS && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-16px_30px_-18px_rgba(12,11,10,0.18)] lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {priceSummary.routeLabel && (
                    <p className="truncate text-xs text-muted">{priceSummary.routeLabel}</p>
                  )}
                  <p className="truncate text-sm font-semibold text-ink">
                    {priceSummary.total !== null ? formatCurrency(priceSummary.total) : "Quote pending"}
                  </p>
                </div>
                <button type="button" onClick={handleNext} className={`${buttonPrimary} min-w-[150px] py-2`}>
                  Continue →
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-28 space-y-4">
            {PriceSummary}
            <div className="rounded-2xl border border-border bg-cream p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Need help?</p>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Talk to a real human — we answer fast on weekdays.
              </p>
              <a href={SITE_CONTACT.phoneHref} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z" />
                </svg>
                {SITE_CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky bottom: total + continue */}
      {step < TOTAL_STEPS && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/95 backdrop-blur-md px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_20px_rgba(12,11,10,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Estimated total</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={priceSummary.total ?? "pending-mobile"}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -3 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="font-display text-lg font-semibold text-ink tabular-nums truncate"
                >
                  {priceSummary.total !== null ? formatCurrency(priceSummary.total) : "—"}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex gap-2 shrink-0">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-3 rounded-full border border-border bg-white text-sm font-semibold text-ink min-h-[44px] active:scale-[0.96] transition-transform"
                  aria-label="Go back to previous step"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-ink text-white text-sm font-semibold min-h-[44px] active:scale-[0.96] transition-transform"
              >
                {step === 5 ? "Confirm" : "Continue"}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Sub components ──────────────────────────────────────── */

interface ToggleRowProps {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ id, label, hint, checked, onChange }: ToggleRowProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition min-h-[60px] ${
        checked ? "border-gold bg-gold/5" : "border-border bg-white hover:border-ink/40"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border text-gold focus:ring-gold"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-muted mt-0.5">{hint}</span>}
      </span>
    </label>
  );
}

interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}

function NumberStepper({ value, min, max, onChange, ariaLabel }: NumberStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-white p-1" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-ink disabled:text-muted/50 hover:bg-cream cursor-pointer disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
        className="w-16 text-center font-semibold tabular-nums bg-transparent outline-none text-ink"
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase"
        className="w-10 h-10 flex items-center justify-center rounded-lg text-ink disabled:text-muted/50 hover:bg-cream cursor-pointer disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

interface ReviewBlockProps {
  title: string;
  rows: { label: string; value: string }[];
  onEdit: () => void;
}

function ReviewBlock({ title, rows, onEdit }: ReviewBlockProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-ink underline underline-offset-2 hover:text-gold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded"
        >
          Edit
        </button>
      </div>
      <dl className="grid gap-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-muted">{row.label}</dt>
            <dd className="text-ink text-right max-w-[60%] break-words">{row.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Compact icon + label/value row used in the final confirmation card.
 * `wide` makes the row span both columns of the grid.
 */
function SummaryRow({
  icon,
  label,
  value,
  wide,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 ${wide ? "sm:col-span-2" : ""}`}
    >
      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/20">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {label}
        </dt>
        <dd className="mt-0.5 font-sans text-sm font-medium text-ink leading-snug break-words">
          {value || "—"}
        </dd>
      </div>
    </div>
  );
}
