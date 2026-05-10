import { pgTable, text, timestamp, integer, jsonb, uuid, index } from "drizzle-orm/pg-core";

/**
 * Booking status lifecycle:
 *   pending        — row created, customer being redirected to Stripe Checkout
 *   confirmed      — Stripe webhook confirmed payment
 *   cancelled      — customer or operator cancelled, refund issued
 *   refund_failed  — cancellation attempted but Stripe refund failed (manual review)
 *   payment_failed — Stripe checkout expired or failed
 */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "refund_failed"
  | "payment_failed";

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * Tenant scope. Today everything is "tnt". When the platform goes
     * multi-tenant this is the column every query filters by.
     */
    tenantId: text("tenant_id").notNull().default("tnt"),

    /** Short human-readable confirmation code shown to customers, e.g. "B-7K9F2". */
    confirmationCode: text("confirmation_code").notNull().unique(),

    status: text("status").$type<BookingStatus>().notNull().default("pending"),

    serviceCode: text("service_code").notNull(),
    serviceLabel: text("service_label").notNull(),

    /** Full wizard state snapshot — preserves exact form values for support. */
    payload: jsonb("payload").notNull(),

    customerEmail: text("customer_email").notNull(),
    customerFirstName: text("customer_first_name").notNull(),
    customerLastName: text("customer_last_name").notNull(),
    customerPhone: text("customer_phone").notNull(),

    /** ISO 8601 of pickup time (stored with timezone). */
    pickupAt: timestamp("pickup_at", { withTimezone: true }).notNull(),

    /** Amounts in USD cents (Stripe convention). */
    subtotalCents: integer("subtotal_cents").notNull(),
    gratuityCents: integer("gratuity_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),

    /** Stripe references — populated as the flow progresses. */
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeRefundId: text("stripe_refund_id"),

    cancellationReason: text("cancellation_reason"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("bookings_tenant_idx").on(table.tenantId),
    index("bookings_email_idx").on(table.customerEmail),
    index("bookings_status_idx").on(table.status),
    index("bookings_pickup_idx").on(table.pickupAt),
  ]
);

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
