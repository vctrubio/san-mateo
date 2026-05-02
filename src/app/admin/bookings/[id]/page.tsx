import Link from 'next/link';
import { CalendarDays, MapPin, Wallet } from 'lucide-react';
import { getAdminBookingById } from '@/services/AdminBookingsService';
import { updateBookingStatus } from '@/app/actions/admin-bookings';

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

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAdminBookingById(id);

  if (!detail.booking) {
    return (
      <main className="space-y-6">
        <Link href="/admin/bookings" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-700 hover:border-ocean hover:text-ocean">
          Back to bookings
        </Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-8">Booking not found.</div>
      </main>
    );
  }

  const booking = detail.booking;

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Booking detail</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-2">{booking.reference}</h1>
            <p className="text-sm text-slate-500">{booking.property_name} · {booking.guest_name || booking.guest_email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/bookings" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to bookings</Link>
            <Link href={`/admin/properties/${booking.property_slug}`} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View property</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Status', value: booking.status, icon: CalendarDays },
            { label: 'Check-in', value: formatDate(booking.check_in), icon: CalendarDays },
            { label: 'Check-out', value: formatDate(booking.check_out), icon: CalendarDays },
            { label: 'Total', value: formatMoney(booking.total_cents), icon: Wallet },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <div className="mt-2 text-lg font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {booking.property_slug}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ocean">{booking.payment_state ?? 'unpaid'}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Payments</p>
          <div className="mt-4 space-y-3">
            {detail.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div>
                  <div className="font-semibold text-slate-900">{payment.kind}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{payment.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{formatMoney(payment.amount_cents)}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                    {payment.paid_at ? formatDate(payment.paid_at) : 'Unpaid'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Update status</p>
            <form action={updateBookingStatus} className="mt-4 space-y-4">
              <input type="hidden" name="bookingId" value={booking.id} />
              <label className="block text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                Status
                <select
                  name="status"
                  defaultValue={booking.status}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-ocean"
                >
                  {['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                Cancellation reason
                <textarea
                  name="reason"
                  placeholder="Required when cancelling"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-ocean"
                  rows={3}
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-ocean"
              >
                Save status
              </button>
            </form>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Fees</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {detail.fees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-900">{fee.name}</div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{fee.calculation}</div>
                  </div>
                  <div className="font-semibold text-slate-900">{formatMoney(fee.amount_cents)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Event log</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {detail.events.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-900">{event.event_type}</div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{event.actor_type ?? 'system'}</div>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{formatDate(event.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
