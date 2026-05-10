import { Resend } from "resend";
import type { Booking } from "@/lib/booking/schema";
import { getTenant } from "@/lib/tenant";
import { signManageToken } from "@/lib/booking/manageToken";
import { renderConfirmationEmail } from "./templates/confirmation";
import { renderCancellationEmail } from "./templates/cancellation";

let cached: Resend | null = null;
function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set. Add it in Vercel env.");
  }
  cached = new Resend(key);
  return cached;
}

function manageUrl(booking: Booking, siteUrl: string): string {
  const token = signManageToken(booking.id);
  return `${siteUrl}/booking/${booking.confirmationCode}?t=${encodeURIComponent(token)}`;
}

/* ── Confirmation email (sent after Stripe payment succeeds) ─────────────── */

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const tenant = getTenant();
  const resend = getResend();
  const link = manageUrl(booking, tenant.siteUrl);

  const { subject, html, internalSubject, internalHtml } = renderConfirmationEmail({
    booking,
    tenant,
    manageUrl: link,
  });

  await resend.emails.send({
    from: tenant.fromEmail,
    to: booking.customerEmail,
    subject,
    html,
    replyTo: tenant.supportEmail,
  });

  await resend.emails.send({
    from: tenant.fromEmail,
    to: tenant.supportEmail,
    subject: internalSubject,
    html: internalHtml,
  });
}

/* ── Cancellation email ──────────────────────────────────────────────────── */

export async function sendBookingCancellation(
  booking: Booking,
  refundCents: number
): Promise<void> {
  const tenant = getTenant();
  const resend = getResend();

  const { subject, html, internalSubject, internalHtml } = renderCancellationEmail({
    booking,
    tenant,
    refundCents,
  });

  await resend.emails.send({
    from: tenant.fromEmail,
    to: booking.customerEmail,
    subject,
    html,
    replyTo: tenant.supportEmail,
  });

  await resend.emails.send({
    from: tenant.fromEmail,
    to: tenant.supportEmail,
    subject: internalSubject,
    html: internalHtml,
  });
}
