import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { getStripe, withTenantStripe } from "@/lib/booking/stripe";
import { ensurePaymentIntent } from "@/lib/booking/stripeSync";
import { sendBookingCancellation } from "@/lib/booking/email/send";
import { isAdminRequestAuthenticated } from "@/lib/admin/auth";

export const runtime = "nodejs";

/**
 * Admin-only cancellation endpoint.
 *
 * Differs from the customer-facing `/api/bookings/[id]/cancel`:
 *   - Auth via operator session cookie or `x-admin-token` header matching
 *     `ADMIN_PASS` env var, NOT the signed manage token. The operator can
 *     cancel any booking without needing the customer's email link.
 *   - **Bypasses the 24-hour free-cancel window.** The operator can cancel at
 *     any time — useful for vehicle issues, no-shows, weather, etc. The
 *     Stripe refund is still issued in full.
 *   - Records `cancellationReason` as "Cancelled by operator." for audit.
 *
 * Both endpoints share the same refund + email logic so customers see the
 * same cancellation email regardless of who initiated it.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequestAuthenticated(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  // Backfill the payment intent from the Stripe session if the webhook
  // never recorded it — otherwise we'd mark the booking cancelled without
  // refunding a real payment.
  const synced = await ensurePaymentIntent(booking);

  // If still no payment intent after backfill, this booking was never paid
  // (e.g. admin-confirmed without a real Stripe session). Just mark cancelled.
  if (!synced.stripePaymentIntentId) {
    const [updated] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: "Cancelled by operator (no payment captured).",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return NextResponse.json({ ok: true, refunded: false, booking: updated });
  }

  const stripe = getStripe();
  let refundId: string;
  try {
    const refund = await stripe.refunds.create(
      {
        payment_intent: synced.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: {
          bookingId: booking.id,
          confirmationCode: booking.confirmationCode,
          cancelledBy: "operator",
        },
      },
      withTenantStripe()
    );
    refundId = refund.id;
  } catch (err) {
    console.error("[admin-cancel] Stripe refund failed:", err);
    await db
      .update(bookings)
      .set({
        status: "refund_failed",
        cancellationReason: "Operator cancellation; Stripe refund failed.",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id));
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: `Refund failed: ${message}` },
      { status: 502 }
    );
  }

  const [updated] = await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: "Cancelled by operator.",
      stripeRefundId: refundId,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning();

  if (updated) {
    try {
      await sendBookingCancellation(updated, updated.totalCents);
    } catch (err) {
      console.error("[admin-cancel] cancellation email failed:", err);
      // Continue — refund already issued; email is best-effort.
    }
  }

  return NextResponse.json({ ok: true, refunded: true, refundId });
}
