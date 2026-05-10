import type { Booking } from "@/lib/booking/schema";
import type { Tenant } from "@/lib/tenant";
import { emailShell, escapeHtml, formatMoney, formatPickup } from "../shared";

export interface CancellationEmail {
  subject: string;
  html: string;
  internalSubject: string;
  internalHtml: string;
}

export function renderCancellationEmail(args: {
  booking: Booking;
  tenant: Tenant;
  refundCents: number;
}): CancellationEmail {
  const { booking, tenant, refundCents } = args;
  const customerName = `${booking.customerFirstName} ${booking.customerLastName}`.trim();
  const pickup = formatPickup(booking.pickupAt, tenant.timezone);

  const detailsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e4ddd2;">
      <tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px;">Service</td><td style="padding: 12px 16px; font-weight: 600; text-align: right;">${escapeHtml(booking.serviceLabel)}</td></tr>
      <tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px; border-top: 1px solid #e4ddd2;">Original pickup</td><td style="padding: 12px 16px; text-align: right; border-top: 1px solid #e4ddd2;">${escapeHtml(pickup)}</td></tr>
      <tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px; border-top: 1px solid #e4ddd2;">Refund amount</td><td style="padding: 12px 16px; font-weight: 600; text-align: right; border-top: 1px solid #e4ddd2;">${formatMoney(refundCents, tenant.currency)}</td></tr>
    </table>
  `;

  const customerBody = `
    <p style="font-size: 16px;">Hi ${escapeHtml(booking.customerFirstName)},</p>
    <p style="font-size: 16px; line-height: 1.6;">Your booking <strong>${escapeHtml(booking.confirmationCode)}</strong> has been cancelled.</p>
    ${detailsTable}
    <p style="color: #7a7268; font-size: 14px; line-height: 1.6;">
      Refunds typically appear in your statement within 5&ndash;10 business days, depending on your bank.
    </p>
    <p style="color: #7a7268; font-size: 14px; line-height: 1.6;">
      Want to rebook? Visit <a href="${tenant.siteUrl}/transportation/book" style="color: ${tenant.brandColor};">${tenant.siteUrl}/transportation/book</a>.
    </p>
  `;

  const internalBody = `
    <p style="font-size: 16px;">Cancellation from ${escapeHtml(customerName)}</p>
    <p style="font-size: 14px; color: #7a7268;">${escapeHtml(booking.customerEmail)}</p>
    ${detailsTable}
  `;

  return {
    subject: `Booking cancelled · ${booking.confirmationCode} · ${tenant.shortName}`,
    html: emailShell({ tenant, body: customerBody }),
    internalSubject: `[Cancellation] ${booking.confirmationCode} · ${booking.serviceLabel} · ${customerName}`,
    internalHtml: emailShell({ tenant, body: internalBody }),
  };
}
