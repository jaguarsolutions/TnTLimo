import type { Tenant } from "@/lib/tenant";

export function formatMoney(cents: number, currency: Tenant["currency"] = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatPickup(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(date);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Branded outer chrome shared by every transactional email — the dark header
 * bar with the tenant name in brand-accent color, a cream body, and a small
 * footer line. Templates supply just the body markup.
 */
export function emailShell(args: { tenant: Tenant; body: string }): string {
  const { tenant, body } = args;
  return `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #0c0b0a;">
      <div style="background: #1c1917; padding: 32px 24px; text-align: center;">
        <h1 style="color: ${tenant.brandColor}; margin: 0; font-size: 22px; letter-spacing: 0.04em;">${escapeHtml(tenant.name.toUpperCase())}</h1>
      </div>
      <div style="padding: 32px 24px; background: #faf8f4;">
        ${body}
      </div>
      <div style="padding: 16px 24px; text-align: center; color: #7a7268; font-size: 12px;">
        ${escapeHtml(tenant.name)} · powered by ${escapeHtml(tenant.shortName)}
      </div>
    </div>
  `;
}
