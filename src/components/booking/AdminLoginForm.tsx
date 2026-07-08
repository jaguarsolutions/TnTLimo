"use client";

import { useState } from "react";

export default function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(data?.error ?? "Unable to sign in. Check credentials and try again.");
      setStatus("idle");
      return;
    }

    // Full-document navigation (not router.push): the auth cookie was just set
    // by the fetch above, and a client-side RSC navigation doesn't re-evaluate
    // server-side auth state — it would leave the user stuck on this page until
    // a manual refresh. A hard navigation issues a fresh request that the
    // middleware evaluates against the now-present cookie, landing on the
    // dashboard reliably. `status` stays "loading" until the page unloads.
    window.location.assign("/admin/bookings");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
      <div>
        <label htmlFor="admin-username" className="block text-sm font-semibold text-stone-900">
          Username
        </label>
        <input
          id="admin-username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="block text-sm font-semibold text-stone-900">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-sm text-stone-500">
        Use your operator credentials to access the admin dashboard.
      </p>
    </form>
  );
}
