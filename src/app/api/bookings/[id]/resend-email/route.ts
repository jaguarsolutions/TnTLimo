import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { sendBookingConfirmation } from "@/lib/booking/email/send";
import { isAdminRequestAuthenticated } from "@/lib/admin/auth";

export const runtime = "nodejs";

/**
 * Admin-only "resend confirmation email" endpoint.
 *
 * Unlike `dispatchConfirmationEmail`, this bypasses the idempotency check and
 * always re-sends — it's the operator manually saying "please email this
 * customer their confirmation again." On success it stamps
 * `confirmationEmailSentAt` (or refreshes it) and clears the last error.
 *
 * Requires a valid operator session cookie or `x-admin-token` header matching
 * `ADMIN_PASS` env var.
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

  if (booking.status !== "confirmed") {
    return NextResponse.json(
      { error: `Booking is "${booking.status}", not confirmed — cannot resend email.` },
      { status: 400 }
    );
  }

  try {
    await sendBookingConfirmation(booking);
    await db
      .update(bookings)
      .set({
        confirmationEmailSentAt: new Date(),
        confirmationEmailLastError: null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id));
    return NextResponse.json({ ok: true, emailSent: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[admin resend-email] failed for ${booking.confirmationCode}:`, err);
    await db
      .update(bookings)
      .set({
        confirmationEmailAttempts: (booking.confirmationEmailAttempts ?? 0) + 1,
        confirmationEmailLastError: message.slice(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id));
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
