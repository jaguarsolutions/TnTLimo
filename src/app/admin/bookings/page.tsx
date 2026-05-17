import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/booking/db";
import { bookings, type BookingStatus } from "@/lib/booking/schema";
import { signManageToken } from "@/lib/booking/manageToken";
import { getTenant } from "@/lib/tenant";
import { ADMIN_SESSION_COOKIE, isAdminSessionValue } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import AdminConfirmButton from "@/components/booking/AdminConfirmButton";
import AdminResendEmailButton from "@/components/booking/AdminResendEmailButton";
import AdminCancelButton from "@/components/booking/AdminCancelButton";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "payment_failed", label: "Payment failed" },
  { value: "refund_failed", label: "Refund pending" },
];

const STATUS_BADGES: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-800" },
  confirmed: { label: "Confirmed", bg: "bg-green-100", text: "text-green-800" },
  cancelled: { label: "Cancelled", bg: "bg-stone-200", text: "text-stone-700" },
  refund_failed: { label: "Refund pending", bg: "bg-orange-100", text: "text-orange-800" },
  payment_failed: { label: "Payment failed", bg: "bg-red-100", text: "text-red-800" },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

async function loadSummary(tenantSlug: string): Promise<Record<BookingStatus, number>> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({ status: bookings.status, count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(and(eq(bookings.tenantId, tenantSlug), gte(bookings.createdAt, thirtyDaysAgo)))
    .groupBy(bookings.status);
  const out: Record<BookingStatus, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    refund_failed: 0,
    payment_failed: 0,
  };
  for (const row of rows) out[row.status] = Number(row.count);
  return out;
}

async function loadBookings(tenantSlug: string, status: "all" | BookingStatus) {
  const conditions = [eq(bookings.tenantId, tenantSlug)];
  if (status !== "all") conditions.push(eq(bookings.status, status));
  return db
    .select()
    .from(bookings)
    .where(and(...conditions))
    .orderBy(desc(bookings.createdAt))
    .limit(100);
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const authCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isAdminSessionValue(authCookie))) {
    redirect("/admin/login");
  }

  const tenant = getTenant();
  const { status } = await searchParams;
  const activeStatus =
    STATUS_FILTERS.find((f) => f.value === status)?.value ?? "all";

  const [summary, rows] = await Promise.all([
    loadSummary(tenant.slug),
    loadBookings(tenant.slug, activeStatus),
  ]);

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryTile label="Confirmed (30d)" value={summary.confirmed} tone="text-green-700" />
        <SummaryTile label="Pending (30d)" value={summary.pending} tone="text-amber-700" />
        <SummaryTile label="Cancelled (30d)" value={summary.cancelled} tone="text-stone-600" />
        <SummaryTile
          label="Refund pending"
          value={summary.refund_failed}
          tone={summary.refund_failed > 0 ? "text-orange-700" : "text-stone-600"}
          alert={summary.refund_failed > 0}
        />
        <SummaryTile
          label="Payment failed (30d)"
          value={summary.payment_failed}
          tone="text-red-700"
        />
      </section>

      {/* Filter pills */}
      <nav className="flex flex-wrap gap-2" aria-label="Status filter">
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter.value === activeStatus;
          const href = filter.value === "all" ? "/admin/bookings" : `/admin/bookings?status=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300 hover:border-stone-500"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {/* Bookings table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <Th>Code</Th>
                <Th>Status</Th>
                <Th>Service</Th>
                <Th>Customer</Th>
                <Th>Pickup</Th>
                <Th className="text-right">Total</Th>
                <Th>Created</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-stone-500">
                    No bookings found{activeStatus !== "all" ? ` for status "${activeStatus}".` : "."}
                  </td>
                </tr>
              ) : (
                rows.map((b) => {
                  const badge = STATUS_BADGES[b.status];
                  const manageHref = `/booking/${b.confirmationCode}?t=${encodeURIComponent(signManageToken(b.id))}`;
                  return (
                    <tr key={b.id} className="border-t border-stone-200 hover:bg-stone-50">
                      <td className="px-4 py-3 font-mono text-xs text-stone-800">{b.confirmationCode}</td>
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
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: tenant.timezone,
                        }).format(new Date(b.pickupAt))}{" "}
                        <span className="text-xs text-stone-400">PT</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-stone-900 font-medium">
                        ${(b.totalCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(b.createdAt))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {/* Email status — surfaces silent Resend failures */}
                          {b.status === "confirmed" && (
                            b.confirmationEmailSentAt ? (
                              <span
                                className="text-[10px] text-stone-500"
                                title={`Sent ${new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }).format(new Date(b.confirmationEmailSentAt))}`}
                              >
                                ✉ sent
                              </span>
                            ) : (
                              <span
                                className="text-[10px] text-orange-700 font-semibold"
                                title={b.confirmationEmailLastError ?? "Email not yet sent"}
                              >
                                ⚠ email failed
                                {b.confirmationEmailAttempts > 0 && (
                                  <> · {b.confirmationEmailAttempts}×</>
                                )}
                              </span>
                            )
                          )}
                          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                            {b.status === "pending" && (
                              <AdminConfirmButton bookingId={b.id} />
                            )}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        Showing the {Math.min(rows.length, 100)} most recent bookings
        {activeStatus !== "all" ? ` with status "${activeStatus}"` : ""}. Tenant: <span className="font-mono">{tenant.slug}</span>.
      </p>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>;
}

function SummaryTile({
  label,
  value,
  tone,
  alert,
}: {
  label: string;
  value: number;
  tone: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        alert ? "border-orange-300 bg-orange-50" : "border-stone-200"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
