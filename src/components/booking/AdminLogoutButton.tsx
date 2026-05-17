"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 disabled:opacity-50"
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
