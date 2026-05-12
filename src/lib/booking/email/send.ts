import { Resend } from "resend";
import type { Booking } from "@/lib/booking/schema";
import { getTenant } from "@/lib/tenant";
import { signManageToken } from "@/lib/booking/manageToken";
import { renderConfirmationEmail } from "./templates/confirmation";
import { renderCancellationEmail } from "./templates/cancellation";

const LOG = "[booking/email/send]";

let cached: Resend | null = null;
function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set. Add it in Vercel env.");
  }
  // Light fingerprint so we can confirm in logs that the key was loaded —
  // never log the full secret.
  console.log(`${LOG} Resend client init (key fingerprint: ${key.slice(0, 5)}…${key.slice(-3)})`);
  cached = new Resend(key);
  return cached;
}

function manageUrl(booking: Booking, siteUrl: string): string {
  const token = signManageToken(booking.id);
  return `${siteUrl}/booking/${booking.confirmationCode}?t=${encodeURIComponent(token)}`;
}

/**
 * Send a transactional email via Resend.
 *
 * IMPORTANT: Resend's SDK does NOT throw on send rejection. It returns
 * `{ data: { id }, error: null }` on success or `{ data: null, error: {...} }`
 * on failure. Our previous code only awaited the call and ignored the return
 * value — so an unverified-domain rejection looked exactly like a successful
 * send. This helper inspects the return and throws on `error` so the calling
 * dispatch layer can record the failure properly.
 */
async function sendOne(args: {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  /** Used in logs only, to disambiguate customer vs operator copies. */
  audience: "customer" | "operator";
  /** Booking code for log correlation. */
  bookingCode: string;
}): Promise<string> {
  const resend = getResend();
  const { from, to, subject, html, replyTo, audience, bookingCode } = args;

  console.log(
    `${LOG} sending ${audience} email for ${bookingCode} ` +
      `(from=${from}, to=${to}, subject=${JSON.stringify(subject)}, replyTo=${replyTo ?? "—"})`
  );

  const result = await resend.emails.send({ from, to, subject, html, replyTo });

  if (result.error) {
    console.error(
      `${LOG} Resend REJECTED ${audience} email for ${bookingCode}:`,
      JSON.stringify(result.error, null, 2)
    );
    // Resend's error shape: { name: "validation_error", message: "..." }
    const msg = result.error.message ?? result.error.name ?? "Resend rejected send";
    throw new Error(msg);
  }

  const id = result.data?.id ?? "(no id)";
  console.log(`${LOG} ✓ ${audience} email queued for ${bookingCode} → resend_id=${id}`);
  return id;
}

/* ── Confirmation email (sent after Stripe payment succeeds) ─────────────── */

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const tenant = getTenant();
  const link = manageUrl(booking, tenant.siteUrl);

  console.log(
    `${LOG} sendBookingConfirmation ${booking.confirmationCode}: ` +
      `customer=${booking.customerEmail} support=${tenant.supportEmail} ` +
      `from=${tenant.fromEmail} siteUrl=${tenant.siteUrl}`
  );

  const { subject, html, internalSubject, internalHtml } = renderConfirmationEmail({
    booking,
    tenant,
    manageUrl: link,
  });

  // Customer email first — if this fails the dispatcher will retry the whole
  // flow on the next Stripe webhook attempt, so we don't want to send a
  // success-looking operator copy first.
  await sendOne({
    from: tenant.fromEmail,
    to: booking.customerEmail,
    subject,
    html,
    replyTo: tenant.supportEmail,
    audience: "customer",
    bookingCode: booking.confirmationCode,
  });

  // Operator copy — same content, different greeting. If THIS fails after the
  // customer copy succeeded, log and swallow: the customer already got their
  // email, no need to mark the whole send as failed.
  try {
    await sendOne({
      from: tenant.fromEmail,
      to: tenant.supportEmail,
      subject: internalSubject,
      html: internalHtml,
      audience: "operator",
      bookingCode: booking.confirmationCode,
    });
  } catch (err) {
    console.error(
      `${LOG} operator copy failed for ${booking.confirmationCode} ` +
        `(customer email already succeeded, treating as soft-fail):`,
      err
    );
  }
}

/* ── Cancellation email ──────────────────────────────────────────────────── */

export async function sendBookingCancellation(
  booking: Booking,
  refundCents: number
): Promise<void> {
  const tenant = getTenant();

  console.log(
    `${LOG} sendBookingCancellation ${booking.confirmationCode}: ` +
      `customer=${booking.customerEmail} refundCents=${refundCents}`
  );

  const { subject, html, internalSubject, internalHtml } = renderCancellationEmail({
    booking,
    tenant,
    refundCents,
  });

  await sendOne({
    from: tenant.fromEmail,
    to: booking.customerEmail,
    subject,
    html,
    replyTo: tenant.supportEmail,
    audience: "customer",
    bookingCode: booking.confirmationCode,
  });

  try {
    await sendOne({
      from: tenant.fromEmail,
      to: tenant.supportEmail,
      subject: internalSubject,
      html: internalHtml,
      audience: "operator",
      bookingCode: booking.confirmationCode,
    });
  } catch (err) {
    console.error(
      `${LOG} operator cancellation copy failed for ${booking.confirmationCode}:`,
      err
    );
  }
}
