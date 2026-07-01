import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon serverless Postgres client wired through Drizzle.
 *
 * `DATABASE_URL` is provisioned by the Neon ↔ Netlify integration.
 * For local dev, pull it from the Neon dashboard into `.env.local`.
 *
 * The connection is lazy: we only call `neon()` on first DB query, which
 * avoids Neon's URL-format check failing at build time when `DATABASE_URL`
 * is a placeholder (e.g. during preview deployments).
 */

type DrizzleNeonDb = ReturnType<typeof drizzle<typeof schema, NeonQueryFunction<false, false>>>;

let cached: DrizzleNeonDb | null = null;

function init(): DrizzleNeonDb {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it in Netlify env (or .env.local for dev).");
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

/** Proxy that defers real client creation until first query. */
export const db = new Proxy({} as DrizzleNeonDb, {
  get(_target, prop: keyof DrizzleNeonDb) {
    if (!cached) cached = init();
    const value = cached[prop];
    return typeof value === "function" ? value.bind(cached) : value;
  },
});

export { schema };
