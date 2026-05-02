import Link from 'next/link';
import { BarChart3, Building2, CalendarCheck, CheckCircle2, Clock, Euro, Users, Home } from 'lucide-react';
import { getAdminDashboardStats, getAnalyticsStats, getAdminBookingSnapshot } from '@/services/AdminOpsService';

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' }).format(new Date(value));
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  checked_in: 'bg-sky-50 text-sky-700 border-sky-200',
  checked_out: 'bg-slate-50 text-slate-600 border-slate-200',
  completed: 'bg-slate-50 text-slate-600 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default async function AdminPage() {
  const [stats, analytics, snapshot] = await Promise.all([
    getAdminDashboardStats(),
    getAnalyticsStats(),
    getAdminBookingSnapshot(),
  ]);

  const statCards = [
    { label: 'Active properties', value: stats.properties_active, icon: Building2, color: 'text-ocean' },
    { label: 'Total guests', value: stats.guests_total, icon: Users, color: 'text-violet-600' },
    { label: 'All bookings', value: stats.bookings_total, icon: CalendarCheck, color: 'text-slate-600' },
    { label: 'Pending requests', value: stats.bookings_pending, icon: Clock, color: 'text-amber-600' },
    { label: 'Confirmed stays', value: stats.bookings_confirmed, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Occupied today', value: stats.occupied_today, icon: Home, color: 'text-sky-600' },
    { label: 'Total revenue', value: formatMoney(stats.revenue_total_cents), icon: Euro, color: 'text-slate-600' },
    { label: 'Collected', value: formatMoney(stats.revenue_collected_cents), icon: BarChart3, color: 'text-emerald-600' },
  ];

  const maxRevenue = Math.max(...analytics.monthlyRevenue.map((m) => m.revenue_cents), 1);

  return (
    <main className="space-y-8">
      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Revenue + Occupancy */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly revenue bars */}
          {analytics.monthlyRevenue.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-6">Monthly revenue performance</p>
              <div className="flex items-end gap-3 h-48">
                {analytics.monthlyRevenue.map((month) => {
                  const pct = (month.revenue_cents / maxRevenue) * 100;
                  return (
                    <div key={month.month} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <div className="text-[9px] font-mono text-slate-400 text-center">{formatMoney(month.revenue_cents)}</div>
                      <div
                        className="w-full rounded-t-lg bg-ocean/80 transition-all hover:bg-ocean"
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
                    <span className="text-xs font-mono text-slate-500">{prop.nights_booked} nights · {prop.occupancy_pct}%</span>
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
        </div>

        {/* Right Column: Bookings snapshot */}
        <div className="space-y-8">
          {/* Recent bookings */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Recent activity</p>
              <Link href="/admin/bookings" className="text-[10px] font-mono uppercase tracking-[0.3em] text-ocean hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {snapshot.recentBookings.slice(0, 6).map((booking) => (
                <div key={booking.reference} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{booking.reference}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5 truncate max-w-[120px]">
                      {booking.property_name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900">{formatMoney(booking.total_cents)}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-[0.2em] ${statusColors[booking.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pending requests */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-5">Pending requests</p>
            {snapshot.pendingRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                All caught up.
              </div>
            ) : (
              <div className="space-y-3">
                {snapshot.pendingRequests.map((booking) => (
                  <div key={booking.reference} className="flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{booking.reference}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{booking.guest_email}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900">{formatMoney(booking.total_cents)}</div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-600 mt-0.5">Awaiting</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
