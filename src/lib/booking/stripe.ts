import Stripe from "stripe";
import { getTenant } from "@/lib/tenant";

let cached: Stripe | null = null;

/**
 * Lazily-constructed Stripe client tied to the platform account
 * (the one whose secret key is in `STRIPE_SECRET_KEY`).
 *
 * For Connect operations on behalf of a specific tenant, pass
 * `{ stripeAccount: tenant.stripeAccountId }` as the second argument
 * to individual Stripe method calls — see {@link withTenantStripe}.
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it in Vercel env (use sk_test_… for testing)."
    );
  }
  cached = new Stripe(key, { typescript: true });
  return cached;
}

/**
 * Returns the Stripe `requestOptions` for the current tenant, ready to spread
 * into any Stripe API call:
 *
 *   await stripe.checkout.sessions.create(params, withTenantStripe())
 *
 * For the single-tenant TnT setup, the tenant's `stripeAccountId` is `null`
 * and this returns `undefined` — Stripe falls back to the platform account.
 * When a connected account is configured, calls are scoped to that account
 * (the customer's card is charged into the tenant's Stripe balance).
 */
export function withTenantStripe(): Stripe.RequestOptions | undefined {
  const tenant = getTenant();
  if (!tenant.stripeAccountId) return undefined;
  return { stripeAccount: tenant.stripeAccountId };
}
