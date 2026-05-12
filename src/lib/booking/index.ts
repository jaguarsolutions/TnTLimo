/**
 * Booking module — self-contained. Everything tenant-scoped about the
 * booking flow lives under this directory. When the platform is extracted
 * into a separate repo, this folder + the schema migrations + the API
 * routes + the React components under `src/components/booking` lift and
 * shift in one piece. Nothing else needs to come along.
 */

export { db, schema } from "./db";
export * from "./schema";
export { generateConfirmationCode } from "./bookingCode";
export { isWithinFreeCancelWindow, hoursUntilPickup } from "./cancellation";
export { signManageToken, verifyManageToken } from "./manageToken";
export { getStripe, withTenantStripe } from "./stripe";
export { sendBookingConfirmation, sendBookingCancellation } from "./email/send";
export { dispatchConfirmationEmail } from "./email/dispatch";
export * from "./pricing";
