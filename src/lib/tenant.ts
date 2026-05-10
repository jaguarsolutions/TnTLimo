import { SITE_CONTACT } from "./siteContact";
import { SITE_URL, IS_BETA } from "./siteEnv";

/**
 * The "tenant" the booking platform is operating on behalf of.
 *
 * Today there is exactly one tenant (TNT). When the platform goes multi-tenant
 * the resolution logic (see {@link getTenant}) is the only thing that changes —
 * every call site is already routed through `getTenant()`, so the booking
 * domain code never references a specific brand directly.
 */
export interface Tenant {
  /** Stable slug used as DB `tenant_id` and (later) as a subdomain. */
  slug: string;
  /** Long display name used in email subjects, page titles, etc. */
  name: string;
  /** Short brand name for buttons and nav. */
  shortName: string;
  /** From address on outbound mail. Must be a verified Resend sender. */
  fromEmail: string;
  /** Customer-facing support email. */
  supportEmail: string;
  /** Customer-facing phone, both display and `tel:` form. */
  supportPhone: { display: string; href: string };
  /** Where the customer-facing site lives. Used to build absolute URLs. */
  siteUrl: string;
  /** Brand accent color used in email templates. */
  brandColor: string;
  /** Optional logo URL (absolute) for use in emails. */
  logoUrl: string | null;
  /**
   * Stripe Connected account id (`acct_…`). `null` means "use the platform
   * account" — i.e. the regular Stripe account configured via
   * `STRIPE_SECRET_KEY`. When the platform takes on a second tenant they get
   * their own connected account here.
   */
  stripeAccountId: string | null;
  /** IANA timezone for displaying pickup times to customers. */
  timezone: string;
  /** ISO 4217 currency for prices. Stripe rejects mismatches. */
  currency: "usd";
  /** Free-cancel window before pickup, in hours. */
  cancellationWindowHours: number;
  /** Prefix for form subject lines — used by beta deployments. */
  formSubjectPrefix: string;
}

const TNT_TENANT: Tenant = {
  slug: "tnt",
  name: "TNT Tours & Transportation",
  shortName: "TNT Tours",
  fromEmail: process.env.RESEND_FROM_EMAIL ?? "TNT Tours <bookings@tnttours.org>",
  supportEmail: SITE_CONTACT.email,
  supportPhone: {
    display: SITE_CONTACT.phoneDisplay,
    href: SITE_CONTACT.phoneHref,
  },
  siteUrl: SITE_URL,
  brandColor: "#c9a96e",
  logoUrl: null,
  stripeAccountId: null,
  timezone: "America/Los_Angeles",
  currency: "usd",
  cancellationWindowHours: 24,
  formSubjectPrefix: IS_BETA ? "[BETA] " : "",
};

/**
 * Resolves the tenant for the current request.
 *
 * Today this always returns the single TNT tenant. When the platform goes
 * multi-tenant, this is the *only* function that needs to change — replace
 * the constant return with a subdomain / host-header lookup against a
 * `tenants` table.
 */
export function getTenant(): Tenant {
  return TNT_TENANT;
}
