import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly `middleware`) — guards `/admin/*` with HTTP Basic Auth.
 *
 * Set the following in your env:
 *   ADMIN_USER=...
 *   ADMIN_PASS=...
 *
 * This is intentionally minimal — basic auth is enough for the small operator
 * audience right now. When real users / roles exist, swap this for a proper
 * auth integration (Clerk, NextAuth, or a custom session cookie).
 */
export function proxy(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    return new NextResponse("Admin auth not configured. Set ADMIN_USER and ADMIN_PASS in env.", {
      status: 500,
    });
  }

  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(auth.slice("Basic ".length));
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(":");
  const user = idx >= 0 ? decoded.slice(0, idx) : "";
  const pass = idx >= 0 ? decoded.slice(idx + 1) : "";

  if (user !== expectedUser || pass !== expectedPass) {
    return unauthorized();
  }

  return NextResponse.next();
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
