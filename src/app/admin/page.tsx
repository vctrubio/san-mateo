import Link from 'next/link';
import DebugDatabasePanel from '@/components/DebugDatabasePanel';

const routeCards = [
  {
    href: '/admin/properties',
    title: 'Properties',
    description: 'Inventory, availability, pricing, photos, and operational status.',
  },
  {
    href: '/admin/bookings',
    title: 'Bookings',
    description: 'Reservation lifecycle, deposits, balances, and booking events.',
  },
  {
    href: '/admin/guests',
    title: 'Guests',
    description: 'Guest history, spend, reviews, and account links.',
  },
  {
    href: '/admin/analytics',
    title: 'Analytics',
    description: 'Occupancy, revenue, payment status, and portfolio performance.',
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#F5F2ED]">
      <section className="px-6 pt-16 pb-10 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Admin dashboard</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900">
              Full operational view of the finca.
            </h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              This is the staff surface: estate-level summaries, current booking states, collected payments,
              guest history, and the route map for the deeper admin sections.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">
              Back to landing
            </Link>
            <Link href="/user" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
              Open guest view
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {routeCards.map((card) => (
            <Link key={card.href} href={card.href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400 mb-3">Admin route</p>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{card.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <DebugDatabasePanel />
    </main>
  );
}
