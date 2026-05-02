import Link from 'next/link';
import { CalendarDays, Home, Image as ImageIcon, MapPin, Users } from 'lucide-react';
import { getAdminPropertyBySlug } from '@/services/AdminPropertiesService';

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

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getAdminPropertyBySlug(slug);

  if (!detail.property) {
    return (
      <main className="space-y-6">
        <Link href="/admin/properties" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-700 hover:border-ocean hover:text-ocean">
          Back to properties
        </Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-8">Property not found.</div>
      </main>
    );
  }

  const property = detail.property;

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-4">Property detail</p>
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-2">{property.name}</h1>
            <p className="text-sm text-slate-500">{property.slug} · {property.property_type}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/properties" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">Back to properties</Link>
            <Link href="/finca" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">Open guest view</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Sleeps', value: property.max_guests, icon: Users },
            { label: 'Bedrooms', value: property.bedrooms, icon: Home },
            { label: 'Min nights', value: property.min_nights, icon: CalendarDays },
            { label: 'Base rate', value: formatMoney(property.base_price_cents), icon: MapPin },
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
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <ImageIcon className="h-4 w-4" />
            <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Photos</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{photo.is_cover ? 'Cover' : 'Gallery'}</div>
                <div className="mt-2 truncate">{photo.storage_key}</div>
                {photo.caption ? <div className="mt-1 text-slate-500">{photo.caption}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Amenities</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {detail.amenities.map((amenity) => (
                <span key={amenity.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600">
                  {amenity.label}
                </span>
              ))}
            </div>
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
                  <div className="text-sm font-bold text-slate-900">{formatMoney(fee.amount_cents)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Availability</p>
            <div className="mt-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Occupied today</span>
                <span className="font-semibold text-slate-900">{property.is_occupied_today ? 'Yes' : 'No'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Next booking</span>
                <span className="font-semibold text-slate-900">{formatDate(property.next_booking_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
