"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ConfirmResponse {
  ok?: boolean;
  confirmed?: boolean;
  emailSent?: boolean;
  emailError?: string;
  alreadySent?: boolean;
  error?: string;
}

export default function AdminConfirmButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "warning" | "error">("idle");
  const [warning, setWarning] = useState<string | null>(null);

  async function confirm() {
    setStatus("loading");
    setWarning(null);
    const adminPass = prompt("Enter admin password to confirm:");
    if (!adminPass) {
      setStatus("idle");
      return;
    }

    const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/confirm`, {
      method: "POST",
      headers: { "x-admin-token": adminPass },
    });
    const data = (await res.json().catch(() => ({}))) as ConfirmResponse;

    if (!res.ok) {
      alert(data.error ?? "Failed to confirm booking");
      setStatus("error");
      return;
    }

    // res.ok=true can still mean "confirmed but email failed" — the route
    // returns 200 in that case so the status change isn't undone. We surface
    // the email error so the operator knows to investigate (usually a Resend
    // domain-verification issue) and can use the Retry-email action.
    if (data.emailSent === false && data.emailError) {
      setWarning(data.emailError);
      setStatus("warning");
      router.refresh();
      return;
    }

    setStatus("done");
    router.refresh();
  }

  if (status === "done") {
    return <span className="text-xs text-green-700 font-semibold">Confirmed ✓ · email sent</span>;
  }

  if (status === "warning") {
    return (
      <span className="inline-flex flex-col items-end text-right">
        <span className="text-xs text-orange-700 font-semibold">Confirmed · email failed</span>
        {warning && (
          <span className="text-[10px] text-orange-600/80 max-w-[220px] mt-0.5 leading-tight break-words">
            {warning}
          </span>
        )}
      </span>
    );
  }

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
