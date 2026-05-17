import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
const ADMIN_SESSION_TOKEN_LABEL = "tnttours-admin-session-v1";

function getAdminCredentials() {
  return {
    user: process.env.ADMIN_USER ?? "",
    pass: process.env.ADMIN_PASS ?? "",
  };
}

function getWebCrypto() {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.subtle !== "undefined") {
    return globalThis.crypto;
  }

  throw new Error("Web Crypto API is required for admin auth");
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function getExpectedAdminSessionValue(): Promise<string | null> {
  const { pass } = getAdminCredentials();
  if (!pass) {
    return null;
  }

  const cryptoImpl = await getWebCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ADMIN_SESSION_TOKEN_LABEL}:${pass}`);
  const hashBuffer = await cryptoImpl.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export async function isAdminSessionValue(value: string | undefined): Promise<boolean> {
  const expected = await getExpectedAdminSessionValue();
  if (!expected || !value) {
    return false;
  }
  return timingSafeEqual(hexToBytes(value), hexToBytes(expected));
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const { user, pass } = getAdminCredentials();
  return Boolean(user && pass && username === user && password === pass);
}

export function getAdminSessionFromHeaders(request: Request | NextRequest): string | undefined {
  const raw = request.headers.get("cookie");
  if (!raw) {
    return undefined;
  }
  const cookies = raw.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    if (name === ADMIN_SESSION_COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}

export async function isAdminRequestAuthenticated(request: Request | NextRequest): Promise<boolean> {
  const adminPass = process.env.ADMIN_PASS;
  if (adminPass) {
    const token = request.headers.get("x-admin-token");
    if (token === adminPass) {
      return true;
    }
  }
  const session = getAdminSessionFromHeaders(request);
  return isAdminSessionValue(session);
}
