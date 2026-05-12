import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { getStripe, withTenantStripe } from "@/lib/booking/stripe";
import { sendBookingCancellation } from "@/lib/booking/email/send";

export const runtime = "nodejs";

/**
 * Admin-only cancellation endpoint.
 *
 * Differs from the customer-facing `/api/bookings/[id]/cancel`:
 *   - Auth via `x-admin-token` header (the same `ADMIN_PASS` env var the rest
 *     of the admin endpoints use), NOT the signed manage token. The operator
 *     can cancel any booking without needing the customer's email link.
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
  const adminPass = process.env.ADMIN_PASS;
  const token = request.headers.get("x-admin-token");
  if (!adminPass || token !== adminPass) {
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

  // We only refund bookings that were actually paid (i.e. have a payment intent).
  // For bookings still in `pending`, there's nothing to refund — we just mark
  // them cancelled.
  if (!booking.stripePaymentIntentId) {
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
        payment_intent: booking.stripePaymentIntentId,
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
