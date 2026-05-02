import Link from "next/link";
import { Suspense } from "react";
import BookingLookup from "@/components/BookingLookup";

export default function BookingLookupPage() {
  return (
    <main className="min-h-screen bg-[#F5F2ED] px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">
            Back to landing
          </Link>
          <Link href="/finca" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
            Browse finca
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Booking lookup</p>
          <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-3">Check your booking status</h1>
          <p className="text-slate-600 leading-relaxed">
            Enter the reference returned after booking to see the current status, totals, and payment state.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <BookingLookup />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
