import Link from 'next/link';
import { CalendarDays, Mail, Star } from 'lucide-react';
import { getAdminGuests } from '@/services/AdminGuestsService';

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

export default async function AdminGuestsPage() {
  const guests = await getAdminGuests();

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin route</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Guests</h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              Guest history, lifetime spend, stays, and review performance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to dashboard</Link>
            <Link href="/admin/bookings" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View bookings</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {guests.map((guest) => (
          <Link
            key={guest.user_id}
            href={`/admin/guests/${guest.user_id}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ocean/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Guest</p>
                <h2 className="text-xl font-bold text-slate-900">{guest.full_name}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  {guest.email}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{formatMoney(guest.lifetime_spend_cents)}</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{guest.stays_completed} stays</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-xs font-mono text-slate-600 sm:grid-cols-3">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <span>Last stay {formatDate(guest.last_stay_ended_on)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-slate-400" />
                <span>Avg rating {guest.avg_rating_given ?? '-'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Upcoming</span>
                <span>{guest.stays_upcoming}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
