import type { MetadataRoute } from "next";
import { SITE_URL, IS_BETA } from "@/lib/siteEnv";

/**
 * AI/data-scraper crawlers that generate crawl load (and metered web requests)
 * without ever sending us a customer. We ask them not to crawl at all. Search
 * engines that actually drive bookings (Google, Bing, etc.) are still welcome.
 */
const BLOCKED_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "CCBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "PerplexityBot",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "DataForSeoBot",
  "MJ12bot",
  "AhrefsBot",
  "SemrushBot",
  "DotBot",
];

export default function robots(): MetadataRoute.Robots {
  // Never let non-production deployments (e.g. beta.tnttours.com) be crawled or
  // indexed — it wastes crawl budget/credits and creates duplicate content.
  if (IS_BETA) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      // Everyone else: crawl the marketing pages, but stay out of the operator
      // dashboard and API routes (neither belongs in search results, and both
      // are pure crawl waste).
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      // Scrapers we don't want at all.
      ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
