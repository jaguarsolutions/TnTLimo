import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { getStripe } from "@/lib/booking/stripe";
import { sendBookingConfirmation } from "@/lib/booking/email/send";

export const runtime = "nodejs";

/**
 * Stripe webhook handler.
 *
 * Configure in Stripe dashboard:
 *   Endpoint: https://<your-domain>/api/stripe/webhook
 *   Events:   checkout.session.completed, checkout.session.expired,
 *             checkout.session.async_payment_failed
 *
 * The webhook signing secret goes into STRIPE_WEBHOOK_SECRET (env).
 *
 * Idempotency: Stripe may deliver the same event multiple times. We dedupe
 * by checking `booking.status` before mutating — a confirmed booking stays
 * confirmed and we skip re-sending emails.
 *
 * Connect: when individual tenants get their own connected Stripe accounts,
 * this same endpoint receives their events too (Stripe Connect routes events
 * from connected accounts to the platform webhook with `event.account` set).
 * The metadata lookup by `bookingId` is account-agnostic, so no code change
 * is required when adding the first connected tenant.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "signature verification failed";
    console.error("[stripe webhook] signature error:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await handleCheckoutFailed(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error("[stripe webhook] checkout.session.completed missing bookingId metadata");
    return;
  }

  const [existing] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!existing) {
    console.error(`[stripe webhook] booking not found for id ${bookingId}`);
    return;
  }

  if (existing.status === "confirmed") {
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const [updated] = await db
    .update(bookings)
    .set({
      status: "confirmed",
      stripePaymentIntentId: paymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (!updated) return;

  await sendBookingConfirmation(updated);
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  await db
    .update(bookings)
    .set({ status: "payment_failed", updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));
}
