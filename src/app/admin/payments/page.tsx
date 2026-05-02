import Link from 'next/link';
import { CalendarDays, Wallet } from 'lucide-react';
import { getAdminPayments } from '@/services/AdminPaymentsService';

function formatMoney(cents: number | null | undefined, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
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

export default async function AdminPaymentsPage() {
  const payments = await getAdminPayments();

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin route</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Payments</h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              Deposit and balance payments across all bookings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to dashboard</Link>
            <Link href="/admin/bookings" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">View bookings</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {payments.map((payment) => (
          <Link
            key={payment.id}
            href={`/admin/bookings/${payment.booking_id}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ocean/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{payment.reference}</p>
                <h2 className="text-xl font-bold text-slate-900">{payment.property_name}</h2>
                <p className="text-sm text-slate-500">{payment.guest_email}</p>
              </div>
              <div className="text-right">
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                  {payment.kind}
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">
                  {formatMoney(payment.amount_cents, payment.currency)}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ocean">{payment.status}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-xs font-mono text-slate-600 sm:grid-cols-2">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <span>Due {formatDate(payment.due_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-slate-400" />
                <span>Paid {formatDate(payment.paid_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
