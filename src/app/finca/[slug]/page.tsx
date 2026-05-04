import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Bed, Bath, CalendarDays, MapPin, Users, Wifi, Wind, Waves, Car, Coffee, Flame, Dumbbell, TreePine } from 'lucide-react';
import { Suspense } from 'react';
import PropertyAvailability from '@/components/PropertyAvailability';
import { pool } from '../../../../db/client';

type PropertyDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  property_type: string;
  status: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  base_price_cents: number;
  min_nights: number;
  currency: string;
  cover_photo_key: string | null;
};

type AmenityRow = { label: string; category: string | null; icon: string | null };
type FeeRow = { name: string; calculation: string; amount_cents: number | null; percentage_bps: number | null };
type ReviewRow = { rating_overall: number; public_comment: string | null; guest_name: string | null; created_at: string };

function formatMoney(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
}

const amenityIconMap: Record<string, React.ElementType> = {
  wifi: Wifi, pool: Waves, parking: Car, kitchen: Coffee,
  fireplace: Flame, gym: Dumbbell, garden: TreePine, ac: Wind,
};

function AmenityIcon({ iconKey }: { iconKey: string | null }) {
  const Icon = iconKey ? (amenityIconMap[iconKey] ?? Wind) : Wind;
  return <Icon className="w-4 h-4 text-ocean shrink-0" />;
}

const fallbackImages: Record<string, string> = {
  levante: '/images/levante.png',
  estrecho: '/images/estrecho.png',
  marea: '/images/marea.png',
  cala: '/images/cala.png',
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [propRows] = (await pool.query(
    `SELECT p.*, ph.storage_key AS cover_photo_key
     FROM properties p
     LEFT JOIN property_photos ph ON ph.property_id = p.id AND ph.is_cover = TRUE
     WHERE p.slug = ? AND p.deleted_at IS NULL
     LIMIT 1`,
    [slug],
  )) as [PropertyDetail[], unknown];

  if (!propRows || propRows.length === 0) notFound();
  const property = propRows[0];

  const [amenityRows] = (await pool.query(
    `SELECT a.label, a.category, a.icon
     FROM property_amenities pa JOIN amenities a ON a.id = pa.amenity_id
     WHERE pa.property_id = ? ORDER BY a.category, a.label`,
    [property.id],
  )) as [AmenityRow[], unknown];

  const [feeRows] = (await pool.query(
    `SELECT pf.name, pf.calculation, pf.amount_cents, pf.percentage_bps
     FROM property_fees pf
     WHERE pf.property_id = ? AND pf.is_active = TRUE
     ORDER BY pf.position ASC`,
    [property.id],
  )) as [FeeRow[], unknown];

  const [reviewRows] = (await pool.query(
    `SELECT r.rating_overall, r.public_comment, u.name AS guest_name, r.created_at
     FROM reviews r JOIN "user" u ON u.id = r.user_id
     WHERE r.property_id = ? AND r.status = 'published'
     ORDER BY r.created_at DESC LIMIT 6`,
    [property.id],
  )) as [ReviewRow[], unknown];

  const coverSrc = property.cover_photo_key?.startsWith('images/')
    ? `/${property.cover_photo_key}`
    : fallbackImages[property.slug] ?? '/images/levante.png';

  const feeDescription = (fee: FeeRow) => {
    if (fee.calculation === 'flat') return formatMoney(fee.amount_cents ?? 0);
    if (fee.calculation === 'per_night') return `${formatMoney(fee.amount_cents ?? 0)} / night`;
    if (fee.calculation === 'per_guest') return `${formatMoney(fee.amount_cents ?? 0)} / guest`;
    if (fee.calculation === 'percentage') return `${((fee.percentage_bps ?? 0) / 100).toFixed(0)}%`;
    return formatMoney(fee.amount_cents ?? 0);
  };

  const avgRating = reviewRows.length
    ? (reviewRows.reduce((s, r) => s + r.rating_overall, 0) / reviewRows.length).toFixed(1)
    : null;

  return (
    <main className="min-h-screen bg-[#F5F2ED]">
      {/* Hero image */}
      <div className="relative h-[55vh] w-full bg-slate-200 overflow-hidden">
        <Image src={coverSrc} alt={property.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/70 mb-2">{property.property_type}</p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white drop-shadow-lg">{property.name}</h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{formatMoney(property.base_price_cents, property.currency)}</div>
              <div className="text-sm text-white/70 font-mono uppercase tracking-widest">per night</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Nav */}
        <div className="flex flex-wrap gap-3">
          <Link href="/finca" className="rounded-full bg-white border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 transition-colors hover:border-ocean hover:text-ocean shadow-sm">
            ← All properties
          </Link>
          <Link href="/admin/properties" className="rounded-full bg-white border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:border-ocean hover:text-ocean shadow-sm">
            Admin view
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: `Sleeps ${property.max_guests}` },
                { icon: Bed, label: `${property.bedrooms} bed${property.bedrooms !== 1 ? 's' : ''}` },
                { icon: Bath, label: `${property.bathrooms} bath${Number(property.bathrooms) !== 1 ? 's' : ''}` },
                { icon: CalendarDays, label: `${property.min_nights}+ nights` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <Icon className="w-4 h-4 text-ocean shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-4">About this stay</p>
                <p className="text-slate-700 leading-8 text-[15px]">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenityRows.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-5">What's included</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenityRows.map((amenity) => (
                    <div key={amenity.label} className="flex items-center gap-3">
                      <AmenityIcon iconKey={amenity.icon} />
                      <span className="text-sm text-slate-700">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviewRows.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Guest reviews</p>
                  {avgRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">★ {avgRating}</span>
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">/ 5</span>
                    </div>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {reviewRows.map((review, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-ocean/10 flex items-center justify-center text-[10px] font-bold text-ocean">
                          {review.guest_name?.[0] ?? '?'}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{review.guest_name ?? 'Guest'}</span>
                        <span className="ml-auto text-xs font-mono text-ocean">{'★'.repeat(review.rating_overall)}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-6 italic">"{review.public_comment ?? 'No comment.'}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: pricing + fees + booking widget */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-4">Pricing</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Base rate</span>
                  <span className="font-bold text-slate-900">{formatMoney(property.base_price_cents, property.currency)} / night</span>
                </div>
                {feeRows.map((fee) => (
                  <div key={fee.name} className="flex justify-between items-center border-t border-slate-50 pt-3">
                    <span className="text-sm text-slate-600">{fee.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{feeDescription(fee)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Deposit</div>
                  <div className="text-sm text-slate-700 mt-1">50% on booking. Balance 14 days before arrival.</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-3">Location</p>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Tarifa, Cádiz, Spain</span>
              </div>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                At the southern tip of Europe, 13 km from Africa across the Strait of Gibraltar. World-famous for kitesurfing and the Levante wind.
              </p>
            </div>
          </div>
        </div>

        {/* Booking widget */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400 mb-6">Check availability &amp; book</p>
          <Suspense fallback={null}>
            <PropertyAvailability preselectedSlug={property.slug} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
