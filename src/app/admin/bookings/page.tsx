import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/booking/db";
import { bookings, type BookingStatus } from "@/lib/booking/schema";
import { signManageToken } from "@/lib/booking/manageToken";
import { getTenant } from "@/lib/tenant";
import { ADMIN_SESSION_COOKIE, isAdminSessionValue } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { describeBooking } from "@/lib/booking/describeBooking";
import AdminBookingRow from "@/components/booking/AdminBookingRow";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "payment_failed", label: "Payment failed" },
  { value: "refund_failed", label: "Refund pending" },
];

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
                  const manageHref = `/booking/${b.confirmationCode}?t=${encodeURIComponent(signManageToken(b.id))}`;
                  return (
                    <AdminBookingRow
                      key={b.id}
                      timezone={tenant.timezone}
                      manageHref={manageHref}
                      detailRows={describeBooking(b)}
                      booking={{
                        id: b.id,
                        confirmationCode: b.confirmationCode,
                        status: b.status,
                        serviceLabel: b.serviceLabel,
                        customerFirstName: b.customerFirstName,
                        customerLastName: b.customerLastName,
                        customerEmail: b.customerEmail,
                        customerPhone: b.customerPhone,
                        pickupAt: b.pickupAt.toISOString(),
                        createdAt: b.createdAt.toISOString(),
                        totalCents: b.totalCents,
                        confirmationEmailSentAt: b.confirmationEmailSentAt?.toISOString() ?? null,
                        confirmationEmailAttempts: b.confirmationEmailAttempts,
                        confirmationEmailLastError: b.confirmationEmailLastError,
                      }}
                    />
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
