"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CancelResponse {
  ok?: boolean;
  refunded?: boolean;
  alreadyCancelled?: boolean;
  refundId?: string;
  error?: string;
}

/**
 * Operator-facing cancel button — bypasses the 24h free-cancel window.
 * Two-step UX so the operator can't cancel by accident.
 */
export default function AdminCancelButton({
  bookingId,
  confirmationCode,
  total,
}: {
  bookingId: string;
  confirmationCode: string;
  total: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setStatus("loading");
    setError(null);

    const adminPass = prompt(
      `Cancel booking ${confirmationCode} and refund ${total} to the customer?\n\nEnter admin password to continue:`
    );
    if (!adminPass) {
      setStatus("idle");
      setConfirming(false);
      return;
    }

    const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/admin-cancel`, {
      method: "POST",
      headers: { "x-admin-token": adminPass },
    });
    const data = (await res.json().catch(() => ({}))) as CancelResponse;

    if (!res.ok) {
      setError(data.error ?? "Cancel failed");
      setStatus("error");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  if (status === "done") {
    return <span className="text-xs text-stone-600 font-semibold">Cancelled · refunded</span>;
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold text-red-700 hover:text-red-900 underline cursor-pointer"
      >
        Cancel + refund
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={cancel}
        disabled={status === "loading"}
        className="text-xs font-semibold text-red-700 hover:text-red-900 underline disabled:opacity-50 cursor-pointer"
      >
        {status === "loading" ? "Cancelling…" : "Confirm cancel"}
      </button>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          setStatus("idle");
          setError(null);
        }}
        disabled={status === "loading"}
        className="text-xs font-semibold text-stone-500 hover:text-stone-700 cursor-pointer"
      >
        Keep
      </button>
      {error && (
        <span className="text-[10px] text-red-700 max-w-[200px] leading-tight">{error}</span>
      )}
    </span>
  );
}
