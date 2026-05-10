import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed booking-management token. The token IS the auth — anyone with the
 * email link can manage the booking. We sign over the booking ID so a token
 * leaked for one booking can't be used to access a different one.
 *
 * Format: <booking_id>.<hex_hmac>
 *
 * `BOOKING_TOKEN_SECRET` must be a long random string set in env.
 */
function getSecret(): string {
  const secret = process.env.BOOKING_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "BOOKING_TOKEN_SECRET is not set. Generate one with `openssl rand -hex 32` and add to env."
    );
  }
  if (secret.length < 32) {
    throw new Error("BOOKING_TOKEN_SECRET must be at least 32 chars (use `openssl rand -hex 32`).");
  }
  return secret;
}

export function signManageToken(bookingId: string): string {
  const sig = createHmac("sha256", getSecret()).update(bookingId).digest("hex");
  return `${bookingId}.${sig}`;
}

export function verifyManageToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const bookingId = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = createHmac("sha256", getSecret()).update(bookingId).digest("hex");
  if (provided.length !== expected.length) return null;
  const ok = timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
  return ok ? bookingId : null;
}
