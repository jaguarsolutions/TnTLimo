import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 renamed Middleware to "Proxy" (same functionality; file convention
 * is now `proxy.ts`, and in a `src/` project it must live at `src/proxy.ts` to
 * be picked up). See node_modules/next/dist/docs/.../proxy.md.
 *
 * Scope: ONLY the API surface. We hard-block abusive crawlers/scrapers (which
 * ignore robots.txt) from the API routes — chiefly to stop them triggering
 * function invocations and paid Google Maps calls via /api/quote. We do NOT
 * touch page routes (on Netlify the request is already billed before the proxy
 * runs, so blocking a static-page crawl only adds an edge invocation — the job
 * of a front layer like Cloudflare, not this) and we do NOT touch /admin (its
 * pages guard themselves with server-side redirects). Real search engines and
 * ordinary browsers are unaffected.
 */
const BLOCKED_BOT_UA = [
  "gptbot",
  "oai-searchbot",
  "chatgpt-user",
  "ccbot",
  "claudebot",
  "claude-web",
  "anthropic-ai",
  "google-extended",
  "applebot-extended",
  "bytespider",
  "bytedance",
  "amazonbot",
  "meta-externalagent",
  "facebookbot",
  "perplexitybot",
  "cohere-ai",
  "diffbot",
  "imagesiftbot",
  "omgilibot",
  "dataforseobot",
  "mj12bot",
  "ahrefsbot",
  "semrushbot",
  "dotbot",
  "petalbot",
  "megaindex",
  "serpstatbot",
  "zoominfobot",
  "scrapy",
];

function isBlockedBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BLOCKED_BOT_UA.some((bot) => ua.includes(bot));
}

export function proxy(request: NextRequest) {
  // Stripe's webhook is server-to-server and must never be blocked.
  if (request.nextUrl.pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (isBlockedBot(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
