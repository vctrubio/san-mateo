import Link from 'next/link';

export default function AdminGuestsPage() {
  return (
    <main className="min-h-screen bg-[#F5F2ED] px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to dashboard</Link>
          <Link href="/admin/bookings" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View bookings</Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin route</p>
          <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Guests</h1>
          <p className="max-w-3xl text-slate-600 leading-relaxed">
            This page will become the guest CRM: lifetime spend, stays, reviews, payment history, and optional user
            account links. It is the customer-facing admin record for every booking counterparty.
          </p>
        </section>
      </div>
    </main>
  );
}
