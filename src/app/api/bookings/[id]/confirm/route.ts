import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { dispatchConfirmationEmail } from "@/lib/booking/email/dispatch";

export const runtime = "nodejs";

/**
 * Admin-only manual confirm endpoint.
 * Requires the `x-admin-token` header matching `ADMIN_PASS` env var.
 * Used when the Stripe webhook fails or hasn't been configured yet.
 *
 * Promotion to `confirmed` and the confirmation email are separated so a
 * failed email doesn't undo the status change — the operator gets the
 * specific error back so they can re-trigger the email later (see the
 * `/resend-email` endpoint).
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

  // Stage 1: status update (idempotent).
  let current = booking;
  if (current.status !== "confirmed") {
    const [updated] = await db
      .update(bookings)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    current = updated;
  }

  // Stage 2: email (also idempotent, but failure is reported to the operator
  // so they can see exactly what's broken — usually a Resend domain issue).
  const result = await dispatchConfirmationEmail(current);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: true,
        confirmed: true,
        emailSent: false,
        emailError: result.error,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ok: true,
    confirmed: true,
    emailSent: !result.alreadySent,
    alreadySent: result.alreadySent,
  });
}
