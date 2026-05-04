'use client';

import React from 'react';
import { Database, Table, Link2, Key, ChevronRight } from 'lucide-react';

type Field = {
  name: string;
  type: string;
  primary?: boolean;
  foreign?: string;
  note?: string;
};

type TableCard = {
  name: string;
  purpose: string;
  fields: Field[];
};

const tables: TableCard[] = [
  {
    name: 'properties',
    purpose: 'Rentable units inside the estate, including map coordinates.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true, note: 'Internal UUID' },
      { name: 'slug', type: 'VARCHAR', note: 'URL identifier (e.g. "villa-sol")' },
      { name: 'property_type', type: 'VARCHAR', note: 'e.g. "Villa", "Room", "Apartment"' },
      { name: 'base_price_cents', type: 'INT', note: 'Nightly rate in EUR cents' },
      { name: 'map_x / map_y / map_z', type: 'DECIMAL', note: '3D coordinate markers for the map' },
    ],
  },
  {
    name: 'property_photos',
    purpose: 'Photo metadata only. Storage keys point to Supabase or object storage.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true, note: 'Internal UUID' },
      { name: 'property_id', type: 'VARCHAR', foreign: 'properties.id', note: 'Owner property' },
      { name: 'storage_key', type: 'VARCHAR', note: 'Unique file path in bucket' },
      { name: 'is_cover', type: 'BOOLEAN', note: 'True if main gallery image' },
    ],
  },
  {
    name: 'bookings',
    purpose: 'Immutable reservation record with snapshot pricing and deposit math.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true, note: 'Internal UUID' },
      { name: 'reference', type: 'VARCHAR', note: 'Human-readable public ID for URLs/Emails (e.g. SMK-2024-X45)' },
      { name: 'property_id', type: 'VARCHAR', foreign: 'properties.id', note: 'Which unit is booked' },
      { name: 'user_id', type: 'VARCHAR', foreign: '"user".id', note: 'Who booked it' },
      { name: 'check_in / check_out', type: 'DATE', note: 'Stay dates' },
      { name: 'status', type: 'VARCHAR', note: 'e.g. "pending", "confirmed", "cancelled"' },
      { name: 'total_cents', type: 'INT', note: 'Snapshot of price at time of booking' },
    ],
  },
  {
    name: 'payments',
    purpose: 'Stripe-backed payment rows for deposit and balance collection.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true, note: 'Internal UUID' },
      { name: 'booking_id', type: 'VARCHAR', foreign: 'bookings.id', note: 'Associated reservation' },
      { name: 'kind', type: 'VARCHAR', note: 'e.g. "deposit" or "balance"' },
      { name: 'status', type: 'VARCHAR', note: 'e.g. "succeeded" or "failed"' },
      { name: 'stripe_payment_intent_id', type: 'VARCHAR', note: 'External bank reference' },
    ],
  },
  {
    name: '"user"',
    purpose: 'Core identity record. Represents a unique person on the platform.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true, note: 'Unique identifier for the person' },
      { name: 'name', type: 'VARCHAR', note: 'Display name' },
      { name: 'email', type: 'VARCHAR', note: 'Primary contact and identity key' },
      { name: 'role', type: 'VARCHAR', note: 'e.g. "admin" (staff) or "user" (customer)' },
    ],
  },
  {
    name: 'account',
    purpose: 'Authentication credentials. One user can have multiple accounts (e.g. Password + Google).',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true, note: 'Internal UUID' },
      { name: '"userId"', type: 'VARCHAR', foreign: '"user".id', note: 'The person this login belongs to' },
      { name: '"providerId"', type: 'VARCHAR', note: 'e.g. "credential" (password) or "google"' },
      { name: 'password', type: 'TEXT', note: 'Hashed password (only for "credential" provider)' },
    ],
  },
  {
    name: 'reviews',
    purpose: 'One review per completed booking, plus a host reply trail.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true },
      { name: 'booking_id', type: 'VARCHAR', foreign: 'bookings.id' },
      { name: 'rating_overall', type: 'INT' },
      { name: 'status', type: 'VARCHAR' },
    ],
  },
  {
    name: 'booking_events',
    purpose: 'Audit trail for lifecycle changes, confirmations, and webhook activity.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true },
      { name: 'booking_id', type: 'VARCHAR', foreign: 'bookings.id' },
      { name: 'event_type', type: 'VARCHAR' },
      { name: 'actor_type', type: 'VARCHAR' },
    ],
  },
];

const derivedViews = [
  {
    name: 'v_booking_payment_status',
    note: 'paid / partial / unpaid, derived from succeeded payments only.',
  },
  {
    name: 'v_property_status_today',
    note: 'occupied today + next booking date for the admin list.',
  },
  {
    name: 'v_guest_summary',
    note: 'stays, spend, and review averages for the guest dashboard.',
  },
];

function TableCard({ table }: { table: TableCard }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50">
        <Table className="w-4 h-4 text-slate-400" />
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{table.name}</h4>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">{table.purpose}</p>
      <div className="space-y-3">
        {table.fields.map((field) => (
          <div key={field.name} className="flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-2 min-w-0">
              {field.primary && <Key className="w-3 h-3 text-amber-500" />}
              {field.foreign && <Link2 className="w-3 h-3 text-ocean" />}
              <span className={`text-[11px] font-mono truncate ${field.primary ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{field.name}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">{field.type}</span>
          </div>
        ))}
      </div>
      {table.fields.some((field) => field.foreign) && (
        <div className="mt-6 pt-4 border-t border-slate-50">
          <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest block mb-2">Relations</span>
          {table.fields
            .filter((field) => field.foreign)
            .map((field) => (
              <div key={field.name} className="flex items-center gap-2 text-[10px] text-ocean font-bold uppercase">
                <ChevronRight className="w-3 h-3" />
                {field.foreign}
              </div>
            ))}
        </div>
      )}
      {table.fields.some((field) => field.note) && (
        <div className="mt-6 pt-4 border-t border-slate-50">
          {table.fields
            .filter((field) => field.note)
            .map((field) => (
              <p key={field.name} className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                <span className="text-slate-900 font-bold">{field.name}:</span> {field.note}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

export default function DebugSchema() {
  return (
    <section className="py-24 px-4 bg-[#F5F2ED] border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <Database className="w-4 h-4 text-ocean" />
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Desired App Schema</span>
        </div>

        <div className="mb-10 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
            The prototype now points at the real model: finca, properties, photos, bookings, payments, guests, and reviews.
            Availability is derived from bookings and blocks, not stored as a slot table.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {tables.map((table) => (
            <TableCard key={table.name} table={table} />
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {derivedViews.map((view) => (
            <div key={view.name} className="bg-white/70 rounded-2xl p-5 border border-dashed border-slate-200">
              <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mb-2">Derived view</p>
              <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">{view.name}</h5>
              <p className="text-xs text-slate-500 leading-relaxed">{view.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-white/50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest text-center">
            Database Engine: MySQL 8.0 • Model: Full booking lifecycle • Availability: Derived, not stored
          </p>
        </div>
      </div>
    </section>
  );
}
