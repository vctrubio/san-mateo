import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { pool } from '../../../../db/client';

type BookingDetail = {
  id: string;
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: { adults: number; children: number; infants: number; hasPets: boolean };
  total_cents: number;
  deposit_cents: number;
  balance_cents: number;
  property_name: string;
  property_slug: string;
  guest_name: string | null;
  guest_email: string;
  payment_state: string | null;
  paid_cents: number | null;
};

function formatMoney(cents: number | null | undefined, currency = 'EUR') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Awaiting confirmation', color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  confirmed:   { label: 'Confirmed',             color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  checked_in:  { label: 'Checked in',            color: 'text-sky-700',    bg: 'bg-sky-50 border-sky-200' },
  checked_out: { label: 'Checked out',           color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200' },
  completed:   { label: 'Completed',             color: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200' },
  cancelled:   { label: 'Cancelled',             color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-200' },
};

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  const [rows] = (await pool.query(
    `SELECT
       b.id, b.reference, b.status, b.check_in, b.check_out, b.nights,
       b.guests, b.total_cents, b.deposit_cents, b.balance_cents,
       p.name AS property_name, p.slug AS property_slug,
       u.name AS guest_name, u.email AS guest_email,
       v.payment_state, v.paid_cents
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     JOIN "user" u ON u.id = b.user_id
     LEFT JOIN v_booking_payment_status v ON v.booking_id = b.id
     WHERE b.reference = ?
     LIMIT 1`,
    [reference.toUpperCase()],
  )) as [BookingDetail[], unknown];

  if (!rows || rows.length === 0) notFound();

  const booking = rows[0];
  const status = statusConfig[booking.status] ?? statusConfig.pending;
  const isNew = booking.status === 'pending';

  return (
    <main className="min-h-screen bg-[#F5F2ED] px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap gap-3 mb-2">
          <Link
            href="/finca"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-ocean"
          >
            Browse properties
          </Link>
          <Link
            href="/booking"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 transition-colors hover:border-ocean hover:text-ocean"
          >
            Booking lookup
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 transition-colors hover:border-ocean hover:text-ocean"
          >
            Admin view
          </Link>
        </div>

        {/* Hero card */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-8 py-10 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-3">
                  {isNew ? 'Booking received' : 'Booking status'}
                </p>
                <h1 className="text-4xl font-bold tracking-tighter">
                  {isNew ? 'You are all set.' : booking.property_name}
                </h1>
                {isNew && (
                  <p className="mt-2 text-slate-400 text-sm">
                    We have received your booking for{' '}
                    <span className="text-white font-medium">{booking.property_name}</span>.
                  </p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-full border text-xs font-mono font-bold uppercase tracking-[0.2em] ${status.bg} ${status.color}`}>
                {status.label}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Reference</div>
                <div className="text-xl font-bold font-mono tracking-wide">{booking.reference}</div>
              </div>
            </div>
          </div>

          {/* Summary grid */}
          <div className="p-8 grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">
                <CalendarDays className="w-3.5 h-3.5" /> Check-in
              </div>
              <div className="text-sm font-bold text-slate-900">{formatDate(booking.check_in)}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">After 15:00</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">
                <CalendarDays className="w-3.5 h-3.5" /> Check-out
              </div>
              <div className="text-sm font-bold text-slate-900">{formatDate(booking.check_out)}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">Before 11:00</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">
                <Clock className="w-3.5 h-3.5" /> Duration
              </div>
              <div className="text-sm font-bold text-slate-900">{booking.nights} nights</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {booking.guests.adults + booking.guests.children} guests
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">
                <Wallet className="w-3.5 h-3.5" /> Guest
              </div>
              <div className="text-sm font-bold text-slate-900">{booking.guest_name}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{booking.guest_email}</div>
            </div>
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Payment summary</p>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total stay</span>
              <span className="font-bold text-slate-900">{formatMoney(booking.total_cents, 'EUR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Deposit (50%)</span>
              <span className="font-bold text-slate-900">{formatMoney(booking.deposit_cents, 'EUR')}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-600">Balance due before check-in</span>
              <span className="font-bold text-slate-900">{formatMoney(booking.balance_cents, 'EUR')}</span>
            </div>
          </div>

          <div className={`rounded-2xl border px-5 py-4 ${status.bg}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono uppercase tracking-[0.2em] font-bold ${status.color}`}>
                Payment status
              </span>
              <span className={`text-xs font-mono uppercase tracking-[0.2em] font-bold ${status.color}`}>
                {booking.payment_state ?? 'unpaid'}
              </span>
            </div>
            {booking.paid_cents != null && booking.paid_cents > 0 && (
              <div className="mt-2 text-sm text-slate-600">
                {formatMoney(booking.paid_cents, 'EUR')} collected
              </div>
            )}
          </div>
        </div>

        {/* Next steps */}
        {isNew && (
          <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm p-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-4">What happens next</p>
            <ol className="space-y-4">
              {[
                { step: '01', text: 'We review your request and confirm availability within 24 hours.' },
                { step: '02', text: `Once confirmed, the deposit of ${formatMoney(booking.deposit_cents, 'EUR')} is due to secure your dates.` },
                { step: '03', text: 'The remaining balance is due 14 days before check-in.' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="text-[10px] font-mono text-slate-500 mt-1 shrink-0">{step}</span>
                  <span className="text-sm text-slate-300 leading-relaxed">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Lookup again link */}
        <p className="text-center text-xs text-slate-400 font-mono">
          Save your reference: <span className="font-bold text-slate-700">{booking.reference}</span>
          {' '}&mdash;{' '}
          <Link href={`/booking?reference=${booking.reference}`} className="underline hover:text-ocean transition-colors">
            look it up anytime
          </Link>
        </p>
      </div>
    </main>
  );
}
