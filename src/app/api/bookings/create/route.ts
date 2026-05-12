import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings, type BookingStatus } from "@/lib/booking/schema";
import { generateConfirmationCode } from "@/lib/booking/bookingCode";
import { getStripe, withTenantStripe } from "@/lib/booking/stripe";
import {
  BOOKABLE_SERVICE_CODES,
  SERVICE_LABELS,
  computeBookingPrice,
  type BookableServiceCode,
  type PricingInput,
} from "@/lib/booking/pricing";
import { getTenant } from "@/lib/tenant";

export const runtime = "nodejs";

interface CreateBookingPayload {
  service: BookableServiceCode;
  pickupAtIso: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  /**
   * The wizard's full state snapshot. We derive `PricingInput` fields from
   * this (so the server controls the math) AND we persist the whole thing
   * to `bookings.payload` for support / audit.
   */
  payload: Record<string, unknown> & {
    service?: BookableServiceCode;
    passengerGroup?: string;
    gratuity?: string;
    airport?: string;
    meetAndGreet?: boolean;
    roundTrip?: boolean;
    pickupAddress?: string;
    dropoffAddress?: string;
    extraStop?: boolean;
    hours?: number;
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isBookableService(value: unknown): value is BookableServiceCode {
  return typeof value === "string" && (BOOKABLE_SERVICE_CODES as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  // Short id we surface to the client so a user-reported failure can be
  // correlated with the matching line in Vercel's function logs.
  const diagnosticId = Math.random().toString(36).slice(2, 8);

  try {
    return await handleCreate(request, diagnosticId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[bookings/create ${diagnosticId}] unhandled error:`, err);
    return NextResponse.json(
      {
        error:
          "We couldn't start your booking. Please try again, or contact us if it keeps failing.",
        diagnosticId,
        // Surface message in non-prod so dev tab shows it; in prod it's omitted.
        ...(process.env.NODE_ENV !== "production" ? { detail: message } : {}),
      },
      { status: 500 }
    );
  }
}

async function handleCreate(request: Request, diagnosticId: string) {
  let body: CreateBookingPayload;
  try {
    body = (await request.json()) as CreateBookingPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { service, pickupAtIso, customer, payload } = body;
  const reject = (error: string, status: number) => {
    console.warn(`[bookings/create ${diagnosticId}] rejected: ${error}`);
    return NextResponse.json({ error, diagnosticId }, { status });
  };

  if (!isBookableService(service)) return reject("Unknown service", 400);
  if (!pickupAtIso || Number.isNaN(Date.parse(pickupAtIso))) {
    return reject("Pickup time is required", 400);
  }
  if (!customer?.firstName || !customer.lastName) {
    return reject("Customer name is required", 400);
  }
  if (!customer.email || !isValidEmail(customer.email)) {
    return reject("Valid customer email is required", 400);
  }
  if (!customer.phone || customer.phone.replace(/\D/g, "").length < 7) {
    return reject("Customer phone is required", 400);
  }
  if (!payload || typeof payload !== "object") {
    return reject("Booking payload is required", 400);
  }

  /* ── AUTHORITATIVE SERVER-SIDE PRICE ───────────────────────────────────
   *
   * Reconstruct the pricing input from the wizard payload and recompute.
   * The client never controls the total — DevTools or a malicious client
   * cannot lower the charge. The wizard's `priceSummary.total` is for
   * display only; this server computation is the source of truth.
   * ────────────────────────────────────────────────────────────────────── */
  const pricingInput: PricingInput = {
    service,
    passengerGroup: String(payload.passengerGroup ?? ""),
    gratuity: String(payload.gratuity ?? "0"),
    airport: typeof payload.airport === "string" ? payload.airport : undefined,
    meetAndGreet: Boolean(payload.meetAndGreet),
    roundTrip: Boolean(payload.roundTrip),
    pickupAddress: typeof payload.pickupAddress === "string" ? payload.pickupAddress : undefined,
    dropoffAddress: typeof payload.dropoffAddress === "string" ? payload.dropoffAddress : undefined,
    extraStop: Boolean(payload.extraStop),
    hours: typeof payload.hours === "number" ? payload.hours : undefined,
  };

  const priced = computeBookingPrice(pricingInput);
  if (priced.kind === "manual-quote") {
    return NextResponse.json(
      { error: `This booking needs a custom quote — ${priced.reason}` },
      { status: 400 }
    );
  }

  if (priced.totalCents < 200) {
    return NextResponse.json({ error: "Booking total is below minimum charge" }, { status: 400 });
  }

  const tenant = getTenant();
  const confirmationCode = generateConfirmationCode();
  const serviceLabel = SERVICE_LABELS[service];

  // Persist the pending booking BEFORE creating the Stripe session so we have
  // an internal record even if Stripe fails or the user closes the tab.
  const [created] = await db
    .insert(bookings)
    .values({
      tenantId: tenant.slug,
      confirmationCode,
      status: "pending" satisfies BookingStatus,
      serviceCode: service,
      serviceLabel,
      payload: payload as object,
      customerEmail: customer.email.toLowerCase().trim(),
      customerFirstName: customer.firstName.trim(),
      customerLastName: customer.lastName.trim(),
      customerPhone: customer.phone.trim(),
      pickupAt: new Date(pickupAtIso),
      subtotalCents: priced.subtotalCents,
      gratuityCents: priced.gratuityCents,
      totalCents: priced.totalCents,
    })
    .returning();

  if (!created) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  // Create Stripe Checkout session — Stripe hosts the payment UI.
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: created.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: tenant.currency,
            unit_amount: created.totalCents,
            product_data: {
              name: `${serviceLabel} · ${confirmationCode}`,
              description: `Pickup ${new Date(created.pickupAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: tenant.timezone,
              })} PT`,
            },
          },
        },
      ],
      metadata: {
        bookingId: created.id,
        confirmationCode: created.confirmationCode,
        tenantId: tenant.slug,
      },
      payment_intent_data: {
        metadata: {
          bookingId: created.id,
          confirmationCode: created.confirmationCode,
          tenantId: tenant.slug,
        },
        description: `${serviceLabel} — ${created.customerFirstName} ${created.customerLastName}`,
      },
      success_url: `${tenant.siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${tenant.siteUrl}/transportation/book?cancelled=1&service=${encodeURIComponent(service)}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    },
    withTenantStripe()
  );

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
  }

  // Save the Stripe session id back to our row so the webhook can correlate.
  await db
    .update(bookings)
    .set({ stripeSessionId: session.id, updatedAt: new Date() })
    .where(eq(bookings.id, created.id));

  return NextResponse.json({
    bookingId: created.id,
    confirmationCode: created.confirmationCode,
    checkoutUrl: session.url,
  });
}
