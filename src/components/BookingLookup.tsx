'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

type BookingStatusRecord = {
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  total_cents: number;
  created_at: string;
  property_name: string;
  property_slug: string;
  guest_name: string | null;
  guest_email: string;
  payment_state: string | null;
  paid_cents: number | null;
  outstanding_cents: number | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

export default function BookingLookup() {
  const searchParams = useSearchParams();
  const initialReference = searchParams.get("reference") ?? "";
  const [reference, setReference] = useState(initialReference);
  const [result, setResult] = useState<BookingStatusRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = useMemo(() => reference.trim().toUpperCase(), [reference]);

  const handleLookup = useCallback(() => {
    setError(null);
    setResult(null);

    if (!trimmed) {
      setError("Enter a booking reference.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookings/${encodeURIComponent(trimmed)}`);
        if (!response.ok) {
          throw new Error("No booking found with that reference.");
        }
        const payload = await response.json();
        setResult(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to look up booking.");
      }
    });
  }, [trimmed]);

  useEffect(() => {
    if (initialReference) {
      handleLookup();
    }
  }, [handleLookup, initialReference]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Booking status</p>
      <h3 className="mt-3 text-xl font-bold text-slate-900">Track a booking</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        Paste a reference from the booking confirmation to see its status and payments.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="INF-2026-0002"
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-mono uppercase tracking-[0.2em] text-sm outline-none focus:border-ocean"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={isPending}
          className="rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-ocean disabled:opacity-70"
        >
          {isPending ? "Checking..." : "Find booking"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Reference</div>
              <div className="font-semibold text-slate-900">{result.reference}</div>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
              {result.status}
            </div>
          </div>
          <div>{result.property_name}</div>
          <div>{formatDate(result.check_in)} to {formatDate(result.check_out)}</div>
          <div>Guest: {result.guest_name || result.guest_email}</div>
          <div>Total: {formatMoney(result.total_cents)}</div>
          <div>Paid: {formatMoney(result.paid_cents)}</div>
          <div>Outstanding: {formatMoney(result.outstanding_cents)}</div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-ocean">
            {result.payment_state ?? "unpaid"}
          </div>
        </div>
      ) : null}
    </div>
  );
}
