import Link from "next/link";
import { Suspense } from "react";
import BookingLookup from "@/components/BookingLookup";

export default function BookingLookupPage() {
  return (
    <main className="min-h-screen bg-[#F5F2ED] px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Nav */}
        <div className="flex flex-wrap gap-3">
          <Link href="/finca" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">
            Browse &amp; Book
          </Link>
          <Link href="/" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
            ← Home
          </Link>
        </div>

        {/* Lookup card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Booking lookup</p>
          <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-3">Check your booking</h1>
          <p className="text-slate-600 leading-relaxed mb-6">
            Enter your booking reference to see the current status, stay details, and payment state.
          </p>
          <Suspense fallback={null}>
            <BookingLookup />
          </Suspense>
        </section>

        {/* Don't have a reference CTA */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-1">No reference?</p>
            <p className="font-bold text-lg">Book a stay at Finca San Mateo</p>
            <p className="text-sm text-slate-400 mt-1">Choose your dates, guests, and confirm in 60 seconds.</p>
          </div>
          <Link
            href="/finca"
            className="shrink-0 rounded-full bg-ocean px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-sky-500"
          >
            Browse properties →
          </Link>
        </div>
      </div>
    </main>
  );
}
