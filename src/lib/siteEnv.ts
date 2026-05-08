/**
 * Environment-aware constants for the TNT Tours site.
 *
 * Beta deployments (e.g. beta.tnttours.com) set:
 *   NEXT_PUBLIC_IS_BETA=true
 *   NEXT_PUBLIC_SITE_URL=https://beta.tnttours.com
 *
 * Production sets neither (or sets IS_BETA=false explicitly).
 */

export const IS_BETA = process.env.NEXT_PUBLIC_IS_BETA === "true";

const PROD_URL = "https://www.tnttours.org";
const BETA_URL = "https://beta.tnttours.com";

/** Canonical URL of the current deployment, used for OG images and metadataBase. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (IS_BETA ? BETA_URL : PROD_URL);

/** Subject prefix for form submissions so beta inquiries are easy to filter in inbox. */
export const FORM_SUBJECT_PREFIX = IS_BETA ? "[BETA] " : "";
