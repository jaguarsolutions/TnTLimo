"use client";

import { useState } from "react";
import Link from "next/link";
import type { BookingStatus } from "@/lib/booking/schema";
import type { BookingDetailRow } from "@/lib/booking/describeBooking";
import AdminConfirmButton from "@/components/booking/AdminConfirmButton";
import AdminResendEmailButton from "@/components/booking/AdminResendEmailButton";
import AdminCancelButton from "@/components/booking/AdminCancelButton";

const STATUS_BADGES: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-800" },
  confirmed: { label: "Confirmed", bg: "bg-green-100", text: "text-green-800" },
  cancelled: { label: "Cancelled", bg: "bg-stone-200", text: "text-stone-700" },
  refund_failed: { label: "Refund pending", bg: "bg-orange-100", text: "text-orange-800" },
  payment_failed: { label: "Payment failed", bg: "bg-red-100", text: "text-red-800" },
};

/**
 * Serializable subset of a booking the row needs. We pass plain fields (not the
 * Drizzle row type) so this stays a clean client/server boundary.
 */
export interface AdminBookingRowData {
  id: string;
  confirmationCode: string;
  status: BookingStatus;
  serviceLabel: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAt: string; // ISO
  createdAt: string; // ISO
  totalCents: number;
  confirmationEmailSentAt: string | null; // ISO or null
  confirmationEmailAttempts: number;
  confirmationEmailLastError: string | null;
}

export default function AdminBookingRow({
  booking,
  detailRows,
  manageHref,
  timezone,
}: {
  booking: AdminBookingRowData;
  detailRows: BookingDetailRow[];
  manageHref: string;
  timezone: string;
}) {
  const [open, setOpen] = useState(false);
  const b = booking;
  const badge = STATUS_BADGES[b.status];

  const pickup = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(b.pickupAt));

  const created = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(b.createdAt));

  const sentTitle = b.confirmationEmailSentAt
    ? `Sent ${new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(b.confirmationEmailSentAt))}`
    : undefined;

  return (
    <>
      <tr
        className="border-t border-stone-200 hover:bg-stone-50 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <td className="px-4 py-3 font-mono text-xs text-stone-800">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block text-stone-400 transition-transform ${open ? "rotate-90" : ""}`}
              aria-hidden="true"
            >
              ▸
            </span>
            {b.confirmationCode}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </td>
        <td className="px-4 py-3 text-stone-700">{b.serviceLabel}</td>
        <td className="px-4 py-3">
          <div className="text-stone-900">
            {b.customerFirstName} {b.customerLastName}
          </div>
          <div className="text-xs text-stone-500">{b.customerEmail}</div>
          <div className="text-xs text-stone-500">{b.customerPhone}</div>
        </td>
        <td className="px-4 py-3 text-stone-700 whitespace-nowrap">
          {pickup} <span className="text-xs text-stone-400">PT</span>
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-stone-900 font-medium">
          ${(b.totalCents / 100).toFixed(2)}
        </td>
        <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">{created}</td>
        {/* Actions — stop propagation so clicking a button doesn't toggle the row. */}
        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-end gap-1.5">
            {b.status === "confirmed" &&
              (b.confirmationEmailSentAt ? (
                <span className="text-[10px] text-stone-500" title={sentTitle}>
                  ✉ sent
                </span>
              ) : (
                <span
                  className="text-[10px] text-orange-700 font-semibold"
                  title={b.confirmationEmailLastError ?? "Email not yet sent"}
                >
                  ⚠ email failed
                  {b.confirmationEmailAttempts > 0 && <> · {b.confirmationEmailAttempts}×</>}
                </span>
              ))}
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
              {b.status === "pending" && <AdminConfirmButton bookingId={b.id} />}
              {b.status === "confirmed" && !b.confirmationEmailSentAt && (
                <AdminResendEmailButton bookingId={b.id} variant="retry" />
              )}
              {b.status === "confirmed" && b.confirmationEmailSentAt && (
                <AdminResendEmailButton bookingId={b.id} variant="resend" />
              )}
              {(b.status === "confirmed" || b.status === "pending") && (
                <AdminCancelButton
                  bookingId={b.id}
                  confirmationCode={b.confirmationCode}
                  total={`$${(b.totalCents / 100).toFixed(2)}`}
                />
              )}
              <Link
                href={manageHref}
                className="text-amber-700 hover:text-amber-900 underline text-xs"
                target="_blank"
                rel="noreferrer"
              >
                Open ↗
              </Link>
            </div>
          </div>
        </td>
      </tr>

      {open && (
        <tr className="border-t border-stone-100 bg-stone-50/60">
          <td colSpan={8} className="px-4 py-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Reservation details
              </p>
              <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between gap-4 border-b border-stone-100 pb-1.5"
                  >
                    <dt className="text-sm text-stone-500">{row.label}</dt>
                    <dd className="text-sm font-medium text-stone-900 text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
