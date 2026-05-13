import { eq } from "drizzle-orm";
import { db } from "./db";
import { bookings, type Booking } from "./schema";
import { getStripe, withTenantStripe } from "./stripe";

const LOG = "[booking/stripeSync]";

/**
 * If a booking has a Stripe checkout session ID but no payment intent ID
 * recorded, pull the session from Stripe and persist the linked payment
 * intent.
 *
 * Why this exists:
 *   - The Stripe webhook normally writes `stripe_payment_intent_id` on
 *     `checkout.session.completed`. In local dev (without Stripe CLI
 *     forwarding) or if a webhook delivery is delayed/lost, that field can
 *     stay null even though a real payment exists.
 *   - Cancellation/refund paths key off `stripe_payment_intent_id`. Without
 *     it they bail with "Payment not found on this booking."
 *
 * This function is idempotent — if the intent is already recorded or there's
 * no session to consult, it returns the input booking unchanged.
 */
export async function ensurePaymentIntent(booking: Booking): Promise<Booking> {
  if (booking.stripePaymentIntentId) {
    return booking;
  }
  if (!booking.stripeSessionId) {
    console.warn(
      `${LOG} ${booking.confirmationCode} has neither paymentIntentId nor sessionId — nothing to backfill`
    );
    return booking;
  }

  console.log(
    `${LOG} ${booking.confirmationCode}: backfilling paymentIntentId from session ${booking.stripeSessionId}`
  );

  try {
    const stripe = getStripe();
    // `retrieve` has two overloads (with/without `params`) and TS can't pick
    // when `withTenantStripe()` is `undefined`. Pass an empty params object
    // so the (id, params, options) overload is unambiguous.
    const session = await stripe.checkout.sessions.retrieve(
      booking.stripeSessionId,
      {},
      withTenantStripe()
    );

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    if (!paymentIntentId) {
      console.warn(
        `${LOG} ${booking.confirmationCode}: session ${booking.stripeSessionId} has no payment_intent yet ` +
          `(status=${session.payment_status})`
      );
      return booking;
    }

    console.log(
      `${LOG} ${booking.confirmationCode}: persisting paymentIntentId=${paymentIntentId}`
    );

    const [updated] = await db
      .update(bookings)
      .set({ stripePaymentIntentId: paymentIntentId, updatedAt: new Date() })
      .where(eq(bookings.id, booking.id))
      .returning();

    return updated ?? booking;
  } catch (err) {
    console.error(`${LOG} backfill failed for ${booking.confirmationCode}:`, err);
    return booking;
  }
}
