"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  token: string;
  total: string;
}

export default function CancelBookingButton({ bookingId, token, total }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Cancellation failed");
      }
      // Reload the page so the new status renders.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
      setSubmitting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-white font-sans text-sm font-semibold rounded-full hover:bg-charcoal active:scale-[0.97] transition-colors cursor-pointer"
      >
        Cancel booking
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-sunset/30 bg-sunset/5 p-5">
      <p className="font-sans text-sm text-ink leading-relaxed">
        Cancel this booking and refund <span className="font-semibold">{total}</span> to your original
        payment method? This can&apos;t be undone, but you can rebook anytime.
      </p>
      {error && (
        <p className="mt-3 font-sans text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ink text-white font-sans text-sm font-semibold rounded-full hover:bg-charcoal disabled:opacity-60 transition-colors cursor-pointer"
        >
          {submitting ? "Cancelling…" : "Yes, cancel and refund"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={submitting}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-border text-ink font-sans text-sm font-semibold rounded-full hover:border-ink disabled:opacity-60 transition-colors cursor-pointer"
        >
          Keep booking
        </button>
      </div>
    </div>
  );
}
