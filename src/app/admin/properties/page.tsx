import Link from 'next/link';
import { CalendarDays, Home, MapPin, Users } from 'lucide-react';
import { getAdminProperties } from '@/services/AdminPropertiesService';

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

export default async function AdminPropertiesPage() {
  const properties = await getAdminProperties();

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Admin route</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4">Properties</h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              Inventory, availability, pricing, and booking activity for each stay.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to dashboard</Link>
            <Link href="/finca" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">Open guest view</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/admin/properties/${property.slug}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ocean/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{property.property_type}</p>
                <h2 className="text-xl font-bold text-slate-900">{property.name}</h2>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                {property.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono text-slate-600">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>Sleeps {property.max_guests}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.bedrooms} bd · {property.bathrooms} ba</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.min_nights}+ nights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatMoney(property.base_price_cents)}/night</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              <span>{property.is_occupied_today ? 'Occupied' : 'Available'}</span>
              <span>Next: {formatDate(property.next_booking_date)}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
