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
      { name: 'id', type: 'VARCHAR', primary: true },
      { name: 'slug', type: 'VARCHAR', note: 'public route key' },
      { name: 'property_type', type: 'VARCHAR' },
      { name: 'base_price_cents', type: 'INT' },
      { name: 'map_x / map_y / map_z', type: 'DECIMAL' },
    ],
  },
  {
    name: 'property_photos',
    purpose: 'Photo metadata only. Storage keys point to Supabase or object storage.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true },
      { name: 'property_id', type: 'VARCHAR', foreign: 'properties.id' },
      { name: 'storage_key', type: 'VARCHAR' },
      { name: 'is_cover', type: 'BOOLEAN' },
    ],
  },
  {
    name: 'bookings',
    purpose: 'Immutable reservation record with snapshot pricing and deposit math.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true },
      { name: 'reference', type: 'VARCHAR', note: 'public booking code' },
      { name: 'property_id', type: 'VARCHAR', foreign: 'properties.id' },
      { name: 'user_id', type: 'VARCHAR', foreign: '"user".id' },
      { name: 'check_in / check_out', type: 'DATE' },
      { name: 'status', type: 'VARCHAR' },
      { name: 'total_cents', type: 'INT' },
    ],
  },
  {
    name: 'payments',
    purpose: 'Stripe-backed payment rows for deposit and balance collection.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true },
      { name: 'booking_id', type: 'VARCHAR', foreign: 'bookings.id' },
      { name: 'kind', type: 'VARCHAR' },
      { name: 'status', type: 'VARCHAR' },
      { name: 'stripe_payment_intent_id', type: 'VARCHAR' },
    ],
  },
  {
    name: '"user"',
    purpose: 'Better Auth user.',
    fields: [
      { name: 'id', type: 'VARCHAR', primary: true },
      { name: 'name', type: 'VARCHAR' },
      { name: 'email', type: 'VARCHAR' },
      { name: 'role', type: 'VARCHAR' },
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
                {field.note}
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
