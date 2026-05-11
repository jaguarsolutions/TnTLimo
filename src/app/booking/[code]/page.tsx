import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/booking/db";
import { bookings } from "@/lib/booking/schema";
import { verifyManageToken } from "@/lib/booking/manageToken";
import { isWithinFreeCancelWindow, hoursUntilPickup } from "@/lib/booking/cancellation";
import { getTenant } from "@/lib/tenant";
import CancelBookingButton from "@/components/booking/CancelBookingButton";

const tenant = getTenant();

export const metadata = {
  title: `Manage booking · ${tenant.shortName}`,
  robots: { index: false, follow: false },
};

// Per-booking page — never cache, never prerender.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function ManageBookingPage({ params, searchParams }: PageProps) {
  const { code } = await params;
  const { t: token } = await searchParams;

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.confirmationCode, code))
    .limit(1);

  if (!booking) notFound();

  const tokenBookingId = token ? verifyManageToken(token) : null;
  const authorized = tokenBookingId === booking.id;

  if (!authorized) {
    return (
      <>
        <Header solid />
        <main className="bg-cream text-ink min-h-screen pt-20 md:pt-24 pb-24">
          <div className="max-w-xl mx-auto px-5 sm:px-8 text-center">
            <h1 className="font-display text-3xl font-semibold text-ink">Link expired or invalid</h1>
            <p className="mt-4 font-sans text-muted leading-relaxed">
              This management link is missing or no longer valid. Please use the latest link in your
              confirmation email, or contact us directly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`mailto:${tenant.supportEmail}?subject=Help%20with%20booking%20${encodeURIComponent(code)}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-ink text-white font-sans text-sm font-semibold rounded-full hover:bg-charcoal transition-colors"
              >
                Email {tenant.supportEmail}
              </a>
              <a
                href={tenant.supportPhone.href}
                className="inline-flex items-center justify-center px-6 py-3 border border-border text-ink font-sans text-sm font-semibold rounded-full hover:border-ink transition-colors"
              >
                Call {tenant.supportPhone.display}
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const pickupAt = new Date(booking.pickupAt);
  const cancellable =
    booking.status === "confirmed" && isWithinFreeCancelWindow(pickupAt);
  const hoursLeft = hoursUntilPickup(pickupAt);
  const cancelled = booking.status === "cancelled";

  return (
    <>
      <Header solid />
      <main className="bg-cream text-ink min-h-screen pt-20 md:pt-24 pb-24">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <div className="mb-8">
            <Link
              href="/transportation"
              className="inline-flex items-center gap-1 font-sans text-sm text-muted hover:text-ink transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="mt-4 font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
              Your booking
            </h1>
            <p className="mt-2 font-sans text-muted">
              Confirmation <span className="font-semibold text-ink">{booking.confirmationCode}</span>
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-[0_4px_16px_-6px_rgba(12,11,10,0.10)]">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{booking.serviceLabel}</p>
                <p className="mt-1 font-sans text-sm text-muted">
                  {`${booking.customerFirstName} ${booking.customerLastName}`} · {booking.customerEmail}
                </p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <dl className="mt-5 space-y-3 font-sans text-sm">
              <Row label="Pickup">
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/Los_Angeles",
                }).format(pickupAt)}{" "}
                PT
              </Row>
              <Row label="Phone">{booking.customerPhone}</Row>
              {(() => {
                const payload = booking.payload as Record<string, unknown>;
                const notes = typeof payload?.notes === "string" ? payload.notes.trim() : "";
                return notes ? <Row label="Notes">{notes}</Row> : null;
              })()}
              <Row label="Subtotal">${(booking.subtotalCents / 100).toFixed(2)}</Row>
              {booking.gratuityCents > 0 && (
                <Row label="Gratuity">${(booking.gratuityCents / 100).toFixed(2)}</Row>
              )}
              <div className="pt-3 border-t border-border flex justify-between">
                <dt className="font-semibold text-ink">{cancelled ? "Refunded" : "Total paid"}</dt>
                <dd className="font-display text-xl font-semibold text-ink">
                  ${(booking.totalCents / 100).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Cancellation panel */}
          {!cancelled && booking.status === "confirmed" && (
            <div className="mt-6 rounded-3xl border border-border bg-white p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink">Need to cancel?</h2>
              {cancellable ? (
                <>
                  <p className="mt-2 font-sans text-sm text-muted leading-relaxed">
                    You&apos;re still within the free cancellation window ({Math.floor(hoursLeft)} hours
                    until pickup). Cancelling will refund the full amount to your original card. Refunds
                    typically appear within 5–10 business days.
                  </p>
                  <div className="mt-5">
                    <CancelBookingButton
                      bookingId={booking.id}
                      token={token!}
                      total={`$${(booking.totalCents / 100).toFixed(2)}`}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-2 font-sans text-sm text-muted leading-relaxed">
                  Free cancellation has closed (less than 24 hours until pickup). To request changes, please
                  call us at{" "}
                  <a href={tenant.supportPhone.href} className="text-gold hover:underline">
                    {tenant.supportPhone.display}
                  </a>{" "}
                  &mdash; we&apos;ll do our best to help.
                </p>
              )}
            </div>
          )}

          {cancelled && (
            <div className="mt-6 rounded-3xl border border-border bg-sand p-6 sm:p-8">
              <p className="font-sans text-sm text-ink leading-relaxed">
                This booking was cancelled
                {booking.cancelledAt
                  ? ` on ${new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "America/Los_Angeles" }).format(new Date(booking.cancelledAt))} PT`
                  : ""}
                . The refund has been issued back to your original card.
              </p>
              <p className="mt-3 font-sans text-sm text-muted">
                <Link href="/transportation/book" className="text-gold hover:underline">
                  Book again →
                </Link>
              </p>
            </div>
          )}

          <p className="mt-8 text-center font-sans text-sm text-muted">
            Need help? Email{" "}
            <a href={`mailto:${tenant.supportEmail}`} className="text-gold hover:underline">
              {tenant.supportEmail}
            </a>{" "}
            · call{" "}
            <a href={tenant.supportPhone.href} className="text-gold hover:underline">
              {tenant.supportPhone.display}
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink text-right">{children}</dd>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; dot: string; text: string }> = {
    confirmed: { label: "Confirmed", bg: "bg-green-50", dot: "bg-green-600", text: "text-green-800" },
    pending: { label: "Awaiting payment", bg: "bg-amber-50", dot: "bg-amber-500", text: "text-amber-800" },
    cancelled: { label: "Cancelled", bg: "bg-stone-100", dot: "bg-stone-500", text: "text-stone-700" },
    refund_failed: { label: "Refund pending", bg: "bg-amber-50", dot: "bg-amber-500", text: "text-amber-800" },
    payment_failed: { label: "Payment failed", bg: "bg-red-50", dot: "bg-red-500", text: "text-red-800" },
  };
  const cfg = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
