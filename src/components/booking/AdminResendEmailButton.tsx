"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  /** UI label — different copy when retrying a failure vs sending a duplicate. */
  variant?: "retry" | "resend";
}

export default function AdminResendEmailButton({ bookingId, variant = "retry" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function send() {
    setStatus("loading");

    const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/resend-email`, {
      method: "POST",
    });

    if (res.ok) {
      setStatus("done");
      router.refresh();
    } else {
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      alert(data.error ?? "Email could not be sent");
      setStatus("error");
    }
  }

  if (status === "done") {
    return <span className="text-xs text-green-700 font-semibold">Sent ✓</span>;
  }

  const label =
    status === "loading"
      ? "Sending…"
      : variant === "retry"
        ? "Retry email"
        : "Resend email";
  const toneClass =
    variant === "retry"
      ? "text-orange-700 hover:text-orange-900"
      : "text-stone-700 hover:text-stone-900";

  return (
    <button
      type="button"
      onClick={send}
      disabled={status === "loading"}
      className={`text-xs font-semibold underline disabled:opacity-50 cursor-pointer ${toneClass}`}
    >
      {label}
    </button>
  );
}
