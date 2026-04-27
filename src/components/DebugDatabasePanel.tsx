import React from 'react';
import { getPool } from '../../db/client';
import { CalendarDays, Database, Euro, Home, MapPin, MessageSquare, Users } from 'lucide-react';

type FincaRow = {
  name: string;
  city: string;
  country: string;
  description: string | null;
};

type PropertyRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  property_type: string;
  max_guests: number;
  base_price_cents: number;
  min_nights: number;
  cover_photo_key: string | null;
  is_occupied_today: number;
  next_booking_date: string | null;
  booking_count: number;
};

type BookingRow = {
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  total_cents: number;
  property_name: string;
  property_slug: string;
  first_name: string;
  last_name: string;
  email: string;
  payment_state: string | null;
  paid_cents: number;
  outstanding_cents: number;
};

type GuestSummaryRow = {
  guest_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  stays_completed: number;
  lifetime_spend_cents: number;
  avg_rating_given: number | null;
  last_stay_ended_on: string | null;
};

type StatsRow = {
  property_count: number;
  booking_count: number;
  review_count: number;
  revenue_cents: number;
  collected_cents: number;
  occupied_today_count: number;
};

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default async function DebugDatabasePanel() {
  let finca: FincaRow | null = null;
  let properties: PropertyRow[] = [];
  let bookings: BookingRow[] = [];
  let guests: GuestSummaryRow[] = [];
  let stats: StatsRow | null = null;
  let error: string | null = null;

  try {
    const pool = await getPool();
    const [fincaRows] = (await pool.query('SELECT * FROM fincas LIMIT 1')) as [FincaRow[], unknown];
    const [propertyRows] = (await pool.query(
      `SELECT p.*, ph.storage_key AS cover_photo_key,
        COALESCE(ps.is_occupied_today, 0) AS is_occupied_today,
        ps.next_booking_date,
        COALESCE(bs.booking_count, 0) AS booking_count
      FROM properties p
      LEFT JOIN property_photos ph ON ph.property_id = p.id AND ph.is_cover = TRUE
      LEFT JOIN v_property_status_today ps ON ps.property_id = p.id
      LEFT JOIN (
        SELECT property_id, COUNT(*) AS booking_count
        FROM bookings
        GROUP BY property_id
      ) bs ON bs.property_id = p.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.base_price_cents DESC`
    )) as [PropertyRow[], unknown];
    const [bookingRows] = (await pool.query(
      `SELECT b.reference, b.status, b.check_in, b.check_out, b.total_cents,
        p.name AS property_name, p.slug AS property_slug,
        g.first_name, g.last_name, g.email,
        v.payment_state, v.paid_cents, v.outstanding_cents
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      JOIN guests g ON g.id = b.guest_id
      LEFT JOIN v_booking_payment_status v ON v.booking_id = b.id
      ORDER BY b.created_at DESC
      LIMIT 6`
    )) as [BookingRow[], unknown];
    const [guestRows] = (await pool.query(
      `SELECT * FROM v_guest_summary
      ORDER BY lifetime_spend_cents DESC
      LIMIT 3`
    )) as [GuestSummaryRow[], unknown];
    const [statsRows] = (await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM properties WHERE deleted_at IS NULL) AS property_count,
        (SELECT COUNT(*) FROM bookings) AS booking_count,
        (SELECT COUNT(*) FROM reviews WHERE status = 'published') AS review_count,
        (SELECT COALESCE(SUM(total_cents), 0) FROM bookings WHERE status IN ('confirmed', 'checked_in', 'checked_out', 'completed')) AS revenue_cents,
        (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE status = 'succeeded') AS collected_cents,
        (SELECT COUNT(*) FROM v_property_status_today WHERE is_occupied_today = 1) AS occupied_today_count`
    )) as [StatsRow[], unknown];

    finca = fincaRows[0];
    properties = propertyRows;
    bookings = bookingRows;
    guests = guestRows;
    stats = statsRows[0];
  } catch (err: unknown) {
    console.error('Database fetch error:', err);
    error = err instanceof Error ? err.message : 'Unknown database error';
  }

  return (
    <section className="p-8 bg-sand/20 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-4 h-4 text-ocean" />
          <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400">
            Operational Dashboard Preview
          </h2>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-600 text-xs font-mono">
            Error connecting to MySQL: {error}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Properties', value: stats?.property_count ?? 0 },
                { label: 'Bookings', value: stats?.booking_count ?? 0 },
                { label: 'Revenue', value: formatMoney(stats?.revenue_cents) },
                { label: 'Collected', value: formatMoney(stats?.collected_cents) },
                { label: 'Reviews', value: stats?.review_count ?? 0 },
              ].map((item) => (
                <div key={item.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">{item.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{finca?.name}</h3>
                  <p className="text-sm text-slate-500 font-mono flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {finca?.city}, {finca?.country}
                  </p>
                </div>
                <span className="px-3 py-1 bg-sky-100 text-ocean text-[10px] font-mono uppercase tracking-wider rounded-full">
                  Primary Estate
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-3xl italic leading-relaxed">“{finca?.description}”</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((property) => (
                <div key={property.id} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-ocean/30 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sand rounded-lg">
                        <Home className="w-4 h-4 text-ocean" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{property.name}</h4>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{property.property_type}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{property.slug}</span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                    {property.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-600 border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sleeps {property.max_guests}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Euro className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatMoney(property.base_price_cents)}/night</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span>{property.min_nights}+ nights</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{property.booking_count} bookings</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    <span>{property.is_occupied_today ? 'Occupied today' : 'Available today'}</span>
                    <span>Next: {formatDate(property.next_booking_date)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-ocean" />
                  <h4 className="text-sm font-mono uppercase tracking-widest text-slate-400">Recent bookings</h4>
                </div>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.reference} className="flex items-center justify-between gap-4 border-t border-slate-50 pt-4 first:border-t-0 first:pt-0">
                      <div>
                        <div className="font-bold text-slate-900">{booking.reference}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {booking.property_name} · {booking.first_name} {booking.last_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                          {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{formatMoney(booking.total_cents)}</div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-ocean">{booking.payment_state}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-ocean" />
                  <h4 className="text-sm font-mono uppercase tracking-widest text-slate-400">Guest summary</h4>
                </div>
                <div className="space-y-4">
                  {guests.map((guest) => (
                    <div key={guest.guest_id} className="border-t border-slate-50 pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-slate-900">{guest.first_name} {guest.last_name}</div>
                          <div className="text-xs text-slate-500 font-mono">{guest.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">{formatMoney(guest.lifetime_spend_cents)}</div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{guest.stays_completed} stays</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        Avg rating: {guest.avg_rating_given ?? '—'} · Last stay ended: {formatDate(guest.last_stay_ended_on)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="px-4 py-2 bg-slate-900 rounded-full flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">
                  MySQL Connection: Active · Desired app data loaded
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
