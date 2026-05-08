"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
import AddressAutocomplete from "./AddressAutocomplete";

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
  meetAndGreet: boolean;
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
  meetAndGreet: false,
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
  <span
    aria-hidden="true"
    className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink shadow-sm"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  </span>
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

function isValidPhone(value: string) {
  // 7+ digits anywhere — keeps validation forgiving for international.
  return value.replace(/\D/g, "").length >= 7;
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
    const raw = searchParams.get("service");
    if (raw === "disneyland-transportation") {
      return { service: "point-to-point", step: 2 };
    }
    if (isBookableCode(raw)) {
      return { service: raw, step: 2 };
    }
    return { service: null, step: 1 };
  }, [searchParams]);

  const [step, setStep] = useState(initialFromUrl.step);
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
        routeLabel: pricing.routeMatch ?? "Custom route — quote follows",
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
  }, [state]);

  const handleField = <K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    setState((current) => ({ ...current, [field]: value }));
  };

  const goToStep = (target: number) => {
    setError("");
    if (target < 1 || target > TOTAL_STEPS) return;
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
      }
      if (state.service === "point-to-point") {
        if (!state.pickupAddress || !state.dropoffAddress || !state.pickupDateTime) {
          return "Please add pickup, drop-off, and pickup date/time.";
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
      const direction =
        state.airportDirection === "from-airport" ? "Pickup at airport" : "Drop-off at airport";
      lines.push(`Direction: ${direction}`);
      lines.push(`Airport: ${airportDisplayName(state.airport)}`);
      lines.push(
        state.airportDirection === "from-airport"
          ? `Drop-off address: ${state.otherAddress}`
          : `Pickup address: ${state.otherAddress}`,
      );
      lines.push(`Airline: ${state.airline || "Not provided"}`);
      lines.push(`Flight #: ${state.flightNumber || "Not provided"}`);
      lines.push(`Flight time: ${formatHumanDateTime(state.flightTime)}`);
      lines.push(`Round trip: ${state.roundTrip ? "Yes" : "No"}`);
      lines.push(`Meet & greet: ${state.meetAndGreet ? "Yes" : "No"}`);
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
        <p className="mt-1 text-sm text-muted">{priceSummary.routeLabel}</p>
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
        <span className="font-display text-2xl font-semibold text-ink tabular-nums">
          {priceSummary.total !== null ? formatCurrency(priceSummary.total) : "—"}
        </span>
      </div>

      {priceSummary.pending && (
        <p className="mt-3 rounded-xl border border-sunset/20 bg-sunset/10 px-3 py-2 text-xs text-ink">
          Custom or large group — we’ll confirm the final quote within hours.
        </p>
      )}

      <p className="mt-4 text-xs text-muted leading-relaxed">
        No payment yet. We confirm your reservation by phone/email and bill at pickup or via invoice.
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
        eyebrow="Step 1 of 5"
        title="What kind of ride do you need?"
        subtitle="Pick the option that matches your trip — we’ll only ask the questions that apply."
      />
      {ServiceCards}
    </>
  );

  const Step2 = (
    <>
      <StepHeader
        eyebrow="Step 2 of 5"
        title="Trip details"
        subtitle="The fields change with the service you picked. Required fields are marked with an asterisk."
      />

      {state.service === "airport-transfer" && (
        <div className="space-y-6">
          {/* 1. Direction */}
          <div>
            <span className={labelClass}>Which way are you going? <RequiredMark /></span>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Airport trip direction">
              {[
                {
                  value: "from-airport" as const,
                  title: "Pick me up at the airport",
                  hint: "Arriving — drop me at hotel / address",
                },
                {
                  value: "to-airport" as const,
                  title: "Drop me at the airport",
                  hint: "Departing — pick me up at hotel / address",
                },
              ].map((option, idx) => {
                const selected = state.airportDirection === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    ref={idx === 0 ? (el) => { firstFieldRef.current = el; } : undefined}
                    onClick={() => handleField("airportDirection", option.value)}
                    className={`text-left p-4 rounded-2xl border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                      selected
                        ? "border-gold bg-gold/5"
                        : "border-border bg-white hover:border-ink/40"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-ink">{option.title}</span>
                    <span className="block text-xs text-muted mt-1">{option.hint}</span>
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

          {/* 3. The non-airport address */}
          <AddressAutocomplete
            id="airport-other-address"
            label={state.airportDirection === "from-airport" ? "Drop-off address" : "Pickup address"}
            value={state.otherAddress}
            onChange={(v) => handleField("otherAddress", v)}
            placeholder="Hotel, resort, or street address (e.g. Disney's Grand Californian)"
            required
            excludeCategories={["airport"]}
          />

          {/* 4. Trip options */}
          <fieldset className="rounded-2xl border border-border bg-cream p-4 grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Trip options</legend>
            <ToggleRow
              id="round-trip"
              label="Round trip"
              hint="Quote both legs (return ride included)."
              checked={state.roundTrip}
              onChange={(v) => handleField("roundTrip", v)}
            />
            <ToggleRow
              id="meet-greet"
              label="Meet & greet"
              hint="Driver waits inside with a sign (+$30)."
              checked={state.meetAndGreet}
              onChange={(v) => handleField("meetAndGreet", v)}
            />
          </fieldset>

          {/* 5. Flight info */}
          <div className={fieldGroup}>
            <div>
              <label htmlFor="airline" className={labelClass}>Airline</label>
              <input
                id="airline"
                value={state.airline}
                onChange={(e) => handleField("airline", e.target.value)}
                placeholder="e.g. United, Delta, Southwest"
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="flight-number" className={labelClass}>Flight number</label>
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

          <div>
            <label htmlFor="flight-time" className={labelClass}>
              {state.airportDirection === "from-airport" ? "Flight arrival time" : "Flight departure time"} <RequiredMark />
            </label>
            <input
              id="flight-time"
              type="datetime-local"
              min={minDateTime}
              value={state.flightTime}
              onChange={(e) => handleField("flightTime", e.target.value)}
              className={inputBase}
            />
            <p className="mt-2 text-xs text-muted">
              {state.airportDirection === "from-airport"
                ? "We track flight delays automatically and adjust pickup."
                : "We’ll plan pickup with airport timing in mind."}
            </p>
          </div>
        </div>
      )}

      {state.service === "point-to-point" && (
        <div className="space-y-6">
          <div className="grid gap-4">
            <AddressAutocomplete
              id="pickup-address-p2p"
              label="Pickup address"
              value={state.pickupAddress}
              onChange={(v) => handleField("pickupAddress", v)}
              placeholder="Hotel, resort, or street address"
              required
              inputRef={(el) => { firstFieldRef.current = el; }}
            />
            <AddressAutocomplete
              id="dropoff-address-p2p"
              label="Drop-off address"
              value={state.dropoffAddress}
              onChange={(v) => handleField("dropoffAddress", v)}
              placeholder="Airport, attraction, or venue"
              required
            />
          </div>

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

          <div className="rounded-2xl border border-border bg-cream/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Sample fixed routes</p>
            <ul className="mt-3 grid gap-1.5 text-sm text-ink sm:grid-cols-2">
              {Object.entries(POINT_TO_POINT_FIXED_ROUTES).map(([route, price]) => (
                <li key={route} className="flex justify-between gap-3">
                  <span>{route}</span>
                  <span className="font-medium tabular-nums">{formatCurrency(price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Outside these routes? Type the addresses and we’ll quote within hours.
            </p>
          </div>
        </div>
      )}

      {state.service === "hourly-charter" && (
        <div className="space-y-6">
          <div className={fieldGroup}>
            <AddressAutocomplete
              id="pickup-address-charter"
              label="Pickup address"
              value={state.pickupAddress}
              onChange={(v) => handleField("pickupAddress", v)}
              placeholder="Hotel, event venue, or address"
              required
              inputRef={(el) => { firstFieldRef.current = el; }}
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
        eyebrow="Step 3 of 5"
        title="Who’s riding?"
        subtitle="Helps us match the right vehicle and seats."
      />

      <div>
        <span className={labelClass}>Passenger group <RequiredMark /></span>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6" role="radiogroup" aria-label="Passenger group">
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
                className={`px-3 py-3 rounded-xl border-2 text-sm font-semibold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  selected
                    ? "border-gold bg-gold/10 text-ink"
                    : "border-border bg-white text-muted hover:border-ink/40"
                }`}
              >
                {option.label.replace(" passengers", "")}
                <span className="block text-[11px] font-normal mt-0.5 text-muted">passengers</span>
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

      <div className="rounded-2xl border border-border bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Child seats — free, on request</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CHILD_SEAT_OPTIONS.map((option) => {
            const checked = state.childSeats.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition min-h-[48px] ${
                  checked ? "border-gold bg-gold/5" : "border-border bg-white hover:border-ink/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...state.childSeats, option.value]
                      : state.childSeats.filter((s) => s !== option.value);
                    handleField("childSeats", next);
                  }}
                  className="h-4 w-4 rounded border-border text-gold focus:ring-gold"
                />
                <span className="text-sm font-medium text-ink">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );

  const Step4 = (
    <>
      <StepHeader
        eyebrow="Step 4 of 5"
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
        eyebrow="Step 5 of 5"
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
                label: "Direction",
                value: state.airportDirection === "from-airport" ? "Pickup at airport" : "Drop-off at airport",
              },
              { label: "Airport", value: airportDisplayName(state.airport) },
              {
                label: state.airportDirection === "from-airport" ? "Drop-off" : "Pickup",
                value: state.otherAddress || "—",
              },
              { label: "Flight", value: `${state.airline || "—"} · ${state.flightNumber || "—"}` },
              {
                label: state.airportDirection === "from-airport" ? "Arrival" : "Departure",
                value: formatHumanDateTime(state.flightTime),
              },
              { label: "Round trip", value: state.roundTrip ? "Yes" : "No" },
              { label: "Meet & greet", value: state.meetAndGreet ? "Yes" : "No" },
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-3">Gratuity</p>
          <div className="grid gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Gratuity amount">
            {GRATUITY_OPTIONS.map((option) => {
              const selected = state.gratuity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleField("gratuity", option.value)}
                  className={`px-3 py-3 rounded-xl border-2 text-sm font-semibold transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                    selected
                      ? "border-gold bg-gold/10 text-ink"
                      : "border-border bg-white text-muted hover:border-ink/40"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Gratuity is included in your estimated total above.</p>
        </div>
      </div>
    </>
  );

  const Step6 = (
    <>
      <StepHeader
        eyebrow="Last step"
        title="Confirm your booking request"
        subtitle="We’ll receive it instantly and reply by phone or email with confirmation. No card needed yet."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Service</p>
              <p className="mt-1 font-display text-xl font-semibold text-ink">
                {state.service ? SERVICE_LABELS[state.service] : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Estimated total</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums">
                {priceSummary.total !== null ? formatCurrency(priceSummary.total) : "Quote pending"}
              </p>
            </div>
          </div>
        </div>

        {submitStatus === "success" ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900" role="status">
            <p className="font-semibold">Booking request received.</p>
            <p className="mt-1 text-green-800/90">
              Thank you, {state.firstName}! We’ll reply shortly to <span className="font-medium">{state.email}</span> or call{" "}
              <span className="font-medium">{state.phone}</span> to confirm pickup details.
            </p>
            <p className="mt-3 text-xs text-green-800/80">
              Need to reach us right now? Call{" "}
              <a className="underline" href={SITE_CONTACT.phoneHref}>{SITE_CONTACT.phoneDisplay}</a>.
            </p>
          </div>
        ) : (
          <>
            <button
              type="submit"
              disabled={submitStatus === "sending"}
              className={`${buttonPrimary} w-full sm:w-auto`}
            >
              {submitStatus === "sending" ? "Sending…" : "Send booking request"}
              {submitStatus !== "sending" && (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              )}
            </button>
            {submitStatus === "error" && (
              <p className="rounded-2xl border border-sunset/20 bg-sunset/10 p-4 text-sm text-ink" role="alert">
                Something went wrong sending your request. Please email{" "}
                <a className="underline" href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a> or call{" "}
                <a className="underline" href={SITE_CONTACT.phoneHref}>{SITE_CONTACT.phoneDisplay}</a>.
              </p>
            )}
            <p className="text-xs text-muted leading-relaxed">
              By sending this request you agree to be contacted by TNT Tours about your booking. Your details are not
              shared with third parties.
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
          Book your ride in five quick steps.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
          Airport transfers, point-to-point trips, and hourly charters across Anaheim, Orange County, and Los Angeles.
        </p>
      </div>

      <div ref={stepHeaderRef} />

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-border bg-white shadow-sm p-5 sm:p-8">
          {ProgressBar}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex items-start gap-3 rounded-xl border border-sunset/30 bg-sunset/10 p-4 text-sm text-ink"
            >
              <svg className="w-5 h-5 shrink-0 text-sunset mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            {step === 1 && Step1}
            {step === 2 && Step2}
            {step === 3 && Step3}
            {step === 4 && Step4}
            {step === 5 && Step5}
            {step === 6 && Step6}
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
                {step === 5 ? "Continue to confirm" : step === 1 ? "Continue" : "Continue"}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
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
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/95 backdrop-blur px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Estimated total</p>
              <p className="font-display text-lg font-semibold text-ink tabular-nums">
                {priceSummary.total !== null ? formatCurrency(priceSummary.total) : "—"}
              </p>
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <button type="button" onClick={handleBack} className="px-4 py-3 rounded-full border border-border bg-white text-sm font-semibold text-ink min-h-[44px]" aria-label="Back">
                  ←
                </button>
              )}
              <button type="button" onClick={handleNext} className="px-5 py-3 rounded-full bg-ink text-white text-sm font-semibold min-h-[44px]">
                {step === 5 ? "Confirm" : "Continue"}
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
