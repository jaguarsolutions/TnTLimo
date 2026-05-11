import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { sendBookingConfirmation } from "@/lib/booking/email/send";

export const runtime = "nodejs";

/**
 * Admin-only manual confirm endpoint.
 * Requires the ADMIN_TOKEN header matching ADMIN_PASS env var.
 * Used when the Stripe webhook fails or hasn't been configured yet.
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

  if (booking.status === "confirmed") {
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  try {
    await sendBookingConfirmation(updated);
  } catch (err) {
    console.error("[admin confirm] email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
