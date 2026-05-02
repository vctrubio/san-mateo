import Link from 'next/link';
import { CalendarDays, MapPin, Wallet } from 'lucide-react';
import { getAdminBookings } from '@/services/AdminBookingsService';

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin route</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Bookings</h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              Reservation lifecycle, deposits, balances, and booking events.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to dashboard</Link>
            <Link href="/admin/properties" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View properties</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/admin/bookings/${booking.id}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ocean/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{booking.reference}</p>
                <h2 className="text-xl font-bold text-slate-900">{booking.property_name}</h2>
                <p className="text-sm text-slate-500">{booking.guest_name || booking.guest_email}</p>
              </div>
              <div className="text-right">
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                  {booking.status}
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{formatMoney(booking.total_cents)}</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ocean">{booking.payment_state ?? 'unpaid'}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-xs font-mono text-slate-600 sm:grid-cols-3">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDate(booking.check_in)} → {formatDate(booking.check_out)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{booking.property_slug}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatMoney(booking.outstanding_cents)} outstanding</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
