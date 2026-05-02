import Link from 'next/link';
import { BarChart3, Building2, CalendarCheck, CheckCircle2, Clock, Euro, Users, Home } from 'lucide-react';
import { getAdminDashboardStats } from '@/services/AdminOpsService';
import { getAdminBookingSnapshot } from '@/services/AdminOpsService';

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
  const [stats, snapshot] = await Promise.all([
    getAdminDashboardStats(),
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

  return (
    <main className="space-y-10">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin dashboard</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4">
          Finca San Mateo — Operations
        </h1>
        <p className="max-w-3xl text-slate-600 leading-relaxed">
          Estate-level overview. Real-time stats from the database, current booking states, and quick access to all operational surfaces.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/finca" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
            Guest view
          </Link>
          <Link href="/booking" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
            Booking lookup
          </Link>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Admin routes */}
      <section>
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-4">Quick access</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: '/admin/properties', title: 'Properties', description: 'Inventory, availability, pricing, photos, and operational status.' },
            { href: '/admin/bookings', title: 'Bookings', description: 'Reservation lifecycle, deposits, balances, and booking events.' },
            { href: '/admin/guests', title: 'Guests', description: 'Guest history, spend, reviews, and account links.' },
            { href: '/admin/analytics', title: 'Analytics', description: 'Occupancy, revenue, payment status, and portfolio performance.' },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-ocean/30">
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400 mb-3">Admin route</p>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{card.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent bookings + pending */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Recent bookings</p>
            <Link href="/admin/bookings" className="text-[10px] font-mono uppercase tracking-[0.3em] text-ocean hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {snapshot.recentBookings.slice(0, 5).map((booking) => (
              <div key={booking.reference} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{booking.reference}</div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                    {booking.property_name} · {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
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
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Pending requests</p>
            <Link href="/admin/bookings" className="text-[10px] font-mono uppercase tracking-[0.3em] text-ocean hover:underline">View all</Link>
          </div>
          {snapshot.pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              No pending requests right now.
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
        </div>
      </section>
    </main>
  );
}
