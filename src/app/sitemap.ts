import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteEnv";

/**
 * Public, indexable pages listed for search engines. Giving crawlers an
 * explicit map means they fetch the pages that matter once, instead of
 * repeatedly brute-crawling the whole site (which is what drives up metered
 * web requests). Operator (/admin), API, and transactional booking pages are
 * intentionally excluded — they're disallowed in robots.ts.
 */
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "monthly", priority: 1.0 },
  { path: "transportation", changeFrequency: "monthly", priority: 0.9 },
  { path: "transportation/airport-transfer", changeFrequency: "monthly", priority: 0.8 },
  { path: "transportation/point-to-point", changeFrequency: "monthly", priority: 0.8 },
  { path: "transportation/hourly-charter", changeFrequency: "monthly", priority: 0.8 },
  { path: "transportation/disneyland-transportation", changeFrequency: "monthly", priority: 0.8 },
  { path: "transportation/book", changeFrequency: "monthly", priority: 0.7 },
  { path: "los-angeles-hollywood-tour-from-anaheim", changeFrequency: "monthly", priority: 0.7 },
  { path: "private-los-angeles-tour", changeFrequency: "monthly", priority: 0.7 },
  { path: "universal-studios-transportation-anaheim", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${SITE_URL}/${path}` : SITE_URL,
    lastModified,
    changeFrequency,
    priority,
  }));
}
