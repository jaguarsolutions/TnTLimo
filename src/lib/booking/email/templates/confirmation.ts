import type { Booking } from "@/lib/booking/schema";
import type { Tenant } from "@/lib/tenant";
import { describeBooking, customerDetailRows } from "@/lib/booking/describeBooking";
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

  // Top summary — the at-a-glance facts, same for both audiences.
  const summaryTable = detailTable([
    { label: "Confirmation", value: escapeHtml(booking.confirmationCode) },
    { label: "Service", value: escapeHtml(booking.serviceLabel) },
    { label: "Pickup", value: escapeHtml(pickup) },
    { label: "Total paid", value: formatMoney(booking.totalCents, tenant.currency) },
  ]);

  // Full, service-specific trip details from the single source of truth.
  const customerRows = customerDetailRows(booking);
  const operatorRows = describeBooking(booking);

  const customerDetails = detailTable(
    customerRows.map((r) => ({ label: r.label, value: escapeHtml(r.value) }))
  );
  const operatorDetails = detailTable(
    operatorRows.map((r) => ({ label: r.label, value: escapeHtml(r.value) }))
  );

  const pickupNote = renderPickupNote(booking, tenant);

  const customerBody = `
    <p style="font-size: 16px;">Hi ${escapeHtml(booking.customerFirstName)},</p>
    <p style="font-size: 16px; line-height: 1.6;">Your booking is confirmed. Here are the details:</p>
    ${summaryTable}
    ${sectionHeading("Trip details")}
    ${customerDetails}
    ${sectionHeading("Booked by")}
    ${detailTable([
      { label: "Name", value: escapeHtml(customerName) },
      { label: "Email", value: escapeHtml(booking.customerEmail) },
      { label: "Phone", value: escapeHtml(booking.customerPhone) },
    ])}
    ${pickupNote}
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
    ${summaryTable}
    ${sectionHeading("Trip details")}
    ${operatorDetails}
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

/* ── Small render helpers ─────────────────────────────────────────────────── */

/** A label/value row where the value is ALREADY html-escaped by the caller. */
interface RenderRow {
  label: string;
  value: string;
}

/** Render the branded label/value table used throughout the email. */
function detailTable(rows: RenderRow[]): string {
  const body = rows
    .map((r, i) => {
      const border = i === 0 ? "" : "border-top: 1px solid #e4ddd2;";
      return `<tr><td style="padding: 12px 16px; color: #7a7268; font-size: 13px; ${border}">${escapeHtml(r.label)}</td><td style="padding: 12px 16px; font-weight: 600; text-align: right; ${border}">${r.value}</td></tr>`;
    })
    .join("");
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e4ddd2;">
      ${body}
    </table>
  `;
}

function sectionHeading(text: string): string {
  return `<p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7a7268; margin: 24px 0 0;">${escapeHtml(text)}</p>`;
}

/**
 * The "we'll confirm your pickup" reassurance. Airport arrivals get the
 * flight-tracking message; everything else gets the general pickup message.
 */
function renderPickupNote(booking: Booking, tenant: Tenant): string {
  const p = (booking.payload ?? {}) as Record<string, unknown>;
  const isAirport = booking.serviceCode === "airport-transfer";
  const hasArrival = isAirport && (p.airportDirection === "from-airport" || p.roundTrip === true);

  const message = hasArrival
    ? "We track your flight automatically and will call to confirm your exact pickup time — no need to worry if your flight is delayed."
    : "Your driver will arrive at the scheduled time. We'll call to confirm pickup details before your trip.";

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #faf5e9; border-radius: 12px; border: 1px solid #e8dcc0;">
      <tr><td style="padding: 16px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #5c5346;"><strong>Pickup time:</strong> ${escapeHtml(message)}</p>
        <p style="margin: 8px 0 0; font-size: 14px; line-height: 1.6; color: #5c5346;">Questions or need to adjust your pickup? Call us at <a href="${escapeHtml(tenant.supportPhone.href)}" style="color: ${tenant.brandColor}; font-weight: 600;">${escapeHtml(tenant.supportPhone.display)}</a>.</p>
      </td></tr>
    </table>
  `;
}
