ALTER TABLE "bookings" ADD COLUMN "tenant_id" text DEFAULT 'tnt' NOT NULL;--> statement-breakpoint
CREATE INDEX "bookings_tenant_idx" ON "bookings" USING btree ("tenant_id");