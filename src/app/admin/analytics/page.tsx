import Link from 'next/link';
import { getAdminBookingSnapshot } from '@/services/AdminOpsService';

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

export default async function AdminAnalyticsPage() {
  const snapshot = await getAdminBookingSnapshot();

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin route</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Analytics</h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              Portfolio-level booking activity and payment states. Revenue summaries will expand next.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to dashboard</Link>
            <Link href="/admin/guests" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View guests</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {snapshot.statusSummary.map((row) => (
          <div key={row.status} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{row.status}</p>
            <div className="mt-3 text-3xl font-bold text-slate-900">{row.count}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Recent bookings</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {snapshot.recentBookings.map((booking) => (
              <div key={booking.reference} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{booking.reference}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{booking.property_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{formatMoney(booking.total_cents)}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ocean">{booking.payment_state ?? 'unpaid'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Pending requests</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {snapshot.pendingRequests.map((booking) => (
              <div key={booking.reference} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{booking.reference}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{booking.property_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{formatMoney(booking.total_cents)}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{booking.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
