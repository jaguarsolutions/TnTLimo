import type { Booking } from "@/lib/booking/schema";
import type { Tenant } from "@/lib/tenant";
import { emailShell, escapeHtml, formatMoney, formatPickup } from "../shared";

export interface ConfirmationEmail {
  /** Customer-facing subject line. */
  subject: string;
  /** Customer-facing HTML body. */
  html: string;
  /** Internal (operator) subject line. */
  internalSubject: string;
  /** Internal HTML body — same content, different greeting. */
  internalHtml: string;
}

export function renderConfirmationEmail(args: {
  booking: Booking;
  tenant: Tenant;
  /** Absolute URL to the customer's manage page including the signed token. */
  manageUrl: string;
}): ConfirmationEmail {
  const { booking, tenant, manageUrl } = args;
  const customerName = `${booking.customerFirstName} ${booking.customerLastName}`.trim();
  const pickup = formatPickup(booking.pickupAt, tenant.timezone);

  const detailsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e4ddd2;">
      <tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px;">Confirmation</td><td style="padding: 12px 16px; font-weight: 600; text-align: right;">${escapeHtml(booking.confirmationCode)}</td></tr>
      <tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px; border-top: 1px solid #e4ddd2;">Service</td><td style="padding: 12px 16px; font-weight: 600; text-align: right; border-top: 1px solid #e4ddd2;">${escapeHtml(booking.serviceLabel)}</td></tr>
      <tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px; border-top: 1px solid #e4ddd2;">Pickup</td><td style="padding: 12px 16px; font-weight: 600; text-align: right; border-top: 1px solid #e4ddd2;">${escapeHtml(pickup)}</td></tr>
      <tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px; border-top: 1px solid #e4ddd2;">Total paid</td><td style="padding: 12px 16px; font-weight: 600; text-align: right; border-top: 1px solid #e4ddd2;">${formatMoney(booking.totalCents, tenant.currency)}</td></tr>
    </table>
  `;

  const customerBody = `
    <p style="font-size: 16px;">Hi ${escapeHtml(booking.customerFirstName)},</p>
    <p style="font-size: 16px; line-height: 1.6;">Your booking is confirmed. Here are the details:</p>
    ${detailsTable}
    <div style="text-align: center; margin: 28px 0;">
      <a href="${manageUrl}" style="display: inline-block; background: ${tenant.brandColor}; color: #0c0b0a; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600;">Manage your booking</a>
    </div>
    <p style="color: #7a7268; font-size: 14px; line-height: 1.6;">
      You can cancel for a full refund up to <strong>${tenant.cancellationWindowHours} hours before pickup</strong>. After that, the
      fare is non-refundable. Need to change pickup details? Use the link above to cancel and rebook,
      or reply to this email and we'll help.
    </p>
    <p style="color: #7a7268; font-size: 14px; line-height: 1.6;">
      Questions any time: <a href="mailto:${escapeHtml(tenant.supportEmail)}" style="color: ${tenant.brandColor};">${escapeHtml(tenant.supportEmail)}</a> ·
      <a href="${escapeHtml(tenant.supportPhone.href)}" style="color: ${tenant.brandColor};">${escapeHtml(tenant.supportPhone.display)}</a>
    </p>
  `;

  const internalBody = `
    <p style="font-size: 16px;">New booking from ${escapeHtml(customerName)}</p>
    <p style="font-size: 14px; color: #7a7268;">${escapeHtml(booking.customerEmail)} · ${escapeHtml(booking.customerPhone)}</p>
    ${detailsTable}
    <div style="text-align: center; margin: 28px 0;">
      <a href="${manageUrl}" style="display: inline-block; background: ${tenant.brandColor}; color: #0c0b0a; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600;">View booking</a>
    </div>
  `;

  return {
    subject: `Booking confirmed · ${booking.confirmationCode} · ${tenant.shortName}`,
    html: emailShell({ tenant, body: customerBody }),
    internalSubject: `[New booking] ${booking.confirmationCode} · ${booking.serviceLabel} · ${customerName}`,
    internalHtml: emailShell({ tenant, body: internalBody }),
  };
}
