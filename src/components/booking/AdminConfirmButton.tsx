"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminConfirmButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function confirm() {
    setStatus("loading");
    const adminPass = prompt("Enter admin password to confirm:");
    if (!adminPass) { setStatus("idle"); return; }

    const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/confirm`, {
      method: "POST",
      headers: { "x-admin-token": adminPass },
    });

    if (res.ok) {
      setStatus("done");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string };
      alert(data.error ?? "Failed to confirm booking");
      setStatus("error");
    }
  }

  if (status === "done") return <span className="text-xs text-green-700 font-semibold">Confirmed ✓</span>;

  return (
    <button
      onClick={confirm}
      disabled={status === "loading"}
      className="text-xs font-semibold text-green-700 hover:text-green-900 underline disabled:opacity-50 cursor-pointer"
    >
      {status === "loading" ? "Confirming…" : "Confirm + email"}
    </button>
  );
}
