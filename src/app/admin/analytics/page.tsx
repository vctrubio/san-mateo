import Link from 'next/link';
import { getAnalyticsStats, getAdminBookingSnapshot } from '@/services/AdminOpsService';

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export default async function AdminAnalyticsPage() {
  const [analytics, snapshot] = await Promise.all([
    getAnalyticsStats(),
    getAdminBookingSnapshot(),
  ]);

  const maxRevenue = Math.max(...analytics.monthlyRevenue.map((m) => m.revenue_cents), 1);

  return (
    <main className="space-y-8">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin route</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Analytics</h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              Revenue, occupancy, and booking performance across all properties.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to dashboard</Link>
            <Link href="/admin/bookings" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View bookings</Link>
          </div>
        </div>
      </section>

      {/* Revenue stats */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total revenue', value: formatMoney(analytics.totalRevenue), sub: 'confirmed + completed stays' },
          { label: 'Collected', value: formatMoney(analytics.collectedRevenue), sub: 'payments succeeded' },
          { label: 'Outstanding', value: formatMoney(analytics.outstandingRevenue), sub: 'balance due' },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
            <div className="mt-3 text-3xl font-bold text-slate-900">{card.value}</div>
            <div className="mt-1 text-xs text-slate-400 font-mono uppercase tracking-widest">{card.sub}</div>
          </div>
        ))}
      </section>

      {/* Monthly revenue bars */}
      {analytics.monthlyRevenue.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-6">Monthly revenue</p>
          <div className="flex items-end gap-3 h-40">
            {analytics.monthlyRevenue.map((month) => {
              const pct = (month.revenue_cents / maxRevenue) * 100;
              return (
                <div key={month.month} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <div className="text-[9px] font-mono text-slate-400 text-center">{formatMoney(month.revenue_cents)}</div>
                  <div
                    className="w-full rounded-t-lg bg-ocean/80 transition-all"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                  <div className="text-[9px] font-mono text-slate-500 text-center truncate w-full">{month.month.slice(5)}/{month.month.slice(2, 4)}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Property occupancy */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-5">Property occupancy</p>
        <div className="space-y-4">
          {analytics.propertyOccupancy.map((prop) => (
            <Link key={prop.slug} href={`/admin/properties/${prop.slug}`} className="block group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-ocean transition-colors">{prop.name}</span>
                <span className="text-xs font-mono text-slate-500">{prop.nights_booked} bookings · {prop.occupancy_pct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ocean transition-all"
                  style={{ width: `${Math.min(prop.occupancy_pct, 100)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Booking status breakdown */}
      <section className="grid gap-4 md:grid-cols-3">
        {snapshot.statusSummary.map((row) => (
          <div key={row.status} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{row.status}</p>
            <div className="mt-3 text-3xl font-bold text-slate-900">{row.count}</div>
          </div>
        ))}
      </section>

      {/* Recent + pending */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-4">Recent bookings</p>
          <div className="space-y-3 text-sm text-slate-600">
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
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-4">Pending requests</p>
          {snapshot.pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">No pending requests.</div>
          ) : (
            <div className="space-y-3 text-sm text-slate-600">
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
          )}
        </div>
      </section>
    </main>
  );
}
