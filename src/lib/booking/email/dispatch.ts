import { eq } from "drizzle-orm";
import { db } from "@/lib/booking/db";
import { bookings, type Booking } from "@/lib/booking/schema";
import { sendBookingConfirmation } from "./send";

/**
 * Send the confirmation email and persist the outcome on the booking row.
 *
 *   • Success → `confirmation_email_sent_at` is set; future calls are no-ops.
 *   • Failure → `confirmation_email_attempts` is incremented, the error
 *     message is recorded on `confirmation_email_last_error`, and the
 *     function returns `{ ok: false, error }`. The caller decides whether
 *     to propagate (e.g. webhook returns 500 so Stripe retries) or swallow
 *     (e.g. admin manual confirm should not undo the status change).
 *
 * Idempotency: if `confirmationEmailSentAt` is already populated, the
 * function short-circuits without contacting Resend. This is what makes
 * Stripe webhook retries safe to run repeatedly.
 */
export async function dispatchConfirmationEmail(
  booking: Booking
): Promise<{ ok: true; alreadySent: boolean } | { ok: false; error: string }> {
  if (booking.confirmationEmailSentAt) {
    return { ok: true, alreadySent: true };
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
      .where(eq(bookings.id, booking.id));
    return { ok: true, alreadySent: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[email dispatch] confirmation email failed for ${booking.confirmationCode}:`, err);
    await db
      .update(bookings)
      .set({
        confirmationEmailAttempts: (booking.confirmationEmailAttempts ?? 0) + 1,
        confirmationEmailLastError: message.slice(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));
    return { ok: false, error: message };
  }
}
