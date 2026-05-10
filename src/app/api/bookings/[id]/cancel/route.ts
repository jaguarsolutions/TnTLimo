import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { verifyManageToken } from "@/lib/booking/manageToken";
import { getStripe, withTenantStripe } from "@/lib/booking/stripe";
import { isWithinFreeCancelWindow } from "@/lib/booking/cancellation";
import { sendBookingCancellation } from "@/lib/booking/email/send";

export const runtime = "nodejs";

interface CancelPayload {
  token: string;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let body: CancelPayload;
  try {
    body = (await request.json()) as CancelPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const tokenBookingId = body.token ? verifyManageToken(body.token) : null;
  if (tokenBookingId !== id) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json(
      { error: `Bookings in status "${booking.status}" cannot be self-cancelled.` },
      { status: 400 }
    );
  }

  if (!isWithinFreeCancelWindow(new Date(booking.pickupAt))) {
    return NextResponse.json(
      {
        error:
          "Free cancellation has closed (less than 24 hours until pickup). Please call us for assistance.",
      },
      { status: 400 }
    );
  }

  if (!booking.stripePaymentIntentId) {
    return NextResponse.json(
      { error: "Payment not found on this booking. Please contact support." },
      { status: 500 }
    );
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
        },
      },
      withTenantStripe()
    );
    refundId = refund.id;
  } catch (err) {
    console.error("[cancel booking] Stripe refund failed:", err);
    await db
      .update(bookings)
      .set({
        status: "refund_failed",
        cancellationReason: "Customer requested cancellation; Stripe refund failed.",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id));
    return NextResponse.json(
      { error: "Refund could not be processed. Our team has been notified and will follow up." },
      { status: 502 }
    );
  }

  const [updated] = await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: "Customer self-cancelled within free window.",
      stripeRefundId: refundId,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning();

  if (updated) {
    try {
      await sendBookingCancellation(updated, updated.totalCents);
    } catch (err) {
      console.error("[cancel booking] cancellation email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
