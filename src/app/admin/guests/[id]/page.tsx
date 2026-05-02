import Link from 'next/link';
import { CalendarDays, Mail, Star } from 'lucide-react';
import { getAdminGuestById } from '@/services/AdminGuestsService';
import { updateGuestNotes } from '@/app/actions/admin-guests';

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default async function AdminGuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAdminGuestById(id);

  if (!detail.guest) {
    return (
      <main className="space-y-6">
        <Link href="/admin/guests" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-700 hover:border-ocean hover:text-ocean">
          Back to guests
        </Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-8">Guest not found.</div>
      </main>
    );
  }

  const guest = detail.guest;

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Guest profile</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-2">{guest.first_name} {guest.last_name}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              {guest.email}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/guests" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to guests</Link>
            <Link href="/admin/bookings" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View bookings</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Lifetime spend', value: formatMoney(guest.lifetime_spend_cents) },
            { label: 'Completed stays', value: guest.stays_completed },
            { label: 'Upcoming stays', value: guest.stays_upcoming },
            { label: 'Avg rating', value: guest.avg_rating_given ?? '-' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Bookings</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {detail.bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
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

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Notes</p>
            <form action={updateGuestNotes} className="mt-4 space-y-4">
              <input type="hidden" name="guestId" value={guest.guest_id} />
              <textarea
                name="notes"
                defaultValue={guest.notes ?? ''}
                placeholder="Add internal notes about this guest"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-ocean"
                rows={4}
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-ocean"
              >
                Save notes
              </button>
            </form>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Reviews</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {detail.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{review.rating_overall}/5</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{review.status}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{review.public_comment ?? 'No public comment.'}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(review.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
