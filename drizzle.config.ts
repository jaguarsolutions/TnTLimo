import { defineConfig } from "drizzle-kit";
import { loadEnvFile } from "node:process";

// Drizzle CLI doesn't auto-load .env files (Next.js does, but the CLI doesn't).
// Pull DATABASE_URL out of .env.local for local dev. In CI / Vercel the env
// vars are already populated by the platform, so the failed load is harmless.
try {
  loadEnvFile(".env.local");
} catch {
  // file missing is fine
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/booking/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  // Verbose output so we see what's being generated
  verbose: true,
  strict: true,
});
