/**
 * Prefix for static files in `public/` when the site is hosted under a subpath.
 * For main domain deploy (e.g. public_html root), leave unset — paths stay `/…`.
 * If you ever need a subfolder, set at build time, e.g. `NEXT_PUBLIC_BASE_PATH=/blog npm run build`
 * (must match `basePath` in `next.config.ts`).
 */
export function publicUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";
  return base ? `${base}${path}` : path;
}
