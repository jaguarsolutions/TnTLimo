CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"confirmation_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"service_code" text NOT NULL,
	"service_label" text NOT NULL,
	"payload" jsonb NOT NULL,
	"customer_email" text NOT NULL,
	"customer_first_name" text NOT NULL,
	"customer_last_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"pickup_at" timestamp with time zone NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"gratuity_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_refund_id" text,
	"cancellation_reason" text,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_confirmation_code_unique" UNIQUE("confirmation_code")
);
--> statement-breakpoint
CREATE INDEX "bookings_email_idx" ON "bookings" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_pickup_idx" ON "bookings" USING btree ("pickup_at");